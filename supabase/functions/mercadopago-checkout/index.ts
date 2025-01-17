import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const sanitizeUrl = (url: string): string => {
  return url.replace(/[:/]+$/, '').replace(/:[/]{0,2}$/, '');
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const mercadopagoToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    if (!mercadopagoToken) {
      console.error('Missing Mercado Pago access token');
      throw new Error('Missing Mercado Pago configuration');
    }

    const { planType, memorialData } = await req.json();
    console.log('Creating Mercado Pago checkout for:', { planType, memorialData });

    const baseUrl = sanitizeUrl(Deno.env.get('SUPABASE_URL') || '');
    if (!baseUrl) {
      throw new Error('Missing SUPABASE_URL configuration');
    }

    const notificationUrl = `${baseUrl}/functions/v1/mercadopago-webhook`;
    console.log('Constructed notification URL:', notificationUrl);

    const successUrl = sanitizeUrl(memorialData.unique_url);
    const cancelUrl = `${new URL(memorialData.unique_url).origin}/create`;

    const preferenceData = {
      items: [{
        id: `love-counter-${planType}`,
        title: planType === 'basic' ? 'Plano Basic Love Counter' : 'Plano Premium Love Counter',
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
        pending: successUrl
      },
      auto_return: "approved",
      notification_url: notificationUrl,
      external_reference: memorialData.custom_slug,
      statement_descriptor: 'Love Counter',
      payment_methods: {
        excluded_payment_methods: [],
        excluded_payment_types: [],
        installments: 12
      }
    };

    console.log('Creating Mercado Pago preference:', preferenceData);

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mercadopagoToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(preferenceData)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Mercado Pago API error:', errorData);
      throw new Error(`Mercado Pago API error: ${response.status} ${response.statusText}`);
    }

    const preferenceResponse = await response.json();
    console.log('Mercado Pago preference created:', preferenceResponse);

    if (!preferenceResponse.init_point) {
      console.error('No init_point in Mercado Pago response:', preferenceResponse);
      throw new Error('Invalid Mercado Pago response');
    }

    return new Response(
      JSON.stringify({ url: preferenceResponse.init_point }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Mercado Pago error:', error);
    return new Response(
      JSON.stringify({ 
        error: `Mercado Pago error: ${error.message}`,
        details: error 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});