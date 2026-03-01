// src/lib/transformers/database.ts

import { 
  Json,
  ApartmentRecord, 
  LocalizedApartment,
  BookingRecord,
  ReviewRecord,
  GuestRecord,
  Locale 
} from '@/lib/types/database'


/**
 * Helper function to extract localized value from JSONB
 * Falls back to Serbian if requested locale is not available
 */
function extractLocalizedValue(jsonValue: Json, locale: Locale): string {
  if (!jsonValue || typeof jsonValue !== 'object') return ''
  const obj = jsonValue as Record<string, unknown>
  return (obj[locale] as string) || (obj['sr'] as string) || ''
}

/**
 * Transform JSONB array amenities to string array
 */
function transformAmenities(amenities: Json, locale: Locale): string[] {
  if (!Array.isArray(amenities)) return []
  return amenities.map(amenity => extractLocalizedValue(amenity as Json, locale))
}

/**
 * Transform JSONB array images to string array (URLs)
 * Supports both string[] and object[] formats
 */
interface ImageRecord {
  url: string
  alt?: Json
}

function transformImages(images: Json): string[] {
  if (!Array.isArray(images)) return []
  return images.map((image: unknown) => {
    // If it's already a string, return it
    if (typeof image === 'string') {
      return image
    }
    // If it's an object with url property, extract url
    if (typeof image === 'object' && image !== null && 'url' in image) {
      const img = image as ImageRecord
      return img.url
    }
    return ''
  }).filter(Boolean) // Remove empty strings
}

/**
 * Transform apartment record from database format (JSONB) to localized format
 * 
 * @param record - Database apartment record with JSONB fields
 * @param locale - Target locale for localization
 * @returns Localized apartment with string fields
 */
export function transformApartmentRecord(
  record: ApartmentRecord,
  locale: Locale
): LocalizedApartment {
  return {
    id: record.id,
    slug: record.slug,
    name: extractLocalizedValue(record.name, locale),
    description: extractLocalizedValue(record.description, locale),
    bed_type: extractLocalizedValue(record.bed_type, locale),
    capacity: record.capacity,
    amenities: transformAmenities(record.amenities, locale),
    base_price_eur: record.base_price_eur,
    images: transformImages(record.images),
    status: record.status,
    created_at: record.created_at,
    updated_at: record.updated_at,
    
    // Enhanced fields
    size_sqm: record.size_sqm,
    floor: record.floor,
    bathroom_count: record.bathroom_count,
    balcony: record.balcony,
    check_in_time: record.check_in_time,
    check_out_time: record.check_out_time,
    min_stay_nights: record.min_stay_nights,
    max_stay_nights: record.max_stay_nights,
    video_url: record.video_url,
    virtual_tour_url: record.virtual_tour_url,
    weekend_price_eur: record.weekend_price_eur,
    weekly_discount_percent: record.weekly_discount_percent,
    monthly_discount_percent: record.monthly_discount_percent,
    display_order: record.display_order,
    
    // Localized JSONB fields
    kitchen_type: record.kitchen_type ? extractLocalizedValue(record.kitchen_type, locale) : null,
    house_rules: record.house_rules ? extractLocalizedValue(record.house_rules, locale) : null,
    cancellation_policy: record.cancellation_policy ? extractLocalizedValue(record.cancellation_policy, locale) : null,
    view_type: record.view_type ? extractLocalizedValue(record.view_type, locale) : null,
    
    // JSONB arrays
    features: record.features && Array.isArray(record.features) && record.features.length > 0
      ? (record.features as Array<Json>).map(f => extractLocalizedValue(f, locale))
      : undefined,
    gallery: record.gallery && Array.isArray(record.gallery) && record.gallery.length > 0
      ? (record.gallery as Array<{url: string; caption: Json; order: number}>)
      : undefined,
    seasonal_pricing: record.seasonal_pricing && Array.isArray(record.seasonal_pricing) && record.seasonal_pricing.length > 0
      ? (record.seasonal_pricing as Array<{season: string; start_date: string; end_date: string; price_eur: number}>)
      : undefined,
    
    // Checkbox/counter fields
    bed_counts: record.bed_counts ? (record.bed_counts as Record<string, number>) : undefined,
    selected_amenities: record.selected_amenities,
    selected_rules: record.selected_rules,
    selected_view: record.selected_view,
    
    // Location fields
    address: record.address,
    city: record.city,
    country: record.country,
    postal_code: record.postal_code,
    latitude: record.latitude,
    longitude: record.longitude
  }
}

/**
 * Booking response interface for API responses
 */
export interface BookingResponse {
  id: string
  bookingNumber: string
  apartmentId: string
  apartmentName: string  // Localized
  guestId: string
  guestName: string
  guestEmail: string
  guestPhone: string | null
  checkIn: string
  checkOut: string
  nights: number
  totalPrice: number
  status: string
  options?: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

/**
 * Transform booking record with related data to API response format
 * 
 * @param record - Database booking record with apartment and guest data
 * @param locale - Target locale for localization
 * @returns Booking response with localized apartment name
 */
export function transformBookingRecord(
  record: BookingRecord & {
    apartment: ApartmentRecord
    guest: GuestRecord
  },
  locale: Locale
): BookingResponse {
  return {
    id: record.id,
    bookingNumber: record.booking_number,
    apartmentId: record.apartment_id,
    apartmentName: extractLocalizedValue(record.apartment.name, locale),
    guestId: record.guest_id,
    guestName: record.guest.full_name,
    guestEmail: record.guest.email,
    guestPhone: record.guest.phone,
    checkIn: record.check_in,
    checkOut: record.check_out,
    nights: record.nights,
    totalPrice: record.total_price,
    status: record.status,
    options: record.options ? (record.options as Record<string, unknown>) : undefined,
    createdAt: record.created_at,
    updatedAt: record.updated_at
  }
}

/**
 * Review response interface for API responses
 */
export interface ReviewResponse {
  id: string
  bookingId: string
  apartmentId: string
  apartmentName: string  // Localized
  guestId: string
  guestName: string
  rating: number
  title: string | null
  comment: string | null
  photos: string[] | null
  status: string
  approvedAt: string | null
  language: Locale
  createdAt: string
  updatedAt: string
}

/**
 * Transform review record with related data to API response format
 * 
 * @param record - Database review record with apartment and guest data
 * @param locale - Target locale for localization
 * @returns Review response with localized apartment name
 */
export function transformReviewRecord(
  record: ReviewRecord & {
    apartment: ApartmentRecord
    guest: GuestRecord
  },
  locale: Locale
): ReviewResponse {
  return {
    id: record.id,
    bookingId: record.booking_id,
    apartmentId: record.apartment_id,
    apartmentName: extractLocalizedValue(record.apartment.name, locale),
    guestId: record.guest_id,
    guestName: record.guest.full_name,
    rating: record.rating,
    title: record.title,
    comment: record.comment,
    photos: record.photos as string[] | null,
    status: record.status,
    approvedAt: record.approved_at,
    language: record.language,
    createdAt: record.created_at,
    updatedAt: record.updated_at
  }
}

/**
 * Reverse transform apartment data from frontend format to database format
 * Converts localized strings to JSONB objects for database storage
 * 
 * @param data - Frontend apartment data with multi-language fields
 * @returns Database-ready JSONB objects
 */
export function reverseTransformApartmentData(
  data: {
    name: Record<Locale, string>
    description: Record<Locale, string>
    bed_type: Record<Locale, string>
    amenities: Record<Locale, string>[]
    images: { url: string; alt: Record<Locale, string> }[]
  }
): {
  name: Json
  description: Json
  bed_type: Json
  amenities: Json
  images: Json
} {
  return {
    name: data.name as Json,
    description: data.description as Json,
    bed_type: data.bed_type as Json,
    amenities: data.amenities as Json,
    images: data.images as Json
  }
}
