// src/lib/localization/helpers.ts

import type { Locale, MultiLanguageText, PartialMultiLanguageText, Json } from '../types/database'

// Re-export types for convenience
export type { Locale, MultiLanguageText, PartialMultiLanguageText } from '../types/database'

/**
 * Extract localized value from multi-language JSONB object
 * 
 * Fallback chain: requested locale → 'sr' → first available → empty string
 * 
 * @param value - Multi-language object or null/undefined
 * @param locale - Requested locale
 * @returns Localized string value
 */
export function getLocalizedValue(
  value: MultiLanguageText | null | undefined,
  locale: Locale
): string {
  // Handle null/undefined
  if (!value || typeof value !== 'object') {
    return ''
  }

  // Try requested locale
  if (value[locale]) {
    return value[locale]
  }

  // Fallback to Serbian
  if (value.sr) {
    console.warn(`Missing translation for locale '${locale}', falling back to 'sr'`)
    return value.sr
  }

  // Fallback to first available language
  const availableLanguages = Object.keys(value) as Locale[]
  if (availableLanguages.length > 0) {
    const firstLang = availableLanguages[0]
    console.warn(`Missing 'sr' fallback, using '${firstLang}'`)
    return value[firstLang]
  }

  // Last resort: empty string
  console.error('Multi-language object has no translations')
  return ''
}

/**
 * Create multi-language object from single value
 * 
 * @param value - Text value
 * @param locale - Language of the value
 * @returns Multi-language object with value set for specified locale
 */
export function createMultiLanguageText(
  value: string,
  locale: Locale
): PartialMultiLanguageText {
  return {
    [locale]: value
  }
}

/**
 * Validate multi-language object has all required language keys
 * 
 * @param value - Multi-language object to validate
 * @returns True if all languages present, false otherwise
 */
export function isCompleteMultiLanguageText(
  value: unknown
): value is MultiLanguageText {
  if (!value || typeof value !== 'object') {
    return false
  }

  const requiredLanguages: Locale[] = ['sr', 'en', 'de', 'it']
  const obj = value as Record<string, unknown>

  return requiredLanguages.every(lang => 
    typeof obj[lang] === 'string' && obj[lang].length > 0
  )
}

/**
 * Merge partial multi-language update with existing data (handles Json type)
 * 
 * @param existing - Current multi-language object (Json type from database)
 * @param update - Partial update
 * @returns Merged multi-language object as Json
 */
export function mergeMultiLanguageText(
  existing: Json,
  update: PartialMultiLanguageText
): Json {
  // Convert existing Json to MultiLanguageText if it's an object
  const existingObj = (existing && typeof existing === 'object' && !Array.isArray(existing)) 
    ? existing as Record<string, unknown>
    : {}
  
  return {
    ...existingObj,
    ...update
  } as Json
}

/**
 * Get missing languages from multi-language object
 * 
 * @param value - Multi-language object
 * @returns Array of missing language codes
 */
export function getMissingLanguages(
  value: PartialMultiLanguageText
): Locale[] {
  const requiredLanguages: Locale[] = ['sr', 'en', 'de', 'it']
  return requiredLanguages.filter(lang => !value[lang])
}
