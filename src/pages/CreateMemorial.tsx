import React, { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { MemorialPreview } from "@/components/memorial/MemorialPreview";
import { CreateMemorialForm } from "@/components/memorial/CreateMemorialForm";
import UserDataCollectionDialog from "@/components/memorial/UserDataCollectionDialog";
import Header from "@/components/layout/Header";
import Footer from '@/components/layout/Footer';

const CreateMemorial = () => {
  const [email, setEmail] = useState("");
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [previewData, setPreviewData] = useState({
    coupleName: "",
    photos: [] as string[],
    message: "",
    youtubeUrl: "",
    selectedPlan: "basic" as "basic" | "premium",
    startDate: undefined as Date | undefined,
    startTime: "00:00",
  });
  const { t } = useLanguage();

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
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-loveblue text-white p-4 pt-24">
        <UserDataCollectionDialog
          open={showEmailDialog}
          onClose={() => setShowEmailDialog(false)}
          onSubmit={handleEmailSubmit}
          email={email}
          isBrazil={false}
        />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-2">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold mb-4">{t("almost_there")}</h1>
            <p className="mb-8">{t("fill_data_counter")}</p>

            <CreateMemorialForm
              onEmailSubmit={handleEmailSubmit}
              email={email}
              onShowEmailDialog={() => setShowEmailDialog(true)}
              onFormDataChange={handleFormDataChange}
            />
          </div>

          <div className="lg:sticky lg:top-8 flex flex-col items-center">
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
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default CreateMemorial;