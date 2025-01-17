import { useEffect, useState, useCallback, useMemo } from "react";
import useEmblaCarousel, { EmblaCarouselType } from "embla-carousel-react";
import AutoplayPlugin from "embla-carousel-autoplay";
import { cn } from "@/lib/utils";

interface PreviewCarouselProps {
  photos: string[];
  className?: string;
}

interface ImageDimensions {
  width: number;
  height: number;
}

const getImageDimensions = (url: string): Promise<ImageDimensions> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };
    img.src = url;
  });
};

const calculateAspectRatio = (width: number, height: number) => {
  return height / width;
};

export function PreviewCarousel({ photos, className }: PreviewCarouselProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState<boolean[]>(photos.map(() => true));
  const [aspectRatio, setAspectRatio] = useState(1);
  
  const autoplay = useMemo(
    () =>
      AutoplayPlugin({
        delay: 4000,
        stopOnInteraction: false,
      }),
    []
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, skipSnaps: false },
    [autoplay]
  );

  const onSelect = useCallback((api: EmblaCarouselType) => {
    setSelectedIndex(api.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect(emblaApi);
    emblaApi.on("select", () => onSelect(emblaApi));

    return () => {
      emblaApi.off("select", () => onSelect(emblaApi));
    };
  }, [emblaApi, onSelect]);

  // Calculate and set aspect ratio when photos change
  useEffect(() => {
    const calculateImageAspectRatios = async () => {
      if (photos.length === 0) return;
      
      const dimensions = await Promise.all(
        photos.map(photo => getImageDimensions(photo))
      );
      
      // Find the average aspect ratio of all images
      const totalRatio = dimensions.reduce(
        (sum, dim) => sum + calculateAspectRatio(dim.width, dim.height),
        0
      );
      const averageRatio = totalRatio / dimensions.length;
      
      setAspectRatio(averageRatio);
    };

    calculateImageAspectRatios();
  }, [photos]);

  const handleImageLoad = useCallback((index: number) => {
    setIsLoading(prev => {
      const newState = [...prev];
      newState[index] = false;
      return newState;
    });
  }, []);

  if (photos.length === 0) return null;

  return (
    <div className={cn("w-full relative", className)}>
      <div className="overflow-hidden rounded-lg" ref={emblaRef}>
        <div className="flex touch-pan-y">
          {photos.map((photo, index) => (
            <div
              key={index}
              className="relative flex-[0_0_100%] min-w-0"
              style={{
                paddingTop: `${aspectRatio * 100}%`,
              }}
            >
              <img
                src={photo}
                alt={`Photo ${index + 1}`}
                className={cn(
                  "absolute inset-0 w-full h-full object-contain transition-opacity duration-300",
                  isLoading[index] ? "opacity-0" : "opacity-100"
                )}
                onLoad={() => handleImageLoad(index)}
              />
              {isLoading[index] && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                  <div className="w-6 h-6 border-2 border-lovepink/30 border-t-lovepink rounded-full animate-spin" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-center gap-1 mt-2">
        {photos.map((_, index) => (
          <button
            key={index}
            className={cn(
              "w-1.5 h-1.5 rounded-full transition-all",
              index === selectedIndex
                ? "bg-lovepink w-3"
                : "bg-lovepink/30 hover:bg-lovepink/50"
            )}
            onClick={() => emblaApi?.scrollTo(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}