import React, { useEffect } from 'react';

interface YampiButtonProps {
  planType: "basic" | "premium";
}

export const YampiButton = ({ planType }: YampiButtonProps) => {
  useEffect(() => {
    // Remove any existing Yampi scripts
    const existingScripts = document.getElementsByClassName('ymp-script');
    Array.from(existingScripts).forEach(script => script.remove());

    // Add the new script based on the plan
    const script = document.createElement('script');
    script.className = 'ymp-script';
    script.src = `https://api.yampi.io/v2/teste1970/public/buy-button/${planType === 'basic' ? 'OPXBUXGO7X' : 'OXD2XK5KNZ'}/js`;
    document.body.appendChild(script);

    return () => {
      // Cleanup on unmount
      const scripts = document.getElementsByClassName('ymp-script');
      Array.from(scripts).forEach(script => script.remove());
    };
  }, [planType]);

  return (
    <div id="yampi-checkout-button" className="mt-4" />
  );
};