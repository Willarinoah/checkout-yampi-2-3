import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from '@supabase/supabase-js';

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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const payload = await req.json();
    console.log('Received Mercadopago webhook:', payload);

    const { id, topic } = payload;

    if (!id || !topic) {
      console.error('Invalid webhook payload:', payload);
      return new Response(
        JSON.stringify({ error: 'Invalid webhook payload' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Track the event
    const eventData = {
      event_type: topic,
      payment_id: id,
      raw_data: payload
    };

    const { error: analyticsError } = await supabaseClient
      .from('payment_events')
      .insert(eventData);

    if (analyticsError) {
      console.error('Error saving payment event:', analyticsError);
    }

    // Handle different webhook events
    switch (topic) {
      case 'payment':
        const { data: memorial, error: memorialError } = await supabaseClient
          .from('yampi_memorials')
          .update({ 
            payment_status: payload.status,
            yampi_payment_id: payload.id,
            yampi_status: payload.status,
            yampi_payment_method: payload.payment_method,
            updated_at: new Date().toISOString()
          })
          .eq('yampi_order_id', payload.external_reference)
          .select()
          .single();

        if (memorialError) {
          console.error('Error updating memorial:', memorialError);
          throw new Error('Failed to update memorial status');
        }

        console.log('Successfully updated memorial:', memorial);
        break;

      default:
        console.log('Unhandled webhook topic:', topic);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});