export type PlanFeature = {
  text: string;
  available: boolean;
};

export type Plan = {
  plan: string;
  price: string;
  priceId: string;
  features: PlanFeature[];
  isPopular: boolean;
};

export type PricingCardProps = Plan;