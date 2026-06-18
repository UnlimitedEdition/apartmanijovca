export type { FAQItem, GuideSection, GuideContent } from './types'

import type { Locale } from '@/lib/types/database'
import type { GuideContent } from './types'
import sr from './sr'
import en from './en'
import de from './de'
import it from './it'

export const guides: Record<Locale, GuideContent> = { sr, en, de, it }

export function getGuide(locale: Locale): GuideContent {
  return guides[locale] ?? guides.sr
}
