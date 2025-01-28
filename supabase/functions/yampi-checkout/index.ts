import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

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

    if (!memorialData.couple_name || !memorialData.email || !memorialData.full_name) {
      throw new Error('Missing required fields');
    }

    const yampiToken = Deno.env.get('YAMPI_ACCESS_TOKEN');
    const yampiStoreId = Deno.env.get('YAMPI_STORE_ID');
    
    if (!yampiToken || !yampiStoreId) {
      throw new Error('Missing Yampi configuration');
    }

    // Get product SKU based on plan type
    const skuId = planType === 'basic' ? 'BASIC-PLAN' : 'PREMIUM-PLAN';
    const productName = planType === 'basic' ? 'Plano Basic Love Counter' : 'Plano Premium Love Counter';

    // Split full name into first and last name
    const nameParts = memorialData.full_name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');

    // Format phone number (remove non-digits and add country code if needed)
    const phone = memorialData.phone?.replace(/\D/g, '') || '';
    const formattedPhone = phone.startsWith('55') ? phone : `55${phone}`;

    // Prepare checkout data
    const checkoutData = {
      order: {
        items: [{
          sku: skuId,
          quantity: 1,
          price: memorialData.plan_price,
          name: productName,
        }],
        customer: {
          first_name: firstName,
          last_name: lastName,
          email: memorialData.email,
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

    console.log('Creating Yampi order:', checkoutData);

    // Create order in Yampi
    const response = await fetch(`https://api.yampi.com.br/v1/stores/${yampiStoreId}/orders`, {
      method: 'POST',
      headers: {
        'User-Token': yampiToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(checkoutData)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Yampi API error:', errorData);
      throw new Error(`Yampi API error: ${response.status} ${response.statusText}`);
    }

    const orderData = await response.json();
    console.log('Yampi order created:', orderData);

    // Update memorial with Yampi order ID
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: updateError } = await supabase
      .from('yampi_memorials')
      .update({
        yampi_order_id: orderData.data.id.toString(),
        yampi_status: 'pending'
      })
      .eq('id', memorialData.id);

    if (updateError) {
      console.error('Error updating memorial:', updateError);
      throw updateError;
    }

    // Return checkout URL
    return new Response(
      JSON.stringify({ url: orderData.data.checkout_url }),
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