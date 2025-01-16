import { supabase } from "@/integrations/supabase/client";

export const uploadPhotosToStorage = async (photos: File[], memorialId: string): Promise<string[]> => {
  console.log('Starting photo upload process for memorial:', memorialId);
  
  const uploadPromises = photos.map(async (photo, index) => {
    const fileExt = photo.name.split('.').pop();
    const fileName = `${memorialId}/photos/${crypto.randomUUID()}.${fileExt}`;
    
    console.log('Uploading photo:', fileName);
    
    const { data, error: uploadError } = await supabase.storage
      .from('memorials')
      .upload(fileName, photo);

    if (uploadError) {
      console.error('Error uploading photo:', uploadError);
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('memorials')
      .getPublicUrl(fileName);

    console.log('Photo uploaded successfully:', publicUrl);
    return publicUrl;
  });

  return Promise.all(uploadPromises);
};

export const uploadQRCode = async (qrCodeBlob: Blob, memorialId: string): Promise<string> => {
  console.log('Starting QR code upload for memorial:', memorialId);
  
  const fileName = `${memorialId}/qr-code.png`;
  
  const { error } = await supabase.storage
    .from('memorials')
    .upload(fileName, qrCodeBlob);

  if (error) {
    console.error('Error uploading QR code:', error);
    throw error;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('memorials')
    .getPublicUrl(fileName);

  console.log('QR code uploaded successfully:', publicUrl);
  return publicUrl;
};