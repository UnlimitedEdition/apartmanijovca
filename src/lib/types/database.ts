// src/lib/types/database.ts

/**
 * Json type for JSONB columns from Supabase
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

/**
 * Supported languages in the application
 */
export type Locale = 'sr' | 'en' | 'de' | 'it'

/**
 * Multi-language content structure stored in JSONB columns
 */
export interface MultiLanguageText {
  sr: string
  en: string
  de: string
  it: string
}

/**
 * Database apartment record with JSONB fields
 */
export interface ApartmentRecord {
  id: string
  slug: string | null  // SEO-friendly URL slug
  name: Json  // JSONB: MultiLanguageText
  description: Json  // JSONB: MultiLanguageText
  bed_type: Json  // JSONB: MultiLanguageText
  capacity: number
  amenities: Json  // JSONB array: MultiLanguageText[]
  base_price_eur: number
  images: Json  // JSONB array: {url: string, alt: MultiLanguageText}[]
  status: 'active' | 'inactive' | 'maintenance'
  display_order: number
  created_at: string
  updated_at: string
  
  // Enhanced fields from migration 20260222000004
  size_sqm?: number | null
  floor?: number | null
  view_type?: Json | null  // JSONB: MultiLanguageText
  bathroom_count?: number | null
  balcony?: boolean | null
  kitchen_type?: Json | null  // JSONB: MultiLanguageText
  features?: Json | null  // JSONB: MultiLanguageText[]
  house_rules?: Json | null  // JSONB: MultiLanguageText[]
  check_in_time?: string | null
  check_out_time?: string | null
  min_stay_nights?: number | null
  max_stay_nights?: number | null
  cancellation_policy?: Json | null  // JSONB: MultiLanguageText
  gallery?: Json | null  // JSONB array
  video_url?: string | null
  virtual_tour_url?: string | null
  meta_title?: Json | null  // JSONB: MultiLanguageText
  meta_description?: Json | null  // JSONB: MultiLanguageText
  meta_keywords?: Json | null  // JSONB: MultiLanguageText
  seasonal_pricing?: Json | null  // JSONB
  weekend_price_eur?: number | null
  weekly_discount_percent?: number | null
  monthly_discount_percent?: number | null
  
  // Checkbox/Counter fields from migration 20260222000007
  bed_counts?: Json | null  // JSONB: Record<string, number> - e.g., {"double_bed": 1, "single_bed": 2}
  selected_amenities?: string[] | null  // Array of amenity IDs
  selected_rules?: string[] | null  // Array of rule IDs
  selected_view?: string | null  // Single view ID
  
  // Location fields
  address?: string | null
  city?: string | null
  country?: string | null
  postal_code?: string | null
  latitude?: number | null
  longitude?: number | null
}

/**
 * Localized apartment for API responses and frontend use
 */
export interface LocalizedApartment {
  id: string
  slug: string | null  // SEO-friendly URL slug
  name: string  // Localized
  description: string  // Localized
  bed_type: string  // Localized
  capacity: number
  amenities: string[]
  base_price_eur: number
  images: string[]
  status: 'active' | 'inactive' | 'maintenance'
  created_at: string
  updated_at: string
  
  // Enhanced fields
  size_sqm?: number | null
  floor?: number | null
  bathroom_count?: number | null
  balcony?: boolean | null
  check_in_time?: string | null
  check_out_time?: string | null
  min_stay_nights?: number | null
  max_stay_nights?: number | null
  video_url?: string | null
  virtual_tour_url?: string | null
  weekend_price_eur?: number | null
  weekly_discount_percent?: number | null
  monthly_discount_percent?: number | null
  display_order?: number | null
  
  // Localized JSONB fields
  kitchen_type?: string | null  // Localized
  house_rules?: string | null  // Localized
  cancellation_policy?: string | null  // Localized
  view_type?: string | null  // Localized
  
  // JSONB arrays (localized)
  features?: string[] | undefined  // Localized array
  gallery?: Array<{url: string; caption: Json; order: number}> | undefined  // JSONB with captions
  seasonal_pricing?: Array<{season: string; start_date: string; end_date: string; price_eur: number}> | undefined  // JSONB array
  
  // Checkbox/Counter fields
  bed_counts?: Record<string, number> | null  // e.g., {"double_bed": 1, "single_bed": 2}
  selected_amenities?: string[] | null  // Array of amenity IDs
  selected_rules?: string[] | null  // Array of rule IDs
  selected_view?: string | null  // Single view ID
  
  // SEO fields (keep as JSONB for multi-language)
  meta_title?: Json | null
  meta_description?: Json | null
  meta_keywords?: Json | null
  
  // Location fields
  address?: string | null
  city?: string | null
  country?: string | null
  postal_code?: string | null
  latitude?: number | null
  longitude?: number | null
}

/**
 * Database content record
 */
export interface ContentRecord {
  id: string
  key: string
  language: Locale
  value: Record<string, unknown>  // Flexible JSONB
  created_at: string
  updated_at: string
}

/**
 * Database guest record
 */
export interface GuestRecord {
  id: string
  full_name: string  // KRITIČNO: NE "name"
  email: string
  phone: string | null
  language: Locale
  created_at: string
  updated_at: string
}

/**
 * Database booking record
 */
export interface BookingRecord {
  id: string
  booking_number: string
  apartment_id: string
  guest_id: string
  check_in: string  // ISO date string
  check_out: string  // ISO date string
  nights: number
  num_guests: number
  total_price: number
  status: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'no_show'
  language: string  // Preferred language from URL (sr, en, de, it)
  options: Json | null
  created_at: string
  updated_at: string
}

/**
 * Database availability record
 */
export interface AvailabilityRecord {
  id: string
  apartment_id: string
  date: string  // ISO date string
  is_available: boolean
  price_override: number | null
  reason: string | null
  booking_id: string | null
  created_at: string
  updated_at: string
}

/**
 * Database review record
 */
export interface ReviewRecord {
  id: string
  booking_id: string
  guest_id: string
  apartment_id: string
  rating: number  // 1-5
  title: string | null
  comment: string | null
  photos: Json | null  // JSONB array: string[]
  status: 'pending' | 'approved' | 'rejected'
  approved_at: string | null
  language: Locale
  created_at: string
  updated_at: string
}

/**
 * Database booking message record
 */
export interface BookingMessageRecord {
  id: string
  booking_id: string
  sender_type: 'guest' | 'admin' | 'system'
  sender_id: string | null
  content: string
  attachments: Json | null
  read_at: string | null
  created_at: string
}

/**
 * Database message record
 */
export interface MessageRecord {
  id: string
  full_name: string  // KRITIČNO: NE "name"
  email: string
  phone: string | null
  subject: string
  message: string
  status: 'new' | 'read' | 'replied' | 'archived'
  created_at: string
  updated_at: string
}

/**
 * Database gallery record
 */
export interface GalleryRecord {
  id: string
  url: string
  caption: Json | null  // JSONB: MultiLanguageText
  tags: Json | null  // JSONB array: string[]
  display_order: number
  created_at: string
  updated_at: string
}

/**
 * Database analytics event record
 */
export interface AnalyticsEventRecord {
  id: string
  event_type: string
  event_data: Json | null
  session_id: string | null
  user_id: string | null
  page_url: string | null
  referrer: string | null
  device_type: string | null
  browser: string | null
  language: string | null
  country: string | null
  city: string | null
  created_at: string
}

/**
 * Partial multi-language text for updates
 */
export type PartialMultiLanguageText = Partial<MultiLanguageText>
