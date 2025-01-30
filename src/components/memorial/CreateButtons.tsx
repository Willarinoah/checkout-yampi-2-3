import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface CreateButtonProps {
  isLoading: boolean;
  isValid: boolean;
  onShowEmailDialog: () => void;
}

export const InternationalCreateButton: React.FC<CreateButtonProps> = ({
  isLoading,
  isValid,
  onShowEmailDialog,
}) => {
  const { t } = useLanguage();

  const handleClick = () => {
    if (!isValid) {
      return;
    }
    onShowEmailDialog();
  };

  return (
    <Button
      className="w-full bg-lovepink hover:bg-lovepink/90"
      disabled={isLoading || !isValid}
      onClick={handleClick}
    >
      {isLoading ? t("creating") : t("create_our_site")}
    </Button>
  );
};

interface BrazilCreateButtonProps extends CreateButtonProps {
  selectedPlan: "basic" | "premium";
  showYampiButton: boolean;
}

export const BrazilCreateButton: React.FC<BrazilCreateButtonProps> = ({
  isLoading,
  isValid,
  selectedPlan,
  showYampiButton,
}) => {
  const { t } = useLanguage();
  const buttonRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const oldScript = document.querySelector('.ymp-script');
    if (oldScript) {
      oldScript.remove();
    }

    if (showYampiButton && buttonRef.current) {
      const script = document.createElement('script');
      script.className = 'ymp-script';
      script.src = `https://api.yampi.io/v2/teste1970/public/buy-button/${selectedPlan === 'basic' ? '59VB91DFBN' : 'G55W9F5YZK'}/js`;
      buttonRef.current.appendChild(script);
    }
  }, [showYampiButton, selectedPlan]);

  if (showYampiButton) {
    return <div ref={buttonRef} className="w-full flex justify-center items-center min-h-[50px]" />;
  }

  return (
    <Button
      className="w-full bg-lovepink hover:bg-lovepink/90"
      disabled={isLoading || !isValid}
      onClick={() => {}}
    >
      {isLoading ? t("creating") : t("create_our_site")}
    </Button>
  );
};