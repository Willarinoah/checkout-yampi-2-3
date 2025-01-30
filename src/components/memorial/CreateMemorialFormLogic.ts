import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { uploadPhotosToStorage, uploadQRCode } from '@/lib/file-upload';
import { generateQRCodeBlob } from '@/lib/qr-utils';
import { generateUniqueSlug } from "@/lib/memorial-utils";
import { sanitizeBaseUrl, constructMemorialUrl } from '@/lib/url-sanitizer';
import { detectUserLocation, saveLocationAnalytics, type LocationInfo } from '@/lib/location-detector';
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
  const [startDate, setStartDate] = useState<Date>();
  const [startTime, setStartTime] = useState("00:00");
  const [locationInfo, setLocationInfo] = useState<LocationInfo | null>(null);

  useEffect(() => {
    const checkLocation = async () => {
      try {
        const info = await detectUserLocation();
        setLocationInfo(info);
        setIsBrazil(info.is_brazil);
        await saveLocationAnalytics(info);
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
      selectedPlan,
      startDate,
      startTime
    };
    onFormDataChange(previewData);
  }, [coupleName, photosPreviews, message, youtubeUrl, selectedPlan, startDate, startTime, onFormDataChange]);

  const handleEmailSubmit = async (submittedEmail: string, fullName: string, phoneNumber: string) => {
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

      console.log('Uploading photos:', photos);
      const photoUrls = await uploadPhotosToStorage(photos, customSlug);
      console.log('Photos uploaded:', photoUrls);

      const planType = selectedPlan === "basic" 
        ? isBrazil ? "1 year, 3 photos and no music" : "1 year, 3 photos and no music (international)"
        : isBrazil ? "Forever, 7 photos and music" : "Forever, 7 photos and music (international)";
      
      const planPrice = selectedPlan === "basic" 
        ? isBrazil ? 29 : 9
        : isBrazil ? 49 : 14;

      const addressInfo = locationInfo ? {
        country_code: locationInfo.country_code,
        city: locationInfo.city,
        region: locationInfo.region,
        address: '',
        number: '',
        complement: '',
        district: '',
        zipcode: ''
      } : null;

      const memorialData = {
        couple_name: coupleName,
        message: message || null,
        plan_type: planType,
        plan_price: planPrice,
        custom_slug: customSlug,
        unique_url: uniqueUrl,
        payment_status: "pending",
        qr_code_url: qrCodeUrl,
        photos: photoUrls,
        youtube_url: selectedPlan === "premium" && youtubeUrl ? youtubeUrl : null,
        relationship_start: startDate ? startDate.toISOString() : new Date().toISOString(),
        time: startTime,
        email: submittedEmail || '',
        full_name: fullName || coupleName,
        phone: phoneNumber || '',
        address_info: addressInfo,
        preferences: null
      };

      console.log('Inserting memorial data:', memorialData);

      // Insert into the appropriate table based on location
      const tableName = isBrazil ? 'yampi_memorials' : 'stripe_memorials';
      const { data: insertedMemorial, error: insertError } = await supabase
        .from(tableName)
        .insert(memorialData)
        .select()
        .maybeSingle();

      if (insertError) {
        console.error('Error inserting memorial:', insertError);
        throw new Error(insertError.message);
      }

      if (!insertedMemorial) {
        throw new Error('Failed to create memorial');
      }

      console.log('Successfully created memorial:', insertedMemorial);

      // Call appropriate checkout function based on location
      const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke(
        isBrazil ? 'yampi-checkout' : 'create-checkout',
        {
          body: {
            planType: selectedPlan,
            memorialData: insertedMemorial
          },
        }
      );

      if (checkoutError) {
        console.error('Error creating checkout:', checkoutError);
        throw new Error(checkoutError.message);
      }

      if (!checkoutData?.url) {
        throw new Error('No checkout URL received');
      }

      // Redirect to checkout
      window.location.href = checkoutData.url;

    } catch (error: unknown) {
      console.error('Error in create memorial flow:', error);
      toast.error(error instanceof Error ? error.message : "Error creating memorial. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
    isBrazil,
    showEmailDialog,
    setShowEmailDialog,
    handleEmailSubmit,
    startDate,
    setStartDate,
    startTime,
    setStartTime
  };
};