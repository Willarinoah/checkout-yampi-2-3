import { Plan } from "@/types/pricing";
import { TranslationKey } from "@/translations/types";

export const getPlans = (t: (key: TranslationKey) => string): Plan[] => [
  {
    plan: "basic",
    price: "29",
    priceId: "price_1QgdpvBZoAuGJOIj2NVvP2EZ",
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
    priceId: "price_1QgdqPBZoAuGJOIjB63PoQ3d",
    features: [
      { text: "forever_access", available: true },
      { text: "photos_with_music", available: true },
      { text: "with_music", available: true }
    ],
    isPopular: true
  }
];