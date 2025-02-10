
import { useState, useEffect } from 'react';
import { saveMemorialData } from '@/lib/memorial-data-utils';
import { detectUserLocation, saveLocationAnalytics, type LocationInfo } from '@/lib/location-detector';
import type { FormPreviewData } from './types';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
      console.log('Starting memorial creation process...');

      if (!coupleName || !startDate || !photos.length) {
        toast.error('Por favor, preencha todos os campos obrigatórios');
        return;
      }

      const planPrice = selectedPlan === "basic" 
        ? isBrazil ? 29 : 9
        : isBrazil ? 49 : 14;

      // Primeiro, salvar os dados do memorial
      const result = await saveMemorialData({
        coupleName,
        message,
        photos,
        youtubeUrl,
        planType: selectedPlan,
        planPrice,
        startDate,
        startTime,
        email: submittedEmail,
        fullName,
        phone: phoneNumber,
        addressInfo: locationInfo ? {
          country_code: locationInfo.country_code,
          city: locationInfo.city,
          region: locationInfo.region,
          address: '',
          number: '',
          complement: '',
          district: '',
          zipcode: ''
        } : null,
        isBrazil: isBrazil || false
      });

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to save memorial data');
      }

      console.log('Memorial data saved successfully:', result.data);
      
      if (isBrazil) {
        // Se for usuário brasileiro, mostrar toast de sucesso e redirecionar para yampi
        toast.success('Memorial criado com sucesso!');
        setShowEmailDialog(false);
        
        // Espera um pouco para o usuário ver a mensagem de sucesso
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        toast.success('Redirecionando para o pagamento...');
        onEmailSubmit(submittedEmail);
      } else {
        // Se for internacional, criar sessão do Stripe
        const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke(
          'create-checkout',
          {
            body: {
              planType: selectedPlan,
              memorialData: result.data,
              isBrazil: false
            },
          }
        );

        if (checkoutError || !checkoutData?.url) {
          throw new Error('Error creating checkout session');
        }

        window.location.href = checkoutData.url;
      }

    } catch (error) {
      console.error('Error in handleEmailSubmit:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao criar memorial. Por favor, tente novamente.');
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

