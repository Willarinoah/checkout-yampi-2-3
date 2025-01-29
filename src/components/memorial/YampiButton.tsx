import React, { useEffect, useState } from 'react';

interface YampiButtonProps {
  planType: "basic" | "premium";
}

export const YampiButton = ({ planType }: YampiButtonProps) => {
  const [mountId] = useState(`yampi-${Date.now()}`);

  useEffect(() => {
    console.log('YampiButton mounted with plan:', planType); // Debug log

    const cleanupDOM = () => {
      console.log('Cleaning up Yampi DOM elements'); // Debug log
      
      document.querySelectorAll('script[src*="yampi"]').forEach(script => script.remove());
      document.querySelectorAll('[id*="yampi"]').forEach(el => el.remove());
      document.querySelectorAll('iframe[src*="yampi"]').forEach(iframe => iframe.remove());
      
      document.querySelectorAll('*').forEach(element => {
        if (element.shadowRoot) {
          element.shadowRoot.querySelectorAll('[id*="yampi"]').forEach(el => el.remove());
        }
      });

      document.querySelectorAll('[class*="ymp"]').forEach(el => el.remove());
    };

    cleanupDOM();

    const timeoutId = setTimeout(() => {
      const script = document.createElement('script');
      script.id = mountId;
      
      const buttonIds = {
        basic: 'EPYNGGBFAY',
        premium: 'GMACVCTS2Q'
      };
      
      script.src = `https://api.yampi.io/v2/teste1970/public/buy-button/${buttonIds[planType]}/js`;
      
      console.log('Loading Yampi script:', script.src); // Debug log
      
      document.body.appendChild(script);

      // Verificar se o script foi carregado
      script.onload = () => {
        console.log('Yampi script loaded successfully'); // Debug log
      };

      script.onerror = (error) => {
        console.error('Error loading Yampi script:', error); // Debug log
      };
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      cleanupDOM();
    };
  }, [planType, mountId]);

  return (
    <div className="yampi-button-container w-full">
      <div id="yampi-checkout-button" className="w-full" />
    </div>
  );
};