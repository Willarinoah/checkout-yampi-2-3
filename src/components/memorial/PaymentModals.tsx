import React from 'react';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mail, User, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  email: string;
  onSubmit: (email: string, fullName: string, phoneNumber: string) => void;
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
  const [fullName, setFullName] = React.useState("");
  const [phoneNumber, setPhoneNumber] = React.useState("");

  const sanitizePhoneNumber = (value: string) => {
    // First remove all non-digits
    const digitsOnly = value.replace(/[^\d]/g, '');
    // Then add back the plus sign if it was at the start
    return value.startsWith('+') ? `+${digitsOnly}` : digitsOnly;
  };

  const formatPhoneNumber = (rawNumber: string) => {
    const cleanNumber = sanitizePhoneNumber(rawNumber);
    
    if (isBrazil) {
      if (cleanNumber.startsWith('+55')) return cleanNumber;
      if (cleanNumber.length <= 11) return `+55${cleanNumber}`;
      return cleanNumber;
    }
    
    if (cleanNumber.startsWith('+')) return cleanNumber;
    return `+${cleanNumber}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedNumber = formatPhoneNumber(e.target.value);
    setPhoneNumber(formattedNumber);
  };

  const validateFullName = (name: string) => {
    const trimmedName = name.trim();
    if (trimmedName.length < 3) {
      toast.error(isBrazil ? "Nome deve ter pelo menos 3 caracteres" : "Name must be at least 3 characters long");
      return false;
    }
    if (trimmedName.length > 100) {
      toast.error(isBrazil ? "Nome deve ter no máximo 100 caracteres" : "Name must be at most 100 characters long");
      return false;
    }
    return true;
  };

  const validateForm = () => {
    if (!localEmail || !fullName || !phoneNumber) {
      toast.error(isBrazil ? "Por favor, preencha todos os campos" : "Please fill in all fields");
      return false;
    }

    if (!validateFullName(fullName)) {
      return false;
    }

    const cleanNumber = sanitizePhoneNumber(phoneNumber);
    const minLength = isBrazil ? 11 : 6;
    
    if (cleanNumber.length < minLength) {
      toast.error(isBrazil ? "Número de telefone inválido" : "Invalid phone number");
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(localEmail, fullName.trim(), phoneNumber);
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
            Digite seus dados para receber o QR Code
          </DialogTitle>
          <div className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Nome completo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-10 bg-white border-gray-300"
                  required
                  maxLength={100}
                />
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
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
              <div className="relative">
                <Input
                  type="tel"
                  placeholder="Telefone com DDD"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  className="pl-10 bg-white border-gray-300"
                  required
                />
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
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
              Please enter your information to continue creating your memorial.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="pl-10 bg-white border-gray-300"
                required
                maxLength={100}
              />
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
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
            <div className="relative">
              <Input
                type="tel"
                placeholder="Phone number (e.g. +1234567890)"
                value={phoneNumber}
                onChange={handlePhoneChange}
                className="pl-10 bg-white border-gray-300"
                required
              />
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
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