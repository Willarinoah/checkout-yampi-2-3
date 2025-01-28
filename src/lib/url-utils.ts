import { supabase } from '@/integrations/supabase/client';
import { checkMemorialExists, getMemorialBySlug } from './memorial-data-utils';

export const generateSlug = (coupleName: string): string => {
  return coupleName.toLowerCase().replace(/\s+/g, '-');
};

export const isSlugAvailable = async (slug: string): Promise<boolean> => {
  return !(await checkMemorialExists(slug));
};

export const getMemorialUrl = async (slug: string): Promise<string | null> => {
  const { memorial } = await getMemorialBySlug(slug);
  return memorial?.unique_url || null;
};

export const generateMemorialUrl = async (coupleName: string): Promise<string> => {
  // First try yampi_memorials
  const { data: yampiMemorial } = await supabase
    .from('yampi_memorials')
    .select('unique_url')
    .eq('couple_name', coupleName)
    .maybeSingle();

  if (yampiMemorial?.unique_url) {
    return yampiMemorial.unique_url;
  }

  // If not found, try stripe_memorials
  const { data: stripeMemorial } = await supabase
    .from('stripe_memorials')
    .select('unique_url')
    .eq('couple_name', coupleName)
    .maybeSingle();

  if (stripeMemorial?.unique_url) {
    return stripeMemorial.unique_url;
  }

  // If not found in either table, generate a new URL
  const baseUrl = window.location.origin;
  return `${baseUrl}/memorial/${coupleName.toLowerCase().replace(/\s+/g, '-')}`;
};

export const checkUrlAvailability = async (url: string): Promise<boolean> => {
  // Check both tables
  const { data: yampiMemorial } = await supabase
    .from('yampi_memorials')
    .select('id')
    .eq('unique_url', url)
    .maybeSingle();

  if (yampiMemorial) {
    return false;
  }

  const { data: stripeMemorial } = await supabase
    .from('stripe_memorials')
    .select('id')
    .eq('unique_url', url)
    .maybeSingle();

  return !stripeMemorial;
};