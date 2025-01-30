import React from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import UserDataCollectionDialog from "./UserDataCollectionDialog";

interface StripePaymentButtonProps {
  isLoading: boolean;
  showEmailDialog: boolean;
  setShowEmailDialog: (show: boolean) => void;
  handleEmailSubmit: (email: string, fullName?: string, phoneNumber?: string) => void;
  email: string;
  disabled?: boolean;
}

export const StripePaymentButton: React.FC<StripePaymentButtonProps> = ({
  isLoading,
  showEmailDialog,
  setShowEmailDialog,
  handleEmailSubmit,
  email,
  disabled
}) => {
  const { t } = useLanguage();

  return (
    <>
      <Button
        className="w-full bg-lovepink hover:bg-lovepink/90"
        disabled={isLoading || disabled}
        onClick={() => setShowEmailDialog(true)}
      >
        {isLoading ? t("creating") : t("create_our_site")}
      </Button>

      <UserDataCollectionDialog
        open={showEmailDialog}
        onClose={() => setShowEmailDialog(false)}
        onSubmit={handleEmailSubmit}
        email={email}
        onEmailChange={() => {}}
        isBrazil={false}
      />
    </>
  );
};