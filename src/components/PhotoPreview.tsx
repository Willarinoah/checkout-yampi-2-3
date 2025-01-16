import { Camera } from "lucide-react";

interface PhotoPreviewProps {
  photos: File[];
}

export const PhotoPreview = ({ photos }: PhotoPreviewProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
      {photos.length > 0 ? (
        photos.map((photo, index) => (
          <div key={index} className="aspect-square relative rounded-lg overflow-hidden">
            <img
              src={URL.createObjectURL(photo)}
              alt={`Preview ${index + 1}`}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        ))
      ) : (
        <div className="col-span-full aspect-video bg-loveblue/30 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-400">
            <Camera className="w-12 h-12 mx-auto mb-2" />
            <p>No photos uploaded yet</p>
          </div>
        </div>
      )}
    </div>
  );
};