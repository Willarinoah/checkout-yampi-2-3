import React from 'react';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { Input } from "@/components/ui/input";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  email: string;
  onSubmit: (email: string) => void;
  isBrazil: boolean;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  open,
  onClose,
  email,
  onSubmit,
  isBrazil
}) => {
  const [localEmail, setLocalEmail] = React.useState(email);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localEmail) {
      onSubmit(localEmail);
    }
  };

  React.useEffect(() => {
    setLocalEmail(email);
  }, [email]);

  if (isBrazil) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px] bg-white p-6">
          <DialogTitle className="text-xl font-semibold text-black">
            Digite seu e-mail para receber o QR Code
          </DialogTitle>
          <div className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Input
                  type="email"
                  placeholder="Seu melhor e-mail"
                  value={localEmail}
                  onChange={(e) => setLocalEmail(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  className="pl-10 bg-white border-gray-300"
                  required
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-[#6C8CFF] hover:bg-[#6C8CFF]/90 text-white"
              >
                Pagar com Pix ou Cartão
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white p-6">
        <DialogTitle className="text-xl font-semibold text-black">
          Almost there!
        </DialogTitle>
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-gray-500">
              Please enter your email to continue creating your memorial.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                type="email"
                placeholder="Enter your email"
                value={localEmail}
                onChange={(e) => setLocalEmail(e.target.value)}
                onFocus={(e) => e.target.select()}
                className="pl-10 bg-white border-gray-300"
                required
              />
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-[#0B1221] hover:bg-[#0B1221]/90 text-white"
            >
              Continue
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};