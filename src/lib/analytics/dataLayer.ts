declare global {
  interface Window {
    dataLayer: any[];
  }
}

// Inicialização do dataLayer
window.dataLayer = window.dataLayer || [];

export interface DataLayerEvent {
  event: string;
  pageType?: string;
  ecommerce?: {
    currency?: string;
    value?: number;
    items?: Array<{
      item_id: string;
      item_name: string;
      price: number;
      quantity?: number;
    }>;
  };
  user_data?: {
    email_sha256?: string;
    phone_sha256?: string;
    name_sha256?: string;
    country?: string;
    region?: string;
    city?: string;
  };
}

export const pushToDataLayer = (data: DataLayerEvent) => {
  if (typeof window !== 'undefined') {
    window.dataLayer.push(data);
    if (process.env.NODE_ENV === 'development') {
      console.log('DataLayer Push:', data);
    }
  }
};

// Eventos de Página
export const trackPageView = (pageType: string) => {
  pushToDataLayer({
    event: 'page_view',
    pageType
  });
};

// Eventos de Plano
export const trackPlanSelection = (planType: string, price: number, currency: string) => {
  pushToDataLayer({
    event: 'select_plan',
    pageType: 'Plan Selection',
    ecommerce: {
      currency,
      value: price,
      items: [{
        item_id: planType,
        item_name: `${planType} Plan`,
        price,
        quantity: 1
      }]
    }
  });
};

// Eventos de Checkout
export const trackBeginCheckout = (planType: string, price: number, currency: string) => {
  pushToDataLayer({
    event: 'begin_checkout',
    pageType: 'Checkout',
    ecommerce: {
      currency,
      value: price,
      items: [{
        item_id: planType,
        item_name: `${planType} Plan`,
        price,
        quantity: 1
      }]
    }
  });
};

// Eventos de Compra
export const trackPurchase = (
  planType: string, 
  price: number, 
  currency: string,
  transactionId: string
) => {
  pushToDataLayer({
    event: 'purchase',
    pageType: 'Purchase',
    ecommerce: {
      currency,
      value: price,
      items: [{
        item_id: planType,
        item_name: `${planType} Plan`,
        price,
        quantity: 1
      }]
    }
  });
};

// Eventos de Localização
export const trackUserLocation = (country: string, region?: string, city?: string) => {
  pushToDataLayer({
    event: 'user_location',
    user_data: {
      country,
      region,
      city
    }
  });
};

// Eventos de Memorial
export const trackMemorialCreation = (memorialId: string) => {
  pushToDataLayer({
    event: 'create_memorial',
    pageType: 'Memorial Creation'
  });
};

// Eventos de Upload
export const trackPhotoUpload = (quantity: number) => {
  pushToDataLayer({
    event: 'upload_photos',
    pageType: 'Photo Upload'
  });
};