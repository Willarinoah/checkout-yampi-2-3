import React, { useEffect } from 'react';

interface YampiButtonProps {
  planType: "basic" | "premium";
}

export const YampiButton = ({ planType }: YampiButtonProps) => {
  useEffect(() => {
    const cleanup = () => {
      // Remove scripts antigos
      const existingScripts = document.getElementsByClassName('ymp-script');
      Array.from(existingScripts).forEach(script => script.remove());
      
      // Remove botões antigos
      const existingButtons = document.querySelectorAll('[id^="yampi-checkout"]');
      existingButtons.forEach(button => button.remove());
      
      // Remove iframes do Yampi
      const existingIframes = document.querySelectorAll('iframe[src*="yampi"]');
      existingIframes.forEach(iframe => iframe.remove());

      // Remove divs que contêm botões antigos
      const existingDivs = document.querySelectorAll('div[id^="yampi-checkout"]');
      existingDivs.forEach(div => div.remove());

      // Remove elementos do shadow DOM que podem persistir
      document.querySelectorAll('div').forEach(div => {
        if (div.shadowRoot) {
          const shadowElements = div.shadowRoot.querySelectorAll('[id^="yampi-checkout"]');
          shadowElements.forEach(elem => elem.remove());
        }
      });
    };

    // Executa limpeza antes de adicionar novo botão
    cleanup();

    // Pequeno delay para garantir que a limpeza foi concluída
    const timeoutId = setTimeout(() => {
      // Cria e adiciona o novo script
      const script = document.createElement('script');
      script.className = 'ymp-script';
      script.src = `https://api.yampi.io/v2/teste1970/public/buy-button/${planType === 'basic' ? 'OPXBUXGO7X' : 'OXD2XK5KNZ'}/js`;
      
      console.log('Loading Yampi script for plan:', planType);
      console.log('Script URL:', script.src);
      
      document.body.appendChild(script);
    }, 100);

    // Limpa ao desmontar o componente
    return () => {
      clearTimeout(timeoutId);
      cleanup();
    };
  }, [planType]);

  return (
    <div>
      <div id="yampi-checkout-button" />
    </div>
  );
};