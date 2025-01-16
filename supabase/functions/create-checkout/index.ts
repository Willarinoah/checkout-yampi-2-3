import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';

const BASIC_PRICE_ID = 'price_1QgdpvBZoAuGJOIj2NVvP2EZ';
const PREMIUM_PRICE_ID = 'price_1QgdqPBZoAuGJOIjB63PoQ3d';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { planType, memorialData, userProfile } = await req.json();
    
    if (!planType || !memorialData || !userProfile) {
      console.error('Missing required data:', { planType, memorialData, userProfile });
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
    console.log('User profile:', userProfile);

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
      success_url: memorialData.unique_url,
      cancel_url: `${new URL(memorialData.unique_url).origin}/create`,
      customer_email: userProfile.email,
      metadata: {
        memorialId: memorialData.id,
        customSlug: memorialData.custom_slug,
        userProfileId: userProfile.id,
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