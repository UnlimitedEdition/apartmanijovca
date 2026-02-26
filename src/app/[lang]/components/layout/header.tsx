'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, Phone } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { Button } from '@/app/[lang]/components/ui/button'
import { cn } from '@/lib/utils'

interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  const t = useTranslations('header')
  const langT = useTranslations('language')
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  
  // Use locale from next-intl instead of manual parsing
  const currentLang = locale

  // Scroll behavior: hide on scroll down, show on scroll up
  useEffect(() => {
    const controlHeader = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY < 10) {
        // Always show header at top of page
        setIsVisible(true)
      } else if (currentScrollY > lastScrollY) {
        // Scrolling down - hide header
        setIsVisible(false)
        setMenuOpen(false) // Close mobile menu when hiding
      } else {
        // Scrolling up - show header
        setIsVisible(true)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', controlHeader)
    return () => window.removeEventListener('scroll', controlHeader)
  }, [lastScrollY])

  const languages = [
    { code: 'sr', name: langT('sr') },
    { code: 'en', name: langT('en') },
    { code: 'de', name: langT('de') },
    { code: 'it', name: langT('it') },
  ]

  const getLocalizedHref = (href: string) => {
    // All languages now use prefix (localePrefix: 'always')
    return `/${currentLang}${href}`
  }

  const handleLanguageChange = (newLang: string) => {
    console.log('🌍 Language change requested:', { from: currentLang, to: newLang, pathname })
    
    // Get current path segments
    const segments = pathname.split('/').filter(Boolean)
    const locales = ['en', 'sr', 'de', 'it']
    
    // Remove current locale from path if it exists
    if (segments.length > 0 && locales.includes(segments[0])) {
      console.log('  Removing locale from path:', segments[0])
      segments.shift()
    }
    
    // Build new path - ALL languages now use prefix (localePrefix: 'always')
    const newPath = '/' + newLang + (segments.length === 0 ? '' : '/' + segments.join('/'))
    console.log('  New path with locale prefix:', newPath)
    
    router.push(newPath)
    setMenuOpen(false) // Close mobile menu
  }

  const navigationItems = [
    { label: t('apartments'), href: '/apartments' },
    { label: t('gallery'), href: '/gallery' },
    { label: t('location'), href: '/location' },
    { label: t('contact'), href: '/contact' },
  ]

  return (
    <header 
      className={cn(
        "sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-transform duration-300",
        isVisible ? "translate-y-0" : "-translate-y-full",
        className
      )}
    >
      <div className="container flex h-14 sm:h-16 lg:h-20 items-center justify-between px-3 sm:px-4">
        <div className="flex items-center gap-4 sm:gap-6 lg:gap-8">
          <Link href={`/${currentLang}`} className="flex items-center space-x-2">
            <span className="text-lg sm:text-xl lg:text-2xl font-black tracking-tighter text-primary">JOVČA</span>
          </Link>
          <nav className="hidden md:flex gap-3 lg:gap-6">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={getLocalizedHref(item.href)}
                className="text-xs lg:text-sm font-bold text-muted-foreground transition-colors hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Phone Call Button - Critical for conversion */}
            <a
              href="tel:+381652378080"
              className="flex items-center gap-1 sm:gap-2 bg-primary hover:opacity-90 text-primary-foreground px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs lg:text-sm font-bold transition-all shadow-md hover:scale-105"
              aria-label={t('contact')}
            >
              <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden lg:inline mr-1">{t('contact')}:</span>
              <span className="hidden sm:inline">+381 65 237 8080</span>
              <span className="sm:hidden">Call</span>
            </a>

            <Link href={`/${currentLang}/booking`}>
              <Button variant="outline" size="sm" className="hidden sm:flex border-primary text-primary hover:bg-primary/10">
                {t('book')}
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={currentLang}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="rounded-md border border-input bg-background px-2 py-1 text-xs font-bold ring-offset-background focus:ring-2 focus:ring-ring"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
            
            {/* Theme toggle removed for better conversion focus */}

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden h-8 w-8"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="absolute top-20 left-0 right-0 bg-background border-b md:hidden z-50 animate-in slide-in-from-top duration-300">
          <nav className="flex flex-col space-y-4 p-6">
            {navigationItems.map((item) => (
              <Link 
                key={item.href}
                href={getLocalizedHref(item.href)} 
                onClick={() => setMenuOpen(false)}
                className="text-lg font-bold text-foreground hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <Link href={`/${currentLang}/booking`} onClick={() => setMenuOpen(false)}>
              <Button className="w-full bg-primary text-primary-foreground font-bold">{t('book')}</Button>
            </Link>
          </nav>
        </div>
      )}
    </header>

  )
}
