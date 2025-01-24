interface PaymentTrackingData {
  payment_method: 'pix' | 'credit_card' | 'credit_card_installments';
  plan_type: 'basic' | 'premium';
  value: number;
  currency: 'USD' | 'BRL';
  country_code: string;
  region?: string;
  city?: string;
  installments?: number;
}

declare global {
  interface Window {
    dataLayer: any[];
  }
}

export const initializeGTM = () => {
  // Código de inicialização do GTM
  (function(w: Window, d: Document, s: 'script', l: string, i: string) {
    w[l] = w[l] || [];
    w[l].push({'gtm.start': new Date().getTime(), event: 'gtm.js'});
    const f = d.getElementsByTagName(s)[0];
    const j = d.createElement(s) as HTMLScriptElement;
    const dl = l !== 'dataLayer' ? '&l=' + l : '';
    j.async = true;
    j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
    f.parentNode?.insertBefore(j, f);
  })(window, document, 'script', 'dataLayer', 'GTM-XXXXXXX'); // Substitua GTM-XXXXXXX pelo seu ID do GTM
};

export const trackPaymentMethod = (data: PaymentTrackingData) => {
  if (typeof window === 'undefined') return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'select_payment_method',
    ecommerce: {
      currency: data.currency,
      value: data.value,
      items: [{
        item_name: `${data.plan_type}_plan`,
        price: data.value,
        currency: data.currency,
        quantity: 1
      }]
    },
    payment_method: data.payment_method,
    plan_type: data.plan_type,
    country_code: data.country_code,
    region: data.region,
    city: data.city,
    installments: data.installments
  });
};

export const trackBeginCheckout = (data: Omit<PaymentTrackingData, 'payment_method' | 'installments'>) => {
  if (typeof window === 'undefined') return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'begin_checkout',
    ecommerce: {
      currency: data.currency,
      value: data.value,
      items: [{
        item_name: `${data.plan_type}_plan`,
        price: data.value,
        currency: data.currency,
        quantity: 1
      }]
    },
    plan_type: data.plan_type,
    country_code: data.country_code,
    region: data.region,
    city: data.city
  });
};