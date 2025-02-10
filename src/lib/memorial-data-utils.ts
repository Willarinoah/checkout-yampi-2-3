
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { PostgrestError } from "@supabase/supabase-js";
import type { Json } from "@/integrations/supabase/types";
import { uploadPhotosToStorage, uploadQRCode } from './file-upload';
import { generateQRCodeBlob } from './qr-utils';
import { generateUniqueSlug } from './memorial-utils';
import { sanitizeBaseUrl, constructMemorialUrl } from './url-sanitizer';
import { toast } from "sonner";

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

export const saveMemorialData = async (input: SaveMemorialInput): Promise<{ success: boolean; error?: string; data?: Memorial }> => {
  try {
    console.log('Starting memorial data save process...', input);

    // Validação básica
    if (!input.coupleName || !input.startDate || !input.photos.length) {
      throw new Error('Missing required fields');
    }

    // Gerar slug e URL única
    const customSlug = await generateUniqueSlug(input.coupleName);
    const baseUrl = sanitizeBaseUrl(window.location.origin);
    const uniqueUrl = constructMemorialUrl(baseUrl, `/memorial/${customSlug}`);
    console.log('Generated unique URL:', uniqueUrl);

    // Gerar e fazer upload do QR Code
    const qrCodeBlob = await generateQRCodeBlob(uniqueUrl);
    const qrCodeUrl = await uploadQRCode(qrCodeBlob, customSlug);
    console.log('QR Code uploaded:', qrCodeUrl);

    // Upload das fotos
    const photoUrls = await uploadPhotosToStorage(input.photos, customSlug);
    console.log('Photos uploaded:', photoUrls);

    const planType = input.planType === "basic" 
      ? input.isBrazil ? "1 year, 3 photos and no music" : "1 year, 3 photos and no music (international)"
      : input.isBrazil ? "Forever, 7 photos and music" : "Forever, 7 photos and music (international)";

    const memorialData = {
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

