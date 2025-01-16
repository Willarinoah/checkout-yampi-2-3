import slugify from 'slugify';
import { supabase } from "@/integrations/supabase/client";
import type { UserConfig, MemorialFormData } from '@/types/database/memorial';

export const generateUniqueSlug = async (coupleName: string): Promise<string> => {
  const baseSlug = slugify(coupleName, {
    lower: true,
    strict: true,
    trim: true,
    locale: 'pt'
  });

  // Function to generate the full URL
  const generateMemorialUrl = (slug: string) => `${window.location.origin}/memorial/${slug}`;

  const { data: existingWithBase, error: slugError } = await supabase
    .from('user_configs')
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
      .from('user_configs')
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
  const { data: memorial, error } = await supabase
    .from('user_configs')
    .insert([{
      couple_name: data.couple_name,
      email: data.email,
      relationship_start: data.relationship_start,
      time: data.time,
      message: data.message,
      plan_type: data.plan_type,
      plan_price: data.plan_price,
      custom_slug: data.custom_slug,
      unique_url: data.unique_url,
      payment_status: data.payment_status,
      qr_code_url: data.qr_code_url,
      photos: data.photos,
      youtube_url: data.youtube_url || null
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating memorial:', error);
    throw error;
  }

  return memorial;
};

export const getMemorialBySlug = async (slug: string): Promise<UserConfig | null> => {
  const { data, error } = await supabase
    .from('user_configs')
    .select('*')
    .eq('custom_slug', slug)
    .single();

  if (error) {
    console.error('Error fetching memorial:', error);
    return null;
  }

  return data;
};