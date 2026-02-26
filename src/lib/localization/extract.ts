// src/lib/localization/extract.ts

import type { NextRequest } from 'next/server'
import type { Locale } from '../types/database'

const VALID_LOCALES: Locale[] = ['sr', 'en', 'de', 'it']
const DEFAULT_LOCALE: Locale = 'sr'

/**
 * Extract locale from Next.js request
 * 
 * Priority: query param → header → cookie → default
 * 
 * @param request - Next.js request object
 * @returns Valid locale
 */
export function extractLocale(request: NextRequest): Locale {
  // Try query parameter
  const queryLocale = request.nextUrl.searchParams.get('locale') || 
                      request.nextUrl.searchParams.get('lang')
  if (queryLocale && isValidLocale(queryLocale)) {
    return queryLocale
  }

  // Try Accept-Language header
  const acceptLanguage = request.headers.get('accept-language')
  if (acceptLanguage) {
    const locale = parseAcceptLanguage(acceptLanguage)
    if (locale) {
      return locale
    }
  }

  // Try cookie
  const cookieLocale = request.cookies.get('locale')?.value
  if (cookieLocale && isValidLocale(cookieLocale)) {
    return cookieLocale
  }

  // Default
  return DEFAULT_LOCALE
}

/**
 * Check if string is valid locale
 */
function isValidLocale(value: string): value is Locale {
  return VALID_LOCALES.includes(value as Locale)
}

/**
 * Parse Accept-Language header
 */
function parseAcceptLanguage(header: string): Locale | null {
  const languages = header.split(',').map(lang => {
    const [code] = lang.trim().split(';')
    return code.split('-')[0].toLowerCase()
  })

  for (const lang of languages) {
    if (isValidLocale(lang)) {
      return lang
    }
  }

  return null
}
