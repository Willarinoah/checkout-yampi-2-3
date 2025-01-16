import { supabase } from '@/integrations/supabase/client';

export const checkUrlExpiration = async (memorialId: string): Promise<boolean> => {
  const { data: memorial, error } = await supabase
    .from('memorial_pages')
    .select('plan, expires_at')
    .eq('id', memorialId)
    .single();

  if (error) {
    console.error('Error checking URL expiration:', error);
    return false;
  }

  if (!memorial) {
    return false;
  }

  // Premium plans don't expire
  if (memorial.plan === 'premium') {
    return true;
  }

  // Basic plans expire after their expiration date
  if (memorial.expires_at) {
    const now = new Date();
    const expirationDate = new Date(memorial.expires_at);
    return now < expirationDate;
  }

  return false;
};

export const handleExpiredUrl = async (memorialId: string): Promise<void> => {
  const { error } = await supabase
    .from('memorial_pages')
    .update({ status: 'expired' })
    .eq('id', memorialId);

  if (error) {
    console.error('Error handling expired URL:', error);
    throw error;
  }
};
