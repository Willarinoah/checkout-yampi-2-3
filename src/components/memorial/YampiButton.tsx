import React, { useEffect, useState } from 'react';

interface YampiButtonProps {
  planType: "basic" | "premium";
}

export const YampiButton = ({ planType }: YampiButtonProps) => {
  const [mountId] = useState(`yampi-${Date.now()}`); // ID único para cada montagem do componente

  useEffect(() => {
    const cleanupDOM = () => {
      // Remove TODOS os scripts Yampi anteriores
      document.querySelectorAll('script[src*="yampi"]').forEach(script => script.remove());
      
      // Remove TODOS os botões e iframes Yampi anteriores
      document.querySelectorAll('[id*="yampi"]').forEach(el => el.remove());
      document.querySelectorAll('iframe[src*="yampi"]').forEach(iframe => iframe.remove());
      
      // Limpa elementos do shadow DOM
      document.querySelectorAll('*').forEach(element => {
        if (element.shadowRoot) {
          element.shadowRoot.querySelectorAll('[id*="yampi"]').forEach(el => el.remove());
        }
      });

      // Remove quaisquer outros elementos relacionados ao Yampi
      document.querySelectorAll('[class*="ymp"]').forEach(el => el.remove());
    };

    // Limpa o DOM antes de adicionar novo botão
    cleanupDOM();

    // Aguarda um momento para garantir que a limpeza foi concluída
    const timeoutId = setTimeout(() => {
      const script = document.createElement('script');
      script.id = mountId;
      
      // IDs específicos para cada plano
      const buttonIds = {
        basic: 'EPYNGGBFAY',
        premium: 'GMACVCTS2Q'
      };
      
      script.src = `https://api.yampi.io/v2/teste1970/public/buy-button/${buttonIds[planType]}/js`;
      
      console.log('Loading Yampi script for plan:', planType);
      console.log('Script URL:', script.src);
      console.log('Mount ID:', mountId);
      
      document.body.appendChild(script);
    }, 300); // Aumentado o delay para garantir limpeza completa

    // Limpa ao desmontar
    return () => {
      clearTimeout(timeoutId);
      cleanupDOM();
    };
  }, [planType, mountId]);

  return (
    <div className="yampi-button-container">
      <div id="yampi-checkout-button" />
    </div>
  );
};