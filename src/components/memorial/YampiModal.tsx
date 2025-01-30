import React, { useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface YampiModalProps {
  open: boolean;
  onClose: () => void;
  planType: "basic" | "premium";
}

export const YampiModal = ({ open, onClose, planType }: YampiModalProps) => {
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Limpa o script anterior se existir
    const oldScript = document.querySelector('.ymp-script');
    if (oldScript) {
      oldScript.remove();
    }

    // Se o modal estiver aberto e tivermos a referência do botão, adiciona o novo script
    if (open && buttonRef.current) {
      const script = document.createElement('script');
      script.className = 'ymp-script';
      script.src = `https://api.yampi.io/v2/teste1970/public/buy-button/${
        planType === 'basic' ? 'EPYNGGBFAY' : 'GMACVCTS2Q'
      }/js`;
      buttonRef.current.appendChild(script);
    }

    return () => {
      const script = document.querySelector('.ymp-script');
      if (script) {
        script.remove();
      }
    };
  }, [open, planType]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white p-6">
        <DialogTitle className="text-xl font-semibold text-black mb-4">
          Digite seus dados para receber o QR Code
        </DialogTitle>
        <div className="mt-4 w-full h-[400px] flex items-center justify-center">
          <div ref={buttonRef} id="yampi-checkout-button" />
        </div>
      </DialogContent>
    </Dialog>
  );
};