
import { useEffect, useState } from "react";
import { useYampiScript } from "@/hooks/use-yampi-script";
import { Loader2 } from "lucide-react";

interface YampiButtonProps {
  plan: "basic" | "premium";
  isModalOpen: boolean;
}

export function YampiButton({ plan, isModalOpen }: YampiButtonProps) {
  const { loadScript } = useYampiScript(plan);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isModalOpen) return;
    
    setIsLoading(true);
    const cleanup = loadScript(isModalOpen);
    
    const timeout = setTimeout(() => {
      setIsLoading(false);
      const yampiCheckout = (window as Window & typeof globalThis & { YampiCheckout?: { init: () => void } }).YampiCheckout;
      if (yampiCheckout) {
        yampiCheckout.init();
      }
    }, 1000);

    return () => {
      clearTimeout(timeout);
      if (cleanup) cleanup();
    };
  }, [plan, isModalOpen]);

  if (isLoading && isModalOpen) {
    return (
      <div className="w-full h-12 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-lovepink" />
      </div>
    );
  }

  return (
    <div className="w-full flex items-center justify-center">
      <div id={`yampi-button-${plan}`} className="w-full max-w-[300px]" />
    </div>
  );
}

