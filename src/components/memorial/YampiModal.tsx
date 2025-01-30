import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface YampiModalProps {
  open: boolean;
  onClose: () => void;
  planType: "basic" | "premium";
}

export const YampiModal = ({ open, onClose, planType }: YampiModalProps) => {
  const [mountId] = useState(`yampi-${Date.now()}`);

  useEffect(() => {
    console.log('YampiModal rendered with:', { open, planType }); // Debug log

    const cleanupDOM = () => {
      console.log('Cleaning up Yampi DOM elements'); // Debug log
      
      // Remove scripts
      document.querySelectorAll('script[src*="yampi"]').forEach(script => script.remove());
      
      // Remove elements except the button container
      document.querySelectorAll('[id*="yampi"]').forEach(el => {
        if (el.id !== 'yampi-checkout-button') {
          el.remove();
        }
      });
      
      // Remove iframes
      document.querySelectorAll('iframe[src*="yampi"]').forEach(iframe => iframe.remove());
      
      // Clean shadow roots
      document.querySelectorAll('*').forEach(element => {
        if (element.shadowRoot) {
          element.shadowRoot.querySelectorAll('[id*="yampi"]').forEach(el => el.remove());
        }
      });

      // Remove Yampi classes
      document.querySelectorAll('[class*="ymp"]').forEach(el => {
        if (!el.classList.contains('yampi-button-container')) {
          el.remove();
        }
      });
    };

    if (open) {
      cleanupDOM();

      const timeoutId = setTimeout(() => {
        const script = document.createElement('script');
        script.id = mountId;
        
        const buttonIds = {
          basic: 'EPYNGGBFAY',
          premium: 'GMACVCTS2Q'
        };
        
        script.src = `https://api.yampi.io/v2/teste1970/public/buy-button/${buttonIds[planType]}/js`;
        
        console.log('Loading Yampi script:', script.src); // Debug log
        
        document.body.appendChild(script);

        script.onload = () => {
          console.log('Yampi script loaded successfully'); // Debug log
        };

        script.onerror = (error) => {
          console.error('Error loading Yampi script:', error); // Debug log
        };
      }, 800);

      return () => {
        clearTimeout(timeoutId);
        cleanupDOM();
      };
    }
  }, [open, planType, mountId]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white p-6">
        <DialogTitle className="text-xl font-semibold text-black mb-4">
          Digite seus dados para receber o QR Code
        </DialogTitle>
        <div className="mt-4 w-full h-[400px] flex items-center justify-center">
          <div className="yampi-button-container w-full h-full flex items-center justify-center">
            <div id="yampi-checkout-button" className="w-full" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};