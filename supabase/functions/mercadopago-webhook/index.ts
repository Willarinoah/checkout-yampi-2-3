import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    console.log('Received Mercado Pago webhook:', payload);

    if (payload.type === 'payment' && payload.data.id) {
      const mercadopagoToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
      if (!mercadopagoToken) {
        throw new Error('Missing Mercado Pago configuration');
      }

      const paymentResponse = await fetch(
        `https://api.mercadopago.com/v1/payments/${payload.data.id}`,
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

      if (paymentData.status === 'approved') {
        const supabase = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        // Atualizado para usar a tabela correta mercadopago_memorials
        const { data: memorial, error: updateError } = await supabase
          .from('mercadopago_memorials')
          .update({ 
            payment_status: 'paid',
            mp_external_reference: paymentData.external_reference,
            mp_merchant_order_id: paymentData.merchant_order_id
          })
          .eq('custom_slug', paymentData.external_reference)
          .select()
          .maybeSingle();

        if (updateError) {
          console.error('Error updating payment status:', updateError);
          throw updateError;
        }

        console.log('Successfully updated payment status for:', paymentData.external_reference);

        if (memorial) {
          try {
            const emailResponse = await fetch(
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

            if (!emailResponse.ok) {
              const errorData = await emailResponse.text();
              console.error('Error sending email:', errorData);
              throw new Error(`Failed to send email: ${errorData}`);
            }

            console.log('Successfully sent memorial email');
          } catch (emailError) {
            console.error('Error in email sending process:', emailError);
          }
        }
      }
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
        status: 200,
      }
    );
  }
});