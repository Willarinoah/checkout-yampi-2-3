
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.1.1?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

console.log('Hello from Create Checkout Function!')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { planType, memorialData } = await req.json()

    console.log('Request received:', { planType, memorialData })

    if (!memorialData?.customSlug) {
      console.error('Missing customSlug in memorial data:', memorialData);
      throw new Error('Missing required memorial data')
    }

    const priceId = planType === 'basic' 
      ? Deno.env.get('STRIPE_BASIC_PRICE_ID')
      : Deno.env.get('STRIPE_PREMIUM_PRICE_ID')

    if (!priceId) {
      console.error('Price ID not found for plan type:', planType);
      throw new Error('Price ID not found')
    }

    console.log('Creating checkout session with priceId:', priceId);

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/memorial/${memorialData.customSlug}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/memorial/${memorialData.customSlug}`,
      metadata: {
        memorial_id: memorialData.id,
        customSlug: memorialData.customSlug,
        planType: planType,
        email: memorialData.email
      },
      customer_email: memorialData.email,
    })

    console.log('Checkout session created:', session.id)

    return new Response(
      JSON.stringify({ url: session.url }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in create-checkout:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
