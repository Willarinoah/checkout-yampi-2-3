import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useMemorial } from "@/hooks/useMemorial";
import { PreviewHeader } from "@/components/memorial/PreviewHeader";
import { MemorialPreview } from "@/components/memorial/MemorialPreview";
import { recordVisit } from "@/lib/analytics";
import { detectUserLocation } from "@/lib/location-detector";

const PreviewMemorial = () => {
  const { slug } = useParams();
  const { data: memorial, isLoading, error } = useMemorial(slug);

  useEffect(() => {
    const recordAnalytics = async () => {
      if (memorial?.id) {
        try {
          // Get location info
          const locationInfo = await detectUserLocation();
          
          // Get basic device info
          const deviceInfo = {
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            screenSize: {
              width: window.screen.width,
              height: window.screen.height
            }
          };

          await recordVisit(memorial.id, locationInfo, deviceInfo);
          console.log('Visit recorded successfully');
        } catch (error) {
          console.error('Error recording analytics:', error);
        }
      }
    };

    recordAnalytics();
  }, [memorial?.id]);

  if (isLoading) {
    return <div className="min-h-screen bg-[#0A1528] flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-lovepink"></div>
    </div>;
  }

  if (error || !memorial) {
    return <div className="min-h-screen bg-[#0A1528] flex items-center justify-center text-white">
      Memorial não encontrado
    </div>;
  }

  return (
    <div className="min-h-screen bg-[#0A1528]">
      <PreviewHeader memorial={memorial} />
      <MemorialPreview memorial={memorial} />
    </div>
  );
};

export default PreviewMemorial;