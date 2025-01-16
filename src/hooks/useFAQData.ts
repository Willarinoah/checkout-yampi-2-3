import { useLanguage } from "@/contexts/LanguageContext";
import { getFAQs } from "@/data/faqData";

export const useFAQData = () => {
  const { t } = useLanguage();
  const faqs = getFAQs(t);
  
  return {
    faqs,
    t
  };
};