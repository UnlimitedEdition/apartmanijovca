import { Metadata } from 'next'
import { getBaseUrl } from '@/lib/seo/config'
import { generateMetaTags } from '@/lib/seo/meta-generator'
import { generateHreflangTags } from '@/lib/seo/hreflang'
import { generateBreadcrumbSchema } from '@/lib/seo/structured-data'
import { getKeywordsString } from '@/lib/seo/keywords'
import { Locale } from '@/lib/types/database'
import BookingFlow from './BookingFlow'

interface PageProps {
  params: Promise<{ lang: string }>
}

const BOOKING_TITLES: Record<string, string> = {
  sr: 'Rezervišite apartman na Bovanskom jezeru | Apartmani Jovča',
  en: 'Book an Apartment at Bovan Lake | Apartments Jovča',
  de: 'Ferienwohnung am Bovan See buchen | Apartments Jovča',
  it: 'Prenota un Appartamento al Lago Bovan | Apartments Jovča',
}

const BOOKING_DESCRIPTIONS: Record<string, string> = {
  sr: 'Rezervišite apartman na Bovanskom jezeru jednostavno i brzo. Proverite dostupnost i odaberite termin koji vam odgovara.',
  en: 'Book your apartment at Bovan Lake easily and quickly. Check availability and choose dates that suit you.',
  de: 'Buchen Sie Ihre Ferienwohnung am Bovan See einfach und schnell. Verfügbarkeit prüfen und Ihren Wunschtermin wählen.',
  it: 'Prenota il tuo appartamento al Lago Bovan in modo semplice e veloce. Controlla la disponibilità e scegli le date che preferisci.',
}

const BOOKING_OG_ALT: Record<string, string> = {
  sr: 'Rezervacija apartmana na Bovanskom jezeru',
  en: 'Booking apartments at Bovan Lake',
  de: 'Ferienwohnung buchen am Bovan See',
  it: 'Prenotazione appartamento al Lago Bovan',
}

export async function generateMetadata({ params: paramsInput }: PageProps): Promise<Metadata> {
  const params = await paramsInput
  const locale = params.lang as Locale
  const baseUrl = getBaseUrl()

  const title = BOOKING_TITLES[locale] ?? BOOKING_TITLES.sr
  const description = BOOKING_DESCRIPTIONS[locale] ?? BOOKING_DESCRIPTIONS.sr
  const ogAlt = BOOKING_OG_ALT[locale] ?? BOOKING_OG_ALT.sr

  const metaTags = generateMetaTags({
    title,
    description,
    keywords: getKeywordsString('contact', locale),
    path: `/${locale}/booking`,
    locale,
    type: 'website'
  })

  const hreflangTags = generateHreflangTags({
    path: '/booking',
    locale
  })

  return {
    title: metaTags.title,
    description: metaTags.description,
    keywords: metaTags.keywords,
    robots: metaTags.robots,
    alternates: {
      canonical: metaTags.canonical,
      languages: hreflangTags.reduce((acc, tag) => {
        acc[tag.hreflang] = tag.href
        return acc
      }, {} as Record<string, string>)
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}/booking`,
      type: 'website',
      locale,
      siteName: 'Apartmani Jovča',
      images: [{
        url: `${baseUrl}/images/background.jpg`,
        alt: ogAlt
      }]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${baseUrl}/images/background.jpg`]
    },
  }
}

export default async function BookingPage({ params: paramsInput }: PageProps) {
  const params = await paramsInput
  const locale = params.lang as Locale
  const breadcrumbSchema = generateBreadcrumbSchema('/booking', locale)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, '\\u003c') }}
      />
      <BookingFlow />
    </>
  )
}
