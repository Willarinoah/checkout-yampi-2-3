import React, { useEffect, useState } from 'react';
import { 
  differenceInYears, differenceInMonths, differenceInDays,
  differenceInHours, differenceInMinutes, differenceInSeconds,
  set
} from 'date-fns';
import { useLanguage } from "@/contexts/LanguageContext";

interface RelationshipDurationProps {
  startDate: Date;
  startTime: string;
}

interface Duration {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const RelationshipDuration: React.FC<RelationshipDurationProps> = ({ startDate, startTime }) => {
  const { t } = useLanguage();
  const [duration, setDuration] = useState<Duration>({
    years: 0,
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateDuration = () => {
      try {
        const [hours, minutes] = startTime.split(':').map(Number);
        const startDateTime = set(startDate, { hours, minutes, seconds: 0 });
        const now = new Date();

        // Calculate years
        const years = differenceInYears(now, startDateTime);
        
        // Calculate months after years
        const afterYearsDate = set(startDateTime, { year: startDateTime.getFullYear() + years });
        const months = differenceInMonths(now, afterYearsDate);

        // Calculate days after months
        const afterMonthsDate = set(afterYearsDate, { month: afterYearsDate.getMonth() + months });
        const days = differenceInDays(now, afterMonthsDate);

        // Calculate time units
        const currentDateTime = new Date();
        const todayWithStartTime = set(currentDateTime, { 
          hours, 
          minutes, 
          seconds: 0 
        });

        const hoursValue = differenceInHours(currentDateTime, todayWithStartTime);
        const minutesValue = differenceInMinutes(currentDateTime, todayWithStartTime) % 60;
        const secondsValue = differenceInSeconds(currentDateTime, todayWithStartTime) % 60;

        setDuration({
          years,
          months,
          days,
          hours: hoursValue,
          minutes: minutesValue,
          seconds: secondsValue
        });
      } catch (error) {
        console.error('Error calculating duration:', error);
      }
    };

    const intervalId = setInterval(calculateDuration, 1000);
    calculateDuration(); // Initial calculation

    return () => clearInterval(intervalId);
  }, [startDate, startTime]);

  return (
    <>
      <p className="text-gray-400 text-lg">
        {duration.years} {t("years")}, {duration.months} {t("months")}, {duration.days} {t("days")}
      </p>
      <p className="text-gray-400 text-lg">
        {duration.hours} {t("hours")}, {duration.minutes} {t("minutes")} {t("and")} {duration.seconds} {t("seconds")}
      </p>
    </>
  );
};