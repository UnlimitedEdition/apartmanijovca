/**
 * SEO Type Definitions
 * 
 * Comprehensive TypeScript interfaces for SEO components including
 * metadata, structured data, sitemaps, and social media optimization.
 */

// ============================================================================
// Core Types
// ============================================================================

export type Locale = 'sr' | 'en' | 'de' | 'it'

export type PageType =
  | 'home'
  | 'apartment-list'
  | 'apartment-detail'
  | 'contact'
  | 'location'
  | 'gallery'
  | 'attractions'
  | 'prices'
  | 'privacy'
  | 'terms'
  | 'booking'

// ============================================================================
// Meta Tags
// ============================================================================

export interface MetaTagsInput {
  title: string
  description: string
  keywords?: string
  path?: string // Added path for canonical URL generation
  canonical?: string
  locale: Locale
  pageType?: PageType
  type?: 'website' | 'article'
  images?: string[]
  noindex?: boolean
}

export interface MetaTagsOutput {
  title: string
  description: string
  keywords?: string
  canonical: string
  robots?: string
  viewport: string
  charset: string
  other: Record<string, string>
}

// ============================================================================
// Hreflang
// ============================================================================

export interface HreflangTag {
  hreflang: string // 'en', 'sr', 'de', 'it', 'x-default'
  href: string // absolute URL
}

export interface HreflangInput {
  path: string // e.g., '/apartments/studio-1'
  locale: Locale
  availableLocales?: Locale[] // defaults to all locales
}

// ============================================================================
// Social Media (Open Graph & Twitter Cards)
// ============================================================================

export interface SocialMediaInput {
  title: string
  description: string
  url: string // absolute URL
  locale: Locale
  type?: 'website' | 'article'
  siteName?: string
  images?: Array<{
    url: string
    width?: number
    height?: number
    alt?: string
  }>
  card?: 'summary_large_image'
}

export interface OpenGraphTags {
  'og:title': string
  'og:description': string
  'og:image': string
  'og:image:alt'?: string
  'og:url': string
  'og:type': string
  'og:locale': string
  'og:locale:alternate': string[]
  'og:site_name': string
}

export interface TwitterCardTags {
  'twitter:card': 'summary_large_image'
  'twitter:title': string
  'twitter:description': string
  'twitter:image': string
  'twitter:image:alt'?: string
}

// ============================================================================
// Structured Data - Schema.org Types
// ============================================================================

export type StructuredDataType =
  | 'LocalBusiness'
  | 'LodgingBusiness'
  | 'Breadcrumb'
  | 'FAQ'
  | 'Review'
  | 'Image'
  | 'Organization'

// Schema.org PostalAddress
export interface PostalAddress {
  '@type': 'PostalAddress'
  streetAddress: string
  addressLocality: string
  addressRegion: string
  postalCode: string
  addressCountry: string
}

// Schema.org GeoCoordinates
export interface GeoCoordinates {
  '@type': 'GeoCoordinates'
  latitude: number
  longitude: number
}

// Schema.org OpeningHoursSpecification
export interface OpeningHoursSpecification {
  '@type': 'OpeningHoursSpecification'
  dayOfWeek: string | string[]
  opens: string
  closes: string
}

// Schema.org PropertyValue (for amenities)
export interface PropertyValue {
  '@type': 'PropertyValue'
  name: string
  value?: string | boolean
}

// Schema.org LocationFeatureSpecification (for amenity features on lodging)
export interface LocationFeatureSpecification {
  '@type': 'LocationFeatureSpecification'
  name: string
  value: boolean | string
}

// Schema.org QuantitativeValue (e.g. floorSize)
export interface QuantitativeValue {
  '@type': 'QuantitativeValue'
  value: number
  unitCode?: string  // e.g. 'MTK' for square metres
}

// Schema.org Offer
export interface OfferSchema {
  '@type': 'Offer'
  priceCurrency: string
  price: number
  availability: string  // e.g. 'https://schema.org/InStock'
  url?: string
  validFrom?: string
}

// Schema.org EntryPoint (used in SearchAction)
export interface EntryPoint {
  '@type': 'EntryPoint'
  urlTemplate: string
}

// Schema.org SearchAction
export interface SearchAction {
  '@type': 'SearchAction'
  target: EntryPoint
  'query-input': string
}

// Schema.org WebSite
export interface WebSiteSchema {
  '@context': 'https://schema.org'
  '@type': 'WebSite'
  '@id'?: string
  url: string
  name: string
  inLanguage: string
  potentialAction?: SearchAction
}

// Schema.org Place (used for areaServed / containsPlace)
export interface PlaceSchema {
  '@type': 'Place'
  name: string
  geo?: GeoCoordinates
}

// Schema.org TouristAttraction
export interface TouristAttractionSchema {
  '@context': 'https://schema.org'
  '@type': 'TouristAttraction'
  name: string
  description?: string
  image?: string | string[]
  geo?: GeoCoordinates
  address?: PostalAddress
  url?: string
  isAccessibleForFree?: boolean
  touristType?: string | string[]
}

// Schema.org TouristDestination
export interface TouristDestinationSchema {
  '@context': 'https://schema.org'
  '@type': 'TouristDestination'
  name: string
  description?: string
  image?: string | string[]
  geo?: GeoCoordinates
  address?: PostalAddress
  url?: string
  containsPlace?: TouristAttractionSchema[]
  touristType?: string | string[]
}

// Schema.org ImageObject (extended)
export interface ImageObjectSchema {
  '@context'?: 'https://schema.org'
  '@type': 'ImageObject'
  contentUrl: string
  url?: string
  caption?: string
  width?: number
  height?: number
  description?: string
  license?: string
}

// Schema.org AggregateRating
export interface AggregateRating {
  '@type': 'AggregateRating'
  ratingValue: number
  bestRating: number
  reviewCount: number
}

// Schema.org Review
export interface Review {
  '@type': 'Review'
  author: {
    '@type': 'Person'
    name: string
  }
  datePublished: string
  reviewRating: {
    '@type': 'Rating'
    ratingValue: number
    bestRating: number
  }
  reviewBody: string
}

// Schema.org LocalBusiness
export interface LocalBusinessSchema {
  '@context': 'https://schema.org'
  '@type': 'LocalBusiness' | ['LocalBusiness', ...string[]]
  '@id': string
  name: string
  image: string[]
  url: string
  telephone: string
  email?: string
  address: PostalAddress
  geo: GeoCoordinates
  openingHoursSpecification?: OpeningHoursSpecification[]
  sameAs?: string[]
  /** Schema.org areaServed — regions / cities served */
  areaServed?: PlaceSchema[]
  /** Schema.org additionalType — extra type URI (e.g. LodgingBusiness) */
  additionalType?: string | string[]
  /** Check-in time in ISO 8601 time format (HH:MM) */
  checkinTime?: string
  /** Check-out time in ISO 8601 time format (HH:MM) */
  checkoutTime?: string
  /** Whether pets are allowed */
  petsAllowed?: boolean
  /** Aggregate rating from guest reviews */
  aggregateRating?: AggregateRating
  /** Individual guest reviews */
  review?: Review[]
}

// Schema.org LodgingBusiness
export interface LodgingBusinessSchema {
  '@context': 'https://schema.org'
  '@type': 'LodgingBusiness'
  '@id'?: string
  name: string
  description: string
  image: string[]
  url?: string
  telephone?: string
  email?: string
  address: PostalAddress
  geo: GeoCoordinates
  /** amenityFeature as LocationFeatureSpecification (preferred) or PropertyValue */
  amenityFeature: LocationFeatureSpecification[] | PropertyValue[]
  /** numberOfRooms — do NOT map bathroom_count here; use for actual room count */
  numberOfRooms?: number
  /** Maximum occupancy (maps to schema:occupancy / maximumAttendeeCapacity) */
  occupancy?: { '@type': 'QuantitativeValue'; maxValue: number }
  /** Floor area (size_sqm) */
  floorSize?: QuantitativeValue
  /** Bed description string or BedDetails */
  bed?: string
  /** Price offers */
  offers?: OfferSchema[]
  priceRange: string
  aggregateRating?: AggregateRating
  review?: Review[]
  /** Check-in time in ISO 8601 time format (HH:MM) */
  checkinTime?: string
  /** Check-out time in ISO 8601 time format (HH:MM) */
  checkoutTime?: string
  /** Whether pets are allowed — always false for Jovča */
  petsAllowed?: boolean
  /** Star rating */
  starRating?: { '@type': 'Rating'; ratingValue: number }
}

// Schema.org BreadcrumbList
export interface BreadcrumbListItem {
  '@type': 'ListItem'
  position: number
  name: string
  item: string
}

export interface BreadcrumbSchema {
  '@context': 'https://schema.org'
  '@type': 'BreadcrumbList'
  itemListElement: BreadcrumbListItem[]
}

// Schema.org FAQPage
export interface FAQQuestion {
  '@type': 'Question'
  name: string
  acceptedAnswer: {
    '@type': 'Answer'
    text: string
  }
}

export interface FAQSchema {
  '@context': 'https://schema.org'
  '@type': 'FAQPage'
  mainEntity: FAQQuestion[]
}

// Schema.org ImageObject
export interface ImageSchema {
  '@context': 'https://schema.org'
  '@type': 'ImageObject'
  contentUrl: string
  url: string
  width?: number
  height?: number
  caption?: string
  description?: string
  license?: string
}

// Schema.org Organization
export interface OrganizationSchema {
  '@context': 'https://schema.org'
  '@type': 'Organization'
  '@id': string
  name: string
  url: string
  logo: string
  image?: string[]
  telephone?: string
  email?: string
  address?: PostalAddress
  sameAs?: string[]
  /** Founding date in ISO 8601 format (YYYY) or full date */
  foundingDate?: string
  /** Regions / cities served */
  areaServed?: PlaceSchema[]
}

// ============================================================================
// Sitemap
// ============================================================================

export interface SitemapEntry {
  url: string
  lastModified?: Date
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority?: number
  alternates?: {
    languages: Record<Locale, string>
  }
}

// ============================================================================
// Robots.txt
// ============================================================================

export interface RobotsConfig {
  rules: {
    userAgent: string
    allow?: string[]
    disallow?: string[]
    crawlDelay?: number
  }[]
  sitemap: string
  host?: string
}

// ============================================================================
// Page SEO Configuration
// ============================================================================

export interface PageSEOConfig {
  pageType: PageType
  titleTemplate: string // e.g., "{apartmentName} - Apartmani Jovča"
  descriptionTemplate: string
  keywords: Record<Locale, string[]>
  priority: number // for sitemap
  changeFreq: 'daily' | 'weekly' | 'monthly'
  structuredDataTypes: StructuredDataType[]
}

// ============================================================================
// Complete SEO Metadata (Next.js Metadata API compatible)
// ============================================================================

export interface SEOMetadata {
  // Basic Meta Tags
  title: string
  description: string
  keywords?: string
  canonical: string

  // Language & Locale
  locale: Locale
  hreflang: HreflangTag[]

  // Open Graph
  openGraph: {
    title: string
    description: string
    url: string
    siteName: string
    images: Array<{
      url: string
      width?: number
      height?: number
      alt?: string
    }>
    locale: string
    type: 'website' | 'article'
  }

  // Twitter Card
  twitter: {
    card: 'summary_large_image'
    title: string
    description: string
    images: string[]
  }

  // Structured Data
  structuredData: object[] // Array of JSON-LD schemas

  // Technical
  robots?: {
    index?: boolean
    follow?: boolean
    googleBot?: {
      index?: boolean
      follow?: boolean
    }
  }

  // Additional
  alternates?: {
    canonical: string
    languages: Record<Locale, string>
  }
}

// ============================================================================
// FAQ Data Model
// ============================================================================

export interface FAQ {
  question: string
  answer: string
}

// ============================================================================
// Apartment SEO Model
// ============================================================================

export interface ApartmentSEO {
  id: string
  slug: string
  name: string
  description: string
  images: string[]
  basePrice: number
  capacity: number
  bedType: string
  amenities: string[]
  locale: Locale

  // SEO-specific
  metaTitle: string
  metaDescription: string
  keywords: string[]
  structuredData: LodgingBusinessSchema
}
