// Tipos base para eventos do DataLayer
export interface DataLayerEvent {
  event: string;
  pageType?: string;
  button_type?: string;
  button_location?: string;
  plan_type?: 'basic' | 'premium';
  payment_provider?: 'stripe' | 'mercadopago';
  payment_method?: string;
  payment_status?: string;
  checkout_step?: string;
  page_path?: string;
  page_title?: string;
  ecommerce?: {
    transaction_id?: string;
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
  funnel_data?: {
    step_name: string;
    step_number: number;
    conversion_rate?: number;
  };
}

// Type-safe declaration for Google Tag Manager's dataLayer
declare global {
  interface Window {
    dataLayer: DataLayerEvent[];
  }
}

// Função base para enviar eventos ao DataLayer
export const pushToDataLayer = (data: DataLayerEvent) => {
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(data);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('DataLayer Push:', data);
    }
  }
};