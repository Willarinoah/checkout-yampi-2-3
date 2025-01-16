import { useLanguage } from "@/contexts/LanguageContext";

type PlanSelectorProps = {
  selectedPlan: "basic" | "premium";
  onPlanChange: (plan: "basic" | "premium") => void;
};

export const PlanSelector = ({ selectedPlan, onPlanChange }: PlanSelectorProps) => {
  const { t, language } = useLanguage();
  
  const getCurrencySymbol = () => {
    return language === 'en' ? '$' : 'R$';
  };

  const getPrice = (plan: "basic" | "premium") => {
    if (language === 'en') {
      return plan === 'basic' ? '9' : '14';
    }
    return plan === 'basic' ? '29' : '49';
  };
  
  return (
    <div className="flex gap-4 mb-8 text-xs lg:text-sm">
      <button
        className={`flex-1 p-4 rounded-lg border ${
          selectedPlan === "basic"
            ? "border-lovepink bg-[#ffffff] text-[#0A1528]"
            : "border-gray-600 text-white"
        }`}
        onClick={() => onPlanChange("basic")}
      >
        {t("one_year")}, 3 {t("photos_no_music")} - {getCurrencySymbol()}{getPrice("basic")}
      </button>
      <button
        className={`flex-1 p-4 rounded-lg border ${
          selectedPlan === "premium"
            ? "border-lovepink bg-[#ffffff] text-[#0A1528]"
            : "border-gray-600 text-white"
        }`}
        onClick={() => onPlanChange("premium")}
      >
        {t("forever")}, 7 {t("photos_with_music")} - {getCurrencySymbol()}{getPrice("premium")}
      </button>
    </div>
  );
};