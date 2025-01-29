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
import { YampiButton } from './YampiButton';
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
  const [startDate, setStartDate] = useState<Date>();
  const [startTime, setStartTime] = useState("00:00");
  const [showYampiCheckout, setShowYampiCheckout] = useState(false);
  
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
    handleEmailSubmit
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

  const handleCreateMemorial = () => {
    if (!coupleName || photosPreviews.length === 0 || !startDate) {
      toast.error(t("fill_missing"));
      return;
    }
    setShowYampiCheckout(true);
  };

  return (
    <div className="space-y-6">
      {!isBrazil && (
        <PaymentModal
          open={showEmailDialog}
          onClose={() => setShowEmailDialog(false)}
          onSubmit={handleEmailSubmit}
          email={email}
          isBrazil={false}
        />
      )}
      
      <PlanSelector 
        selectedPlan={selectedPlan} 
        onPlanChange={(plan) => {
          setSelectedPlan(plan);
          setShowYampiCheckout(true);
        }} 
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

      {showYampiCheckout && (
        <div className="mt-4">
          <YampiButton planType={selectedPlan} />
        </div>
      )}
    </div>
  );
};