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
      
      // Remove scripts
      document.querySelectorAll('script[src*="yampi"]').forEach(script => script.remove());
      
      // Remove elements except the button container
      document.querySelectorAll('[id*="yampi"]').forEach(el => {
        if (el.id !== 'yampi-checkout-button') {
          el.remove();
        }
      });
      
      // Remove iframes
      document.querySelectorAll('iframe[src*="yampi"]').forEach(iframe => iframe.remove());
      
      // Clean shadow roots
      document.querySelectorAll('*').forEach(element => {
        if (element.shadowRoot) {
          element.shadowRoot.querySelectorAll('[id*="yampi"]').forEach(el => el.remove());
        }
      });

      // Remove Yampi classes
      document.querySelectorAll('[class*="ymp"]').forEach(el => {
        if (!el.classList.contains('yampi-button-container')) {
          el.remove();
        }
      });
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

      script.onload = () => {
        console.log('Yampi script loaded successfully'); // Debug log
      };

      script.onerror = (error) => {
        console.error('Error loading Yampi script:', error); // Debug log
      };
    }, 800); // Aumentado o tempo de espera para garantir que o DOM esteja pronto

    return () => {
      clearTimeout(timeoutId);
      cleanupDOM();
    };
  }, [planType, mountId]);

  return (
    <div className="yampi-button-container w-full h-full flex items-center justify-center">
      <div id="yampi-checkout-button" className="w-full" />
    </div>
  );
};