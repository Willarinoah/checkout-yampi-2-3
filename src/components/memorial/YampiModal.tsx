import React from 'react';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { YampiButton } from './YampiButton';

interface YampiModalProps {
  open: boolean;
  onClose: () => void;
  planType: "basic" | "premium";
}

export const YampiModal = ({ open, onClose, planType }: YampiModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white p-6">
        <DialogTitle className="text-xl font-semibold text-black">
          Digite seus dados para receber o QR Code
        </DialogTitle>
        <div className="mt-4">
          <YampiButton planType={planType} />
        </div>
      </DialogContent>
    </Dialog>
  );
};