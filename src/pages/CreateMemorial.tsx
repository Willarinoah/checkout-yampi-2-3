import React, { useState, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { MemorialPreview } from "@/components/memorial/MemorialPreview";
import { CreateMemorialForm } from "@/components/memorial/CreateMemorialForm";
import UserDataCollectionDialog from "@/components/memorial/UserDataCollectionDialog";
import Header from "@/components/layout/Header";
import Footer from '@/components/layout/Footer';

const CreateMemorial = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showYampiButton, setShowYampiButton] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"basic" | "premium">("basic");
  const buttonRef = useRef<HTMLDivElement>(null);
  const [previewData, setPreviewData] = useState({
    coupleName: "",
    photos: [] as string[],
    message: "",
    youtubeUrl: "",
    selectedPlan: "basic" as "basic" | "premium",
    startDate: undefined as Date | undefined,
    startTime: "00:00",
  });

  const handleEmailSubmit = (submittedEmail: string) => {
    setEmail(submittedEmail);
    setShowEmailDialog(false);
  };

  const handleFormDataChange = (data: {
    coupleName?: string;
    photosPreviews?: string[];
    message?: string;
    youtubeUrl?: string;
    selectedPlan?: "basic" | "premium";
    startDate?: Date;
    startTime?: string;
  }) => {
    setPreviewData((prev) => ({
      ...prev,
      ...data,
      photos: data.photosPreviews || prev.photos,
      startDate: data.startDate || prev.startDate,
      startTime: data.startTime || prev.startTime,
    }));
    if (data.selectedPlan) {
      setSelectedPlan(data.selectedPlan);
    }
  };

  React.useEffect(() => {
    const oldScript = document.querySelector('.ymp-script');
    if (oldScript) {
      oldScript.remove();
    }

    if (showYampiButton && buttonRef.current) {
      const script = document.createElement('script');
      script.className = 'ymp-script';
      script.src = `https://api.yampi.io/v2/teste1970/public/buy-button/${selectedPlan === 'basic' ? 'EPYNGGBFAY' : 'GMACVCTS2Q'}/js`;
      buttonRef.current.appendChild(script);
    }
  }, [showYampiButton, selectedPlan]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-loveblue text-white p-4 pt-24">
        <UserDataCollectionDialog
          open={showEmailDialog}
          onClose={() => setShowEmailDialog(false)}
          onSubmit={handleEmailSubmit}
          email={email}
          onEmailChange={setEmail}
          isBrazil={false}
        />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold mb-4">{t("almost_there")}</h1>
            <p className="mb-8">{t("fill_data_counter")}</p>

            <CreateMemorialForm
              onEmailSubmit={handleEmailSubmit}
              email={email}
              onShowEmailDialog={() => setShowEmailDialog(true)}
              onFormDataChange={(data) => {
                handleFormDataChange(data);
                if (data.coupleName && data.photosPreviews?.length && data.startDate) {
                  setShowYampiButton(true);
                }
              }}
            />
          </div>

          <div className="flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              {t("preview")} <span className="text-2xl">👇</span>
            </h2>

            <MemorialPreview
              coupleName={previewData.coupleName}
              photos={previewData.photos}
              message={previewData.message}
              youtubeUrl={previewData.youtubeUrl}
              selectedPlan={previewData.selectedPlan}
              startDate={previewData.startDate}
              startTime={previewData.startTime}
              isPreview={true}
            />

            {showYampiButton && (
              <div ref={buttonRef} className="w-full flex justify-center items-center min-h-[50px] mt-8" />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default CreateMemorial;