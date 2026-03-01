# Design Document: Comprehensive SEO Optimization

## Overview

This design document outlines the implementation of comprehensive SEO optimization for the Apartmani Jovča website. The system will integrate with Next.js 14's Metadata API, next-intl for multi-language support, and Supabase for dynamic content, delivering best-in-class search engine optimization across all pages, languages (SR, EN, DE, IT), and content types.

### Goals

- Achieve 90+ Lighthouse SEO score across all pages
- Implement proper multi-language SEO with hreflang tags
- Generate rich structured data (Schema.org JSON-LD) for enhanced search results
- Create dynamic XML sitemaps with automatic updates
- Optimize social media sharing with Open Graph and Twitter Cards
- Ensure fast page load times (<3s) for optimal SEO performance
- Support local SEO targeting for vacation rental market in Serbia

### Non-Goals

- SEO analytics and tracking (Google Analytics, Search Console integration)
- Automated SEO content generation or AI-powered optimization
- Backlink management or off-page SEO strategies
- A/B testing for SEO variations

## Architecture

### High-Level Architecture

The SEO system is built as a modular, server-side architecture that integrates seamlessly with Next.js 14's App Router and Metadata API:

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js App Router                       │
│                  (Server Components)                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ├──> generateMetadata() functions
                     │    (per page/route)
                     │
        ┌────────────┴────────────┐
        │   SEO Metadata Engine   │
        └────────────┬────────────┘
                     │
        ┌────────────┴────────────────────────────┐
        │                                         │
   ┌────▼─────┐  ┌──────▼──────┐  ┌─────▼──────┐
   │  Meta    │  │  Hreflang   │  │  Social    │
   │Generator │  │  Manager    │  │  Media     │
   └────┬─────┘  └──────┬──────┘  └─────┬──────┘
        │               │                │
        └───────────────┴────────────────┘
                        │
        ┌───────────────┴───────────────┐
        │                               │
   ┌────▼────────┐         ┌───────▼────────┐
   │ Structured  │         │   Sitemap      │
   │ Data Engine │         │   Generator    │
   └────┬────────┘         └───────┬────────┘
        │                          │
        └──────────┬───────────────┘
                   │
        ┌──────────▼──────────┐
        │   Data Sources      │
        ├─────────────────────┤
        │ • Supabase DB       │
        │ • Translation Files │
        │ • Environment Vars  │
        └─────────────────────┘
```

### Component Responsibilities


1. **SEO Metadata Engine**: Central orchestrator that coordinates all SEO components and provides unified API for metadata generation

2. **Meta Generator**: Creates page-specific meta tags (title, description, keywords, canonical, viewport, charset)

3. **Hreflang Manager**: Generates language alternate tags for multi-language SEO compliance

4. **Social Media Optimizer**: Produces Open Graph and Twitter Card metadata for rich social sharing

5. **Structured Data Engine**: Generates Schema.org JSON-LD markup for various page types (LocalBusiness, LodgingBusiness, Breadcrumb, FAQ, Review, Image)

6. **Sitemap Generator**: Creates dynamic XML sitemaps with automatic updates from database

### Technology Stack Integration

- **Next.js 14 Metadata API**: Primary integration point via `generateMetadata()` and `metadata` exports
- **next-intl**: Locale detection, translation loading, and URL structure (`/[lang]/[page]`)
- **Supabase**: Dynamic content source for apartments, reviews, and CMS content
- **Cloudinary**: Optimized image delivery for og:image and structured data
- **TypeScript**: Type-safe SEO configuration and metadata generation

## Components and Interfaces

### 1. SEO Configuration Module

**Location**: `src/lib/seo/config.ts`

**Purpose**: Centralized SEO configuration with environment-aware base URL management

```typescript
interface SEOConfig {
  baseUrl: string
  siteName: string
  defaultLocale: Locale
  locales: Locale[]
  social: {
    twitter?: string
    facebook?: string
    instagram?: string
  }
  business: {
    name: string
    phone: string
    email: string
    address: {
      street: string
      city: string
      region: string
      postalCode: string
      country: string
    }
    geo: {
      latitude: number
      longitude: number
    }
  }
}
```

**Key Functions**:
- `getBaseUrl()`: Returns environment-appropriate base URL (localhost, Vercel preview, production)
- `getSEOConfig()`: Returns complete SEO configuration object
- `validateBaseUrl(url: string)`: Ensures base URL has protocol and domain

### 2. Meta Generator

**Location**: `src/lib/seo/meta-generator.ts`

**Purpose**: Generate page-specific meta tags with locale support

```typescript
interface MetaTagsInput {
  title: string
  description: string
  keywords?: string[]
  canonical?: string
  locale: Locale
  pageType: PageType
  images?: string[]
  noindex?: boolean
}

interface MetaTagsOutput {
  title: string
  description: string
  keywords?: string
  canonical: string
  robots?: string
  viewport: string
  charset: string
  other: Record<string, string>
}
```

**Key Functions**:
- `generateMetaTags(input: MetaTagsInput): MetaTagsOutput`
- `generateTitle(title: string, locale: Locale): string` - Ensures 50-60 char limit
- `generateDescription(desc: string): string` - Ensures 150-160 char limit
- `generateCanonicalUrl(path: string, locale: Locale): string`

### 3. Hreflang Manager

**Location**: `src/lib/seo/hreflang.ts`

**Purpose**: Generate hreflang alternate tags for multi-language pages

```typescript
interface HreflangTag {
  hreflang: string // 'en', 'sr', 'de', 'it', 'x-default'
  href: string // absolute URL
}

interface HreflangInput {
  path: string // e.g., '/apartments/studio-1'
  locale: Locale
  availableLocales?: Locale[] // defaults to all locales
}
```

**Key Functions**:
- `generateHreflangTags(input: HreflangInput): HreflangTag[]`
- `getAlternateUrls(path: string): Record<Locale, string>`
- `getSelfReferentialTag(path: string, locale: Locale): HreflangTag`

### 4. Social Media Optimizer

**Location**: `src/lib/seo/social-media.ts`

**Purpose**: Generate Open Graph and Twitter Card metadata

```typescript
interface SocialMediaInput {
  title: string
  description: string
  image: string // absolute URL
  url: string // absolute URL
  locale: Locale
  type?: 'website' | 'article'
  imageAlt?: string
}

interface OpenGraphTags {
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

interface TwitterCardTags {
  'twitter:card': 'summary_large_image'
  'twitter:title': string
  'twitter:description': string
  'twitter:image': string
  'twitter:image:alt'?: string
}
```

**Key Functions**:
- `generateOpenGraphTags(input: SocialMediaInput): OpenGraphTags`
- `generateTwitterCardTags(input: SocialMediaInput): TwitterCardTags`
- `optimizeImageForSocial(imageUrl: string): string` - Ensures 1200x630 minimum

### 5. Structured Data Engine

**Location**: `src/lib/seo/structured-data.ts`

**Purpose**: Generate Schema.org JSON-LD markup for various page types

```typescript
type StructuredDataType = 
  | 'LocalBusiness'
  | 'LodgingBusiness'
  | 'Breadcrumb'
  | 'FAQ'
  | 'Review'
  | 'Image'
  | 'Organization'

interface LocalBusinessSchema {
  '@context': 'https://schema.org'
  '@type': 'LocalBusiness'
  name: string
  image: string[]
  '@id': string
  url: string
  telephone: string
  address: PostalAddress
  geo: GeoCoordinates
  openingHoursSpecification: OpeningHoursSpecification[]
  sameAs: string[]
}

interface LodgingBusinessSchema {
  '@context': 'https://schema.org'
  '@type': 'LodgingBusiness'
  name: string
  description: string
  image: string[]
  address: PostalAddress
  geo: GeoCoordinates
  amenityFeature: PropertyValue[]
  numberOfRooms: number
  priceRange: string
  aggregateRating?: AggregateRating
}

interface BreadcrumbSchema {
  '@context': 'https://schema.org'
  '@type': 'BreadcrumbList'
  itemListElement: ListItem[]
}

interface FAQSchema {
  '@context': 'https://schema.org'
  '@type': 'FAQPage'
  mainEntity: Question[]
}
```

**Key Functions**:
- `generateLocalBusinessSchema(locale: Locale): LocalBusinessSchema`
- `generateLodgingBusinessSchema(apartment: Apartment, locale: Locale): LodgingBusinessSchema`
- `generateBreadcrumbSchema(path: string, locale: Locale): BreadcrumbSchema`
- `generateFAQSchema(faqs: FAQ[], locale: Locale): FAQSchema`
- `generateReviewSchema(reviews: Review[]): AggregateRating`
- `generateOrganizationSchema(): Organization`
- `validateSchema(schema: object): boolean` - Validates against Schema.org specs

### 6. Sitemap Generator

**Location**: `src/app/sitemap.ts` (Next.js convention)

**Purpose**: Generate dynamic XML sitemap with all pages and languages

```typescript
interface SitemapEntry {
  url: string
  lastModified?: Date
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority?: number
  alternates?: {
    languages: Record<Locale, string>
  }
}
```

**Key Functions**:
- `generateSitemap(): Promise<SitemapEntry[]>`
- `getStaticPages(): SitemapEntry[]`
- `getDynamicPages(): Promise<SitemapEntry[]>` - Fetches from Supabase
- `addHreflangToSitemap(entry: SitemapEntry): SitemapEntry`

### 7. Robots.txt Generator

**Location**: `src/app/robots.ts` (Next.js convention)

**Purpose**: Generate robots.txt with environment-aware rules

```typescript
interface RobotsConfig {
  rules: {
    userAgent: string
    allow?: string[]
    disallow?: string[]
    crawlDelay?: number
  }[]
  sitemap: string
  host?: string
}
```

**Key Functions**:
- `generateRobots(): RobotsConfig`
- `getEnvironmentRules(): RobotsConfig` - Different rules for dev/staging/prod

### 8. SEO Utilities

**Location**: `src/lib/seo/utils.ts`

**Purpose**: Helper functions for SEO operations

**Key Functions**:
- `truncateText(text: string, maxLength: number): string`
- `generateSlug(text: string): string`
- `extractKeywords(text: string, locale: Locale): string[]`
- `calculateKeywordDensity(text: string, keyword: string): number`
- `sanitizeMetaContent(text: string): string` - Remove HTML, special chars
- `generateAltText(imageName: string, context: string): string`
- `isValidUrl(url: string): boolean`
- `makeAbsoluteUrl(path: string, baseUrl: string): string`

## Data Models

### SEO Metadata Model

```typescript
interface SEOMetadata {
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
    images: OpenGraphImage[]
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
```

### Page Type Configuration

```typescript
type PageType = 
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

interface PageSEOConfig {
  pageType: PageType
  titleTemplate: string // e.g., "{apartmentName} - Apartmani Jovča"
  descriptionTemplate: string
  keywords: Record<Locale, string[]>
  priority: number // for sitemap
  changeFreq: 'daily' | 'weekly' | 'monthly'
  structuredDataTypes: StructuredDataType[]
}
```

### Apartment SEO Model

```typescript
interface ApartmentSEO {
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
```

## Implementation Approach

### Phase 1: Core Infrastructure (Foundation)

1. **SEO Configuration Setup**
   - Create `src/lib/seo/config.ts` with environment-aware base URL
   - Define SEO constants (site name, business info, social profiles)
   - Implement `getBaseUrl()` with localhost/Vercel/production detection

2. **Utility Functions**
   - Implement text truncation, sanitization, and validation helpers
   - Create URL manipulation functions (absolute URLs, canonical generation)
   - Build keyword extraction and alt text generation utilities

3. **Type Definitions**
   - Define all TypeScript interfaces for SEO components
   - Create type guards and validators
   - Set up shared types in `src/lib/types/seo.ts`

### Phase 2: Metadata Generation

1. **Meta Generator Implementation**
   - Build core meta tag generation logic
   - Implement title and description optimization (length limits)
   - Create canonical URL generation
   - Add viewport and charset meta tags

2. **Hreflang Manager**
   - Implement hreflang tag generation for all locales
   - Add x-default handling
   - Create self-referential tag logic
   - Integrate with next-intl routing

3. **Social Media Optimizer**
   - Build Open Graph tag generator
   - Implement Twitter Card metadata
   - Add image optimization for social sharing (1200x630)
   - Create locale-specific og:locale tags

### Phase 3: Structured Data

1. **Schema.org Generators**
   - Implement LocalBusiness schema for home page
   - Create LodgingBusiness schema for apartment pages
   - Build Breadcrumb schema generator
   - Add FAQ schema support
   - Implement Review/AggregateRating schema
   - Create Organization schema

2. **Schema Validation**
   - Add JSON-LD validation against Schema.org specs
   - Implement error handling for malformed schemas
   - Create testing utilities for schema validation

### Phase 4: Dynamic Content Integration

1. **Page-Level Metadata**
   - Integrate with Next.js `generateMetadata()` for each page type
   - Fetch dynamic data from Supabase (apartments, reviews)
   - Implement locale-specific content loading
   - Add fallback metadata for missing translations

2. **Apartment Detail Pages**
   - Generate unique meta tags per apartment
   - Create apartment-specific structured data
   - Implement image optimization for og:image
   - Add breadcrumb navigation

3. **Multi-Language Support**
   - Load translations from `messages/[locale].json`
   - Generate locale-specific keywords
   - Implement hreflang for all page types
   - Add language switcher metadata

### Phase 5: Sitemaps and Robots

1. **Sitemap Generation**
   - Create `src/app/sitemap.ts` with Next.js sitemap API
   - Fetch all apartments from Supabase
   - Generate URLs for all locales
   - Add hreflang annotations to sitemap
   - Implement priority and changefreq logic

2. **Robots.txt**
   - Create `src/app/robots.ts` with Next.js robots API
   - Add environment-aware rules (block crawling in dev/staging)
   - Disallow admin and API routes
   - Include sitemap reference

### Phase 6: Performance Optimization

1. **Image Optimization**
   - Integrate with Cloudinary for automatic optimization
   - Implement lazy loading for below-the-fold images
   - Add responsive images with srcset
   - Include width/height attributes to prevent layout shift

2. **Code Optimization**
   - Implement code splitting for SEO utilities
   - Add caching for generated metadata
   - Optimize bundle size
   - Ensure server-side rendering for all SEO content

3. **Performance Monitoring**
   - Set up Lighthouse CI for automated testing
   - Monitor Core Web Vitals (LCP, FID, CLS)
   - Track page load times
   - Optimize for mobile-first performance

### Phase 7: Testing and Validation

1. **SEO Validation**
   - Test with Google Rich Results Test
   - Validate hreflang with Google Search Console
   - Check Open Graph with Facebook Sharing Debugger
   - Validate Twitter Cards with Twitter Card Validator
   - Run W3C HTML validation

2. **Lighthouse Audits**
   - Achieve 90+ SEO score
   - Pass mobile-friendly test
   - Verify structured data markup
   - Check for duplicate meta tags

3. **Manual Testing**
   - Test all pages in all locales
   - Verify sitemap generation
   - Check robots.txt in different environments
   - Validate canonical URLs
   - Test social media previews

## Integration Points

### Next.js Metadata API Integration

Each page will export a `generateMetadata()` function:

```typescript
// Example: src/app/[lang]/page.tsx
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = params
  const seoConfig = getSEOConfig()
  const translations = await getTranslations({ locale: lang, namespace: 'home' })
  
  const metaTags = generateMetaTags({
    title: translations('title'),
    description: translations('description'),
    locale: lang,
    pageType: 'home',
    keywords: getKeywordsForPage('home', lang)
  })
  
  const hreflangTags = generateHreflangTags({
    path: '/',
    locale: lang
  })
  
  const socialMedia = generateOpenGraphTags({
    title: metaTags.title,
    description: metaTags.description,
    image: `${seoConfig.baseUrl}/images/og-home.jpg`,
    url: `${seoConfig.baseUrl}/${lang}`,
    locale: lang
  })
  
  return {
    title: metaTags.title,
    description: metaTags.description,
    keywords: metaTags.keywords,
    alternates: {
      canonical: metaTags.canonical,
      languages: Object.fromEntries(
        hreflangTags.map(tag => [tag.hreflang, tag.href])
      )
    },
    openGraph: socialMedia,
    twitter: generateTwitterCardTags({...}),
    other: {
      ...metaTags.other
    }
  }
}
```

### Supabase Integration

Dynamic content fetching for SEO:

```typescript
// Fetch apartments for sitemap
async function getApartmentsForSitemap(): Promise<SitemapEntry[]> {
  const { data: apartments } = await supabase
    .from('apartments')
    .select('slug, updated_at')
    .eq('status', 'active')
  
  return apartments.flatMap(apt => 
    LOCALES.map(locale => ({
      url: `${baseUrl}/${locale}/apartments/${apt.slug}`,
      lastModified: new Date(apt.updated_at),
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: {
        languages: Object.fromEntries(
          LOCALES.map(l => [l, `${baseUrl}/${l}/apartments/${apt.slug}`])
        )
      }
    }))
  )
}
```

### Translation Integration (next-intl)

```typescript
// Load SEO translations
const t = await getTranslations({ locale: lang, namespace: 'seo' })

const keywords = {
  sr: ['apartmani', 'Bovansko jezero', 'smeštaj', 'Aleksinac'],
  en: ['apartments', 'Bovan Lake', 'accommodation', 'Serbia'],
  de: ['Ferienwohnung', 'Bovan See', 'Unterkunft', 'Serbien'],
  it: ['appartamenti', 'Lago Bovan', 'alloggio', 'Serbia']
}
```

### Cloudinary Integration

```typescript
// Optimize images for social media
function optimizeImageForSocial(cloudinaryUrl: string): string {
  return cloudinaryUrl.replace(
    '/upload/',
    '/upload/w_1200,h_630,c_fill,f_auto,q_auto/'
  )
}
```

