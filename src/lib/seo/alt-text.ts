import { Locale } from '@/lib/types/database'

/**
 * Generates descriptive alt text for images based on context and locale
 * @param imageName - The name or identifier of the image
 * @param context - The context where the image is used (e.g., 'apartment', 'gallery', 'hero')
 * @param locale - The current locale
 * @param additionalInfo - Optional additional information (e.g., apartment name, location)
 * @returns Descriptive alt text string
 */
export function generateAltText(
  imageName: string,
  context: 'apartment' | 'gallery' | 'hero' | 'amenity' | 'location' | 'decorative',
  locale: Locale,
  additionalInfo?: string
): string {
  // Decorative images should have empty alt text
  if (context === 'decorative') {
    return ''
  }

  // Base templates per locale
  const templates: Record<Locale, Record<string, string>> = {
    sr: {
      apartment: additionalInfo 
        ? `${additionalInfo} - Apartman u Jovči, Bovansko jezero`
        : 'Apartman u Jovči, Bovansko jezero',
      gallery: additionalInfo
        ? `${additionalInfo} - Galerija Apartmani Jovča`
        : 'Galerija Apartmani Jovča, Bovansko jezero',
      hero: 'Apartmani Jovča - Luksuzni smeštaj na Bovanskom jezeru',
      amenity: additionalInfo
        ? `${additionalInfo} - Sadržaji apartmana`
        : 'Sadržaji apartmana',
      location: additionalInfo
        ? `${additionalInfo} - Lokacija Jovča, Bovansko jezero`
        : 'Lokacija Jovča, Bovansko jezero, Srbija'
    },
    en: {
      apartment: additionalInfo
        ? `${additionalInfo} - Apartment in Jovča, Bovan Lake`
        : 'Apartment in Jovča, Bovan Lake',
      gallery: additionalInfo
        ? `${additionalInfo} - Gallery Apartmani Jovča`
        : 'Gallery Apartmani Jovča, Bovan Lake',
      hero: 'Apartmani Jovča - Luxury accommodation at Bovan Lake',
      amenity: additionalInfo
        ? `${additionalInfo} - Apartment amenities`
        : 'Apartment amenities',
      location: additionalInfo
        ? `${additionalInfo} - Location Jovča, Bovan Lake`
        : 'Location Jovča, Bovan Lake, Serbia'
    },
    de: {
      apartment: additionalInfo
        ? `${additionalInfo} - Ferienwohnung in Jovča, Bovan-See`
        : 'Ferienwohnung in Jovča, Bovan-See',
      gallery: additionalInfo
        ? `${additionalInfo} - Galerie Apartmani Jovča`
        : 'Galerie Apartmani Jovča, Bovan-See',
      hero: 'Apartmani Jovča - Luxusunterkunft am Bovan-See',
      amenity: additionalInfo
        ? `${additionalInfo} - Ausstattung der Wohnung`
        : 'Ausstattung der Wohnung',
      location: additionalInfo
        ? `${additionalInfo} - Lage Jovča, Bovan-See`
        : 'Lage Jovča, Bovan-See, Serbien'
    },
    it: {
      apartment: additionalInfo
        ? `${additionalInfo} - Appartamento a Jovča, Lago Bovan`
        : 'Appartamento a Jovča, Lago Bovan',
      gallery: additionalInfo
        ? `${additionalInfo} - Galleria Apartmani Jovča`
        : 'Galleria Apartmani Jovča, Lago Bovan',
      hero: 'Apartmani Jovča - Alloggio di lusso al Lago Bovan',
      amenity: additionalInfo
        ? `${additionalInfo} - Servizi dell'appartamento`
        : 'Servizi dell\'appartamento',
      location: additionalInfo
        ? `${additionalInfo} - Posizione Jovča, Lago Bovan`
        : 'Posizione Jovča, Lago Bovan, Serbia'
    }
  }

  return templates[locale][context] || templates[locale].apartment
}

/**
 * Generates alt text specifically for apartment images
 * @param apartmentName - The name of the apartment
 * @param imageIndex - The index of the image in the gallery (optional)
 * @param locale - The current locale
 * @returns Descriptive alt text for apartment image
 */
export function generateApartmentImageAlt(
  apartmentName: string,
  locale: Locale,
  imageIndex?: number
): string {
  const indexSuffix = imageIndex !== undefined ? ` - ${locale === 'sr' ? 'Slika' : locale === 'en' ? 'Image' : locale === 'de' ? 'Bild' : 'Immagine'} ${imageIndex + 1}` : ''
  return generateAltText('', 'apartment', locale, `${apartmentName}${indexSuffix}`)
}

/**
 * Generates alt text for gallery images
 * @param description - Optional description of the gallery image
 * @param locale - The current locale
 * @returns Descriptive alt text for gallery image
 */
export function generateGalleryImageAlt(
  locale: Locale,
  description?: string
): string {
  return generateAltText('', 'gallery', locale, description)
}

/**
 * Generates alt text for location/map images
 * @param locationName - The name of the location
 * @param locale - The current locale
 * @returns Descriptive alt text for location image
 */
export function generateLocationImageAlt(
  locationName: string,
  locale: Locale
): string {
  return generateAltText('', 'location', locale, locationName)
}
