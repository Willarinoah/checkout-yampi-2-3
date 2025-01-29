import React, { useEffect } from 'react';

interface YampiButtonProps {
  planType: "basic" | "premium";
}

export const YampiButton = ({ planType }: YampiButtonProps) => {
  useEffect(() => {
    // Limpa todos os scripts e botões Yampi existentes
    const cleanup = () => {
      const existingScripts = document.getElementsByClassName('ymp-script');
      Array.from(existingScripts).forEach(script => script.remove());
      
      // Limpa também os botões existentes
      const existingButtons = document.querySelectorAll('[id^="yampi-checkout"]');
      existingButtons.forEach(button => button.remove());
    };

    // Limpa antes de adicionar novo
    cleanup();

    // Cria e adiciona o novo script
    const script = document.createElement('script');
    script.className = 'ymp-script';
    script.src = `https://api.yampi.io/v2/teste1970/public/buy-button/${planType === 'basic' ? 'OPXBUXGO7X' : 'OXD2XK5KNZ'}/js`;
    
    console.log('Loading Yampi script for plan:', planType);
    console.log('Script URL:', script.src);
    
    document.body.appendChild(script);

    // Limpa ao desmontar
    return cleanup;
  }, [planType]);

  return (
    <div>
      <div id="yampi-checkout-button" />
    </div>
  );
};