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
  const [startDate, setStartDate] = useState<Date>();
  const [startTime, setStartTime] = useState("00:00");
  const [locationInfo, setLocationInfo] = useState<LocationInfo | null>(null);
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

  useEffect(() => {
    if (currentMemorialId && !canCreateNewMemorial) {
      setCanCreateNewMemorial(true);
    }
  }, [selectedPlan]);

  const handleSaveMemorial = async () => {
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
        email: '',
        fullName: '',
        phone: '',
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

  const updateMemorialEmail = async (memorialId: string, email: string, fullName: string, phoneNumber: string) => {
    try {
      console.log('Updating memorial with email:', { memorialId, email, fullName, phoneNumber });
      
      const { data: memorial, error } = await supabase
        .from('stripe_memorials')
        .update({
          email: email,
          full_name: fullName,
          phone: phoneNumber,
          updated_at: new Date().toISOString()
        })
        .eq('id', memorialId)
        .select()
        .single();

      if (error) {
        console.error('Error updating memorial with email:', error);
        throw error;
      }

      console.log('Successfully updated memorial with email:', memorial);
      return memorial;
    } catch (error) {
      console.error('Error in updateMemorialEmail:', error);
      return null;
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
    startDate,
    setStartDate,
    startTime,
    setStartTime,
    canCreateNewMemorial,
    handleSaveMemorial,
    updateMemorialEmail
  };
};
