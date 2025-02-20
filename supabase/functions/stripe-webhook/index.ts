
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
    const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    
    if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
      console.error('Missing required environment variables');
      throw new Error('Server configuration error');
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });

    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      console.error('No Stripe signature found');
      return new Response(
        JSON.stringify({ error: 'No signature provided' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.text();
    let event;

    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error(`⚠️ Webhook signature verification failed:`, err.message);
      return new Response(
        JSON.stringify({ error: `Webhook signature verification failed` }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Successfully verified webhook signature');
    console.log('Event type:', event.type);
    console.log('Event metadata:', event.data.object.metadata);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log('Processing checkout.session.completed');
      console.log('Session metadata:', session.metadata);

      const customSlug = session.metadata?.customSlug;
      if (!customSlug) {
        console.error('No custom slug found in session metadata:', session.metadata);
        throw new Error('No custom slug found in session metadata');
      }

      // Atualizado para usar a tabela stripe_memorials
      const { data: memorial, error: updateError } = await supabase
        .from('stripe_memorials')
        .update({ 
          payment_status: 'paid',
          stripe_session_id: session.id,
          stripe_customer_id: session.customer,
          updated_at: new Date().toISOString()
        })
        .eq('custom_slug', customSlug)
        .select()
        .maybeSingle();

      if (updateError) {
        console.error('Error updating payment status:', updateError);
        throw updateError;
      }

      console.log('Successfully updated payment status for slug:', customSlug);

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

    return new Response(
      JSON.stringify({ received: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (err) {
    console.error('Webhook error:', err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
