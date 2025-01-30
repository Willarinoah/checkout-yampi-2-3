import React, { useEffect, useState } from 'react';

interface YampiButtonProps {
  planType: "basic" | "premium";
  onCleanup?: () => void;
}

export const YampiButton = ({ planType, onCleanup }: YampiButtonProps) => {
  const [mountId] = useState(`yampi-${Date.now()}`);

  useEffect(() => {
    const cleanupDOM = () => {
      // Remove scripts Yampi anteriores
      document.querySelectorAll('script[src*="yampi"]').forEach(script => script.remove());
      
      // Remove botões e iframes Yampi anteriores
      document.querySelectorAll('[id*="yampi"]').forEach(el => el.remove());
      document.querySelectorAll('iframe[src*="yampi"]').forEach(iframe => iframe.remove());
      
      // Limpa elementos do shadow DOM
      document.querySelectorAll('*').forEach(element => {
        if (element.shadowRoot) {
          element.shadowRoot.querySelectorAll('[id*="yampi"]').forEach(el => el.remove());
        }
      });

      // Remove elementos relacionados ao Yampi
      document.querySelectorAll('[class*="ymp"]').forEach(el => el.remove());
    };

    // Limpa o DOM antes de adicionar novo botão
    cleanupDOM();

    // Aguarda para garantir que a limpeza foi concluída
    const timeoutId = setTimeout(() => {
      const script = document.createElement('script');
      script.id = mountId;
      script.src = `https://api.yampi.io/v2/teste1970/public/buy-button/${planType === 'basic' ? '59VB91DFBN' : 'G55W9F5YZK'}/js`;
      document.body.appendChild(script);
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      cleanupDOM();
      if (onCleanup) onCleanup();
    };
  }, [planType, mountId, onCleanup]);

  return (
    <div className="flex items-center justify-center min-h-[50px]">
      <div id="yampi-checkout-button" />
    </div>
  );
};