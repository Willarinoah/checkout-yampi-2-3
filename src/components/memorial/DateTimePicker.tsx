import React from 'react';
import { format } from "date-fns";
import { ptBR, enUS } from 'date-fns/locale';
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface DateTimePickerProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  onTimeChange: (time: string) => void;
  time: string;
}

export function DateTimePicker({ date, onDateChange, onTimeChange, time }: DateTimePickerProps) {
  const { language } = useLanguage();
  const locale = language === 'pt' ? ptBR : enUS;

  return (
    <div className="space-y-4">
      <Label>{language === 'pt' ? 'Início do relacionamento:' : 'Start of relationship:'}</Label>
      
      <div className="flex flex-col sm:flex-row gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full sm:w-[240px] justify-start text-left font-normal bg-[#0A1528] border-lovepink",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP", { locale }) : 
                language === 'pt' ? "Selecione uma data" : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={onDateChange}
              initialFocus
              locale={locale}
            />
          </PopoverContent>
        </Popover>

        <Input
          type="time"
          value={time}
          onChange={(e) => onTimeChange(e.target.value)}
          className="w-full sm:w-[140px] bg-[#0A1528] border-lovepink"
        />
      </div>
    </div>
  );
}