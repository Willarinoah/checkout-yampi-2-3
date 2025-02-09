
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { PostgrestError } from "@supabase/supabase-js";
import type { Json } from "@/integrations/supabase/types";

export type YampiMemorial = Database['public']['Tables']['yampi_memorials']['Row'];
export type StripeMemorial = Database['public']['Tables']['stripe_memorials']['Row'];
export type Memorial = YampiMemorial | StripeMemorial;

export interface MemorialResult {
  memorial: Memorial | null;
  error: PostgrestError | null;
  source?: 'yampi' | 'stripe';
}

export const getMemorialBySlug = async (slug: string): Promise<MemorialResult> => {
  // First try yampi_memorials
  const { data: yampiMemorial, error: yampiError } = await supabase
    .from('yampi_memorials')
    .select('*')
    .eq('custom_slug', slug)
    .maybeSingle();

  if (yampiMemorial) {
    return { memorial: yampiMemorial, error: null, source: 'yampi' };
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

  return { memorial: null, error: stripeError || yampiError };
};

export const updateMemorialData = async (
  slug: string, 
  data: Partial<Memorial>, 
  isBrazil: boolean
) => {
  const tableName = isBrazil ? 'yampi_memorials' : 'stripe_memorials';
  return supabase
    .from(tableName)
    .update(data)
    .eq('custom_slug', slug);
};

export const checkMemorialExists = async (slug: string): Promise<boolean> => {
  // Check in both tables
  const { data: yampiMemorial } = await supabase
    .from('yampi_memorials')
    .select('custom_slug')
    .eq('custom_slug', slug)
    .maybeSingle();

  if (yampiMemorial) return true;

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
  plan_type: string;
  plan_price: number;
  relationship_start: string;
  time: string;
};

export const createMemorial = async (
  data: RequiredMemorialFields & Partial<Omit<Memorial, keyof RequiredMemorialFields>>,
  isBrazil: boolean
): Promise<Memorial | null> => {
  const { data: session } = await supabase.auth.getSession();
  const userId = session?.session?.user?.id;

  if (!userId) {
    throw new Error('User must be authenticated to create a memorial');
  }

  const tableName = isBrazil ? 'yampi_memorials' : 'stripe_memorials';
  
  const memorialData = {
    ...data,
    user_id: userId
  };

  console.log('Creating memorial with data:', memorialData);
  
  const { data: memorial, error: insertError } = await supabase
    .from(tableName)
    .insert(memorialData)
    .select()
    .maybeSingle();

  if (insertError) {
    console.error(`Error creating memorial in ${tableName}:`, insertError);
    throw insertError;
  }

  return memorial;
};

export const getMemorialPaymentStatus = async (slug: string): Promise<string> => {
  const { memorial } = await getMemorialBySlug(slug);
  return memorial?.payment_status || 'pending';
};

