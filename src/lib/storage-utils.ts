import { supabase } from "@/integrations/supabase/client";

export const uploadPhotosToStorage = async (
  photos: File[],
  memorialId: string
): Promise<string[]> => {
  const uploadPromises = photos.map(async (photo) => {
    const fileExt = photo.name.split('.').pop();
    const fileName = `${memorialId}/${crypto.randomUUID()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('memorials')
      .upload(fileName, photo);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('memorials')
      .getPublicUrl(fileName);

    return publicUrl;
  });

  return Promise.all(uploadPromises);
};

export const uploadQRCode = async (
  qrCodeBlob: Blob,
  memorialId: string
): Promise<string> => {
  const fileName = `${memorialId}/qr-code.png`;
  
  const { error } = await supabase.storage
    .from('memorials')
    .upload(fileName, qrCodeBlob);

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('memorials')
    .getPublicUrl(fileName);

  return publicUrl;
};