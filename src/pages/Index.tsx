import { useState } from "react";
import { CountdownForm } from "@/components/CountdownForm";
import { CountdownDisplay } from "@/components/CountdownDisplay";
import { PhotoPreview } from "@/components/PhotoPreview";
import { toast } from "sonner";

const Index = () => {
  const [countdownData, setCountdownData] = useState<{
    coupleName: string;
    startDate: Date;
    startTime: string;
    message: string;
    photos: File[];
  } | null>(null);

  const handleSubmit = (data: {
    coupleName: string;
    startDate: Date;
    startTime: string;
    message: string;
    photos: File[];
  }) => {
    setCountdownData(data);
    toast.success("Countdown created successfully!");
  };

  return (
    <div className="min-h-screen bg-loveblue text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Love Countdown</h1>
          <p className="text-gray-400">Track the beautiful moments you've spent together</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <CountdownForm onSubmit={handleSubmit} />
          </div>

          <div className="space-y-8">
            {countdownData && (
              <>
                <div className="bg-black/20 rounded-xl p-6 backdrop-blur-sm">
                  <h2 className="text-2xl font-bold mb-4 text-center">{countdownData.coupleName}</h2>
                  <CountdownDisplay startDate={countdownData.startDate} startTime={countdownData.startTime} />
                </div>

                {countdownData.message && (
                  <div className="bg-black/20 rounded-xl p-6 backdrop-blur-sm">
                    <h3 className="text-xl font-semibold mb-3">Your Message</h3>
                    <p className="text-gray-300 whitespace-pre-line">{countdownData.message}</p>
                  </div>
                )}

                <PhotoPreview photos={countdownData.photos} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;