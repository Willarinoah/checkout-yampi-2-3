import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { MercadoPagoConfig, Preference } from 'https://esm.sh/mercadopago@2.0.6';

const BASIC_PRICE_ID = 'price_1QgdpvBZoAuGJOIj2NVvP2EZ';
const PREMIUM_PRICE_ID = 'price_1QgdqPBZoAuGJOIjB63PoQ3d';

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
    const { planType, memorialData, isBrazil } = await req.json();
    
    if (!planType || !memorialData) {
      console.error('Missing required data:', { planType, memorialData });
      return new Response(
        JSON.stringify({ error: 'Missing required data' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    console.log('Creating checkout session for plan:', planType);
    console.log('Memorial data:', memorialData);
    console.log('Is Brazil:', isBrazil);

    const successUrl = memorialData.unique_url;
    const baseUrl = new URL(memorialData.unique_url).origin;
    const cancelUrl = `${baseUrl}/create`;
    
    console.log('Success URL:', successUrl);
    console.log('Cancel URL:', cancelUrl);

    if (isBrazil) {
      console.log('Using Mercado Pago for Brazilian customer');
      const mercadopagoToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
      
      if (!mercadopagoToken) {
        console.error('Missing Mercado Pago access token');
        throw new Error('Missing Mercado Pago configuration');
      }

      const client = new MercadoPagoConfig({
        accessToken: mercadopagoToken,
      });

      try {
        const preference = new Preference(client);
        const preferenceData = {
          items: [{
            title: planType === 'basic' ? 'Basic Plan' : 'Premium Plan',
            quantity: 1,
            currency_id: 'BRL',
            unit_price: Number(memorialData.plan_price)
          }],
          payer: {
            email: memorialData.email
          },
          back_urls: {
            success: successUrl,
            failure: cancelUrl,
            pending: cancelUrl
          },
          auto_return: 'approved',
          notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/mercadopago-webhook`,
          external_reference: memorialData.custom_slug,
          statement_descriptor: 'Love Counter'
        };

        console.log('Creating Mercado Pago preference:', preferenceData);
        const response = await preference.create({ body: preferenceData });
        console.log('Mercado Pago preference created:', response);

        if (!response.init_point) {
          console.error('No init_point in Mercado Pago response:', response);
          throw new Error('Invalid Mercado Pago response');
        }

        return new Response(
          JSON.stringify({ url: response.init_point }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      } catch (mpError) {
        console.error('Mercado Pago error:', mpError);
        return new Response(
          JSON.stringify({ error: `Mercado Pago error: ${mpError.message}` }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          }
        );
      }
    } else {
      console.log('Using Stripe for international customer');
      const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
        apiVersion: '2023-10-16',
      });

      const priceId = planType === 'basic' ? BASIC_PRICE_ID : PREMIUM_PRICE_ID;
      
      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          memorialId: memorialData.id,
          customSlug: memorialData.custom_slug,
          email: memorialData.email,
        },
      });

      if (!session?.url) {
        console.error('No checkout URL in session:', session);
        throw new Error('Failed to create checkout session');
      }

      console.log('Stripe session created:', session.id);
      return new Response(
        JSON.stringify({ url: session.url }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});