export type UserConfig = {
  id: string;
  user_id: string;
  couple_name: string;
  message: string | null;
  plan_type: "1 year, 3 photos and no music" | "Forever, 7 photos and music";
  plan_price: number;
  custom_slug: string;
  unique_url: string;
  payment_status: "pending" | "paid";
  qr_code_url: string | null;
  photos: string[] | null;
  youtube_url: string | null;
  relationship_start: string;
  time: string;
  created_at: string;
  updated_at: string;
};

export type MemorialFormData = {
  couple_name: string;
  message: string | null;
  plan_type: "basic" | "premium";
  plan_price: number;
  custom_slug: string;
  unique_url: string;
  payment_status: "pending" | "paid";
  qr_code_url?: string | null;
  photos?: string[] | null;
  youtube_url?: string | null;
  relationship_start: string;
  time: string;
  user_id: string;
};

export const getPlanTypeFromSelection = (planType: "basic" | "premium"): "1 year, 3 photos and no music" | "Forever, 7 photos and music" => {
  return planType === "basic" 
    ? "1 year, 3 photos and no music" 
    : "Forever, 7 photos and music";
};