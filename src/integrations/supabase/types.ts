export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      location_analytics: {
        Row: {
          city: string | null
          country_code: string
          created_at: string
          detected_by: Database["public"]["Enums"]["detection_method"]
          id: string
          is_brazil: boolean
          region: string | null
          timestamp: string
        }
        Insert: {
          city?: string | null
          country_code: string
          created_at?: string
          detected_by: Database["public"]["Enums"]["detection_method"]
          id?: string
          is_brazil: boolean
          region?: string | null
          timestamp?: string
        }
        Update: {
          city?: string | null
          country_code?: string
          created_at?: string
          detected_by?: Database["public"]["Enums"]["detection_method"]
          id?: string
          is_brazil?: boolean
          region?: string | null
          timestamp?: string
        }
        Relationships: []
      }
      user_configs: {
        Row: {
          couple_name: string
          created_at: string
          custom_slug: string
          email: string
          id: string
          message: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          photos: string[] | null
          plan_price: number
          plan_type: Database["public"]["Enums"]["plan_type"]
          qr_code_url: string | null
          relationship_start: string
          time: string
          unique_url: string
          updated_at: string
          youtube_url: string | null
        }
        Insert: {
          couple_name: string
          created_at?: string
          custom_slug: string
          email: string
          id?: string
          message?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          photos?: string[] | null
          plan_price: number
          plan_type: Database["public"]["Enums"]["plan_type"]
          qr_code_url?: string | null
          relationship_start: string
          time: string
          unique_url: string
          updated_at?: string
          youtube_url?: string | null
        }
        Update: {
          couple_name?: string
          created_at?: string
          custom_slug?: string
          email?: string
          id?: string
          message?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          photos?: string[] | null
          plan_price?: number
          plan_type?: Database["public"]["Enums"]["plan_type"]
          qr_code_url?: string | null
          relationship_start?: string
          time?: string
          unique_url?: string
          updated_at?: string
          youtube_url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      detection_method:
        | "ipapi"
        | "cloudflare"
        | "browser"
        | "fallback"
        | "vercel"
      payment_status: "pending" | "paid"
      plan_type: "1 year, 3 photos and no music" | "Forever, 7 photos and music"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
