
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { encode as base64Encode } from "https://deno.land/std@0.190.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-yampi-signature, x-yampi-hmac-sha256',
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
  if (!signature) {
    console.error('No signature provided');
    return false;
  }

  try {
    const encoder = new TextEncoder();
    const key = encoder.encode(secret);
    const message = encoder.encode(payload);
    
    console.log('Payload being verified:', payload);
    console.log('Received signature:', signature);
    console.log('Secret key length:', secret.length);
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      key,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signed = await crypto.subtle.sign('HMAC', cryptoKey, message);
    const calculatedSignature = base64Encode(new Uint8Array(signed));
    
    console.log('Calculated signature:', calculatedSignature);
    console.log('Signatures match?', signature === calculatedSignature);
    
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
    const yampiSecretKey = Deno.env.get('YAMPI_WEBHOOK_SECRET');
    if (!yampiSecretKey) {
      console.error('Missing Yampi webhook secret key');
      throw new Error('Missing Yampi webhook secret key');
    }

    console.log('YAMPI_WEBHOOK_SECRET length:', yampiSecretKey.length);
    
    const signature = req.headers.get('X-Yampi-Hmac-SHA256') || req.headers.get('x-yampi-hmac-sha256');
    console.log('Received headers:', Object.fromEntries(req.headers.entries()));
    console.log('Received signature:', signature);
    
    const payload = await req.text();
    console.log('Received Yampi webhook payload:', payload);

    const isValid = await verifyYampiSignature(payload, signature, yampiSecretKey);
    if (!isValid) {
      console.error('Invalid Yampi signature');
      throw new Error('Invalid webhook signature');
    }

    const webhookData = JSON.parse(payload) as WebhookPayload;
    console.log('Processing webhook event:', webhookData.event);

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }
    const supabase = createClient(supabaseUrl, supabaseKey);

    switch (webhookData.event) {
      case 'order.paid': {
        // Primeiro, vamos verificar se o memorial existe
        const { data: existingMemorial, error: checkError } = await supabase
          .from('yampi_memorials')
          .select('*')
          .eq('yampi_order_id', webhookData.data.id.toString())
          .maybeSingle();

        if (checkError) {
          console.error('Error checking memorial:', checkError);
          throw new Error(`Error checking memorial: ${checkError.message}`);
        }

        if (!existingMemorial) {
          console.error('No memorial found for order ID:', webhookData.data.id);
          throw new Error(`No memorial found for order ID: ${webhookData.data.id}`);
        }

        console.log('Found existing memorial:', existingMemorial);

        const { data: memorial, error: updateError } = await supabase
          .from('yampi_memorials')
          .update({
            payment_status: 'approved',
            yampi_status: webhookData.data.status,
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

        console.log('Memorial updated successfully:', memorial);

        if (memorial) {
          try {
            const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-memorial-email`, {
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

            if (!emailResponse.ok) {
              const errorData = await emailResponse.text();
              console.error('Error sending confirmation email:', errorData);
            } else {
              console.log('Confirmation email sent successfully');
            }
          } catch (emailError) {
            console.error('Error sending confirmation email:', emailError);
          }
        }
        break;
      }

      case 'order.status.updated': {
        // Primeiro, vamos verificar se o memorial existe
        const { data: existingMemorial, error: checkError } = await supabase
          .from('yampi_memorials')
          .select('*')
          .eq('yampi_order_id', webhookData.data.id.toString())
          .maybeSingle();

        if (checkError) {
          console.error('Error checking memorial:', checkError);
          throw new Error(`Error checking memorial: ${checkError.message}`);
        }

        if (!existingMemorial) {
          console.error('No memorial found for order ID:', webhookData.data.id);
          throw new Error(`No memorial found for order ID: ${webhookData.data.id}`);
        }

        console.log('Found existing memorial for status update:', existingMemorial);

        const { error: statusError } = await supabase
          .from('yampi_memorials')
          .update({
            yampi_status: webhookData.data.status,
            updated_at: new Date().toISOString()
          })
          .eq('yampi_order_id', webhookData.data.id.toString());

        if (statusError) {
          console.error('Error updating memorial status:', statusError);
          throw statusError;
        }
        console.log('Memorial status updated successfully');
        break;
      }

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
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
