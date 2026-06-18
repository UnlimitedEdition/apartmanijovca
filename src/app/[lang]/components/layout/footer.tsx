'use client'

import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { cn } from '../../../../lib/utils'

interface FooterProps {
  className?: string
}

const guideLabel = {
  sr: 'Vodič za Bovansko jezero',
  en: 'Bovan Lake Travel Guide',
  de: 'Reiseführer Bovan-See',
  it: 'Guida al Lago Bovan',
}

export function Footer({ className }: FooterProps) {
  const t = useTranslations('footer')
  const navT = useTranslations('header')
  const locale = useLocale()
  const currentLang = locale

  return (
    <footer
      className={cn(
        'bg-gray-800/80 backdrop-blur-sm text-slate-50 py-8 px-4 mt-16 text-center',
        className
      )}
    >
      <div className="mx-auto max-w-5xl space-y-3">
        {/* Copyright */}
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Apartmani Jovča. {t('rights')}.
        </p>

        {/* Nav links — horizontal row separated by | */}
        <nav aria-label="Footer navigation">
          <ul className="flex flex-wrap justify-center gap-x-2 gap-y-1 text-sm list-none m-0 p-0">
            <li>
              <Link
                href={`/${currentLang}/apartments`}
                className="underline text-slate-50 hover:text-blue-400 transition-colors"
              >
                {navT('apartments')}
              </Link>
            </li>
            <li className="text-slate-50/40 select-none">|</li>
            <li>
              <Link
                href={`/${currentLang}/gallery`}
                className="underline text-slate-50 hover:text-blue-400 transition-colors"
              >
                {navT('gallery')}
              </Link>
            </li>
            <li className="text-slate-50/40 select-none">|</li>
            <li>
              <Link
                href={`/${currentLang}/attractions`}
                className="underline text-slate-50 hover:text-blue-400 transition-colors"
              >
                {navT('attractions')}
              </Link>
            </li>
            <li className="text-slate-50/40 select-none">|</li>
            <li>
              <Link
                href={`/${currentLang}/prices`}
                className="underline text-slate-50 hover:text-blue-400 transition-colors"
              >
                {navT('prices')}
              </Link>
            </li>
            <li className="text-slate-50/40 select-none">|</li>
            <li>
              <Link
                href={`/${currentLang}/location`}
                className="underline text-slate-50 hover:text-blue-400 transition-colors"
              >
                {navT('location')}
              </Link>
            </li>
            <li className="text-slate-50/40 select-none">|</li>
            <li>
              <Link
                href={`/${currentLang}/contact`}
                className="underline text-slate-50 hover:text-blue-400 transition-colors"
              >
                {navT('contact')}
              </Link>
            </li>
            <li className="text-slate-50/40 select-none">|</li>
            <li>
              <Link
                href={`/${currentLang}/guide`}
                className="underline text-slate-50 hover:text-blue-400 transition-colors"
              >
                {guideLabel[currentLang as keyof typeof guideLabel] ?? guideLabel.sr}
              </Link>
            </li>
            <li className="text-slate-50/40 select-none">|</li>
            <li>
              <Link
                href={`/${currentLang}/privacy`}
                className="underline text-slate-50 hover:text-blue-400 transition-colors"
              >
                {t('privacy')}
              </Link>
            </li>
            <li className="text-slate-50/40 select-none">|</li>
            <li>
              <Link
                href={`/${currentLang}/terms`}
                className="underline text-slate-50 hover:text-blue-400 transition-colors"
              >
                {t('terms')}
              </Link>
            </li>
          </ul>
        </nav>

        {/* Social + dev credit */}
        <p className="text-xs text-slate-300 flex flex-wrap justify-center items-center gap-x-2 gap-y-1">
          <a
            href="https://instagram.com/apartmanijovca"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-blue-400 transition-colors"
          >
            Instagram
          </a>
          <span className="text-slate-50/40 select-none">|</span>
          <a
            href="https://facebook.com/apartmanijovca"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-blue-400 transition-colors"
          >
            Facebook
          </a>
          <span className="text-slate-50/40 select-none">|</span>
          <a
            href="https://toske-programer.web.app"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-400 transition-colors"
            aria-label="Development: Toške"
          >
            Development:{' '}
            <span className="font-mono text-indigo-300">&lt;Toške/&gt;</span>
          </a>
        </p>
      </div>
    </footer>
  )
}
