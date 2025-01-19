import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { createHmac } from "https://deno.land/std@0.190.0/crypto/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Função para validar a assinatura do Mercado Pago
const validateMPSignature = (payload: string, signature: string | null, secret: string): boolean => {
  if (!signature) return false;
  
  const generatedSignature = createHmac("sha256", secret)
    .update(payload)
    .toString("hex");
    
  return signature === generatedSignature;
};

// Função para mapear status do Mercado Pago para nosso sistema
const mapPaymentStatus = (mpStatus: string): string => {
  const statusMap: Record<string, string> = {
    approved: 'paid',
    pending: 'pending',
    in_process: 'pending',
    rejected: 'rejected',
    refunded: 'refunded',
    cancelled: 'cancelled',
    in_mediation: 'dispute',
    charged_back: 'chargeback'
  };
  return statusMap[mpStatus] || 'pending';
};

// Função para processar a atualização do pagamento
const processPaymentUpdate = async (
  supabase: any,
  memorialId: string,
  currentStatus: string,
  paymentData: any,
  previousStatus: string
) => {
  console.log('Processing payment update:', {
    memorialId,
    currentStatus,
    previousStatus,
    paymentData: JSON.stringify(paymentData, null, 2)
  });

  const updateData = {
    payment_status: currentStatus,
    mp_external_reference: paymentData.external_reference,
    mp_merchant_order_id: paymentData.order.id,
    updated_at: new Date().toISOString(),
  };

  const { data: memorial, error: updateError } = await supabase
    .from('mercadopago_memorials')
    .update(updateData)
    .eq('id', memorialId)
    .select()
    .single();

  if (updateError) {
    console.error('Error updating memorial payment status:', updateError);
    throw updateError;
  }

  // Se o pagamento foi aprovado, enviar email de confirmação
  if (currentStatus === 'paid' && previousStatus !== 'paid') {
    try {
      await fetch(
        `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-memorial-email`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
          },
          body: JSON.stringify({
            to: memorial.email,
            memorialUrl: memorial.unique_url,
            qrCodeUrl: memorial.qr_code_url
          }),
        }
      );
      console.log('Confirmation email sent successfully');
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
    }
  }

  return memorial;
};

serve(async (req) => {
  // Tratamento de CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Received Mercado Pago webhook');
    
    // Validar origem e assinatura
    const signature = req.headers.get('x-signature');
    const rawBody = await req.text();
    const webhookSecret = Deno.env.get('MERCADOPAGO_WEBHOOK_SECRET');

    if (!webhookSecret) {
      throw new Error('Missing Mercado Pago webhook secret');
    }

    if (!validateMPSignature(rawBody, signature, webhookSecret)) {
      console.error('Invalid webhook signature');
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const payload = JSON.parse(rawBody);
    console.log('Webhook payload:', JSON.stringify(payload, null, 2));

    if (payload.type === 'payment' && payload.data.id) {
      const mercadopagoToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
      if (!mercadopagoToken) {
        throw new Error('Missing Mercado Pago configuration');
      }

      // Buscar detalhes do pagamento
      const paymentResponse = await fetch(
        `https://api.mercadopago.com/v1/payments/${payload.data.id}`,
        {
          headers: {
            'Authorization': `Bearer ${mercadopagoToken}`,
          },
        }
      );

      if (!paymentResponse.ok) {
        throw new Error(`Failed to fetch payment details: ${paymentResponse.statusText}`);
      }

      const paymentData = await paymentResponse.json();
      console.log('Payment details:', JSON.stringify(paymentData, null, 2));

      // Inicializar cliente Supabase
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      // Buscar memorial atual
      const { data: memorial, error: fetchError } = await supabase
        .from('mercadopago_memorials')
        .select('*')
        .eq('custom_slug', paymentData.external_reference)
        .single();

      if (fetchError) {
        console.error('Error fetching memorial:', fetchError);
        throw fetchError;
      }

      if (!memorial) {
        throw new Error(`Memorial not found for reference: ${paymentData.external_reference}`);
      }

      // Verificar se o status já foi processado
      if (memorial.payment_status === 'paid' && paymentData.status === 'approved') {
        console.log('Payment already processed, skipping update');
        return new Response(
          JSON.stringify({ received: true, status: 'already_processed' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      }

      // Processar atualização do pagamento
      const currentStatus = mapPaymentStatus(paymentData.status);
      await processPaymentUpdate(
        supabase,
        memorial.id,
        currentStatus,
        paymentData,
        memorial.payment_status
      );

      console.log('Payment status updated successfully');
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
        status: 500,
      }
    );
  }
});