import React, { useState, useEffect, useRef } from "react";
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
import { StripePaymentButton } from './StripePaymentButton';
import { toast } from "sonner";

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
  const buttonRef = useRef<HTMLDivElement>(null);
  const [showYampiButton, setShowYampiButton] = useState(false);
  
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
    showEmailDialog,
    setShowEmailDialog,
    handleEmailSubmit,
    startDate,
    setStartDate,
    startTime,
    setStartTime
  } = useMemorialFormLogic(onEmailSubmit, onShowEmailDialog, email, onFormDataChange);

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
    if (showYampiButton && buttonRef.current && isBrazil) {
      const oldScript = document.querySelector('.ymp-script');
      if (oldScript) {
        oldScript.remove();
      }

      const script = document.createElement('script');
      script.className = 'ymp-script';
      script.src = `https://api.yampi.io/v2/teste1970/public/buy-button/${selectedPlan === 'basic' ? '59VB91DFBN' : 'G55W9F5YZK'}/js`;
      buttonRef.current.appendChild(script);
    }
  }, [showYampiButton, selectedPlan, isBrazil]);

  const isFormValid = coupleName && startDate && photosPreviews.length > 0;

  const handleCreateMemorial = () => {
    if (!isFormValid) {
      toast.error(t("fill_missing"));
      return;
    }
    
    setShowYampiButton(true);
  };

  const renderPaymentButton = () => {
    if (isBrazil) {
      if (!showYampiButton) {
        return (
          <Button
            className="w-full bg-lovepink hover:bg-lovepink/90"
            disabled={isLoading || !isFormValid}
            onClick={handleCreateMemorial}
          >
            {isLoading ? t("creating") : t("create_our_site")}
          </Button>
        );
      }
      return <div ref={buttonRef} className="w-full flex justify-center items-center min-h-[50px]" />;
    }
    
    return (
      <StripePaymentButton
        isLoading={isLoading}
        showEmailDialog={showEmailDialog}
        setShowEmailDialog={setShowEmailDialog}
        handleEmailSubmit={handleEmailSubmit}
        email={email}
        isDisabled={!isFormValid}
      />
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

      <div className="mt-12 flex flex-col items-center space-y-4">
        {renderPaymentButton()}
      </div>
    </div>
  );
};