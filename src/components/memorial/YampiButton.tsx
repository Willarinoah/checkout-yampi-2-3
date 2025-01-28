import React, { useEffect } from 'react';

interface YampiButtonProps {
  planType: "basic" | "premium";
}

export const getYampiCheckoutUrl = (planType: "basic" | "premium"): string => {
  const productId = planType === 'basic' ? 'OPXBUXGO7X' : 'OXD2XK5KNZ';
  return `https://seguro.memoryys.com/checkout/teste1970/${productId}`;
};

export const YampiButton = ({ planType }: YampiButtonProps) => {
  useEffect(() => {
    // Cleanup any existing scripts
    const existingScripts = document.getElementsByClassName('ymp-script');
    Array.from(existingScripts).forEach(script => script.remove());
  }, []);

  return null;
};