'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface LanguageSwitcherProps {
  className?: string
}

const LANGUAGES = [
  { code: 'sr', label: 'SR' },
  { code: 'en', label: 'EN' },
  { code: 'de', label: 'DE' },
  { code: 'it', label: 'IT' },
]

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const pathname = usePathname()

  // Derive current locale from pathname: /sr/... → 'sr'
  const segments = pathname?.split('/').filter(Boolean) ?? []
  const currentLang = LANGUAGES.some(l => l.code === segments[0]) ? segments[0] : 'sr'

  // Build destination path: swap locale segment
  const buildPath = (lang: string) => {
    if (!segments.length) return `/${lang}`
    const rest = LANGUAGES.some(l => l.code === segments[0]) ? segments.slice(1) : segments
    return `/${lang}${rest.length ? '/' + rest.join('/') : ''}`
  }

  return (
    <nav
      className={cn('flex items-center gap-1', className)}
      aria-label="Odabir jezika"
    >
      {LANGUAGES.map((lang, index) => (
        <span key={lang.code} className="flex items-center">
          {index > 0 && (
            <span
              className="text-white/50 select-none mx-1 text-shadow-light"
              aria-hidden="true"
            >
              |
            </span>
          )}
          {currentLang === lang.code ? (
            <span
              className="text-white font-bold underline underline-offset-2 text-sm text-shadow-light cursor-default"
              aria-current="true"
            >
              {lang.label}
            </span>
          ) : (
            <Link
              href={buildPath(lang.code)}
              className="text-white/80 hover:text-white text-sm text-shadow-light transition-colors duration-150"
              hrefLang={lang.code}
            >
              {lang.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  )
}
