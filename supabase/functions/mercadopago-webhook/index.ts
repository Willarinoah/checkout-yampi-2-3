import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { crypto } from "https://deno.land/std@0.190.0/crypto/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-signature',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.text();
    console.log('Received webhook payload:', payload);
    const data = JSON.parse(payload);
    console.log('Parsed webhook data:', data);

    if (data.type === 'payment' && data.data.id) {
      const mercadopagoToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
      if (!mercadopagoToken) {
        throw new Error('Missing Mercado Pago configuration');
      }

      // Fetch payment details
      const paymentResponse = await fetch(
        `https://api.mercadopago.com/v1/payments/${data.data.id}`,
        {
          headers: {
            'Authorization': `Bearer ${mercadopagoToken}`,
          },
        }
      );

      if (!paymentResponse.ok) {
        throw new Error(`Failed to fetch payment details: ${paymentResponse.statusText}`);
      }

      const paymentData = await paymentResponse.json();
      console.log('Payment details:', paymentData);

      // Initialize Supabase client
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      // Map payment status
      const paymentStatus = {
        approved: 'paid',
        pending: 'pending',
        in_process: 'pending',
        rejected: 'rejected',
        refunded: 'refunded',
        cancelled: 'cancelled',
        in_mediation: 'dispute',
        charged_back: 'chargeback'
      }[paymentData.status] || 'pending';

      // Update memorial payment status
      const { data: memorial, error: updateError } = await supabase
        .from('mercadopago_memorials')
        .update({
          payment_status: paymentStatus,
          mp_merchant_order_id: paymentData.order.id,
          updated_at: new Date().toISOString(),
        })
        .eq('mp_external_reference', paymentData.external_reference)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating memorial payment status:', updateError);
        throw updateError;
      }

      // If payment is approved, send confirmation email
      if (paymentStatus === 'paid') {
        try {
          await fetch(
            `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-memorial-email`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
              },
              body: JSON.stringify({
                to: memorial.email,
                memorialUrl: memorial.unique_url,
                qrCodeUrl: memorial.qr_code_url
              }),
            }
          );
          console.log('Confirmation email sent successfully');
        } catch (emailError) {
          console.error('Error sending confirmation email:', emailError);
        }
      }

      return new Response(
        JSON.stringify({ received: true }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    return new Response(
      JSON.stringify({ received: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});