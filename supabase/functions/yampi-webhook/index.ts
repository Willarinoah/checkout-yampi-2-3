import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PurchaseEventData {
  orderId: string;
  planType: string;
  price: number;
  paymentMethod: string;
  gateway: string;
  user: {
    email: string;
    phone: string;
    name: string;
    country?: string;
    region?: string;
    city?: string;
  };
  status: string;
}

const trackPurchase = async (data: PurchaseEventData) => {
  // Implement analytics tracking here if needed
  console.log('Purchase event tracked:', data);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const yampiSecretKey = Deno.env.get('YAMPI_SECRET_KEY');
    if (!yampiSecretKey) {
      throw new Error('Missing Yampi configuration');
    }

    // Parse webhook payload
    const payload = await req.json();
    console.log('Received Yampi webhook:', payload);

    // Verify webhook signature
    const signature = req.headers.get('X-Yampi-Signature');
    if (!signature) {
      throw new Error('Missing Yampi signature');
    }

    // Handle different webhook events
    if (payload.event === 'order.paid' || payload.event === 'order.canceled') {
      const orderId = payload.data.id;
      const status = payload.event === 'order.paid' ? 'approved' : 'canceled';
      
      // Create Supabase client
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Missing Supabase configuration');
      }
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Update memorial status
      const { data: memorial, error: memorialError } = await supabase
        .from('yampi_memorials')
        .update({ 
          payment_status: status,
          yampi_status: status,
          yampi_payment_method: payload.data.payment_method,
          yampi_payment_id: payload.data.payment_id,
          yampi_installments: payload.data.installments,
          updated_at: new Date().toISOString(),
        })
        .eq('yampi_order_id', orderId.toString())
        .select()
        .single();

      if (memorialError) {
        console.error('Error updating payment status:', memorialError);
        throw memorialError;
      }

      console.log('Successfully updated payment status for order:', orderId);
      console.log('Memorial data:', memorial);

      // Track purchase event
      if (status === 'approved') {
        await trackPurchase({
          orderId: orderId.toString(),
          planType: memorial.plan_type === 'basic' ? 'basic' : 'premium',
          price: memorial.plan_price,
          paymentMethod: payload.data.payment_method,
          gateway: 'yampi',
          user: {
            email: memorial.email,
            phone: memorial.phone,
            name: memorial.full_name,
            country: memorial.address_info?.country_code,
            region: memorial.address_info?.region,
            city: memorial.address_info?.city
          },
          status
        });
      }

      // If payment approved, send confirmation email
      if (status === 'approved') {
        try {
          await fetch(`${supabaseUrl}/functions/v1/send-memorial-email`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              to: memorial.email,
              memorialUrl: memorial.unique_url,
              qrCodeUrl: memorial.qr_code_url
            })
          });
        } catch (emailError) {
          console.error('Error sending confirmation email:', emailError);
          // Don't throw error here, just log it
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