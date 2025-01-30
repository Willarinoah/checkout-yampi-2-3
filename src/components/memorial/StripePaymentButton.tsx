import React from 'react';
import { Button } from "@/components/ui/button";
import { PaymentModal } from './PaymentModals';
import { useLanguage } from "@/contexts/LanguageContext";

interface StripePaymentButtonProps {
  isLoading: boolean;
  showEmailDialog: boolean;
  setShowEmailDialog: (show: boolean) => void;
  handleEmailSubmit: (email: string, fullName: string, phoneNumber: string) => void;
  email: string;
  isDisabled: boolean;
}

export const StripePaymentButton: React.FC<StripePaymentButtonProps> = ({
  isLoading,
  showEmailDialog,
  setShowEmailDialog,
  handleEmailSubmit,
  email,
  isDisabled,
}) => {
  const { t } = useLanguage();

  return (
    <>
      <Button
        className="w-full bg-lovepink hover:bg-lovepink/90"
        disabled={isLoading || isDisabled}
        onClick={() => setShowEmailDialog(true)}
      >
        {isLoading ? t("creating") : "Pay with Credit Card"}
      </Button>

      <PaymentModal
        open={showEmailDialog}
        onClose={() => setShowEmailDialog(false)}
        onSubmit={handleEmailSubmit}
        email={email}
      />
    </>
  );
};