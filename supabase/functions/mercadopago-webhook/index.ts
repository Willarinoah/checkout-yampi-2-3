import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { trackPurchase, trackPaymentError } from "@/lib/analytics/events";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const fetchPaymentDetails = async (paymentId: string, token: string) => {
  const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch payment details: ${response.statusText}`);
  }
  return response.json();
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const mercadopagoToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    if (!mercadopagoToken) {
      throw new Error('Missing Mercado Pago configuration');
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse webhook payload
    const payload = await req.json();
    console.log('Received Mercado Pago webhook:', payload);

    // Handle different webhook events
    if (payload.type === 'payment' && payload.action === 'payment.updated') {
      const paymentId = payload.data.id;
      console.log('Processing payment update for payment ID:', paymentId);

      // Fetch payment details from Mercado Pago API
      const paymentData = await fetchPaymentDetails(paymentId, mercadopagoToken);

      if (paymentData && paymentData.external_reference) {
        const { data: memorial, error: memorialError } = await supabase
          .from('mercadopago_memorials')
          .update({ 
            payment_status: paymentData.status,
            mp_merchant_order_id: paymentData.order.id,
            updated_at: new Date().toISOString(),
          })
          .eq('custom_slug', paymentData.external_reference)
          .select()
          .single();

        if (memorialError) {
          console.error('Error updating payment status:', memorialError);
          throw memorialError;
        }

        console.log('Successfully updated payment status for:', paymentData.external_reference);
        console.log('Memorial data:', memorial);

        // Track purchase event
        trackPurchase(
          paymentData.id,
          memorial.plan_type === 'basic' ? 'basic' : 'premium',
          memorial.plan_price,
          paymentData.payment_method_id,
          'mercadopago',
          {
            email: memorial.email,
            phone: memorial.phone,
            name: memorial.full_name,
            country: memorial.address_info?.country_code,
            region: memorial.address_info?.region,
            city: memorial.address_info?.city
          },
          paymentData.status
        );

        if (paymentData.status === 'rejected') {
          trackPaymentError(
            'payment_rejected',
            paymentData.status_detail,
            'mercadopago'
          );
        }
      }
    }

    // Return success response
    return new Response(
      JSON.stringify({ received: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error processing webhook:', error);
    trackPaymentError('webhook_error', error.message, 'mercadopago');
    // Return 200 to acknowledge receipt even for errors
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  }
});
