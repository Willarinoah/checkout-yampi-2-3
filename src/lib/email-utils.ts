import { supabase } from '@/integrations/supabase/client';

export const sendMemorialEmail = async (email: string, memorialUrl: string, qrCodeUrl: string) => {
  const { data, error } = await supabase.functions.invoke('send-memorial-email', {
    body: {
      to: email,
      memorialUrl,
      qrCodeUrl
    }
  });

  if (error) throw error;
  return data;
};