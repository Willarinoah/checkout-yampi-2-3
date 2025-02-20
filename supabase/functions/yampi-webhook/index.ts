
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { encode as base64Encode } from "https://deno.land/std@0.190.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-yampi-signature, x-yampi-hmac-sha256',
};

interface YampiResource {
  id: number;
  status: {
    id: number;
    type: string;
    label: string;
  };
  payment: {
    method: string;
    installments: number;
    payment_id?: string;
  };
  customer?: {
    email?: string;
  };
}

interface WebhookPayload {
  event: string;
  resource: YampiResource;
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
    console.log('Resource ID:', webhookData.resource.id);
    console.log('Resource ID as string:', webhookData.resource.id.toString());

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Função auxiliar para buscar o memorial
    const findMemorial = async (orderId: string) => {
      console.log('Searching for memorial with order ID:', orderId);
      
      const { data: memorial, error } = await supabase
        .from('yampi_memorials')
        .select('*')
        .eq('yampi_order_id', orderId)
        .maybeSingle();

      if (error) {
        console.error('Error finding memorial:', error);
        throw error;
      }

      if (!memorial) {
        console.log('No memorial found with order ID:', orderId);
        
        // Tenta buscar o memorial mais recente pendente como fallback
        const { data: pendingMemorial, error: pendingError } = await supabase
          .from('yampi_memorials')
          .select('*')
          .eq('payment_status', 'pending')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (pendingError) {
          console.error('Error finding pending memorial:', pendingError);
          throw pendingError;
        }

        if (!pendingMemorial) {
          throw new Error(`No memorial found for order ID: ${orderId}`);
        }

        console.log('Found pending memorial:', pendingMemorial);
        return pendingMemorial;
      }

      console.log('Found memorial:', memorial);
      return memorial;
    };

    switch (webhookData.event) {
      case 'order.created': {
        console.log('Processing order.created event');
        // Busca o memorial mais recente pendente
        const memorial = await findMemorial(webhookData.resource.id.toString());

        // Atualiza o memorial com o ID do pedido Yampi
        const { error: updateError } = await supabase
          .from('yampi_memorials')
          .update({
            yampi_order_id: webhookData.resource.id.toString(),
            yampi_status: webhookData.resource.status.type,
            updated_at: new Date().toISOString()
          })
          .eq('id', memorial.id);

        if (updateError) {
          console.error('Error updating memorial with Yampi order ID:', updateError);
          throw updateError;
        }

        console.log('Memorial updated with Yampi order ID:', webhookData.resource.id);
        break;
      }

      case 'order.status.updated': {
        console.log('Processing order.status.updated event');
        const memorial = await findMemorial(webhookData.resource.id.toString());

        // Atualiza o status do pedido
        const { error: updateError } = await supabase
          .from('yampi_memorials')
          .update({
            yampi_status: webhookData.resource.status.type,
            updated_at: new Date().toISOString()
          })
          .eq('id', memorial.id);

        if (updateError) {
          console.error('Error updating memorial status:', updateError);
          throw updateError;
        }

        console.log('Memorial status updated successfully');
        break;
      }

      case 'order.paid': {
        console.log('Processing order.paid event');
        const memorial = await findMemorial(webhookData.resource.id.toString());

        // Atualiza o memorial com as informações de pagamento
        const { data: updatedMemorial, error: updateError } = await supabase
          .from('yampi_memorials')
          .update({
            payment_status: 'approved',
            yampi_status: webhookData.resource.status.type,
            yampi_payment_method: webhookData.resource.payment.method,
            yampi_payment_id: webhookData.resource.payment.payment_id,
            yampi_installments: webhookData.resource.payment.installments,
            updated_at: new Date().toISOString()
          })
          .eq('id', memorial.id)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating memorial:', updateError);
          throw updateError;
        }

        console.log('Memorial payment confirmed:', updatedMemorial);

        // Envia email de confirmação
        try {
          const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-memorial-email`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              to: updatedMemorial.email,
              memorialUrl: updatedMemorial.unique_url,
              qrCodeUrl: updatedMemorial.qr_code_url
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

