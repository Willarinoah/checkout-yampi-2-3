import { supabase } from '@/integrations/supabase/client';
import { checkMemorialExists, getMemorialBySlug } from './memorial-data-utils';

export const isSlugAvailable = async (slug: string): Promise<boolean> => {
  return !(await checkMemorialExists(slug));
};

export const getMemorialUrl = async (slug: string): Promise<string | null> => {
  const { memorial } = await getMemorialBySlug(slug);
  return memorial?.unique_url || null;
};

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