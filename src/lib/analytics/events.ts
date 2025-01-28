import { sha256 } from 'crypto-js';
import { pushToDataLayer, DataLayerEvent } from './dataLayer';

interface UserData {
  email?: string;
  phone?: string;
  name?: string;
  country?: string;
  region?: string;
  city?: string;
}

// Função auxiliar para hash de dados sensíveis
const hashData = (data: string): string => {
  return sha256(data).toString();
};

// Eventos de Página
export const trackPageView = (pageType: string, userData?: UserData) => {
  const eventData: DataLayerEvent = {
    event: 'page_view',
    pageType,
    page_path: window.location.pathname,
    page_title: document.title,
    funnel_data: {
      step_name: pageType,
      step_number: getStepNumber(pageType)
    }
  };

  if (userData) {
    eventData.user_data = {
      ...(userData.email && { email_sha256: hashData(userData.email) }),
      ...(userData.phone && { phone_sha256: hashData(userData.phone) }),
      ...(userData.name && { name_sha256: hashData(userData.name) }),
      ...(userData.country && { country: userData.country }),
      ...(userData.region && { region: userData.region }),
      ...(userData.city && { city: userData.city })
    };
  }

  pushToDataLayer(eventData);
};

// Eventos de Clique em Botões
export const trackButtonClick = (
  buttonType: string,
  buttonLocation: string,
  planType?: 'basic' | 'premium'
) => {
  pushToDataLayer({
    event: 'button_click',
    button_type: buttonType,
    button_location: buttonLocation,
    plan_type: planType,
    funnel_data: {
      step_name: `${buttonLocation}_${buttonType}_click`,
      step_number: getStepNumber(buttonLocation)
    }
  });
};

// Evento de Modal
export const trackModalInteraction = (
  action: 'open' | 'close' | 'button_click',
  paymentProvider: 'stripe' | 'mercadopago',
  userData?: UserData
) => {
  pushToDataLayer({
    event: 'modal_interaction',
    button_type: action,
    payment_provider: paymentProvider,
    user_data: userData ? {
      ...(userData.email && { email_sha256: hashData(userData.email) }),
      ...(userData.phone && { phone_sha256: hashData(userData.phone) }),
      ...(userData.name && { name_sha256: hashData(userData.name) })
    } : undefined,
    funnel_data: {
      step_name: `modal_${action}`,
      step_number: 3
    }
  });
};

// Evento de Início do Checkout
export const trackBeginCheckout = (
  planType: 'basic' | 'premium',
  price: number,
  userData: UserData,
  paymentProvider: 'stripe' | 'mercadopago'
) => {
  pushToDataLayer({
    event: 'begin_checkout',
    ecommerce: {
      currency: paymentProvider === 'mercadopago' ? 'BRL' : 'USD',
      value: price,
      items: [{
        item_id: `${planType}_plan`,
        item_name: `${planType.charAt(0).toUpperCase() + planType.slice(1)} Plan`,
        price,
        quantity: 1
      }]
    },
    user_data: {
      ...(userData.email && { email_sha256: hashData(userData.email) }),
      ...(userData.phone && { phone_sha256: hashData(userData.phone) }),
      ...(userData.name && { name_sha256: hashData(userData.name) }),
      ...(userData.country && { country: userData.country }),
      ...(userData.region && { region: userData.region }),
      ...(userData.city && { city: userData.city })
    },
    funnel_data: {
      step_name: 'begin_checkout',
      step_number: 4
    }
  });
};

// Evento de Compra
export const trackPurchase = (
  transactionId: string,
  planType: 'basic' | 'premium',
  price: number,
  paymentMethod: string,
  paymentProvider: 'stripe' | 'mercadopago',
  userData: UserData,
  status: string
) => {
  pushToDataLayer({
    event: 'purchase',
    ecommerce: {
      transaction_id: transactionId,
      currency: paymentProvider === 'mercadopago' ? 'BRL' : 'USD',
      value: price,
      items: [{
        item_id: `${planType}_plan`,
        item_name: `${planType.charAt(0).toUpperCase() + planType.slice(1)} Plan`,
        price,
        quantity: 1
      }]
    },
    user_data: {
      ...(userData.email && { email_sha256: hashData(userData.email) }),
      ...(userData.phone && { phone_sha256: hashData(userData.phone) }),
      ...(userData.name && { name_sha256: hashData(userData.name) }),
      ...(userData.country && { country: userData.country }),
      ...(userData.region && { region: userData.region }),
      ...(userData.city && { city: userData.city })
    },
    payment_provider: paymentProvider,
    payment_method: paymentMethod,
    payment_status: status,
    funnel_data: {
      step_name: 'purchase_complete',
      step_number: 5
    }
  });
};

// Evento de Erro no Pagamento
export const trackPaymentError = (
  errorType: string,
  errorMessage: string,
  paymentProvider: 'stripe' | 'mercadopago'
) => {
  pushToDataLayer({
    event: 'payment_error',
    error_type: errorType,
    error_message: errorMessage,
    payment_provider: paymentProvider,
    funnel_data: {
      step_name: 'payment_error',
      step_number: 4
    }
  });
};

// Função auxiliar para determinar o número do passo no funil
const getStepNumber = (stepName: string): number => {
  const stepMap: Record<string, number> = {
    'homepage': 1,
    'create': 2,
    'modal': 3,
    'checkout': 4,
    'purchase': 5
  };
  
  return stepMap[stepName.toLowerCase()] || 0;
};