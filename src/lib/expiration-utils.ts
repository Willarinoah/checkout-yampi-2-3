import { supabase } from '@/integrations/supabase/client';

export const checkUrlExpiration = async (memorialId: string): Promise<boolean> => {
  const { data: memorial, error } = await supabase
    .from('memorials')
    .select('plan_type, payment_status')
    .eq('id', memorialId)
    .single();

  if (error) {
    console.error('Error checking URL expiration:', error);
    return false;
  }

  if (!memorial) {
    return false;
  }

  // Check payment status first
  if (memorial.payment_status !== 'paid') {
    return false;
  }

  // Forever plan doesn't expire
  if (memorial.plan_type === 'Forever, 7 photos and music') {
    return true;
  }

  // Basic plan (1 year) expires after one year from creation
  const { data: creationData } = await supabase
    .from('memorials')
    .select('created_at')
    .eq('id', memorialId)
    .single();

  if (creationData) {
    const creationDate = new Date(creationData.created_at);
    const expirationDate = new Date(creationDate.setFullYear(creationDate.getFullYear() + 1));
    return new Date() < expirationDate;
  }

  return false;
};

export const handleExpiredUrl = async (memorialId: string): Promise<void> => {
  const { error } = await supabase
    .from('memorials')
    .update({ payment_status: 'pending' })
    .eq('id', memorialId);

  if (error) {
    console.error('Error handling expired URL:', error);
    throw error;
  }
};