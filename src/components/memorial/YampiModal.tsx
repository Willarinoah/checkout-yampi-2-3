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
    console.log('YampiModal rendered:', { open, planType, mountId });

    if (open) {
      console.log('Initializing Yampi script');
      
      // Cleanup any existing Yampi elements
      document.querySelectorAll('script[src*="yampi"]').forEach(script => {
        console.log('Removing existing Yampi script');
        script.remove();
      });

      // Add new script
      const script = document.createElement('script');
      script.id = mountId;
      
      const buttonIds = {
        basic: 'EPYNGGBFAY',
        premium: 'GMACVCTS2Q'
      };
      
      script.src = `https://api.yampi.io/v2/teste1970/public/buy-button/${buttonIds[planType]}/js`;
      
      script.onload = () => {
        console.log('Yampi script loaded successfully');
      };

      script.onerror = (error) => {
        console.error('Error loading Yampi script:', error);
      };

      document.body.appendChild(script);
    }

    return () => {
      if (document.getElementById(mountId)) {
        console.log('Cleaning up Yampi script:', mountId);
        document.getElementById(mountId)?.remove();
      }
    };
  }, [open, planType, mountId]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white p-6">
        <DialogTitle className="text-xl font-semibold text-black mb-4">
          Digite seus dados para receber o QR Code
        </DialogTitle>
        <div className="mt-4 w-full h-[400px] flex items-center justify-center">
          <div id="yampi-checkout-button" />
        </div>
      </DialogContent>
    </Dialog>
  );
};