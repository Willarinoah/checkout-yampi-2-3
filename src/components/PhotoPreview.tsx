interface PhotoPreviewProps {
  photos: File[];
}

export const PhotoPreview = ({ photos }: PhotoPreviewProps) => {
  if (!photos || photos.length === 0) return null;

  return (
    <div className="bg-black/20 rounded-xl p-6 backdrop-blur-sm">
      <h3 className="text-xl font-semibold mb-3">Your Photos</h3>
      <div className="grid grid-cols-2 gap-4">
        {photos.map((photo, index) => (
          <div key={index} className="aspect-square relative overflow-hidden rounded-lg">
            <img
              src={URL.createObjectURL(photo)}
              alt={`Photo ${index + 1}`}
              className="object-cover w-full h-full"
            />
          </div>
        ))}
      </div>
    </div>
  );
};