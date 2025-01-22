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
  // Primeiro tenta encontrar na tabela mercadopago_memorials
  const { data: mpMemorial } = await supabase
    .from('mercadopago_memorials')
    .select('unique_url')
    .eq('couple_name', coupleName)
    .maybeSingle();

  if (mpMemorial?.unique_url) {
    return mpMemorial.unique_url;
  }

  // Se não encontrar, tenta na tabela stripe_memorials
  const { data: stripeMemorial } = await supabase
    .from('stripe_memorials')
    .select('unique_url')
    .eq('couple_name', coupleName)
    .maybeSingle();

  if (stripeMemorial?.unique_url) {
    return stripeMemorial.unique_url;
  }

  // Se não encontrar em nenhuma tabela, gera uma nova URL
  const baseUrl = window.location.origin;
  return `${baseUrl}/memorial/${coupleName.toLowerCase().replace(/\s+/g, '-')}`;
};

export const checkUrlAvailability = async (url: string): Promise<boolean> => {
  // Verifica em ambas as tabelas
  const { data: mpMemorial } = await supabase
    .from('mercadopago_memorials')
    .select('id')
    .eq('unique_url', url)
    .maybeSingle();

  if (mpMemorial) {
    return false;
  }

  const { data: stripeMemorial } = await supabase
    .from('stripe_memorials')
    .select('id')
    .eq('unique_url', url)
    .maybeSingle();

  return !stripeMemorial;
};