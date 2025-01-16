import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

type PhotoUploadProps = {
  photos: File[];
  photosPreviews: string[];
  selectedPlan: "basic" | "premium";
  onPhotosChange: (newPhotos: File[], newPreviews: string[]) => void;
};

export const PhotoUpload = ({ photos, photosPreviews, selectedPlan, onPhotosChange }: PhotoUploadProps) => {
  const { t } = useLanguage();

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const maxPhotos = selectedPlan === "basic" ? 3 : 7;
    if (photos.length + files.length > maxPhotos) {
      toast.error(`${t("maximum")} ${maxPhotos} ${t("photos")}`);
      return;
    }

    const newPhotos = Array.from(files);
    const newPreviews = newPhotos.map(photo => URL.createObjectURL(photo));
    
    onPhotosChange([...photos, ...newPhotos], [...photosPreviews, ...newPreviews]);
  };

  return (
    <div>
      <label className="block mb-0 text-xs lg:text-sm">
        {t("photos")} ({photosPreviews.length}/{selectedPlan === "basic" ? "3" : "7"}):
      </label>
      <Button
        className="w-full bg-[#0A1528] border border-lovepink hover:bg-lovepink/20"
        onClick={() => document.getElementById('photo-upload')?.click()}
      >
        <Upload className="mr-2 h-4 w-4" />
        {t("choose_photos")}
      </Button>
      <input
        id="photo-upload"
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handlePhotoUpload}
      />
    </div>
  );
};