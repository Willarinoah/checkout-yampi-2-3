
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Music } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { PhotoUpload } from './PhotoUpload';
import { PlanSelector } from './PlanSelector';
import { useMemorialFormLogic } from './CreateMemorialFormLogic';
import { DateTimePicker } from './DateTimePicker';
import type { FormPreviewData } from './types';
import { StripePaymentModal } from './StripePaymentModal';
import { YampiPaymentModal } from './YampiPaymentModal';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CreateMemorialFormProps {
  onEmailSubmit: (email: string) => void;
  onShowEmailDialog: () => void;
  email: string;
  onFormDataChange: (data: FormPreviewData) => void;
}

export const CreateMemorialForm: React.FC<CreateMemorialFormProps> = ({
  onEmailSubmit,
  onShowEmailDialog,
  email,
  onFormDataChange,
}) => {
  const { t } = useLanguage();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showStripeModal, setShowStripeModal] = useState(false);
  
  const {
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
  } = useMemorialFormLogic(onEmailSubmit, onShowEmailDialog, email, onFormDataChange);

  const isFormValid = coupleName && startDate && photosPreviews.length > 0;

  const handleStripeEmailSubmit = async (email: string, fullName: string, phoneNumber: string) => {
    try {
      const savedData = await handleSaveMemorial();
      if (!savedData) return;

      // Primeiro atualiza o memorial com o email
      const updatedMemorial = await updateMemorialEmail(savedData.id, email, fullName, phoneNumber);
      if (!updatedMemorial) {
        throw new Error('Failed to update memorial with email');
      }

      console.log('Creating Stripe checkout for memorial:', updatedMemorial);

      const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke(
        'create-checkout',
        {
          body: {
            planType: selectedPlan,
            memorialData: {
              ...updatedMemorial,
              customSlug: updatedMemorial.custom_slug
            }
          },
        }
      );

      if (checkoutError) {
        console.error('Stripe checkout error:', checkoutError);
        throw new Error('Error creating checkout session');
      }

      if (!checkoutData?.url) {
        console.error('No URL returned from checkout creation');
        throw new Error('Invalid checkout response');
      }

      console.log('Redirecting to Stripe checkout:', checkoutData.url);
      window.location.href = checkoutData.url;
    } catch (error) {
      console.error('Error in handleStripeEmailSubmit:', error);
      toast.error('Erro ao criar sessão de pagamento. Por favor, tente novamente.');
    }
  };

  const handleYampiClick = async () => {
    try {
      const result = await handleSaveMemorial();
      if (result) {
        setShowPaymentModal(true);
      }
    } catch (error) {
      console.error('Error saving memorial data:', error);
      toast.error(t("error_creating_memorial"));
    }
  };

  const renderPaymentButton = () => {
    if (!isFormValid) {
      return (
        <Button
          className="w-full bg-lovepink hover:bg-lovepink/90"
          disabled={true}
          onClick={() => toast.error(t("fill_missing"))}
        >
          {t("create_our_site")}
        </Button>
      );
    }

    if (isBrazil) {
      return (
        <Button
          className="w-full bg-lovepink hover:bg-lovepink/90"
          onClick={handleYampiClick}
          disabled={isLoading || !canCreateNewMemorial}
        >
          {isLoading 
            ? t("creating") 
            : !canCreateNewMemorial 
              ? t("plan_change_to_continue") 
              : t("create_our_site")}
        </Button>
      );
    }
    
    return (
      <Button
        className="w-full bg-lovepink hover:bg-lovepink/90"
        onClick={() => setShowStripeModal(true)}
        disabled={isLoading || !canCreateNewMemorial}
      >
        {isLoading ? t("creating") : t("create_our_site")}
      </Button>
    );
  };

  return (
    <div className="space-y-6">
      <PlanSelector 
        selectedPlan={selectedPlan} 
        onPlanChange={setSelectedPlan} 
      />

      <div>
        <label className="block mb-0 text-xs lg:text-sm">{t("couple_name")}:</label>
        <Input
          placeholder={t("couple_placeholder")}
          className="bg-[#0A1528] border-lovepink"
          value={coupleName}
          onChange={(e) => setCoupleName(e.target.value)}
        />
      </div>

      <DateTimePicker
        date={startDate}
        onDateChange={setStartDate}
        time={startTime}
        onTimeChange={setStartTime}
      />

      <div>
        <label className="block mb-0 text-xs lg:text-sm">{t("message")}:</label>
        <Textarea
          placeholder={t("message_placeholder")}
          className="bg-[#0A1528] border-lovepink min-h-[150px] whitespace-pre-wrap break-words"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      <PhotoUpload
        photos={photos}
        photosPreviews={photosPreviews}
        selectedPlan={selectedPlan}
        onPhotosChange={(newPhotos, newPreviews) => {
          setPhotos(newPhotos);
          setPhotosPreviews(newPreviews);
        }}
      />

      {selectedPlan === "premium" && (
        <div>
          <label className="block mb-0 text-xs lg:text-sm">{t("youtube_url")} ({t("optional")}):</label>
          <div className="relative">
            <Input
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              className="bg-[#0A1528] border-lovepink pl-10"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
            />
            <Music className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>
      )}

      <div className="mt-12">
        {renderPaymentButton()}
      </div>

      <YampiPaymentModal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        selectedPlan={selectedPlan}
        isLoading={isLoading}
        isModalOpen={showPaymentModal}
      />

      <StripePaymentModal
        open={showStripeModal}
        onClose={() => setShowStripeModal(false)}
        email={email}
        onSubmit={handleStripeEmailSubmit}
      />
    </div>
  );
};
