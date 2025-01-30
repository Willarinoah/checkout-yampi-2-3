import React, { useEffect } from 'react';

interface YampiButtonProps {
  planType: "basic" | "premium";
  onCleanup?: () => void;
}

export const YampiButton = ({ planType, onCleanup }: YampiButtonProps) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.className = 'ymp-script';
    script.src = `https://api.yampi.io/v2/teste1970/public/buy-button/${planType === 'basic' ? 'OPXBUXGO7X' : 'OXD2XK5KNZ'}/js`;
    
    document.body.appendChild(script);

    return () => {
      script.remove();
      document.querySelectorAll('.ymp-script').forEach(el => el.remove());
      document.querySelectorAll('[id*="yampi"]').forEach(el => el.remove());
      document.querySelectorAll('iframe[src*="yampi"]').forEach(iframe => iframe.remove());
      if (onCleanup) onCleanup();
    };
  }, [planType, onCleanup]);

  return <div id="yampi-checkout-button" className="w-full" />;
};