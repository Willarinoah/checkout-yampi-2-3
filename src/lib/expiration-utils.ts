import { supabase } from '@/integrations/supabase/client';
import { getMemorialBySlug, updateMemorialData, getMemorialPaymentStatus } from './memorial-data-utils';

export const checkMemorialExpiration = async (slug: string) => {
  const { memorial } = await getMemorialBySlug(slug);
  
  if (!memorial) {
    return { isExpired: true, message: 'Memorial not found' };
  }

  // Check payment status first
  const paymentStatus = await getMemorialPaymentStatus(slug);
  if (paymentStatus !== 'paid') {
    return { isExpired: true, message: 'Payment pending' };
  }

  // Basic plan expires after 1 year
  if (memorial.plan_type.includes('1 year')) {
    const createdAt = new Date(memorial.created_at);
    const oneYearLater = new Date(createdAt.setFullYear(createdAt.getFullYear() + 1));
    const now = new Date();

    if (now > oneYearLater) {
      return { isExpired: true, message: 'Plan expired' };
    }
  }

  return { isExpired: false, message: null };
};

export const markMemorialAsExpired = async (slug: string, isBrazil: boolean) => {
  return updateMemorialData(slug, { 
    payment_status: 'expired'
  }, isBrazil);
};