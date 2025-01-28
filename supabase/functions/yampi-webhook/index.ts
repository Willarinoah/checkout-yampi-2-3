import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { encode as base64Encode } from "https://deno.land/std@0.190.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-yampi-signature',
};

interface WebhookPayload {
  event: string;
  data: {
    id: string;
    payment_method?: string;
    payment_id?: string;
    installments?: number;
    status?: string;
  };
}

const verifyYampiSignature = async (payload: string, signature: string | null, secret: string) => {
  if (!signature) return false;

  try {
    const encoder = new TextEncoder();
    const key = encoder.encode(secret);
    const message = encoder.encode(payload);
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      key,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signed = await crypto.subtle.sign('HMAC', cryptoKey, message);
    const calculatedSignature = base64Encode(new Uint8Array(signed));
    
    return signature === calculatedSignature;
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const yampiSecretKey = Deno.env.get('YAMPI_SECRET_KEY');
    if (!yampiSecretKey) {
      throw new Error('Missing Yampi webhook secret key');
    }

    // Get the signature from headers
    const signature = req.headers.get('X-Yampi-Signature');
    
    // Get the raw payload
    const payload = await req.text();
    console.log('Received Yampi webhook payload:', payload);

    // Verify signature
    const isValid = await verifyYampiSignature(payload, signature, yampiSecretKey);
    if (!isValid) {
      console.error('Invalid Yampi signature');
      throw new Error('Invalid webhook signature');
    }

    // Parse the payload
    const webhookData = JSON.parse(payload) as WebhookPayload;
    console.log('Processing webhook event:', webhookData.event);

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Handle different webhook events
    switch (webhookData.event) {
      case 'order.paid':
        const { data: memorial, error: updateError } = await supabase
          .from('yampi_memorials')
          .update({
            payment_status: 'approved',
            yampi_status: 'approved',
            yampi_payment_method: webhookData.data.payment_method,
            yampi_payment_id: webhookData.data.payment_id,
            yampi_installments: webhookData.data.installments,
            updated_at: new Date().toISOString()
          })
          .eq('yampi_order_id', webhookData.data.id.toString())
          .select()
          .single();

        if (updateError) {
          console.error('Error updating memorial:', updateError);
          throw updateError;
        }

        // Send confirmation email
        if (memorial) {
          try {
            await fetch(`${supabaseUrl}/functions/v1/send-memorial-email`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                to: memorial.email,
                memorialUrl: memorial.unique_url,
                qrCodeUrl: memorial.qr_code_url
              })
            });
          } catch (emailError) {
            console.error('Error sending confirmation email:', emailError);
          }
        }
        break;

      case 'order.canceled':
        await supabase
          .from('yampi_memorials')
          .update({
            payment_status: 'canceled',
            yampi_status: 'canceled',
            updated_at: new Date().toISOString()
          })
          .eq('yampi_order_id', webhookData.data.id.toString());
        break;

      case 'order.status.updated':
        await supabase
          .from('yampi_memorials')
          .update({
            yampi_status: webhookData.data.status,
            updated_at: new Date().toISOString()
          })
          .eq('yampi_order_id', webhookData.data.id.toString());
        break;

      default:
        console.log('Unhandled webhook event:', webhookData.event);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});