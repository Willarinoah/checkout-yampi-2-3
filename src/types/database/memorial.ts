export type UserConfig = {
  id: string;
  couple_name: string;
  email: string;
  full_name: string;
  phone: string;
  message: string | null;
  plan_type: "1 year, 3 photos and no music" | "Forever, 7 photos and music";
  plan_price: number;
  custom_slug: string;
  unique_url: string;
  payment_status: "pending" | "paid";
  qr_code_url: string | null;
  photos: string[] | null;
  youtube_url: string | null;
  created_at: string;
  updated_at: string;
  relationship_start: string;
  time: string;
};

export type MemorialFormData = {
  couple_name: string;
  email: string;
  full_name: string;
  phone: string;
  message: string | null;
  plan_type: "1 year, 3 photos and no music" | "Forever, 7 photos and music";
  plan_price: number;
  custom_slug: string;
  unique_url: string;
  payment_status: "pending" | "paid";
  qr_code_url?: string | null;
  photos?: string[] | null;
  youtube_url?: string | null;
  relationship_start: string;
  time: string;
};