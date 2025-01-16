import React from 'react';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface EmailCollectionDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (email: string) => void;
  email: string;
  onEmailChange: (email: string) => void;
  isBrazil?: boolean | null;
}

const EmailCollectionDialog: React.FC<EmailCollectionDialogProps> = ({
  open,
  onClose,
  onSubmit,
  email,
  onEmailChange,
  isBrazil = false,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      onSubmit(email);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] p-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">
              {isBrazil ? "Digite seu e-mail para receber o QR Code" : "Almost there!"}
            </h2>
            {!isBrazil && (
              <p className="text-sm text-gray-500">
                Please enter your email to continue creating your memorial.
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                type="email"
                placeholder={isBrazil ? "Seu melhor e-mail" : "Enter your email"}
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
                onFocus={(e) => e.target.select()}
                className="pl-10"
                required
              />
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <Button 
              type="submit" 
              className={`w-full ${isBrazil ? 'bg-[#6C8CFF] hover:bg-[#6C8CFF]/90' : 'bg-[#0B1221] hover:bg-[#0B1221]/90'}`}
            >
              {isBrazil ? "Pagar com Pix ou Cartão" : "Continue"}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmailCollectionDialog;