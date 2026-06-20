/**
 * Structured Data Base Module
 * 
 * Provides base functionality for generating and validating Schema.org structured data.
 * This module serves as the foundation for all structured data generators.
 * 
 * Requirements: 4.7, 4.8, 4.10
 */

/**
 * Validates a Schema.org schema object
 * Ensures the schema has required properties and valid structure
 * 
 * @param schema - The schema object to validate
 * @returns true if schema is valid, false otherwise
 * 
 * @example
 * validateSchema({
 *   '@context': 'https://schema.org',
 *   '@type': 'LocalBusiness',
 *   name: 'My Business'
 * }) // true
 */
export function validateSchema(schema: object): boolean {
  if (!schema || typeof schema !== 'object') {
    return false
  }

  // Check if schema is an array (for multiple schemas)
  if (Array.isArray(schema)) {
    return schema.every(item => validateSchema(item))
  }

  const schemaObj = schema as Record<string, unknown>

  // Required: @context property
  if (!schemaObj['@context']) {
    return false
  }

  // @context must be a string or array of strings
  const context = schemaObj['@context']
  if (typeof context !== 'string' && !Array.isArray(context)) {
    return false
  }

  // If @context is array, all items must be strings
  if (Array.isArray(context) && !context.every(item => typeof item === 'string')) {
    return false
  }

  // Required: @type property
  if (!schemaObj['@type']) {
    return false
  }

  // @type must be a string or array of strings
  const type = schemaObj['@type']
  if (typeof type !== 'string' && !Array.isArray(type)) {
    return false
  }

  // If @type is array, all items must be strings
  if (Array.isArray(type) && !type.every(item => typeof item === 'string')) {
    return false
  }

  // Validate nested objects recursively
  for (const [key, value] of Object.entries(schemaObj)) {
    // Skip @context and @type as already validated
    if (key === '@context' || key === '@type' || key === '@id') {
      continue
    }

    // If value is an object with @type, validate it as a nested schema (without @context requirement)
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const nestedObj = value as Record<string, unknown>
      if (nestedObj['@type']) {
        // Nested objects don't need @context, only @type
        if (!nestedObj['@type']) {
          return false
        }
        // Validate @type format
        const nestedType = nestedObj['@type']
        if (typeof nestedType !== 'string' && !Array.isArray(nestedType)) {
          return false
        }
        if (Array.isArray(nestedType) && !nestedType.every(item => typeof item === 'string')) {
          return false
        }
      }
    }

    // If value is an array of objects with @type, validate each
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item && typeof item === 'object' && (item as Record<string, unknown>)['@type']) {
          const itemObj = item as Record<string, unknown>
          // Validate @type format for array items
          const itemType = itemObj['@type']
          if (typeof itemType !== 'string' && !Array.isArray(itemType)) {
            return false
          }
          if (Array.isArray(itemType) && !itemType.every(t => typeof t === 'string')) {
            return false
          }
        }
      }
    }
  }

  return true
}

/**
 * Embeds a Schema.org schema object in a JSON-LD script tag
 * Converts the schema to a properly formatted script tag for HTML embedding
 * 
 * @param schema - The schema object to embed
 * @returns HTML script tag string with JSON-LD content
 * 
 * @example
 * embedJsonLd({ '@context': 'https://schema.org', '@type': 'Organization', name: 'Acme' })
 * // Returns: <script type="application/ld+json">{"@context":"https://schema.org",...}</script>
 */
export function embedJsonLd(schema: object): string {
  if (!validateSchema(schema)) {
    throw new Error('Invalid schema: Schema validation failed')
  }

  // Serialize the schema to JSON
  const jsonContent = JSON.stringify(schema)

  // Return the script tag with proper type attribute
  return `<script type="application/ld+json">${jsonContent}</script>`
}

/**
 * Creates a React-compatible script element for JSON-LD
 * Returns an object that can be used with dangerouslySetInnerHTML
 * 
 * @param schema - The schema object to embed
 * @returns Object with __html property for React dangerouslySetInnerHTML
 * 
 * @example
 * <script 
 *   type="application/ld+json"
 *   dangerouslySetInnerHTML={createJsonLdScript(schema)}
 * />
 */
export function createJsonLdScript(schema: object): { __html: string } {
  if (!validateSchema(schema)) {
    throw new Error('Invalid schema: Schema validation failed')
  }

  return {
    __html: JSON.stringify(schema)
  }
}

/**
 * Validates multiple schemas at once
 * Useful for validating an array of different schema types
 * 
 * @param schemas - Array of schema objects to validate
 * @returns true if all schemas are valid, false otherwise
 * 
 * @example
 * validateSchemas([
 *   { '@context': 'https://schema.org', '@type': 'Organization', name: 'Acme' },
 *   { '@context': 'https://schema.org', '@type': 'LocalBusiness', name: 'Store' }
 * ]) // true
 */
export function validateSchemas(schemas: object[]): boolean {
  if (!Array.isArray(schemas)) {
    return false
  }

  return schemas.every(schema => validateSchema(schema))
}

/**
 * Merges multiple schemas into a single JSON-LD graph
 * Useful for embedding multiple related schemas in one script tag
 * 
 * @param schemas - Array of schema objects to merge
 * @returns Combined schema with @graph property
 * 
 * @example
 * mergeSchemas([
 *   { '@context': 'https://schema.org', '@type': 'Organization', name: 'Acme' },
 *   { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Acme Site' }
 * ])
 * // Returns: { '@context': 'https://schema.org', '@graph': [...] }
 */
export function mergeSchemas(schemas: object[]): object {
  if (!validateSchemas(schemas)) {
    throw new Error('Invalid schemas: One or more schemas failed validation')
  }

  if (schemas.length === 0) {
    throw new Error('Cannot merge empty schema array')
  }

  // Extract @context from first schema (should be consistent)
  const firstSchema = schemas[0] as Record<string, unknown>
  const context = firstSchema['@context']

  // Create graph structure
  return {
    '@context': context,
    '@graph': schemas.map(schema => {
      // Remove @context from individual schemas in graph
      const { '@context': _unusedContext, ...rest } = schema as Record<string, unknown>
      void _unusedContext // Suppress unused variable warning
      return rest
    })
  }
}

// ============================================================================
// Schema Generators
// ============================================================================

import type {
  Locale,
  LocalBusinessSchema,
  LodgingBusinessSchema,
  BreadcrumbSchema,
  FAQSchema,
  OrganizationSchema,
  FAQ,
  PostalAddress,
  GeoCoordinates,
  AggregateRating,
  Review as ReviewType,
  WebSiteSchema,
  TouristAttractionSchema,
  TouristDestinationSchema,
  ImageObjectSchema,
  LocationFeatureSpecification,
  QuantitativeValue,
  OfferSchema,
  PlaceSchema
} from '../types/seo'
import type { AttractionEntry } from '../../data/attractions'
import { getSEOConfig, getBaseUrl } from './config'
import { makeAbsoluteUrl } from './utils'

/**
 * Apartment interface for LodgingBusiness schema
 */
export interface Apartment {
  id: string
  slug: string
  name: string
  description: string
  images: string[]
  basePrice: number
  capacity: number
  numberOfRooms?: number
  amenities: string[]
  /** Apartment size in square metres (size_sqm) */
  size_sqm?: number | null
  /** Bed type description string */
  bed_type?: string | null
  /** Number of bathrooms (bathroom_count) — NOT mapped to numberOfRooms */
  bathroom_count?: number | null
}

/**
 * Review interface for Review schema
 */
export interface Review {
  id: string
  author: string
  rating: number
  comment: string
  createdAt: string
  approved: boolean
}

/**
 * Generates LocalBusiness schema for the home page
 * Includes name, address, phone, geo coordinates, opening hours, and social media links
 * 
 * Requirements: 4.1, 4.11, 10.3, 10.7, 10.8
 * 
 * @param locale - The current locale
 * @returns LocalBusiness schema object
 * 
 * @example
 * const schema = generateLocalBusinessSchema('sr')
 */
export function generateLocalBusinessSchema(locale: Locale): LocalBusinessSchema {
  const config = getSEOConfig()
  const baseUrl = getBaseUrl()

  const address: PostalAddress = {
    '@type': 'PostalAddress',
    streetAddress: config.business.address.street,
    addressLocality: config.business.address.city,
    addressRegion: config.business.address.region,
    postalCode: config.business.address.postalCode,
    addressCountry: config.business.address.country
  }

  const geo: GeoCoordinates = {
    '@type': 'GeoCoordinates',
    latitude: config.business.geo.latitude,
    longitude: config.business.geo.longitude
  }

  // Collect social media links
  const sameAs: string[] = []
  if (config.social.facebook) sameAs.push(config.social.facebook)
  if (config.social.instagram) sameAs.push(config.social.instagram)
  if (config.social.twitter) sameAs.push(config.social.twitter)

  // Build areaServed Place array from config
  const areaServed: PlaceSchema[] = config.business.areaServed.map(name => ({
    '@type': 'Place' as const,
    name
  }))

  const schema: LocalBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'LodgingBusiness'],
    '@id': `${baseUrl}/#business`,
    name: config.business.name,
    image: [
      makeAbsoluteUrl('/images/background.jpg', baseUrl)
    ],
    url: makeAbsoluteUrl(`/${locale}`, baseUrl),
    telephone: config.business.phone,
    email: config.business.email,
    address,
    geo,
    areaServed,
    checkinTime: config.business.checkinTime,
    checkoutTime: config.business.checkoutTime,
    petsAllowed: false
  }

  // Add social media links if available
  if (sameAs.length > 0) {
    schema.sameAs = sameAs
  }

  return schema
}

/**
 * Generates LodgingBusiness schema for apartment detail pages
 * Includes name, description, images, address, geo, amenities, rooms, price range, and ratings
 *
 * Requirements: 4.2, 4.9, 19.4
 *
 * @param apartment - The apartment data
 * @param locale - The current locale
 * @returns LodgingBusiness schema object
 *
 * @example
 * const schema = generateLodgingBusinessSchema(apartment, 'en')
 */
export function generateLodgingBusinessSchema(
  apartment: Apartment,
  locale: Locale
): LodgingBusinessSchema {
  const config = getSEOConfig()
  const baseUrl = getBaseUrl()

  const address: PostalAddress = {
    '@type': 'PostalAddress',
    streetAddress: config.business.address.street,
    addressLocality: config.business.address.city,
    addressRegion: config.business.address.region,
    postalCode: config.business.address.postalCode,
    addressCountry: config.business.address.country
  }

  const geo: GeoCoordinates = {
    '@type': 'GeoCoordinates',
    latitude: config.business.geo.latitude,
    longitude: config.business.geo.longitude
  }

  // Convert amenities to LocationFeatureSpecification array (schema.org preferred for LodgingBusiness)
  const amenityFeature: LocationFeatureSpecification[] = apartment.amenities.map(amenity => ({
    '@type': 'LocationFeatureSpecification' as const,
    name: amenity,
    value: true
  }))

  const apartmentUrl = makeAbsoluteUrl(`/${locale}/apartments/${apartment.slug}`, baseUrl)

  // Generate price range (e.g., "€40-€80")
  const priceRange = `€${apartment.basePrice}-€${Math.round(apartment.basePrice * 1.5)}`

  // Offer: price in EUR, InStock
  const offers: OfferSchema[] = [
    {
      '@type': 'Offer',
      priceCurrency: 'EUR',
      price: apartment.basePrice,
      availability: 'https://schema.org/InStock',
      url: apartmentUrl
    }
  ]

  const schema: LodgingBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    '@id': apartmentUrl,
    name: apartment.name,
    description: apartment.description,
    image: apartment.images.map(img => makeAbsoluteUrl(img, baseUrl)),
    url: apartmentUrl,
    telephone: config.business.phone,
    email: config.business.email,
    address,
    geo,
    amenityFeature,
    priceRange,
    offers,
    checkinTime: config.business.checkinTime,
    checkoutTime: config.business.checkoutTime,
    petsAllowed: false,
    // Occupancy based on capacity
    occupancy: {
      '@type': 'QuantitativeValue',
      maxValue: apartment.capacity
    }
  }

  // Add number of rooms if explicitly provided (NOT bathroom_count)
  if (apartment.numberOfRooms) {
    schema.numberOfRooms = apartment.numberOfRooms
  }

  // Floor size from size_sqm
  if (apartment.size_sqm) {
    const floorSize: QuantitativeValue = {
      '@type': 'QuantitativeValue',
      value: apartment.size_sqm,
      unitCode: 'MTK'  // square metres (UN/CEFACT)
    }
    schema.floorSize = floorSize
  }

  // Bed type from bed_type string
  if (apartment.bed_type) {
    schema.bed = apartment.bed_type
  }

  return schema
}

/**
 * Generates Breadcrumb schema for navigation hierarchy
 * Supports multi-level breadcrumbs with position, name, and item URL
 * 
 * Requirements: 4.3, 17.2, 17.8, 17.10
 * 
 * @param path - The current path (e.g., '/apartments/studio-1')
 * @param locale - The current locale
 * @returns Breadcrumb schema object
 * 
 * @example
 * const schema = generateBreadcrumbSchema('/apartments/studio-1', 'en')
 */
export function generateBreadcrumbSchema(path: string, locale: Locale): BreadcrumbSchema {
  const baseUrl = getBaseUrl()
  
  // Split path into segments
  const segments = path.split('/').filter(Boolean)
  
  // Always start with Home
  const items: BreadcrumbSchema['itemListElement'] = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: makeAbsoluteUrl(`/${locale}`, baseUrl)
    }
  ]

  // Build breadcrumb items from path segments
  let currentPath = `/${locale}`
  segments.forEach((segment) => {
    // Skip locale segment if it's in the path
    if (segment === locale) return

    currentPath += `/${segment}`
    
    // Capitalize and format segment name
    const name = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')

    items.push({
      '@type': 'ListItem',
      position: items.length + 1,
      name,
      item: makeAbsoluteUrl(currentPath, baseUrl)
    })
  })

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items
  }
}

/**
 * Generates FAQ schema for frequently asked questions
 * Includes question name and acceptedAnswer.text for each FAQ
 * 
 * Requirements: 4.4, 18.1, 18.2, 18.3, 18.4, 18.5, 18.10
 * 
 * @param faqs - Array of FAQ items
 * @param locale - The current locale
 * @returns FAQ schema object or null if no FAQs
 * 
 * @example
 * const schema = generateFAQSchema(faqs, 'de')
 */
export function generateFAQSchema(faqs: FAQ[], __locale: Locale): FAQSchema | null {
  void __locale // Suppress unused variable warning
  if (!faqs || faqs.length === 0) {
    return null
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  }
}

/**
 * Generates Review schema with aggregate ratings
 * Calculates average rating and includes individual reviews
 * Only includes approved reviews
 * 
 * Requirements: 4.5, 19.1, 19.2, 19.3, 19.5, 19.6, 19.7, 19.8, 19.9
 * 
 * @param reviews - Array of review items
 * @returns AggregateRating object or null if no reviews
 * 
 * @example
 * const rating = generateReviewSchema(reviews)
 */
export function generateReviewSchema(reviews: Review[]): {
  aggregateRating: AggregateRating
  review: ReviewType[]
} | null {
  if (!reviews || reviews.length === 0) {
    return null
  }

  // Filter only approved reviews
  const approvedReviews = reviews.filter(review => review.approved)

  if (approvedReviews.length === 0) {
    return null
  }

  // Calculate average rating
  const totalRating = approvedReviews.reduce((sum, review) => sum + review.rating, 0)
  const averageRating = totalRating / approvedReviews.length

  const aggregateRating: AggregateRating = {
    '@type': 'AggregateRating',
    ratingValue: Math.round(averageRating * 10) / 10, // Round to 1 decimal
    bestRating: 5,
    reviewCount: approvedReviews.length
  }

  // Convert reviews to Schema.org format
  const reviewItems: ReviewType[] = approvedReviews.map(review => ({
    '@type': 'Review',
    author: {
      '@type': 'Person',
      name: review.author
    },
    datePublished: review.createdAt,
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.rating,
      bestRating: 5
    },
    reviewBody: review.comment
  }))

  return {
    aggregateRating,
    review: reviewItems
  }
}

/**
 * Generates WebSite schema with SearchAction for sitelinks search box.
 * Signals to Google/AI crawlers that this site is searchable.
 *
 * @param locale - The current locale
 * @returns WebSite schema object
 *
 * @example
 * const schema = generateWebSiteSchema('en')
 */
export function generateWebSiteSchema(locale: Locale): WebSiteSchema {
  const config = getSEOConfig()
  const baseUrl = getBaseUrl()

  const schema: WebSiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${baseUrl}/#website`,
    url: baseUrl,
    name: config.siteName,
    inLanguage: locale,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/${locale}/apartments?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  }

  return schema
}

/**
 * Generates TouristAttraction schema for a single attraction entry.
 *
 * @param attraction - The attraction data (from src/data/attractions.ts)
 * @param locale - The current locale (used for inLanguage signal, not translation here)
 * @returns TouristAttraction schema object
 *
 * @example
 * const schema = generateTouristAttractionSchema(attraction, 'en')
 */
export function generateTouristAttractionSchema(
  attraction: AttractionEntry,
  locale: Locale
): TouristAttractionSchema {
  void locale  // locale used for future inLanguage extension; suppress unused warning
  const baseUrl = getBaseUrl()

  const schema: TouristAttractionSchema = {
    '@context': 'https://schema.org',
    '@type': 'TouristAttraction',
    name: attraction.name,
    description: attraction.description,
    image: makeAbsoluteUrl(attraction.image, baseUrl),
    geo: {
      '@type': 'GeoCoordinates',
      latitude: attraction.lat,
      longitude: attraction.lng
    }
  }

  return schema
}

/**
 * Generates TouristDestination schema for Bovansko jezero (Bovan Lake),
 * including all local attractions as containsPlace entries.
 * Boosts AI/GEO presence for "things to do near Bovan lake".
 *
 * @param locale - The current locale
 * @param attractions - Array of attraction entries for the locale
 * @returns TouristDestination schema object
 *
 * @example
 * const schema = generateTouristDestinationSchema('en', STATIC_ATTRACTIONS['en'])
 */
export function generateTouristDestinationSchema(
  locale: Locale,
  attractions: AttractionEntry[]
): TouristDestinationSchema {
  const baseUrl = getBaseUrl()

  const containsPlace: TouristAttractionSchema[] = attractions.map(a =>
    generateTouristAttractionSchema(a, locale)
  )

  const schema: TouristDestinationSchema = {
    '@context': 'https://schema.org',
    '@type': 'TouristDestination',
    name: 'Bovansko jezero (Bovan Lake)',
    description:
      'Bovan Lake (Bovansko jezero) is a reservoir on the Moravica river near the village of Bovan, Aleksinac municipality, Serbia. Surrounded by forested hills, it offers swimming, fishing, and nature tourism.',
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 43.64592019,
      longitude: 21.70277774
    },
    image: makeAbsoluteUrl('/images/og-home.jpg', baseUrl),
    url: makeAbsoluteUrl(`/${locale}/location`, baseUrl),
    containsPlace
  }

  return schema
}

/**
 * Generates ImageObject schema for a single image.
 * Useful for rich results and AI image indexing.
 *
 * @param url - Absolute or relative URL of the image
 * @param caption - Image caption / alt text
 * @param baseUrl - Base URL for making relative paths absolute
 * @returns ImageObject schema (without top-level @context — embed in @graph)
 *
 * @example
 * const schema = generateImageSchema('/images/apartment.jpg', 'Studio apartment', baseUrl)
 */
export function generateImageSchema(
  url: string,
  caption: string,
  baseUrl: string
): ImageObjectSchema {
  const absoluteUrl = makeAbsoluteUrl(url, baseUrl)
  return {
    '@type': 'ImageObject',
    contentUrl: absoluteUrl,
    url: absoluteUrl,
    caption
  }
}

/**
 * Generates Organization schema with logo and contact information
 * Includes social media links
 *
 * Requirements: 4.12
 *
 * @returns Organization schema object
 *
 * @example
 * const schema = generateOrganizationSchema()
 */
export function generateOrganizationSchema(): OrganizationSchema {
  const config = getSEOConfig()
  const baseUrl = getBaseUrl()

  const address: PostalAddress = {
    '@type': 'PostalAddress',
    streetAddress: config.business.address.street,
    addressLocality: config.business.address.city,
    addressRegion: config.business.address.region,
    postalCode: config.business.address.postalCode,
    addressCountry: config.business.address.country
  }

  // Collect social media links
  const sameAs: string[] = []
  if (config.social.facebook) sameAs.push(config.social.facebook)
  if (config.social.instagram) sameAs.push(config.social.instagram)
  if (config.social.twitter) sameAs.push(config.social.twitter)

  // Build areaServed Place array from config
  const areaServed: PlaceSchema[] = config.business.areaServed.map(name => ({
    '@type': 'Place' as const,
    name
  }))

  const schema: OrganizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${baseUrl}/#organization`,
    name: config.business.name,
    url: baseUrl,
    logo: makeAbsoluteUrl('/images/logo2.png', baseUrl),
    telephone: config.business.phone,
    email: config.business.email,
    address,
    foundingDate: String(config.business.foundingYear),
    areaServed
  }

  // Add social media links if available
  if (sameAs.length > 0) {
    schema.sameAs = sameAs
  }

  return schema
}
