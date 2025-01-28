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

// Helper function for hashing sensitive data
const hashData = (data: string): string => {
  return sha256(data).toString();
};

// Page View Event (already implemented)
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

// Button Click Events
export const trackButtonClick = (
  buttonType: 'create_site' | 'basic_plan' | 'premium_plan' | 'create_memorial' | 'payment',
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

// Payment Form Events
export const trackPaymentFormInteraction = (
  action: 'start' | 'field_complete' | 'submit',
  paymentProvider: 'stripe' | 'mercadopago',
  fieldName?: string,
  userData?: UserData
) => {
  pushToDataLayer({
    event: 'payment_form_interaction',
    button_type: action,
    payment_provider: paymentProvider,
    form_field: fieldName,
    form_status: action === 'start' ? 'started' : action === 'submit' ? 'completed' : undefined,
    user_data: userData ? {
      ...(userData.email && { email_sha256: hashData(userData.email) }),
      ...(userData.phone && { phone_sha256: hashData(userData.phone) }),
      ...(userData.name && { name_sha256: hashData(userData.name) })
    } : undefined,
    funnel_data: {
      step_name: `payment_form_${action}`,
      step_number: 3
    }
  });
};

// Checkout Events
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

// Purchase Event
export const trackPurchase = (
  transactionId: string,
  planType: 'basic' | 'premium',
  price: number,
  paymentMethod: string,
  paymentProvider: 'stripe' | 'mercadopago',
  userData: UserData,
  status: 'approved' | 'pending' | 'rejected' | 'succeeded' | 'failed' | 'canceled'
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
      ...(userData.name && { name_sha256: hashData.name) }),
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

// Helper function to determine funnel step number
const getStepNumber = (stepName: string): number => {
  const stepMap: Record<string, number> = {
    'homepage': 1,
    'create': 2,
    'payment_form': 3,
    'checkout': 4,
    'purchase': 5
  };
  
  return stepMap[stepName.toLowerCase()] || 0;
};