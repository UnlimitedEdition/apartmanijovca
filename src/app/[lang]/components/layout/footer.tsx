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
      <div className="container px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12 text-center md:text-left">
          <div className="space-y-4">
            <span className="text-3xl font-black tracking-tighter text-primary">JOVČA</span>
            <p className="text-muted-foreground font-medium max-w-xs mx-auto md:mx-0">
              {homeT('subtitle')}
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-black text-sm uppercase tracking-widest text-foreground">{navT('home')}</h4>
            <div className="flex flex-col gap-3 text-sm font-bold">
              <Link href={`/${currentLang}/apartments`} className="text-muted-foreground hover:text-primary transition-colors">{navT('apartments')}</Link>
              <Link href={`/${currentLang}/gallery`} className="text-muted-foreground hover:text-primary transition-colors">{navT('gallery')}</Link>
              <Link href={`/${currentLang}/prices`} className="text-muted-foreground hover:text-primary transition-colors">{navT('prices')}</Link>
              <Link href={`/${currentLang}/location`} className="text-muted-foreground hover:text-primary transition-colors">{navT('location')}</Link>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-black text-sm uppercase tracking-widest text-foreground">{t('contactUs')}</h4>
            <div className="flex flex-col gap-3 text-sm font-bold">
              <Link href={`/${currentLang}/contact`} className="text-muted-foreground hover:text-primary transition-colors">{navT('contact')}</Link>
              <Link href={`/${currentLang}/privacy`} className="text-muted-foreground hover:text-primary transition-colors">{t('privacy')}</Link>
              <Link href={`/${currentLang}/terms`} className="text-muted-foreground hover:text-primary transition-colors">{t('terms')}</Link>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground font-medium">
          <p>© {new Date().getFullYear()} Apartmani Jovča. {t('rights')}.</p>
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
