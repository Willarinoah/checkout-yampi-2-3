import React, { useEffect, useState } from 'react';

interface YampiButtonProps {
  planType: "basic" | "premium";
  onCleanup?: () => void;
}

export const YampiButton = ({ planType, onCleanup }: YampiButtonProps) => {
  const [mountId] = useState(`yampi-${Date.now()}`);

  useEffect(() => {
    // Limpa apenas o script específico deste componente
    const cleanupPreviousScript = () => {
      const previousScript = document.getElementById(mountId);
      if (previousScript) {
        previousScript.remove();
      }
    };

    // Carrega o script da Yampi
    const script = document.createElement('script');
    script.id = mountId;
    script.src = `https://api.yampi.io/v2/teste1970/public/buy-button/${planType === 'basic' ? '59VB91DFBN' : 'G55W9F5YZK'}/js`;
    document.body.appendChild(script);

    // Cleanup ao desmontar
    return () => {
      cleanupPreviousScript();
      if (onCleanup) onCleanup();
    };
  }, [planType, mountId, onCleanup]);

  return (
    <div className="w-full flex justify-center items-center min-h-[50px]">
      <div id="yampi-checkout-button" />
    </div>
  );
};