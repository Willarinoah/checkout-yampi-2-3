import { useLanguage } from "@/contexts/LanguageContext";
import { faqData } from "@/data/faqData";

export const useFAQData = () => {
  const { language } = useLanguage();
  const faqs = faqData[language as keyof typeof faqData];
  
  return {
    faqs
  };
};