/**
 * SEO Configuration Module
 * 
 * Provides centralized SEO configuration with environment-aware base URL management.
 * Supports localhost, Vercel preview, and production environments.
 */

// ============================================
// CENTRALIZED CONFIGURATION - EDIT HERE ONLY
// ============================================
export const PRODUCTION_URL = (process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '')) || 'https://apartmani-jovca.vercel.app'
export const CONTACT_EMAIL = 'apartmanijovca@gmail.com'
export const CONTACT_PHONE = '+381 65 237 8080'
export const WHATSAPP_NUMBER = '+381 65 237 8080'

// Email sender configuration (for Resend)
// For production with custom domain: use your domain (e.g., 'noreply@apartmani-jovca.com')
// For testing without domain: use 'onboarding@resend.dev' (Resend test mode)
export const EMAIL_FROM = process.env.EMAIL_FROM || 'onboarding@resend.dev'
export const EMAIL_ADMIN = CONTACT_EMAIL // Admin email is the same as contact email
// ============================================

export type Locale = 'sr' | 'en' | 'de' | 'it'

export interface SEOConfig {
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
    /** Founding year of the business (for schema.org foundingDate) */
    foundingYear: number
    /** Standard check-in time in HH:MM format */
    checkinTime: string
    /** Standard check-out time in HH:MM format */
    checkoutTime: string
    /** Regions/cities served — for schema.org areaServed */
    areaServed: string[]
    /** Geographic service radius in meters — for schema.org GeoCircle */
    geoRadius: number
  }
}

/**
 * Validates that a base URL has proper protocol and domain
 * @param url - The URL to validate
 * @returns true if valid, false otherwise
 */
export function validateBaseUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return (parsed.protocol === 'http:' || parsed.protocol === 'https:') && !!parsed.hostname
  } catch {
    return false
  }
}

/**
 * Gets the base URL for the application based on environment
 * Priority: NEXT_PUBLIC_BASE_URL > Vercel URL > PRODUCTION_URL > localhost
 * 
 * @returns The base URL without trailing slash
 */
export function getBaseUrl(): string {
  // 1. Check for explicit base URL configuration
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    const url = process.env.NEXT_PUBLIC_BASE_URL.replace(/\/$/, '')
    if (validateBaseUrl(url)) {
      return url
    }
  }

  // 2. On the PRODUCTION Vercel deployment, always use the stable production URL.
  // VERCEL_URL is deployment-specific (e.g. ...-1fxfb2xhs-milans-projects.vercel.app)
  // and changes every deploy — using it for og:url/og:image/hreflang creates
  // signals inconsistent with the canonical (which uses PRODUCTION_URL), which
  // confuses Google. Preview deploys (VERCEL_ENV='preview') still fall through to
  // VERCEL_URL below so their OG/links resolve on the preview host.
  if (process.env.VERCEL_ENV === 'production') {
    return PRODUCTION_URL
  }

  // 3. Check for Vercel deployment URL (preview/branch deploys)
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  // 4. Use production URL if in production
  if (process.env.NODE_ENV === 'production') {
    return PRODUCTION_URL
  }

  // 4. Fallback to localhost for development
  return 'http://localhost:3000'
}

/**
 * Gets the complete SEO configuration for the application
 * @returns SEO configuration object
 */
export function getSEOConfig(): SEOConfig {
  return {
    baseUrl: getBaseUrl(),
    siteName: 'Apartmani Jovča',
    defaultLocale: 'sr',
    locales: ['sr', 'en', 'de', 'it'],
    social: {
      facebook: 'https://www.facebook.com/apartmani.jovca',
      instagram: 'https://www.instagram.com/bovanapartmanijovca',
    },
    business: {
      name: 'Apartmani Jovča',
      phone: CONTACT_PHONE,
      email: CONTACT_EMAIL,
      address: {
        street: 'Bukovička 125',
        city: 'Bovan',
        region: 'Nišavski okrug',
        postalCode: '18230',
        country: 'RS',
      },
      geo: {
        latitude: 43.64592019,
        longitude: 21.70277774,
      },
      foundingYear: 2015,
      checkinTime: '14:00',
      checkoutTime: '10:00',
      areaServed: ['Bovansko jezero', 'Bovan', 'Aleksinac', 'Sokobanja', 'Niš'],
      geoRadius: 50000,
    },
  }
}
