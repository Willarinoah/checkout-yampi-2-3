import { Plan } from "@/types/pricing";
import { TranslationKey } from "@/translations/types";

export const getPlans = (t: (key: TranslationKey) => string): Plan[] => [
  {
    plan: "basic",
    price: "29",
    priceId: "price_1QZFcpHqzrKr0Po5Yi7TwA6u",
    features: [
      { text: "year_access", available: true },
      { text: "photos_no_music", available: true },
      { text: "no_music", available: false }
    ],
    isPopular: false
  },
  {
    plan: "premium",
    price: "49",
    priceId: "price_1QZFeeHqzrKr0Po5eUPMHE2B",
    features: [
      { text: "forever_access", available: true },
      { text: "photos_with_music", available: true },
      { text: "with_music", available: true }
    ],
    isPopular: true
  }
];