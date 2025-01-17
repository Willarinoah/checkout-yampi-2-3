import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { planType, memorialData } = await req.json();
    
    if (!planType || !memorialData) {
      console.error('Missing required data:', { planType, memorialData });
      throw new Error('Missing required data');
    }

    console.log('Creating checkout session for plan:', planType);
    console.log('Memorial data:', memorialData);

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    const priceId = planType === 'basic' ? 'price_1QgdpvBZoAuGJOIj2NVvP2EZ' : 'price_1QgdqPBZoAuGJOIjB63PoQ3d';
    
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: memorialData.unique_url,
      cancel_url: `${new URL(memorialData.unique_url).origin}/create`,
      metadata: {
        memorialId: memorialData.id,
        customSlug: memorialData.custom_slug,
      },
    });

    console.log('Payment session created:', session.id);
    return new Response(
      JSON.stringify({ url: session.url }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
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