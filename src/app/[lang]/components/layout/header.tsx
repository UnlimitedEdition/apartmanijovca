'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Phone } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { CONTACT_PHONE } from '@/lib/seo/config'

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
    // Get current path segments
    const segments = pathname.split('/').filter(Boolean)
    const locales = ['en', 'sr', 'de', 'it']

    // Remove current locale from path if it exists
    if (segments.length > 0 && locales.includes(segments[0])) {
      segments.shift()
    }

    // Build new path - ALL languages now use prefix (localePrefix: 'always')
    const newPath = '/' + newLang + (segments.length === 0 ? '' : '/' + segments.join('/'))

    router.push(newPath)
    setMenuOpen(false) // Close mobile menu
  }

  const navigationItems = [
    { label: t('apartments'), href: '/apartments' },
    { label: t('gallery'), href: '/gallery' },
    { label: t('attractions'), href: '/attractions' },
    { label: t('location'), href: '/location' },
    { label: t('contact'), href: '/contact' },
  ]

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-[1000] bg-transparent transition-transform duration-300',
        isVisible ? 'translate-y-0' : '-translate-y-full',
        className
      )}
      style={{ padding: '0 1rem' }}
    >
      {/* nav-container: max-width 1200px centered, flex, ~80px tall via 1rem padding */}
      <div
        className="flex items-center justify-between mx-auto w-full"
        style={{ maxWidth: '1200px', padding: '1rem 0' }}
      >
        {/* Logo */}
        <Link href={'/' + currentLang} className="flex items-center flex-shrink-0 rounded-xl bg-white/15 px-2.5 py-1.5 backdrop-blur-md ring-1 ring-white/20">
          <Image
            src="/images/logo2.png"
            alt="Apartmani Jovča Logo"
            width={1280}
            height={724}
            priority
            sizes="88px"
            className="h-12 w-auto"
            style={{ filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.5))' }}
          />
        </Link>

        {/* Desktop nav links — center */}
        <nav aria-label="Main navigation" className="hidden md:flex">
          <ul className="flex list-none m-0 p-0" style={{ gap: '2rem' }}>
            {navigationItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={getLocalizedHref(item.href)}
                  className={cn(
                    'relative text-white no-underline font-medium',
                    // text-shadow-light equivalent
                    // underline grow animation via after pseudo-element
                    'after:content-[""] after:absolute after:-bottom-1 after:left-0',
                    'after:h-0.5 after:w-0 after:bg-white after:transition-all after:duration-300',
                    'hover:after:w-full'
                  )}
                  style={{
                    fontSize: '1rem',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                  }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Right side: phone CTA + booking + lang switcher + hamburger */}
        <div className="flex items-center" style={{ gap: '0.75rem' }}>
          {/* Phone CTA — blue pill, always visible */}
          <a
            href={`tel:${CONTACT_PHONE.replace(/\s/g, '')}`}
            className="flex items-center gap-1.5 bg-primary text-white rounded-full font-bold shadow-md transition-opacity hover:opacity-90"
            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
            aria-label={`${t('contact')}: ${CONTACT_PHONE}`}
          >
            <Phone className="h-4 w-4 flex-shrink-0" />
            <span className="hidden sm:inline">{CONTACT_PHONE}</span>
            <span className="sm:hidden">Call</span>
          </a>

          {/* Booking button — outline white pill, desktop only */}
          <Link
            href={`/${currentLang}/booking`}
            className="hidden sm:inline-flex items-center border-2 border-white text-white rounded-full font-bold transition-colors hover:bg-white hover:text-primary"
            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
          >
            {t('book')}
          </Link>

          {/* Language select — transparent, white text */}
          <select
            value={currentLang}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="rounded-md bg-transparent text-white font-bold focus:outline-none focus:ring-2 focus:ring-white/50 [&>option]:text-foreground [&>option]:bg-background"
            style={{
              border: '1px solid rgba(255,255,255,0.3)',
              padding: '0.25rem 0.5rem',
              fontSize: '0.75rem',
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
            }}
            aria-label="Select language"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>

          {/* Hamburger — mobile only, 3 white bars */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex flex-col justify-center items-center rounded transition-colors hover:bg-white/10"
            style={{
              width: '44px',
              height: '44px',
              padding: '10px',
              gap: '4px',
              cursor: 'pointer',
              border: 'none',
              background: 'transparent',
            }}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              // X icon when open — two rotated bars
              <>
                <span
                  style={{
                    display: 'block',
                    width: '24px',
                    height: '2px',
                    background: 'white',
                    borderRadius: '2px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                    transform: 'rotate(45deg) translate(4px, 4px)',
                    transition: 'all 0.3s ease',
                  }}
                />
                <span
                  style={{
                    display: 'block',
                    width: '24px',
                    height: '2px',
                    background: 'white',
                    borderRadius: '2px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                    opacity: 0,
                    transition: 'all 0.3s ease',
                  }}
                />
                <span
                  style={{
                    display: 'block',
                    width: '24px',
                    height: '2px',
                    background: 'white',
                    borderRadius: '2px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                    transform: 'rotate(-45deg) translate(6px, -6px)',
                    transition: 'all 0.3s ease',
                  }}
                />
              </>
            ) : (
              // 3 bars when closed
              <>
                <span
                  style={{
                    display: 'block',
                    width: '24px',
                    height: '2px',
                    background: 'white',
                    borderRadius: '2px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                    transition: 'all 0.3s ease',
                  }}
                />
                <span
                  style={{
                    display: 'block',
                    width: '24px',
                    height: '2px',
                    background: 'white',
                    borderRadius: '2px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                    transition: 'all 0.3s ease',
                  }}
                />
                <span
                  style={{
                    display: 'block',
                    width: '24px',
                    height: '2px',
                    background: 'white',
                    borderRadius: '2px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                    transition: 'all 0.3s ease',
                  }}
                />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mobile fullscreen overlay menu */}
      {menuOpen && (
        <div
          className="absolute top-full left-0 right-0 md:hidden"
          style={{
            background: 'rgba(0,0,0,0.9)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            zIndex: 1000,
          }}
        >
          <nav aria-label="Mobile navigation">
            <ul className="flex flex-col list-none m-0 p-0">
              {navigationItems.map((item) => (
                <li
                  key={item.href}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <Link
                    href={getLocalizedHref(item.href)}
                    onClick={() => setMenuOpen(false)}
                    className="block w-full text-white font-bold text-center transition-colors hover:bg-white/10"
                    style={{
                      fontSize: '1.125rem',
                      padding: '0.75rem 1rem',
                      textDecoration: 'none',
                    }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              {/* Booking CTA in mobile menu */}
              <li className="p-4">
                <Link
                  href={`/${currentLang}/booking`}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center w-full bg-primary text-white rounded-full font-bold shadow-md hover:opacity-90 transition-opacity"
                  style={{ padding: '0.75rem 1rem', fontSize: '1rem' }}
                >
                  {t('book')}
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  )
}
