/**
 * Hreflang Manager Module
 * 
 * Manages language alternate tags for multi-language SEO compliance.
 * Generates hreflang tags for all supported locales with proper x-default handling.
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8
 */

import type { HreflangTag, HreflangInput, Locale } from '@/lib/types/seo'
import { getBaseUrl, getSEOConfig } from './config'
import { makeAbsoluteUrl } from './utils'

/**
 * Generates hreflang tags for a given path and locale
 * Includes tags for all available locales plus x-default pointing to Serbian (sr)
 * 
 * @param input - Hreflang input configuration
 * @returns Array of hreflang tags with absolute URLs
 * 
 * @example
 * generateHreflangTags({ path: '/apartments/studio-1', locale: 'en' })
 * // Returns tags for sr, en, de, it, and x-default
 */
export function generateHreflangTags(input: HreflangInput): HreflangTag[] {
  const { path, locale: _locale, availableLocales } = input
  void _locale // Suppress unused variable warning
  const config = getSEOConfig()
  const baseUrl = getBaseUrl()
  
  // Use provided locales or default to all configured locales
  const locales = availableLocales || config.locales
  
  const tags: HreflangTag[] = []
  
  // Generate hreflang tag for each locale
  for (const targetLocale of locales) {
    const localizedPath = `/${targetLocale}${path}`
    const absoluteUrl = makeAbsoluteUrl(localizedPath, baseUrl)
    
    tags.push({
      hreflang: targetLocale,
      href: absoluteUrl
    })
  }
  
  // Add x-default tag pointing to Serbian (sr) as the default locale
  const defaultPath = `/sr${path}`
  const defaultUrl = makeAbsoluteUrl(defaultPath, baseUrl)
  
  tags.push({
    hreflang: 'x-default',
    href: defaultUrl
  })
  
  return tags
}

/**
 * Gets alternate URLs for all locales for a given path
 * Returns a record mapping each locale to its absolute URL
 * 
 * @param path - The path without locale prefix (e.g., '/apartments/studio-1')
 * @returns Record mapping locale codes to absolute URLs
 * 
 * @example
 * getAlternateUrls('/apartments/studio-1')
 * // Returns: { sr: 'https://...', en: 'https://...', de: '...', it: '...' }
 */
export function getAlternateUrls(path: string): Record<Locale, string> {
  const config = getSEOConfig()
  const baseUrl = getBaseUrl()
  
  const alternates: Record<string, string> = {}
  
  for (const locale of config.locales) {
    const localizedPath = `/${locale}${path}`
    alternates[locale] = makeAbsoluteUrl(localizedPath, baseUrl)
  }
  
  return alternates as Record<Locale, string>
}

/**
 * Gets the self-referential hreflang tag for the current page
 * This tag indicates the language of the current page itself
 * 
 * @param path - The path without locale prefix
 * @param locale - The current locale
 * @returns Hreflang tag for the current page
 * 
 * @example
 * getSelfReferentialTag('/apartments/studio-1', 'en')
 * // Returns: { hreflang: 'en', href: 'https://.../en/apartments/studio-1' }
 */
export function getSelfReferentialTag(path: string, locale: Locale): HreflangTag {
  const baseUrl = getBaseUrl()
  const localizedPath = `/${locale}${path}`
  const absoluteUrl = makeAbsoluteUrl(localizedPath, baseUrl)
  
  return {
    hreflang: locale,
    href: absoluteUrl
  }
}
