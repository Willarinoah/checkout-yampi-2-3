import { sha256 } from 'crypto-js';

interface UserData {
  email?: string;
  phone?: string;
  name?: string;
  country?: string;
  region?: string;
  city?: string;
}

interface EcommerceItem {
  item_id: string;
  item_name: string;
  item_category: string;
  item_variant: string;
  price: number;
  quantity: number;
}

const hashData = (data: string): string => {
  return sha256(data).toString();
};

export const pushEvent = (eventData: any) => {
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(eventData);

    if (process.env.NODE_ENV === 'development') {
      console.log('DataLayer Push:', eventData);
    }
  }
};

// Eventos de Página
export const trackPageView = (pageType: string, userData?: UserData) => {
  const eventData: any = {
    event: 'page_view',
    pageType,
    page_path: window.location.pathname,
    page_title: document.title
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

  pushEvent(eventData);
};

// Evento de Clique no Botão Criar Site
export const trackCreateSiteClick = (userData?: UserData) => {
  const eventData: any = {
    event: 'create_site_click',
    pageType: 'Homepage'
  };

  if (userData) {
    eventData.user_data = {
      ...(userData.country && { country: userData.country }),
      ...(userData.region && { region: userData.region }),
      ...(userData.city && { city: userData.city })
    };
  }

  pushEvent(eventData);
};

// Evento de Início do Checkout
export const trackBeginCheckout = (
  planType: 'basic' | 'premium',
  price: number,
  userData: UserData,
  paymentProvider: 'stripe' | 'mercadopago'
) => {
  const eventData = {
    event: 'begin_checkout',
    ecommerce: {
      currency: paymentProvider === 'mercadopago' ? 'BRL' : 'USD',
      value: price,
      items: [{
        item_id: `${planType}_plan`,
        item_name: `${planType.charAt(0).toUpperCase() + planType.slice(1)} Plan`,
        item_category: 'Memorial Plan',
        item_variant: planType,
        price: price,
        quantity: 1,
        content_type: 'product',
        content_ids: [`${planType}_plan`]
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
    payment_provider: paymentProvider
  };

  pushEvent(eventData);
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
  const eventData = {
    event: 'purchase',
    ecommerce: {
      transaction_id: transactionId,
      currency: paymentProvider === 'mercadopago' ? 'BRL' : 'USD',
      value: price,
      items: [{
        item_id: `${planType}_plan`,
        item_name: `${planType.charAt(0).toUpperCase() + planType.slice(1)} Plan`,
        item_category: 'Memorial Plan',
        item_variant: planType,
        price: price,
        quantity: 1,
        content_type: 'product',
        content_ids: [`${planType}_plan`]
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
    payment_status: status
  };

  pushEvent(eventData);
};

// Evento de Erro no Pagamento
export const trackPaymentError = (
  errorType: string,
  errorMessage: string,
  paymentProvider: 'stripe' | 'mercadopago'
) => {
  pushEvent({
    event: 'payment_error',
    error_type: errorType,
    error_message: errorMessage,
    payment_provider: paymentProvider
  });
};