export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      memorial_pages: {
        Row: {
          id: string
          created_at: string
          couple_name: string
          slug: string
          start_date: string
          start_time: string
          message: string | null
          youtube_url: string | null
          plan: 'basic' | 'premium'
          status: 'draft' | 'published' | 'expired'
          expires_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          couple_name: string
          slug: string
          start_date: string
          start_time: string
          message?: string | null
          youtube_url?: string | null
          plan: 'basic' | 'premium'
          status?: 'draft' | 'published' | 'expired'
          expires_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          couple_name?: string
          slug?: string
          start_date?: string
          start_time?: string
          message?: string | null
          youtube_url?: string | null
          plan?: 'basic' | 'premium'
          status?: 'draft' | 'published' | 'expired'
          expires_at?: string | null
        }
      }
      memorial_photos: {
        Row: {
          id: string
          created_at: string
          memorial_id: string
          photo_url: string
          order: number
        }
        Insert: {
          id?: string
          created_at?: string
          memorial_id: string
          photo_url: string
          order: number
        }
        Update: {
          id?: string
          created_at?: string
          memorial_id?: string
          photo_url?: string
          order?: number
        }
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
  }
}
