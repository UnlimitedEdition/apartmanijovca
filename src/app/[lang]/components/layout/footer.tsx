'use client'

import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { cn } from '../../../../lib/utils'

interface FooterProps {
  className?: string
}

export function Footer({ className }: FooterProps) {
  const t = useTranslations('footer')
  const navT = useTranslations('header')
  const homeT = useTranslations('home')
  const locale = useLocale()
  const currentLang = locale

  return (
    <footer className={cn("border-t py-16 bg-zinc-50 dark:bg-zinc-950", className)}>
      <div className="container px-4 3xl:px-6 4xl:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 3xl:gap-16 4xl:gap-20 mb-12 3xl:mb-16 4xl:mb-20 text-center md:text-left">
          <div className="space-y-4">
            <img 
              src="/images/logo2.png" 
              alt="Apartmani Jovča Logo" 
              className="h-12 w-auto mx-auto md:mx-0"
            />
            <p className="text-muted-foreground font-medium max-w-xs mx-auto md:mx-0">
              {homeT('subtitle')}
            </p>
          </div>
          
          <nav aria-label="Site navigation" className="space-y-4">
            <h2 className="font-black text-sm uppercase tracking-widest text-foreground">{navT('home')}</h2>
            <ul className="flex flex-col gap-3 text-sm font-bold list-none m-0 p-0">
              <li><Link href={`/${currentLang}/apartments`} className="text-muted-foreground hover:text-primary transition-colors">{navT('apartments')}</Link></li>
              <li><Link href={`/${currentLang}/gallery`} className="text-muted-foreground hover:text-primary transition-colors">{navT('gallery')}</Link></li>
              <li><Link href={`/${currentLang}/prices`} className="text-muted-foreground hover:text-primary transition-colors">{navT('prices')}</Link></li>
              <li><Link href={`/${currentLang}/location`} className="text-muted-foreground hover:text-primary transition-colors">{navT('location')}</Link></li>
            </ul>
          </nav>

          <nav aria-label="Contact and legal" className="space-y-4">
            <h2 className="font-black text-sm uppercase tracking-widest text-foreground">{t('contactUs')}</h2>
            <ul className="flex flex-col gap-3 text-sm font-bold list-none m-0 p-0">
              <li><Link href={`/${currentLang}/contact`} className="text-muted-foreground hover:text-primary transition-colors">{navT('contact')}</Link></li>
              <li><Link href={`/${currentLang}/privacy`} className="text-muted-foreground hover:text-primary transition-colors">{t('privacy')}</Link></li>
              <li><Link href={`/${currentLang}/terms`} className="text-muted-foreground hover:text-primary transition-colors">{t('terms')}</Link></li>
            </ul>
          </nav>
        </div>

        <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground font-medium">
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
            <p>© {new Date().getFullYear()} Apartmani Jovča. {t('rights')}.</p>
            <span className="hidden sm:inline text-muted-foreground/30">|</span>
            <a 
              href="https://toske-programer.web.app" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-all group"
              aria-label="Development: Toške"
            >
              <span className="text-xs font-semibold">Development:</span>
              <span className="font-mono font-bold text-indigo-400 group-hover:text-primary transition-colors flex items-center gap-0.5">
                &lt;Toške/&gt;
              </span>
            </a>
          </div>
          <div className="flex gap-4 items-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t('followUs')}:</span>
            <a href="https://instagram.com/apartmanijovca" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Instagram</a>
            <a href="https://facebook.com/apartmanijovca" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Facebook</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
