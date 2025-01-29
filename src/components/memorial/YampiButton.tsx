import React, { useEffect } from 'react';

interface YampiButtonProps {
  planType: "basic" | "premium";
}

export const YampiButton = ({ planType }: YampiButtonProps) => {
  useEffect(() => {
    const cleanup = () => {
      // Remove scripts antigos por ID específico
      const basicScript = document.getElementById('yampi-basic-script');
      const premiumScript = document.getElementById('yampi-premium-script');
      basicScript?.remove();
      premiumScript?.remove();
      
      // Remove botões antigos por ID específico
      const basicButton = document.getElementById('yampi-basic-button');
      const premiumButton = document.getElementById('yampi-premium-button');
      basicButton?.remove();
      premiumButton?.remove();
      
      // Remove iframes antigos
      const iframes = document.querySelectorAll('iframe[src*="yampi"]');
      iframes.forEach(iframe => iframe.remove());

      // Remove elementos do shadow DOM
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
      // Cria o script com ID específico para o plano
      const script = document.createElement('script');
      script.id = `yampi-${planType}-script`; // ID único para cada tipo de plano
      
      // URLs específicas para cada plano
      const scriptUrls = {
        basic: 'https://api.yampi.io/v2/teste1970/public/buy-button/OPXBUXGO7X/js',
        premium: 'https://api.yampi.io/v2/teste1970/public/buy-button/OXD2XK5KNZ/js'
      };
      
      script.src = scriptUrls[planType];
      
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
      <div id={`yampi-${planType}-button`} />
    </div>
  );
};