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
  '@type': 'LocalBusiness'
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
  address: PostalAddress
  geo: GeoCoordinates
  amenityFeature: PropertyValue[]
  numberOfRooms?: number
  priceRange: string
  aggregateRating?: AggregateRating
  review?: Review[]
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
