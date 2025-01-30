import React from 'react';
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface InternationalCreateButtonProps {
  isLoading: boolean;
  isDisabled: boolean;
  onShowEmailDialog: () => void;
}

export const InternationalCreateButton: React.FC<InternationalCreateButtonProps> = ({
  isLoading,
  isDisabled,
  onShowEmailDialog
}) => {
  const { t } = useLanguage();

  return (
    <Button
      className="w-full bg-lovepink hover:bg-lovepink/90"
      disabled={isLoading || isDisabled}
      onClick={onShowEmailDialog}
    >
      {isLoading ? t("creating") : t("create_our_site")}
    </Button>
  );
};