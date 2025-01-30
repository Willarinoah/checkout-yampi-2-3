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
import { PaymentModal } from './PaymentModals';
import { YampiModal } from './YampiModal';
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
  const [showYampiModal, setShowYampiModal] = useState(false);
  
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
    console.log('Location status:', { isBrazil, showYampiModal, showEmailDialog });
  }, [isBrazil, showYampiModal, showEmailDialog]);

  // Reset Yampi modal quando o plano muda
  useEffect(() => {
    if (showYampiModal) {
      console.log('Closing Yampi modal due to plan change');
      setShowYampiModal(false);
    }
  }, [selectedPlan]);

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

  const handleCreateMemorial = () => {
    console.log('handleCreateMemorial called:', { 
      isBrazil, 
      coupleName, 
      photosLength: photosPreviews.length, 
      startDate 
    });
    
    if (!coupleName || photosPreviews.length === 0 || !startDate) {
      toast.error(t("fill_missing"));
      return;
    }
    
    if (isBrazil === true) {
      console.log('Opening Yampi modal for Brazilian user');
      setShowYampiModal(true);
      setShowEmailDialog(false); // Garante que o modal do Stripe está fechado
    } else {
      console.log('Opening Stripe modal for international user');
      setShowEmailDialog(true);
      setShowYampiModal(false); // Garante que o modal da Yampi está fechado
    }
  };

  return (
    <div className="space-y-6">
      {isBrazil === false && (
        <PaymentModal
          open={showEmailDialog}
          onClose={() => setShowEmailDialog(false)}
          onSubmit={handleEmailSubmit}
          email={email}
          isBrazil={false}
        />
      )}
      
      {isBrazil === true && (
        <YampiModal
          open={showYampiModal}
          onClose={() => setShowYampiModal(false)}
          planType={selectedPlan}
        />
      )}
      
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

      <Button
        className="w-full bg-lovepink hover:bg-lovepink/90"
        disabled={isLoading || !coupleName || photosPreviews.length === 0 || !startDate}
        onClick={handleCreateMemorial}
      >
        {isLoading ? t("creating") : t("create_our_site")}
      </Button>
    </div>
  );
};
