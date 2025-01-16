import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { uploadPhotosToStorage, uploadQRCode } from '@/lib/file-upload';
import { generateQRCodeBlob } from '@/lib/qr-utils';
import { generateUniqueSlug } from "@/lib/memorial-utils";
import { sanitizeBaseUrl, constructMemorialUrl } from '@/lib/url-sanitizer';
import { detectUserLocation, saveLocationAnalytics } from '@/lib/location-detector';
import type { FormPreviewData } from './types';
import { toast } from "sonner";

export const useMemorialFormLogic = (
  onEmailSubmit: (email: string) => void,
  onShowEmailDialog: () => void,
  email: string,
  onFormDataChange: (data: FormPreviewData) => void
) => {
  const [selectedPlan, setSelectedPlan] = useState<"basic" | "premium">("basic");
  const [coupleName, setCoupleName] = useState("");
  const [message, setMessage] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [photosPreviews, setPhotosPreviews] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isBrazil, setIsBrazil] = useState<boolean | null>(null);
  const [showEmailDialog, setShowEmailDialog] = useState(false);

  useEffect(() => {
    const checkLocation = async () => {
      try {
        const locationInfo = await detectUserLocation();
        setIsBrazil(locationInfo.is_brazil);
        await saveLocationAnalytics(locationInfo);
      } catch (error) {
        console.error('Error in location detection:', error);
        setIsBrazil(false);
      }
    };
    checkLocation();
  }, []);

  useEffect(() => {
    const previewData: FormPreviewData = {
      coupleName,
      photosPreviews,
      message,
      youtubeUrl,
      selectedPlan
    };
    onFormDataChange(previewData);
  }, [coupleName, photosPreviews, message, youtubeUrl, selectedPlan, onFormDataChange]);

  const handleEmailSubmit = async (submittedEmail: string) => {
    try {
      setIsLoading(true);
      onEmailSubmit(submittedEmail);
      setShowEmailDialog(false);

      const customSlug = await generateUniqueSlug(coupleName);
      const baseUrl = sanitizeBaseUrl(window.location.origin);
      const uniqueUrl = constructMemorialUrl(baseUrl, `/memorial/${customSlug}`);
      console.log('Generated unique URL:', uniqueUrl);

      const qrCodeBlob = await generateQRCodeBlob(uniqueUrl);
      const qrCodeUrl = await uploadQRCode(qrCodeBlob, customSlug);
      console.log('QR Code uploaded:', qrCodeUrl);

      const photoUrls = await uploadPhotosToStorage(photos, customSlug);
      console.log('Photos uploaded:', photoUrls);

      const planType = selectedPlan === "basic" 
        ? "1 year, 3 photos and no music" 
        : "Forever, 7 photos and music";
      
      const planPrice = selectedPlan === "basic" ? 29 : 49;

      const memorialData = {
        couple_name: coupleName,
        email: submittedEmail,
        message: message || null,
        plan_type: planType as "1 year, 3 photos and no music" | "Forever, 7 photos and music",
        plan_price: planPrice,
        custom_slug: customSlug,
        unique_url: uniqueUrl,
        payment_status: "pending" as "pending" | "paid",
        qr_code_url: qrCodeUrl,
        photos: photoUrls,
        youtube_url: selectedPlan === "premium" && youtubeUrl ? youtubeUrl : null,
        relationship_start: new Date().toISOString(),
        time: new Date().toLocaleTimeString('en-US', { hour12: false })
      };

      console.log('Inserting memorial data:', memorialData);

      const { data: insertedMemorial, error: insertError } = await supabase
        .from('user_configs')
        .insert(memorialData)
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting memorial:', insertError);
        throw new Error(insertError.message);
      }

      console.log('Successfully created memorial:', insertedMemorial);

      const checkoutEndpoint = isBrazil ? 'mercadopago-checkout' : 'create-checkout';
      const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke(
        checkoutEndpoint,
        {
          body: {
            planType: selectedPlan,
            memorialData: insertedMemorial,
          },
        }
      );

      if (checkoutError) {
        console.error('Error creating checkout:', checkoutError);
        throw new Error(checkoutError.message);
      }

      if (checkoutData?.url) {
        window.location.href = checkoutData.url;
      } else {
        throw new Error('No checkout URL received');
      }

    } catch (error: unknown) {
      console.error('Error in create memorial flow:', error);
      toast.error(error instanceof Error ? error.message : "Error creating memorial. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateMemorial = () => {
    if (!coupleName || photos.length === 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!email) {
      setShowEmailDialog(true);
      return;
    }

    handleEmailSubmit(email);
  };

  return {
    selectedPlan,
    setSelectedPlan,
    coupleName,
    setCoupleName,
    message,
    setMessage,
    youtubeUrl,
    setYoutubeUrl,
    photos,
    setPhotos,
    photosPreviews,
    setPhotosPreviews,
    isLoading,
    handleCreateMemorial,
    isBrazil,
    showEmailDialog,
    setShowEmailDialog,
    handleEmailSubmit,
    onEmailSubmit
  };
};