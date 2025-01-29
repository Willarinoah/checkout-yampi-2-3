import React, { useEffect } from 'react';

interface YampiButtonProps {
  planType: "basic" | "premium";
}

export const YampiButton = ({ planType }: YampiButtonProps) => {
  useEffect(() => {
    // Função de limpeza que remove scripts e botões anteriores
    const cleanup = () => {
      // Remove scripts antigos
      const existingScripts = document.getElementsByClassName('ymp-script');
      Array.from(existingScripts).forEach(script => script.remove());
      
      // Remove botões antigos
      const existingButtons = document.querySelectorAll('[id^="yampi-checkout"]');
      existingButtons.forEach(button => button.remove());
      
      // Remove também os iframes que o Yampi cria
      const existingIframes = document.querySelectorAll('iframe[src*="yampi"]');
      existingIframes.forEach(iframe => iframe.remove());

      // Remove divs que possam conter botões antigos
      const existingDivs = document.querySelectorAll('div[id^="yampi-checkout"]');
      existingDivs.forEach(div => div.remove());
    };

    // Limpa antes de adicionar novo
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

    // Limpa ao desmontar
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