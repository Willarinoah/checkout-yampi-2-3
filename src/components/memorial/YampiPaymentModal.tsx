
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { YampiButton } from "./YampiButton";

interface YampiPaymentModalProps {
  open: boolean;
  onClose: () => void;
  selectedPlan: "basic" | "premium";
  isLoading: boolean;
  isModalOpen: boolean;
}

export function YampiPaymentModal({
  open,
  onClose,
  selectedPlan,
  isLoading,
  isModalOpen
}: YampiPaymentModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white p-6">
        <DialogTitle className="text-xl font-semibold text-black">
          Quase lá!
        </DialogTitle>
        <div className="w-full flex flex-col items-center justify-center">
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-8 w-8 animate-spin text-lovepink" />
              <span className="ml-2 text-gray-600">Salvando dados...</span>
            </div>
          ) : (
            <div className="w-full flex items-center justify-center mx-auto" style={{ maxWidth: '300px' }}>
              <YampiButton plan={selectedPlan} isModalOpen={isModalOpen} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
