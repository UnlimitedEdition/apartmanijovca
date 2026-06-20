'use client'

import { useEffect } from 'react'

/**
 * Postavlja `<html lang>` po aktivnom locale-u.
 *
 * Root `<html lang="sr">` je u `app/layout.tsx` (iznad `[lang]` segmenta), pa se
 * ne može SSR-ovati po jeziku bez rizičnog refaktora root layout-a (font/theme/
 * analytics/background + admin/portal zavise od njega). Googlebot i moderni
 * crawler-i renderuju JS, pa je klijentsko postavljanje `lang` dovoljno da svaka
 * jezička verzija prijavi tačan jezik (SEO + a11y/screen readeri).
 */
export default function HtmlLang({ lang }: { lang: string }) {
  useEffect(() => {
    if (lang && typeof document !== 'undefined') {
      document.documentElement.lang = lang
    }
  }, [lang])

  return null
}
