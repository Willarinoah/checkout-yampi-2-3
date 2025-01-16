import { useLanguage } from "@/contexts/LanguageContext";
import { faqData } from "@/data/faqData";

export const useFAQData = () => {
  const { currentLanguage } = useLanguage();
  const faqs = faqData[currentLanguage as keyof typeof faqData];
  
  return {
    faqs
  };
};