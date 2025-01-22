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
          detected_by: string
          id: string
          is_brazil: boolean
          region: string | null
        }
        Insert: {
          city?: string | null
          country_code: string
          created_at?: string
          detected_by: string
          id?: string
          is_brazil?: boolean
          region?: string | null
        }
        Update: {
          city?: string | null
          country_code?: string
          created_at?: string
          detected_by?: string
          id?: string
          is_brazil?: boolean
          region?: string | null
        }
        Relationships: []
      }
      mercadopago_memorials: {
        Row: {
          address_info: Json | null
          couple_name: string
          created_at: string
          custom_slug: string
          email: string | null
          full_name: string | null
          id: string
          message: string | null
          mp_external_reference: string | null
          mp_merchant_order_id: string | null
          mp_preference_id: string | null
          payment_status: string | null
          phone: string | null
          photos: string[] | null
          plan_price: number | null
          plan_type: string | null
          preferences: Json | null
          qr_code_url: string | null
          relationship_start: string
          time: string
          unique_url: string
          updated_at: string
          user_id: string | null
          youtube_url: string | null
        }
        Insert: {
          address_info?: Json | null
          couple_name: string
          created_at?: string
          custom_slug: string
          email?: string | null
          full_name?: string | null
          id?: string
          message?: string | null
          mp_external_reference?: string | null
          mp_merchant_order_id?: string | null
          mp_preference_id?: string | null
          payment_status?: string | null
          phone?: string | null
          photos?: string[] | null
          plan_price?: number | null
          plan_type?: string | null
          preferences?: Json | null
          qr_code_url?: string | null
          relationship_start?: string
          time?: string
          unique_url: string
          updated_at?: string
          user_id?: string | null
          youtube_url?: string | null
        }
        Update: {
          address_info?: Json | null
          couple_name?: string
          created_at?: string
          custom_slug?: string
          email?: string | null
          full_name?: string | null
          id?: string
          message?: string | null
          mp_external_reference?: string | null
          mp_merchant_order_id?: string | null
          mp_preference_id?: string | null
          payment_status?: string | null
          phone?: string | null
          photos?: string[] | null
          plan_price?: number | null
          plan_type?: string | null
          preferences?: Json | null
          qr_code_url?: string | null
          relationship_start?: string
          time?: string
          unique_url?: string
          updated_at?: string
          user_id?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      stripe_memorials: {
        Row: {
          address_info: Json | null
          couple_name: string
          created_at: string
          custom_slug: string
          email: string | null
          full_name: string | null
          id: string
          message: string | null
          payment_status: string | null
          phone: string | null
          photos: string[] | null
          plan_price: number | null
          plan_type: string | null
          preferences: Json | null
          qr_code_url: string | null
          relationship_start: string
          stripe_customer_id: string | null
          stripe_session_id: string | null
          stripe_subscription_id: string | null
          time: string
          unique_url: string
          updated_at: string
          user_id: string | null
          youtube_url: string | null
        }
        Insert: {
          address_info?: Json | null
          couple_name: string
          created_at?: string
          custom_slug: string
          email?: string | null
          full_name?: string | null
          id?: string
          message?: string | null
          payment_status?: string | null
          phone?: string | null
          photos?: string[] | null
          plan_price?: number | null
          plan_type?: string | null
          preferences?: Json | null
          qr_code_url?: string | null
          relationship_start?: string
          stripe_customer_id?: string | null
          stripe_session_id?: string | null
          stripe_subscription_id?: string | null
          time?: string
          unique_url: string
          updated_at?: string
          user_id?: string | null
          youtube_url?: string | null
        }
        Update: {
          address_info?: Json | null
          couple_name?: string
          created_at?: string
          custom_slug?: string
          email?: string | null
          full_name?: string | null
          id?: string
          message?: string | null
          payment_status?: string | null
          phone?: string | null
          photos?: string[] | null
          plan_price?: number | null
          plan_type?: string | null
          preferences?: Json | null
          qr_code_url?: string | null
          relationship_start?: string
          stripe_customer_id?: string | null
          stripe_session_id?: string | null
          stripe_subscription_id?: string | null
          time?: string
          unique_url?: string
          updated_at?: string
          user_id?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      trunc_timestamp: {
        Args: {
          "": string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
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
