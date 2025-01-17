import slugify from 'slugify';
import { supabase } from "@/integrations/supabase/client";
import type { UserConfig, MemorialFormData } from '@/types/database/memorial';
import { getPlanTypeFromSelection } from '@/types/database/memorial';

const generateSlug = (coupleName: string): string => {
  return slugify(coupleName, {
    lower: true,
    strict: true,
    trim: true,
    locale: 'pt'
  });
};

export const generateUniqueSlug = async (coupleName: string): Promise<string> => {
  let slug = generateSlug(coupleName);
  let isAvailable = !(await checkMemorialExists(slug));
  let counter = 1;

  while (!isAvailable) {
    slug = `${generateSlug(coupleName)}-${counter}`;
    isAvailable = !(await checkMemorialExists(slug));
    counter++;
  }

  return slug;
};

export const getMemorialData = async (slug: string): Promise<UserConfig | null> => {
  // First try mercadopago_memorials
  const { data: mpMemorial, error: mpError } = await supabase
    .from('mercadopago_memorials')
    .select('*')
    .eq('custom_slug', slug)
    .maybeSingle();

  if (mpMemorial) {
    console.log('Found memorial in mercadopago_memorials:', mpMemorial);
    return {
      ...mpMemorial,
      plan_type: mpMemorial.plan_type as "1 year, 3 photos and no music" | "Forever, 7 photos and music"
    };
  }

  // If not found, try stripe_memorials
  const { data: stripeMemorial, error: stripeError } = await supabase
    .from('stripe_memorials')
    .select('*')
    .eq('custom_slug', slug)
    .maybeSingle();

  if (stripeMemorial) {
    console.log('Found memorial in stripe_memorials:', stripeMemorial);
    return {
      ...stripeMemorial,
      plan_type: stripeMemorial.plan_type as "1 year, 3 photos and no music" | "Forever, 7 photos and music"
    };
  }

  console.log('Memorial not found in either table:', { mpError, stripeError });
  return null;
};

export const updateMemorial = async (slug: string, data: Partial<UserConfig>, isBrazil: boolean) => {
  const tableName = isBrazil ? 'mercadopago_memorials' : 'stripe_memorials';
  console.log(`Updating memorial in ${tableName}:`, { slug, data });
  
  const { data: result, error } = await supabase
    .from(tableName)
    .update(data)
    .eq('custom_slug', slug)
    .select()
    .maybeSingle();

  if (error) {
    console.error(`Error updating memorial in ${tableName}:`, error);
    throw error;
  }

  return result;
};

export const checkMemorialExists = async (slug: string): Promise<boolean> => {
  // Check in mercadopago_memorials
  const { data: mpMemorial, error: mpError } = await supabase
    .from('mercadopago_memorials')
    .select('custom_slug')
    .eq('custom_slug', slug)
    .maybeSingle();

  if (mpMemorial) return true;

  // Check in stripe_memorials
  const { data: stripeMemorial, error: stripeError } = await supabase
    .from('stripe_memorials')
    .select('custom_slug')
    .eq('custom_slug', slug)
    .maybeSingle();

  return !!stripeMemorial;
};

export const createMemorial = async (data: MemorialFormData, isBrazil: boolean): Promise<UserConfig> => {
  const planType = getPlanTypeFromSelection(data.plan_type);
  const tableName = isBrazil ? 'mercadopago_memorials' : 'stripe_memorials';
  
  console.log(`Creating memorial in ${tableName}:`, data);

  const { data: memorial, error } = await supabase
    .from(tableName)
    .insert([{
      couple_name: data.couple_name,
      message: data.message,
      plan_type: planType,
      plan_price: data.plan_price,
      custom_slug: data.custom_slug,
      unique_url: data.unique_url,
      payment_status: data.payment_status,
      qr_code_url: data.qr_code_url,
      photos: data.photos,
      youtube_url: data.youtube_url,
      relationship_start: data.relationship_start,
      time: data.time,
      email: data.email,
      full_name: data.full_name,
      phone: data.phone,
      address_info: data.address_info,
      preferences: data.preferences
    }])
    .select()
    .maybeSingle();

  if (error) {
    console.error(`Error creating memorial in ${tableName}:`, error);
    throw error;
  }

  if (!memorial) {
    throw new Error('Failed to create memorial');
  }

  console.log(`Successfully created memorial:`, memorial);

  return {
    ...memorial,
    plan_type: memorial.plan_type as "1 year, 3 photos and no music" | "Forever, 7 photos and music"
  };
};