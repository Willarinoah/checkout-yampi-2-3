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
    
    document.body.appendChild(script);

    // Simulate click after script loads
    script.onload = () => {
      const yampiButton = document.querySelector('#yampi-checkout-button button') as HTMLButtonElement;
      if (yampiButton) {
        yampiButton.click();
      }
    };

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