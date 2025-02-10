
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { Json } from "@/integrations/supabase/types";
import { uploadPhotosToStorage, uploadQRCode } from './file-upload';
import { generateQRCodeBlob } from './qr-utils';
import { generateUniqueSlug } from './memorial-utils';
import { sanitizeBaseUrl, constructMemorialUrl } from './url-sanitizer';

export type YampiMemorial = Database['public']['Tables']['yampi_memorials']['Row'];
export type StripeMemorial = Database['public']['Tables']['stripe_memorials']['Row'];
export type Memorial = YampiMemorial | StripeMemorial;

interface SaveMemorialInput {
  coupleName: string;
  message?: string;
  photos: File[];
  youtubeUrl?: string;
  planType: "basic" | "premium";
  planPrice: number;
  startDate: Date;
  startTime: string;
  email?: string;
  fullName?: string;
  phone?: string;
  addressInfo?: Json;
  isBrazil: boolean;
}

export type RequiredMemorialFields = {
  couple_name: string;
  custom_slug: string;
  plan_type: string;
  plan_price: number;
  payment_status: string;
  unique_url: string;
  relationship_start: string;
  time: string;
};

export const getMemorialBySlug = async (slug: string): Promise<{ memorial: Memorial | null; error?: string }> => {
  try {
    // Try yampi_memorials first
    const { data: yampiMemorial, error: yampiError } = await supabase
      .from('yampi_memorials')
      .select('*')
      .eq('custom_slug', slug)
      .maybeSingle();

    if (yampiMemorial) {
      return { memorial: yampiMemorial };
    }

    // If not found in yampi, try stripe_memorials
    const { data: stripeMemorial, error: stripeError } = await supabase
      .from('stripe_memorials')
      .select('*')
      .eq('custom_slug', slug)
      .maybeSingle();

    if (stripeMemorial) {
      return { memorial: stripeMemorial };
    }

    return { memorial: null, error: 'Memorial not found' };
  } catch (error) {
    console.error('Error fetching memorial:', error);
    return { memorial: null, error: 'Error fetching memorial' };
  }
};

export const updateMemorialData = async (
  slug: string,
  data: Partial<RequiredMemorialFields & Partial<Memorial>>,
  isBrazil: boolean
): Promise<{ success: boolean; error?: string }> => {
  const tableName = isBrazil ? 'yampi_memorials' : 'stripe_memorials';
  
  try {
    const { error } = await supabase
      .from(tableName)
      .update(data)
      .eq('custom_slug', slug);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error(`Error updating ${tableName}:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};

export const getMemorialPaymentStatus = async (slug: string): Promise<string> => {
  const { memorial, error } = await getMemorialBySlug(slug);
  if (error || !memorial) {
    throw new Error(error || 'Memorial not found');
  }
  return memorial.payment_status;
};

export const checkMemorialExists = async (slug: string): Promise<boolean> => {
  const { memorial } = await getMemorialBySlug(slug);
  return !!memorial;
};

export const createMemorial = async (
  memorialData: RequiredMemorialFields & Partial<Memorial>,
  isBrazil: boolean
): Promise<Memorial | null> => {
  const tableName = isBrazil ? 'yampi_memorials' : 'stripe_memorials';
  
  try {
    const { data, error } = await supabase
      .from(tableName)
      .insert(memorialData)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error creating memorial in ${tableName}:`, error);
    return null;
  }
};

export const saveMemorialData = async (input: SaveMemorialInput): Promise<{ success: boolean; error?: string; data?: Memorial }> => {
  try {
    console.log('Starting memorial data save process...', input);

    if (!input.coupleName || !input.startDate || !input.photos.length) {
      throw new Error('Missing required fields');
    }

    // Generate unique slug and URL
    const customSlug = await generateUniqueSlug(input.coupleName);
    const baseUrl = sanitizeBaseUrl(window.location.origin);
    const uniqueUrl = constructMemorialUrl(baseUrl, `/memorial/${customSlug}`);
    console.log('Generated unique URL:', uniqueUrl);

    // Generate and upload QR Code
    const qrCodeBlob = await generateQRCodeBlob(uniqueUrl);
    const qrCodeUrl = await uploadQRCode(qrCodeBlob, customSlug);
    console.log('QR Code uploaded:', qrCodeUrl);

    // Upload photos
    const photoUrls = await uploadPhotosToStorage(input.photos, customSlug);
    console.log('Photos uploaded:', photoUrls);

    const planType = input.planType === "basic" 
      ? input.isBrazil ? "1 year, 3 photos and no music" : "1 year, 3 photos and no music (international)"
      : input.isBrazil ? "Forever, 7 photos and music" : "Forever, 7 photos and music (international)";

    const memorialData: RequiredMemorialFields & Partial<Memorial> = {
      couple_name: input.coupleName,
      message: input.message || null,
      plan_type: planType,
      plan_price: input.planPrice,
      custom_slug: customSlug,
      unique_url: uniqueUrl,
      payment_status: "pending",
      qr_code_url: qrCodeUrl,
      photos: photoUrls,
      youtube_url: input.planType === "premium" && input.youtubeUrl ? input.youtubeUrl : null,
      relationship_start: input.startDate.toISOString(),
      time: input.startTime,
      email: input.email || '',
      full_name: input.fullName || input.coupleName,
      phone: input.phone || '',
      address_info: input.addressInfo || null,
      preferences: null,
      data_validated: true,
      status_details: {
        creation_timestamp: new Date().toISOString(),
        initial_save: true
      }
    };

    const tableName = input.isBrazil ? 'yampi_memorials' : 'stripe_memorials';
    console.log(`Saving memorial data to ${tableName}...`);

    const { data: memorial, error: insertError } = await supabase
      .from(tableName)
      .insert(memorialData)
      .select()
      .maybeSingle();

    if (insertError) {
      console.error(`Error inserting memorial into ${tableName}:`, insertError);
      throw new Error(insertError.message);
    }

    if (!memorial) {
      throw new Error('Failed to create memorial record');
    }

    console.log('Successfully saved memorial data:', memorial);
    return { success: true, data: memorial };

  } catch (error) {
    console.error('Error in saveMemorialData:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return { 
      success: false, 
      error: errorMessage,
      data: undefined 
    };
  }
};
