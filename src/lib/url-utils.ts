import { supabase } from '@/integrations/supabase/client';

export const generateMemorialUrl = async (coupleName: string): Promise<string> => {
  const { data: config } = await supabase
    .from('memorials')
    .select('unique_url')
    .eq('couple_name', coupleName)
    .single();

  if (config?.unique_url) {
    return config.unique_url;
  }

  const baseUrl = window.location.origin;
  return `${baseUrl}/memorial/${coupleName.toLowerCase().replace(/\s+/g, '-')}`;
};

export const checkUrlAvailability = async (url: string): Promise<boolean> => {
  const { data: existingConfig } = await supabase
    .from('memorials')
    .select('id')
    .eq('unique_url', url)
    .single();

  return !existingConfig;
};