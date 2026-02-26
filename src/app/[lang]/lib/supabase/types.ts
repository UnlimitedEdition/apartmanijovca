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
      pages: {
        Row: {
          id: string
          slug: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          created_at?: string
          updated_at?: string
        }
      }
      page_translations: {
        Row: {
          id: string
          page_id: string
          language: string
          title: string
          content: Json
          seo_title?: string
          seo_description?: string
        }
        Insert: {
          id?: string
          page_id: string
          language: string
          title: string
          content: Json
          seo_title?: string
          seo_description?: string
        }
        Update: {
          id?: string
          page_id?: string
          language?: string
          title?: string
          content?: Json
          seo_title?: string
          seo_description?: string
        }
      }
      media: {
        Row: {
          id: string
          url: string
          alt_text: Json
          width?: number
          height?: number
          size?: number
          mime_type?: string
          created_at: string
        }
        Insert: {
          id?: string
          url: string
          alt_text: Json
          width?: number
          height?: number
          size?: number
          mime_type?: string
          created_at?: string
        }
        Update: {
          id?: string
          url?: string
          alt_text?: Json
          width?: number
          height?: number
          size?: number
          mime_type?: string
          created_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          apartment_id: string
          check_in: string
          check_out: string
          guest_name: string
          guest_email: string
          guest_phone?: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          apartment_id: string
          check_in: string
          check_out: string
          guest_name: string
          guest_email: string
          guest_phone?: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          apartment_id?: string
          check_in?: string
          check_out?: string
          guest_name?: string
          guest_email?: string
          guest_phone?: string
          status?: string
          created_at?: string
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
