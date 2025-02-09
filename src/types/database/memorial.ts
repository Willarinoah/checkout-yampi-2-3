
import type { Json } from "@/integrations/supabase/types";

export type UserConfig = {
  id: string;
  user_id?: string;
  couple_name: string;
  photos: string[] | null;
  message: string | null;
  youtube_url: string | null;
  payment_status: string;
  qr_code_url: string | null;
  custom_slug: string;
  unique_url: string;
  plan_type: "1 year, 3 photos and no music" | "Forever, 7 photos and music" | "1 year, 3 photos and no music (international)" | "Forever, 7 photos and music (international)";
  plan_price: number;
  created_at: string;
  updated_at: string;
  relationship_start: string;
  time: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  address_info: Json | null;
  preferences: Json | null;
  yampi_order_id?: string;
  yampi_payment_id?: string;
  yampi_status?: string;
  yampi_payment_method?: string;
  yampi_installments?: number;
};

export type MemorialFormData = {
  couple_name: string;
  message: string | null;
  plan_type: "basic" | "premium";
  plan_price: number;
  custom_slug: string;
  unique_url: string;
  payment_status: string;
  qr_code_url?: string | null;
  photos?: string[] | null;
  youtube_url?: string | null;
  relationship_start: string;
  time: string;
  email?: string | null;
  full_name?: string | null;
  phone?: string | null;
  address_info?: Json | null;
  preferences?: Json | null;
};

export const getPlanTypeFromSelection = (
  planType: "basic" | "premium", 
  isBrazil: boolean = false
): "1 year, 3 photos and no music" | "Forever, 7 photos and music" | "1 year, 3 photos and no music (international)" | "Forever, 7 photos and music (international)" => {
  if (isBrazil) {
    return planType === "basic" 
      ? "1 year, 3 photos and no music" 
      : "Forever, 7 photos and music";
  } else {
    return planType === "basic" 
      ? "1 year, 3 photos and no music (international)" 
      : "Forever, 7 photos and music (international)";
  }
};
