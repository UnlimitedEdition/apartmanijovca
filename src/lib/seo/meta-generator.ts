/**
 * Meta Tag Generator Module
 * 
 * Generates page-specific meta tags with locale support, including title, description,
 * keywords, canonical URLs, and technical meta tags (viewport, charset, robots).
 */

import { PRODUCTION_URL } from './config'
import { truncateText, sanitizeMetaContent, makeAbsoluteUrl } from './utils'
import type { MetaTagsInput, MetaTagsOutput, Locale } from '../types/seo'

/**
 * Generates optimized page title with character limit (50-60 chars)
 * Ensures titles are within optimal SERP display length
 * 
 * @param title - The page title
 * @param locale - The current locale
 * @returns Optimized title string
 */
export function generateTitle(title: string, locale: Locale): string {
  const sanitized = sanitizeMetaContent(title)
  
  // Target 50-60 characters for optimal SERP display
  const maxLength = 60
  
  if (sanitized.length <= maxLength) {
    return sanitized
  }
  
  return truncateText(sanitized, maxLength)
}

/**
 * Generates optimized meta description with character limit (150-160 chars)
 * Ensures descriptions are within optimal SERP display length
 * 
 * @param desc - The page description
 * @returns Optimized description string
 */
export function generateDescription(desc: string): string {
  const sanitized = sanitizeMetaContent(desc)
  
  // Target 150-160 characters for optimal SERP display
  const maxLength = 160
  
  if (sanitized.length <= maxLength) {
    return sanitized
  }
  
  return truncateText(sanitized, maxLength)
}

/**
 * Generates canonical URL for a page
 * Always uses production URL to ensure consistent canonical URLs across all deployments
 * 
 * @param path - The page path (e.g., '/apartments/studio-1')
 * @param locale - The current locale
 * @returns Absolute canonical URL
 */
export function generateCanonicalUrl(path: string, locale: Locale): string {
  // Always use production URL for canonical URLs (not preview/deployment URLs)
  const baseUrl = PRODUCTION_URL
  
  // Ensure path starts with /
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  
  // Add locale prefix if not already present
  const pathWithLocale = cleanPath.startsWith(`/${locale}`)
    ? cleanPath
    : `/${locale}${cleanPath}`
  
  return makeAbsoluteUrl(pathWithLocale, baseUrl)
}

/**
 * Generates complete meta tags for a page
 * Includes title, description, keywords, canonical, viewport, charset, and robots
 * 
 * @param input - Meta tags input configuration
 * @returns Complete meta tags output
 */
export function generateMetaTags(input: MetaTagsInput): MetaTagsOutput {
  const {
    title,
    description,
    keywords = '',
    path,
    canonical,
    locale,
    pageType,
    noindex = false,
  } = input
  
  // Generate optimized title and description
  const optimizedTitle = generateTitle(title, locale)
  const optimizedDescription = generateDescription(description)
  
  // Generate canonical URL - use path if provided, otherwise canonical, otherwise root
  const canonicalUrl = path
    ? generateCanonicalUrl(path, locale)
    : canonical
    ? generateCanonicalUrl(canonical, locale)
    : generateCanonicalUrl('/', locale)
  
  // Use keywords string directly
  const keywordsString = keywords ? sanitizeMetaContent(keywords) : undefined
  
  // Generate robots directive
  const robots = noindex ? 'noindex, nofollow' : undefined
  
  // Standard viewport for mobile responsiveness
  const viewport = 'width=device-width, initial-scale=1, maximum-scale=5'
  
  // UTF-8 charset
  const charset = 'UTF-8'
  
  // Additional meta tags
  const other: Record<string, string> = {
    'format-detection': 'telephone=no',
  }
  
  // Add language meta tag
  other['language'] = locale
  
  return {
    title: optimizedTitle,
    description: optimizedDescription,
    keywords: keywordsString,
    canonical: canonicalUrl,
    robots,
    viewport,
    charset,
    other,
  }
}
