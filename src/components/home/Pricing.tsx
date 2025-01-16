import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Plan, PricingCardProps } from "@/types/pricing";
import { TranslationKey } from "@/translations/types";
import { getPlans } from "@/data/pricingData";

const PricingCard = ({ plan, price, features, isPopular, priceId }: PricingCardProps) => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const getCurrencySymbol = () => {
    return language === 'en' ? '$' : 'R$';
  };

  const getPrice = () => {
    return language === 'en' ? (plan === 'basic' ? '9' : '14') : price;
  };

  const handleNavigate = () => {
    navigate("/create");
    window.scrollTo(0, 0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`relative bg-[#0A1528] backdrop-blur-lg rounded-xl p-8 ${
        isPopular ? "border-2 border-lovepink" : ""
      }`}
    >
      {isPopular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-lovepink text-white px-4 py-1 rounded-full text-sm">
          {t('most_chosen')}
        </span>
      )}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">{t(plan.toLowerCase() as TranslationKey)}</h3>
          <div className="text-4xl font-bold text-white">{getCurrencySymbol()}{getPrice()}</div>
        </div>
        <img
          src={isPopular ? "/heart-fire.png" : "/teddy-bear.png"}
          alt={plan}
          className="w-16 h-16"
        />
      </div>
      <ul className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-2 text-gray-300">
            {feature.available ? (
              <Check className="w-5 h-5 text-lovepink" />
            ) : (
              <X className="w-5 h-5 text-gray-500" />
            )}
            <span className="flex-1">
              {feature.text === "year_access" ? (
                t("one_year")
              ) : (
                t(feature.text as TranslationKey)
              )}
            </span>
          </li>
        ))}
      </ul>
      <button
        onClick={handleNavigate}
        className="w-full bg-lovepink text-white py-3 rounded-xl font-semibold hover:bg-opacity-90 transition-colors"
      >
        {t('make_website')}
      </button>
    </motion.div>
  );
};

const Pricing = () => {
  const { t } = useLanguage();
  const plans = getPlans(t);

  return (
    <div id="pricing" className="py-20 bg-loveblue">
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-5xl font-bold text-center text-white mb-16"
        >
          {t('prices')}
        </motion.h2>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <PricingCard key={index} {...plan} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pricing;