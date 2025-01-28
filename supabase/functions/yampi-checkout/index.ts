import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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
    console.log('Creating Yampi checkout for:', { planType, memorialData });

    // Validate required fields
    if (!memorialData.couple_name) {
      throw new Error('Missing couple name');
    }

    const yampiToken = Deno.env.get('YAMPI_ACCESS_TOKEN');
    const yampiSecretKey = Deno.env.get('YAMPI_SECRET_KEY');
    const yampiStoreId = Deno.env.get('YAMPI_STORE_ID');
    
    if (!yampiToken || !yampiStoreId || !yampiSecretKey) {
      throw new Error('Missing Yampi configuration');
    }

    // Format customer name
    const fullName = memorialData.full_name || memorialData.couple_name;
    const nameParts = fullName.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || firstName;

    // Format phone number (remove non-digits and add country code if needed)
    const phone = memorialData.phone?.replace(/\D/g, '') || '';
    const formattedPhone = phone.startsWith('55') ? phone : `55${phone}`;

    // Prepare checkout data following Yampi's API structure
    const checkoutData = {
      order: {
        items: [{
          sku: planType === 'basic' ? 'BASIC-PLAN' : 'PREMIUM-PLAN',
          quantity: 1,
          price: memorialData.plan_price,
          name: planType === 'basic' ? 'Plano Basic Love Counter' : 'Plano Premium Love Counter',
        }],
        customer: {
          first_name: firstName,
          last_name: lastName,
          email: memorialData.email || '',
          phone: {
            full_number: formattedPhone
          }
        },
        shipping_address: memorialData.address_info || {},
        billing_address: memorialData.address_info || {},
        metadata: {
          memorial_id: memorialData.id,
          custom_slug: memorialData.custom_slug,
          plan_type: planType
        }
      }
    };

    console.log('Creating Yampi order with data:', checkoutData);
    console.log('Using Yampi credentials:', {
      storeId: yampiStoreId,
      hasToken: !!yampiToken,
      hasSecretKey: !!yampiSecretKey
    });

    // Create order in Yampi with proper authentication headers and updated endpoint
    const response = await fetch(`https://api.dooki.com.br/v2/teste1970/checkout/orders`, {
      method: 'POST',
      headers: {
        'User-Token': yampiToken,
        'Secret-Key': yampiSecretKey,
        'X-Store-ID': yampiStoreId,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(checkoutData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Yampi API error response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        headers: Object.fromEntries(response.headers.entries())
      });
      throw new Error(`Yampi API error: ${response.status} ${response.statusText}`);
    }

    const orderData = await response.json();
    console.log('Yampi order created:', orderData);

    // Replace the Yampi checkout domain with our custom domain
    const checkoutUrl = orderData.data.checkout_url.replace(
      'https://pay.yampi.com.br',
      'https://seguro.memoryys.com'
    );

    return new Response(
      JSON.stringify({ url: checkoutUrl }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error creating checkout:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});