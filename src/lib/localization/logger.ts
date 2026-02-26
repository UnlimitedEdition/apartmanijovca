// src/lib/localization/logger.ts

import type { Locale } from '../types/database'

export function logMissingTranslation(
  field: string,
  requestedLocale: Locale,
  fallbackLocale: Locale
): void {
  console.warn('[Localization]', {
    type: 'MISSING_TRANSLATION',
    field,
    requestedLocale,
    fallbackLocale,
    timestamp: new Date().toISOString()
  })
}

export function logInvalidStructure(
  field: string,
  value: unknown
): void {
  console.error('[Localization]', {
    type: 'INVALID_STRUCTURE',
    field,
    value,
    timestamp: new Date().toISOString()
  })
}
