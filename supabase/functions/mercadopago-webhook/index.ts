import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
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
      const paymentResponse = await fetch(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
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

      // Update memorial payment status based on the payment status
      if (paymentData.status === 'approved') {
        // Get the memorial data using the external_reference (custom_slug)
        const { data: memorial, error: memorialError } = await supabase
          .from('user_configs')
          .update({ payment_status: 'paid' })
          .eq('custom_slug', paymentData.external_reference)
          .select()
          .single();

        if (memorialError) {
          console.error('Error updating payment status:', memorialError);
          throw memorialError;
        }

        console.log('Successfully updated payment status for:', paymentData.external_reference);
        console.log('Memorial data:', memorial);

        // Send email with QR code
        if (memorial) {
          try {
            console.log('Sending email to:', memorial.email);
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
            // We don't throw here to avoid retriggering the webhook
          }
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
    // Still return 200 to acknowledge receipt of webhook
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200, // Return 200 even for errors to acknowledge receipt
      }
    );
  }
});