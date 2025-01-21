import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const sanitizeUrl = (url: string): string => {
  return url.replace(/[:/]+$/, '').replace(/:[/]{0,2}$/, '');
};

const formatPhoneNumber = (phone: string | null): { area_code: string; number: string } => {
  if (!phone) return { area_code: '', number: '' };
  const cleanPhone = phone.replace(/\D/g, '');
  const areaCode = cleanPhone.substring(0, 2);
  const number = cleanPhone.substring(2);
  return { area_code: areaCode, number };
};

const createItemDescription = (coupleName: string, planType: string): string => {
  const planDescription = planType === 'basic' 
    ? '1 ano, 3 fotos' 
    : 'Para sempre, 7 fotos e música';
  return `Memorial digital para ${coupleName} - ${planDescription}`;
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

    if (!memorialData.couple_name || !memorialData.email || !memorialData.full_name) {
      throw new Error('Missing required fields: couple_name, email, or full_name');
    }

    const baseUrl = sanitizeUrl(Deno.env.get('SUPABASE_URL') || '');
    if (!baseUrl) {
      throw new Error('Missing SUPABASE_URL configuration');
    }

    const notificationUrl = `${baseUrl}/functions/v1/mercadopago-webhook`;
    console.log('Constructed notification URL:', notificationUrl);

    const successUrl = sanitizeUrl(memorialData.unique_url);
    const cancelUrl = `${new URL(memorialData.unique_url).origin}/create`;

    // Separar nome completo em nome e sobrenome
    const nameParts = (memorialData.full_name || '').split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Formatar número de telefone
    const formattedPhone = formatPhoneNumber(memorialData.phone);

    // Criar descrição detalhada do item
    const itemDescription = createItemDescription(memorialData.couple_name, planType);

    // Preparar dados de endereço do comprador
    const addressInfo = memorialData.address_info || {};
    const payerAddress = {
      zip_code: addressInfo.postal_code || '',
      street_name: addressInfo.street || '',
      street_number: addressInfo.number || '',
      city: addressInfo.city || '',
      state: addressInfo.region || '',
      country: addressInfo.country_code || 'BR'
    };

    const preferenceData = {
      items: [{
        id: `love-counter-${planType}`,
        title: planType === 'basic' ? 'Plano Basic Love Counter' : 'Plano Premium Love Counter',
        description: itemDescription,
        category_id: 'digital_services',
        quantity: 1,
        currency_id: 'BRL',
        unit_price: Number(memorialData.plan_price)
      }],
      payer: {
        email: memorialData.email,
        first_name: firstName,
        last_name: lastName,
        phone: formattedPhone,
        address: payerAddress
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
      },
      metadata: {
        memorial_id: memorialData.id,
        plan_type: planType
      }
    };

    console.log('Creating Mercado Pago preference:', JSON.stringify(preferenceData, null, 2));

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