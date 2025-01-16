import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "lucide-react";

interface CountdownFormProps {
  onSubmit: (data: {
    coupleName: string;
    startDate: Date;
    startTime: string;
    message: string;
    photos: File[];
  }) => void;
}

export const CountdownForm = ({ onSubmit }: CountdownFormProps) => {
  const [coupleName, setCoupleName] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [startTime, setStartTime] = useState("00:00");
  const [message, setMessage] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate) return;
    onSubmit({ coupleName, startDate, startTime, message, photos });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="coupleName">Couple's Name</Label>
        <Input
          id="coupleName"
          placeholder="Enter your names"
          value={coupleName}
          onChange={(e) => setCoupleName(e.target.value)}
          className="bg-loveblue/50 border-lovepink/30 focus:border-lovepink"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <div className="relative">
            <Input
              id="startDate"
              type="date"
              value={startDate?.toISOString().split("T")[0] || ""}
              onChange={(e) => setStartDate(new Date(e.target.value))}
              className="bg-loveblue/50 border-lovepink/30 focus:border-lovepink pl-10"
              required
            />
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-lovepink/50" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="startTime">Start Time</Label>
          <Input
            id="startTime"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="bg-loveblue/50 border-lovepink/30 focus:border-lovepink"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Your Message</Label>
        <Textarea
          id="message"
          placeholder="Write a special message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="bg-loveblue/50 border-lovepink/30 focus:border-lovepink min-h-[100px]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="photos">Add Photos</Label>
        <Input
          id="photos"
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setPhotos(Array.from(e.target.files || []))}
          className="bg-loveblue/50 border-lovepink/30 focus:border-lovepink"
        />
      </div>

      <Button type="submit" className="w-full bg-lovepink hover:bg-lovepink/90">
        Create Countdown
      </Button>
    </form>
  );
};