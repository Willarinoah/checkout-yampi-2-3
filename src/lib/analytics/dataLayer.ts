
// Types for DataLayer events
export interface DataLayerEvent {
  event: string;
  pageType?: string;
  button_type?: string;
  button_location?: string;
  plan_type?: 'basic' | 'premium';
  payment_provider?: 'stripe' | 'yampi';
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
    items?: Array<{
      item_id: string;
      item_name: string;
      price: number;
      quantity?: number;
      item_category?: string;
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
    if (fbclid) {
      // Store fbclid in localStorage for persistence
      localStorage.setItem('fbclid', fbclid);
    }
    
    // Add Facebook browser ID (fbp) if present in cookies
    const fbp = document.cookie.split(';').find(c => c.trim().startsWith('_fbp='));
    if (fbp) {
      // Add fbp to user_data if it exists
      if (data.user_data) {
        data.user_data.external_id = fbp.split('=')[1];
      }
    }
    
    // Add stored fbclid if exists
    const storedFbclid = localStorage.getItem('fbclid');
    if (storedFbclid && data.user_data) {
      data.user_data.external_id = storedFbclid;
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
