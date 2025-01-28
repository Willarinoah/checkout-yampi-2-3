import React, { useEffect } from 'react';

interface YampiButtonProps {
  planType: "basic" | "premium";
}

export const YampiButton = ({ planType }: YampiButtonProps) => {
  useEffect(() => {
    // Remove any existing Yampi scripts to avoid duplicates
    const existingScripts = document.getElementsByClassName('ymp-script');
    Array.from(existingScripts).forEach(script => script.remove());

    // Create and add the new script
    const script = document.createElement('script');
    script.className = 'ymp-script';
    script.src = `https://api.yampi.io/v2/teste1970/public/buy-button/${planType === 'basic' ? 'OPXBUXGO7X' : 'OXD2XK5KNZ'}/js`;
    
    // Log para debug
    console.log('Loading Yampi script for plan:', planType);
    console.log('Script URL:', script.src);
    
    // Função para tentar clicar no botão
    const tryClickButton = () => {
      const yampiButton = document.querySelector('#yampi-checkout-button button') as HTMLButtonElement;
      if (yampiButton) {
        console.log('Yampi button found, clicking...');
        yampiButton.click();
      } else {
        console.log('Yampi button not found yet, retrying...');
        setTimeout(tryClickButton, 100); // Tenta novamente após 100ms
      }
    };

    // Configura o evento onload do script
    script.onload = () => {
      console.log('Yampi script loaded, waiting for button...');
      setTimeout(tryClickButton, 100); // Espera 100ms antes da primeira tentativa
    };

    document.body.appendChild(script);

    return () => {
      // Cleanup on unmount
      const scripts = document.getElementsByClassName('ymp-script');
      Array.from(scripts).forEach(script => script.remove());
    };
  }, [planType]);

  return (
    <div style={{ display: 'none' }}>
      <div id="yampi-checkout-button" />
    </div>
  );
};