
// Types for DataLayer events
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
  form_status?: 'started' | 'completed' | 'abandoned';
  form_field?: string;
  page_path?: string;
  page_title?: string;
  // Enhanced E-commerce data
  ecommerce?: {
    transaction_id?: string;
    currency?: string;
    value?: number;
    content_type?: string;
    content_ids?: string[];
    contents?: Array<{
      id: string;
      quantity: number;
      item_price: number;
    }>;
    content_name?: string;
    content_category?: string;
    items?: Array<{
      item_id: string;
      item_name: string;
      price: number;
      quantity?: number;
      item_category?: string;
      item_variant?: string;
      item_brand?: string;
    }>;
  };
  // User data (hashed for privacy)
  user_data?: {
    email_sha256?: string;
    phone_sha256?: string;
    name_sha256?: string;
    country?: string;
    region?: string;
    city?: string;
    external_id?: string;
    client_user_agent?: string;
  };
  // Facebook specific tracking
  fb_tracking?: {
    fbp?: string;
    fbc?: string;
  };
  // Funnel data
  funnel_data?: {
    step_name: string;
    step_number: number;
    conversion_rate?: number;
  };
}

declare global {
  interface Window {
    dataLayer: DataLayerEvent[];
  }
}

export const pushToDataLayer = (data: DataLayerEvent) => {
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    
    // Add Facebook click ID (fbc) if present in URL
    const fbclid = new URLSearchParams(window.location.search).get('fbclid');
    if (fbclid && data.fb_tracking) {
      data.fb_tracking.fbc = fbclid;
    }
    
    // Add Facebook browser ID (fbp) if present in cookies
    const fbp = document.cookie.split(';').find(c => c.trim().startsWith('_fbp='));
    if (fbp && data.fb_tracking) {
      data.fb_tracking.fbp = fbp.split('=')[1];
    }
    
    // Add user agent
    if (data.user_data) {
      data.user_data.client_user_agent = window.navigator.userAgent;
    }
    
    window.dataLayer.push(data);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('DataLayer Push:', data);
    }
  }
};
