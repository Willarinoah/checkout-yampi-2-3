import { useEffect, useState } from "react";

interface CountdownDisplayProps {
  startDate: Date;
  startTime: string;
}

interface TimeLeft {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const CountdownDisplay = ({ startDate, startTime }: CountdownDisplayProps) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    years: 0,
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const [hours, minutes] = startTime.split(":").map(Number);
      const start = new Date(startDate);
      start.setHours(hours, minutes, 0, 0);
      const now = new Date();

      const difference = now.getTime() - start.getTime();

      const years = Math.floor(difference / (1000 * 60 * 60 * 24 * 365));
      const months = Math.floor((difference % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
      const days = Math.floor((difference % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ years, months, days, hours, minutes, seconds });
    };

    const timer = setInterval(calculateTimeLeft, 1000);
    calculateTimeLeft();

    return () => clearInterval(timer);
  }, [startDate, startTime]);

  return (
    <div className="text-center space-y-4">
      <h2 className="text-3xl font-bold text-white">Together for</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Object.entries(timeLeft).map(([unit, value]) => (
          <div key={unit} className="bg-loveblue/30 p-4 rounded-lg">
            <div className="text-2xl font-bold text-lovepink">{value}</div>
            <div className="text-sm text-gray-400">{unit}</div>
          </div>
        ))}
      </div>
    </div>
  );
};