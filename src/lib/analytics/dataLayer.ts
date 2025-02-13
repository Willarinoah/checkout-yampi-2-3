
// Types for DataLayer events
export interface YampiCustomer {
  id: number;
  first_name: string;
  last_name: string;
  document?: string;
  document_type?: string;
  phone_number?: string;
  full_name: string;
  email: string;
}

export interface YampiProduct {
  id: string;
  sku: string;
  price: number;
  brand?: string;
  categories?: string[];
  image_url?: string;
  metadata?: Record<string, any>[];
}

export interface YampiOrderItem {
  product: YampiProduct;
  quantity: number;
  name: string;
  product_id: number;
  categories_names: string[];
}

export interface YampiOrder {
  id: number;
  token: string;
  payment_method: string;
  number: string;
  total: number;
  total_without_taxes?: number;
  total_without_shipping?: number;
  customer: YampiCustomer;
  status: string;
  items: YampiOrderItem[];
  address_info?: {
    hashed_first_name?: string;
    hashed_last_name?: string;
    hashed_street_address?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country_code?: string;
  };
}

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
  pageCategory?: string;
  order?: YampiOrder;
  orderConversionValue?: number;
  purchasedSkus?: string[];
  purchasedSkusText?: string;
  orderId?: number;
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
      sku?: string;
      brand?: string;
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
