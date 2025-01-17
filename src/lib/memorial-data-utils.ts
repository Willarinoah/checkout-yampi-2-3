import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { PostgrestError } from "@supabase/supabase-js";
import type { Json } from "@/integrations/supabase/types";

export type MercadoPagoMemorial = Database['public']['Tables']['mercadopago_memorials']['Row'];
export type StripeMemorial = Database['public']['Tables']['stripe_memorials']['Row'];
export type Memorial = MercadoPagoMemorial | StripeMemorial;

export interface MemorialResult {
  memorial: Memorial | null;
  error: PostgrestError | null;
  source?: 'mercadopago' | 'stripe';
}

export const getMemorialBySlug = async (slug: string): Promise<MemorialResult> => {
  // First try mercadopago_memorials
  const { data: mpMemorial, error: mpError } = await supabase
    .from('mercadopago_memorials')
    .select('*')
    .eq('custom_slug', slug)
    .maybeSingle();

  if (mpMemorial) {
    return { memorial: mpMemorial, error: null, source: 'mercadopago' };
  }

  // If not found, try stripe_memorials
  const { data: stripeMemorial, error: stripeError } = await supabase
    .from('stripe_memorials')
    .select('*')
    .eq('custom_slug', slug)
    .maybeSingle();

  if (stripeMemorial) {
    return { memorial: stripeMemorial, error: null, source: 'stripe' };
  }

  return { memorial: null, error: stripeError || mpError };
};

export const updateMemorialData = async (
  slug: string, 
  data: Partial<Memorial>, 
  isBrazil: boolean
) => {
  const tableName = isBrazil ? 'mercadopago_memorials' : 'stripe_memorials';
  return supabase
    .from(tableName)
    .update(data)
    .eq('custom_slug', slug);
};

export const checkMemorialExists = async (slug: string): Promise<boolean> => {
  // Check in both tables
  const { data: mpMemorial } = await supabase
    .from('mercadopago_memorials')
    .select('custom_slug')
    .eq('custom_slug', slug)
    .maybeSingle();

  if (mpMemorial) return true;

  const { data: stripeMemorial } = await supabase
    .from('stripe_memorials')
    .select('custom_slug')
    .eq('custom_slug', slug)
    .maybeSingle();

  return !!stripeMemorial;
};

type RequiredMemorialFields = {
  couple_name: string;
  custom_slug: string;
  unique_url: string;
};

export const createMemorial = async (
  data: RequiredMemorialFields & Partial<Memorial>,
  isBrazil: boolean
): Promise<Memorial | null> => {
  const tableName = isBrazil ? 'mercadopago_memorials' : 'stripe_memorials';
  
  const { data: memorial, error } = await supabase
    .from(tableName)
    .insert([data])
    .select()
    .maybeSingle();

  if (error) {
    console.error(`Error creating memorial in ${tableName}:`, error);
    throw error;
  }

  return memorial;
};

export const getMemorialPaymentStatus = async (slug: string): Promise<string> => {
  const { memorial } = await getMemorialBySlug(slug);
  return memorial?.payment_status || 'pending';
};