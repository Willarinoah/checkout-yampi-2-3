import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encode as base64Encode } from "https://deno.land/std@0.190.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Log environment variables (safely)
    console.log('Supabase URL exists:', !!Deno.env.get('SUPABASE_URL'));
    console.log('Supabase Key exists:', !!Deno.env.get('SUPABASE_ANON_KEY'));

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false
        }
      }
    );

    // Get JWT token from request header
    const authHeader = req.headers.get('Authorization');
    console.log('Auth Header exists:', !!authHeader);
    
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Extract and verify JWT token
    const jwt = authHeader.replace('Bearer ', '');
    console.log('JWT token length:', jwt.length);

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(jwt);
    
    if (authError) {
      console.error('Auth error details:', authError);
      throw new Error(`Invalid JWT token: ${authError.message}`);
    }

    if (!user) {
      throw new Error('No user found with provided token');
    }

    console.log('Successfully authenticated user:', user.id);

    // Get request data
    const { planType, memorialData } = await req.json();
    console.log('Creating Yampi checkout for:', { planType, memorialId: memorialData?.id });

    // Validate required fields
    if (!memorialData.couple_name) {
      throw new Error('Missing couple name');
    }

    const yampiToken = Deno.env.get('YAMPI_ACCESS_TOKEN');
    const yampiSecretKey = Deno.env.get('YAMPI_SECRET_KEY');
    const yampiStoreId = Deno.env.get('YAMPI_STORE_ID');
    const yampiAlias = 'teste1970';
    
    if (!yampiToken || !yampiStoreId || !yampiSecretKey) {
      throw new Error('Missing Yampi configuration');
    }

    // Format customer data
    const fullName = memorialData.full_name || memorialData.couple_name;
    const nameParts = fullName.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || firstName;

    const phone = memorialData.phone?.replace(/\D/g, '') || '';
    const formattedPhone = phone.startsWith('55') ? phone : `55${phone}`;

    // Prepare checkout data
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
          plan_type: planType,
          user_id: user.id
        }
      }
    };

    // Calculate HMAC signature
    const encoder = new TextEncoder();
    const message = encoder.encode(JSON.stringify(checkoutData));
    const key = encoder.encode(yampiSecretKey);
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      key,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, message);
    const hmacSignature = base64Encode(new Uint8Array(signature));

    console.log('Creating Yampi order with data:', {
      orderId: memorialData.id,
      customSlug: memorialData.custom_slug,
      planType
    });

    // Create order in Yampi
    const response = await fetch(`https://api.yampi.com.br/v2/${yampiAlias}/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${yampiToken}`,
        'User-Token': yampiToken,
        'Content-Type': 'application/json',
        'X-Store-ID': yampiStoreId,
        'X-Yampi-Hmac-SHA256': hmacSignature,
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
    console.log('Yampi order created:', {
      orderId: orderData.data?.id,
      checkoutUrl: orderData.data?.checkout_url
    });

    // Replace Yampi checkout domain
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