import slugify from 'slugify';
import { supabase } from "@/integrations/supabase/client";
import type { UserConfig, MemorialFormData } from '@/types/database/memorial';
import { getPlanTypeFromSelection } from '@/types/database/memorial';

export const generateUniqueSlug = async (coupleName: string): Promise<string> => {
  const baseSlug = slugify(coupleName, {
    lower: true,
    strict: true,
    trim: true,
    locale: 'pt'
  });

  const { data: existingWithBase, error: slugError } = await supabase
    .from('memorials')
    .select('custom_slug')
    .eq('custom_slug', baseSlug)
    .maybeSingle();

  if (slugError) {
    console.error('Error checking slug:', slugError);
    throw slugError;
  }

  if (!existingWithBase) {
    return baseSlug;
  }

  let counter = 1;
  while (true) {
    const newSlug = `${baseSlug}-${counter}`;
    const { data: existing, error } = await supabase
      .from('memorials')
      .select('custom_slug')
      .eq('custom_slug', newSlug)
      .maybeSingle();

    if (error) {
      console.error('Error checking slug:', error);
      throw error;
    }

    if (!existing) {
      return newSlug;
    }
    counter++;
  }
};

export const createMemorial = async (data: MemorialFormData): Promise<UserConfig> => {
  const planType = getPlanTypeFromSelection(data.plan_type);

  const { data: memorial, error } = await supabase
    .from('memorials')
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

  // Ensure the plan_type is correctly typed when returning
  return {
    ...memorial,
    plan_type: memorial.plan_type as "1 year, 3 photos and no music" | "Forever, 7 photos and music"
  } as UserConfig;
};

export const getMemorialBySlug = async (slug: string): Promise<UserConfig | null> => {
  const { data, error } = await supabase
    .from('memorials')
    .select('*')
    .eq('custom_slug', slug)
    .single();

  if (error) {
    console.error('Error fetching memorial:', error);
    return null;
  }

  // Ensure the plan_type is correctly typed when returning
  return data ? {
    ...data,
    plan_type: data.plan_type as "1 year, 3 photos and no music" | "Forever, 7 photos and music"
  } as UserConfig : null;
};