
import { useState, useEffect } from 'react';
import { saveMemorialData } from '@/lib/memorial-data-utils';
import { detectUserLocation, saveLocationAnalytics, type LocationInfo } from '@/lib/location-detector';
import type { FormPreviewData } from './types';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getPlanTypeFromSelection } from '@/types/database/memorial';

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
  const [isDataSaved, setIsDataSaved] = useState(false);
  const [memorialData, setMemorialData] = useState<any>(null);
  const [currentMemorialId, setCurrentMemorialId] = useState<string | null>(null);
  const [canCreateNewMemorial, setCanCreateNewMemorial] = useState(true);

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

  // Efeito para controlar quando o botão pode ser clicável novamente
  useEffect(() => {
    if (currentMemorialId && !canCreateNewMemorial) {
      setCanCreateNewMemorial(true);
    }
  }, [selectedPlan]);

  const handleSaveMemorial = async (submittedEmail: string, fullName: string, phoneNumber: string) => {
    try {
      setIsLoading(true);
      console.log('Starting memorial creation/update process...');

      if (!coupleName || !startDate || !photos.length) {
        toast.error('Por favor, preencha todos os campos obrigatórios');
        return null;
      }

      const planPrice = selectedPlan === "basic" 
        ? isBrazil ? 29 : 9
        : isBrazil ? 49 : 14;

      // Se já existe um memorial salvo, atualiza em vez de criar um novo
      if (currentMemorialId) {
        console.log('Updating existing memorial:', currentMemorialId);
        const table = isBrazil ? 'yampi_memorials' : 'stripe_memorials';
        
        // Use getPlanTypeFromSelection para obter o tipo correto do plano
        const fullPlanType = getPlanTypeFromSelection(selectedPlan, isBrazil || false);
        console.log('Using plan type:', fullPlanType);
        
        const { data: updatedMemorial, error: updateError } = await supabase
          .from(table)
          .update({
            plan_type: fullPlanType,
            plan_price: planPrice,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentMemorialId)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating memorial:', updateError);
          throw new Error(`Failed to update memorial: ${updateError.message}`);
        }

        setMemorialData(updatedMemorial);
        toast.success('Memorial atualizado com sucesso!');
        return updatedMemorial;
      }

      // Se não existe memorial, cria um novo
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
      setCurrentMemorialId(result.data.id);
      setCanCreateNewMemorial(false);
      setIsDataSaved(true);
      setMemorialData(result.data);
      toast.success('Memorial criado com sucesso!');
      return result.data;

    } catch (error) {
      console.error('Error in handleSaveMemorial:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao criar memorial. Por favor, tente novamente.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (submittedEmail: string, fullName: string, phoneNumber: string) => {
    const savedData = await handleSaveMemorial(submittedEmail, fullName, phoneNumber);
    
    if (!savedData) return null;

    if (!isBrazil) {
      try {
        const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke(
          'create-checkout',
          {
            body: {
              planType: selectedPlan,
              memorialData: savedData,
              isBrazil: false
            },
          }
        );

        if (checkoutError || !checkoutData?.url) {
          throw new Error('Error creating checkout session');
        }

        window.location.href = checkoutData.url;
      } catch (error) {
        console.error('Error creating Stripe checkout:', error);
        toast.error('Erro ao criar sessão de pagamento. Por favor, tente novamente.');
        return null;
      }
    }

    return savedData;
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
    setStartTime,
    isDataSaved,
    memorialData,
    canCreateNewMemorial
  };
};

