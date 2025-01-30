import React, { useState, useEffect } from "react";
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

const InternalYampiButton = ({ planType }: { planType: "basic" | "premium" }) => {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const mountId = React.useId();

  useEffect(() => {
    const cleanupDOM = () => {
      document.querySelectorAll('script[src*="yampi"]').forEach(script => script.remove());
      document.querySelectorAll('[id*="yampi"]').forEach(el => {
        if (el.id !== 'yampi-checkout-button') {
          el.remove();
        }
      });
    };

    cleanupDOM();

    const script = document.createElement('script');
    script.id = mountId;
    script.src = `https://api.yampi.io/v2/teste1970/public/buy-button/${planType === 'basic' ? '59VB91DFBN' : 'G55W9F5YZK'}/js`;
    
    script.onload = () => {
      console.log('Script Yampi carregado com sucesso');
      setScriptLoaded(true);
    };

    script.onerror = () => {
      toast.error("Erro ao carregar botão de pagamento. Por favor, tente novamente.");
    };

    document.body.appendChild(script);

    return () => {
      cleanupDOM();
    };
  }, [planType, mountId]);

  return (
    <div className="w-full">
      <div id="yampi-checkout-button" className="w-full" />
      {!scriptLoaded && (
        <Button disabled className="w-full bg-lovepink hover:bg-lovepink/90">
          Carregando...
        </Button>
      )}
    </div>
  );
};

export const CreateMemorialForm: React.FC<CreateMemorialFormProps> = ({
  onEmailSubmit,
  onShowEmailDialog,
  email,
  onFormDataChange,
}) => {
  const { t } = useLanguage();
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
    setShowYampiButton(false);
  }, [selectedPlan]);

  const isFormValid = coupleName && startDate && photosPreviews.length > 0;

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
      if (!showYampiButton) {
        return (
          <Button
            className="w-full bg-lovepink hover:bg-lovepink/90"
            onClick={() => setShowYampiButton(true)}
          >
            {t("create_our_site")}
          </Button>
        );
      }
      return <InternalYampiButton planType={selectedPlan} />;
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

      <div className="mt-12">
        {renderPaymentButton()}
      </div>
    </div>
  );
};