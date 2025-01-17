import slugify from 'slugify';
import { supabase } from "@/integrations/supabase/client";
import { getMemorialBySlug, updateMemorialData, checkMemorialExists } from './memorial-data-utils';
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
  const { memorial } = await getMemorialBySlug(slug);
  if (!memorial) return null;
  
  return {
    ...memorial,
    plan_type: memorial.plan_type as "1 year, 3 photos and no music" | "Forever, 7 photos and music"
  };
};

export const updateMemorial = async (slug: string, data: Partial<UserConfig>, isBrazil: boolean) => {
  // Convert the UserConfig data back to Memorial type
  const memorialData = {
    ...data,
    plan_type: data.plan_type || undefined
  };
  return updateMemorialData(slug, memorialData, isBrazil);
};

export const createMemorial = async (data: MemorialFormData, isBrazil: boolean): Promise<UserConfig> => {
  const planType = getPlanTypeFromSelection(data.plan_type);
  const tableName = isBrazil ? 'mercadopago_memorials' : 'stripe_memorials';

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
    .select('*')
    .single();

  if (error) {
    console.error('Error creating memorial:', error);
    throw error;
  }

  return {
    ...memorial,
    plan_type: memorial.plan_type as "1 year, 3 photos and no music" | "Forever, 7 photos and music"
  } as UserConfig;
};