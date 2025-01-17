export type PlanType = "1 year, 3 photos and no music" | "Forever, 7 photos and music";

export interface UserConfig {
  id: string;
  user_id?: string;
  couple_name: string;
  photos?: string[];
  message?: string;
  youtube_url?: string;
  payment_status?: string;
  qr_code_url?: string;
  custom_slug: string;
  unique_url: string;
  plan_type: PlanType;
  plan_price?: number;
  created_at?: string;
  updated_at?: string;
  relationship_start?: string;
  time?: string;
  full_name?: string;
  phone?: string;
  email?: string;
  address_info?: {
    country_code?: string;
    city?: string;
    region?: string;
  };
  preferences?: {
    theme?: string;
    language?: string;
  };
}

export interface MemorialFormData {
  couple_name: string;
  message?: string;
  plan_type: string;
  plan_price: number;
  custom_slug: string;
  unique_url: string;
  payment_status: string;
  qr_code_url: string;
  photos: string[];
  youtube_url?: string;
  relationship_start: string;
  time: string;
  email: string;
  full_name: string;
  phone: string;
  address_info?: {
    country_code?: string;
    city?: string;
    region?: string;
  };
  preferences?: {
    theme?: string;
    language?: string;
  };
}

export const getPlanTypeFromSelection = (planType: string): PlanType => {
  return planType === "basic" 
    ? "1 year, 3 photos and no music" 
    : "Forever, 7 photos and music";
};