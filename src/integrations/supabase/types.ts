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
      analytics_data: {
        Row: {
          device_info: Json | null
          id: string
          memorial_id: string | null
          visit_timestamp: string
          visitor_location: Json | null
        }
        Insert: {
          device_info?: Json | null
          id?: string
          memorial_id?: string | null
          visit_timestamp?: string
          visitor_location?: Json | null
        }
        Update: {
          device_info?: Json | null
          id?: string
          memorial_id?: string | null
          visit_timestamp?: string
          visitor_location?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_data_memorial_id_fkey"
            columns: ["memorial_id"]
            isOneToOne: false
            referencedRelation: "memorials"
            referencedColumns: ["id"]
          },
        ]
      }
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
      memorials: {
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
          time?: string
          unique_url?: string
          updated_at?: string
          user_id?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          amount: number
          created_at: string
          id: string
          memorial_id: string | null
          provider: string
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          memorial_id?: string | null
          provider: string
          status: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          memorial_id?: string | null
          provider?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_memorial_id_fkey"
            columns: ["memorial_id"]
            isOneToOne: false
            referencedRelation: "memorials"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
