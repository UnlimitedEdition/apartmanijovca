// src/lib/localization/transformer.ts

import type { Locale, ApartmentRecord, LocalizedApartment, Json } from '../types/database'

/**
 * Helper to extract localized value from Json type
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
  return amenities
    .map(amenity => {
      if (!amenity || typeof amenity !== 'object') return null
      const obj = amenity as { code?: string; name?: Json }
      // Handle both old format (just name) and new format (code + name)
      if (obj.name) {
        return extractLocalizedValue(obj.name, locale)
      }
      return extractLocalizedValue(amenity as Json, locale)
    })
    .filter((name): name is string => !!name)
}

/**
 * Transform JSONB array images to string array (URLs)
 */
function transformImages(images: Json): string[] {
  if (!Array.isArray(images)) return []
  return images
    .map((image: unknown) => {
      if (!image) return null
      if (typeof image === 'string') return image
      const img = image as { url?: string; alt?: Json }
      return img.url || null
    })
    .filter((url): url is string => !!url)
}

/**
 * Transform apartment record to localized format
 * 
 * @param apartment - Database apartment record with JSONB fields
 * @param locale - Target locale
 * @returns Localized apartment with string fields
 */
export function localizeApartment(
  apartment: ApartmentRecord,
  locale: Locale
): LocalizedApartment {
  return {
    id: apartment.id,
    slug: apartment.slug || null,
    name: extractLocalizedValue(apartment.name, locale),
    description: extractLocalizedValue(apartment.description, locale),
    bed_type: extractLocalizedValue(apartment.bed_type, locale),
    capacity: apartment.capacity || 2,
    amenities: transformAmenities(apartment.amenities, locale),
    base_price_eur: apartment.base_price_eur || 0,
    images: transformImages(apartment.images),
    status: apartment.status || 'active',
    created_at: apartment.created_at,
    updated_at: apartment.updated_at,
    
    // Enhanced fields
    size_sqm: apartment.size_sqm || null,
    floor: apartment.floor || null,
    bathroom_count: apartment.bathroom_count || null,
    balcony: apartment.balcony || null,
    check_in_time: apartment.check_in_time || null,
    check_out_time: apartment.check_out_time || null,
    min_stay_nights: apartment.min_stay_nights || null,
    max_stay_nights: apartment.max_stay_nights || null,
    video_url: apartment.video_url || null,
    virtual_tour_url: apartment.virtual_tour_url || null,
    weekend_price_eur: apartment.weekend_price_eur || null,
    weekly_discount_percent: apartment.weekly_discount_percent || null,
    monthly_discount_percent: apartment.monthly_discount_percent || null,
    
    // Checkbox/counter fields
    bed_counts: apartment.bed_counts ? (apartment.bed_counts as Record<string, number>) : null,
    selected_amenities: apartment.selected_amenities || null,
    selected_rules: apartment.selected_rules || null,
    selected_view: apartment.selected_view || null,
    
    // SEO fields (keep as JSONB for multi-language support)
    meta_title: apartment.meta_title || null,
    meta_description: apartment.meta_description || null,
    meta_keywords: apartment.meta_keywords || null,
    
    // Location fields
    address: apartment.address || null,
    city: apartment.city || null,
    country: apartment.country || null,
    postal_code: apartment.postal_code || null,
    latitude: apartment.latitude || null,
    longitude: apartment.longitude || null
  }
}

/**
 * Transform array of apartments to localized format
 * 
 * @param apartments - Array of database apartment records
 * @param locale - Target locale
 * @returns Array of localized apartments
 */
export function localizeApartments(
  apartments: ApartmentRecord[],
  locale: Locale
): LocalizedApartment[] {
  return apartments.map(apt => localizeApartment(apt, locale))
}
