import React from 'react';
import { PreviewCarousel } from "@/components/shared/PreviewCarousel";
import { PreviewHeader } from "./PreviewHeader";
import { RelationshipDuration } from "./RelationshipDuration";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/contexts/LanguageContext";
import { Camera } from "lucide-react";

interface MemorialPreviewProps {
  coupleName?: string;
  photos?: string[];
  message?: string;
  youtubeUrl?: string;
  selectedPlan?: "basic" | "premium";
  isPreview?: boolean;
  startDate?: Date;
  startTime?: string;
}

type CustomIframeAttributes = React.DetailedHTMLProps<React.IframeHTMLAttributes<HTMLIFrameElement>, HTMLIFrameElement> & {
  playsInline?: boolean;
};

export const MemorialPreview: React.FC<MemorialPreviewProps> = ({
  coupleName,
  photos,
  message,
  youtubeUrl,
  selectedPlan = "basic",
  startDate,
  startTime = "00:00"
}) => {
  const { t } = useLanguage();
  const [customUrl, setCustomUrl] = React.useState("");

  React.useEffect(() => {
    if (coupleName) {
      const slug = coupleName.toLowerCase().replace(/\s+/g, '-');
      setCustomUrl(`Memorys.com/${slug}`);
    } else {
      setCustomUrl('Memorys.com/seu-amor');
    }
  }, [coupleName]);

  const formatMessage = (text: string) => {
    if (!text) return null;
    return text.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  const getYouTubeEmbedUrl = (url: string) => {
    try {
      const videoId = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/user\/\S+|\/ytscreeningroom\?v=|\/sandalsResorts#\w\/\w\/.*\/))([^\/&\?]{10,12})/);
      if (!videoId) return null;
      return `https://www.youtube.com/embed/${videoId[1]}?autoplay=1&mute=0&playsinline=1`;
    } catch (error) {
      console.error('Error parsing YouTube URL:', error);
      return null;
    }
  };

  return (
    <div className="w-full max-w-[95vw] sm:max-w-sm mx-auto">
      <Card className="bg-[#1a1a1a] border-lovepink/30 overflow-hidden">
        <ScrollArea className="h-[80vh]">
          <div className="p-4 space-y-4">
            <PreviewHeader customUrl={customUrl} />

            <div className="border-2 border-dashed border-lovepink/30 rounded-lg p-2 aspect-square sm:aspect-video flex items-center justify-center">
              {photos && photos.length > 0 ? (
                <PreviewCarousel photos={photos} />
              ) : (
                <div className="text-center text-lovepink/50">
                  <Camera className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2" />
                  <p className="text-sm sm:text-base">{t("photos_will_appear")}</p>
                </div>
              )}
            </div>

            {startDate && (
              <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-2">{t("together")}</h2>
                <RelationshipDuration startDate={startDate} startTime={startTime} />
              </div>
            )}
            
            {message && (
              <div className="border-t border-lovepink/20 pt-4">
                <p className="text-xs sm:text-sm text-gray-300 whitespace-pre-line break-words max-w-full px-0">
                  {formatMessage(message)}
                </p>
              </div>
            )}

            {selectedPlan === "premium" && youtubeUrl && (
              <div className="aspect-video rounded-lg overflow-hidden border border-lovepink/30 mt-4">
                <iframe
                  src={getYouTubeEmbedUrl(youtubeUrl)}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                  allowFullScreen
                  className="w-full h-full"
                  playsInline
                  {...{} as CustomIframeAttributes}
                />
              </div>
            )}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
};