import { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { supabase } from '../lib/supabase/client'
import { Badge } from '../components/ui/badge'
import { getLocalizedValue } from '@/lib/localization/helpers'
import type { Locale, ApartmentRecord, MultiLanguageText, Json } from '@/lib/types/database'
import { getBaseUrl } from '@/lib/seo/config'
import { generateMetaTags } from '@/lib/seo/meta-generator'
import { generateHreflangTags } from '@/lib/seo/hreflang'
import { generateBreadcrumbSchema } from '@/lib/seo/structured-data'
import { getKeywordsString } from '@/lib/seo/keywords'

interface PageProps {
  params: Promise<{ lang: string }>
}

export async function generateMetadata({ params: paramsInput }: PageProps): Promise<Metadata> {
  const params = await paramsInput
  const locale = params.lang as Locale
  const t = await getTranslations({ locale, namespace: 'seo' })
  const baseUrl = getBaseUrl()

  const metaTags = generateMetaTags({
    title: t('apartments.title'),
    description: t('apartments.description'),
    keywords: getKeywordsString('apartment-list', locale),
    path: `/${locale}/apartments`,
    locale,
    type: 'website'
  })

  const hreflangTags = generateHreflangTags({
    path: '/apartments',
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
      title: t('apartments.title'),
      description: t('apartments.description'),
      url: `${baseUrl}/${locale}/apartments`,
      type: 'website',
      locale,
      siteName: 'Apartmani Jovča',
      images: [{
        url: `${baseUrl}/images/background.jpg`,
        alt: t('apartments.ogImageAlt')
      }]
    },
    twitter: {
      card: 'summary_large_image',
      title: t('apartments.title'),
      description: t('apartments.description'),
      images: [`${baseUrl}/images/background.jpg`]
    },
  }
}

export default async function ApartmentsPage({ params: paramsInput }: PageProps) {
  const params = await paramsInput
  const t = await getTranslations({ locale: params.lang, namespace: 'apartments' })
  const locale = params.lang as Locale

  const { data: apartments } = await supabase
    ?.from('apartments')
    .select('*')
    .eq('status', 'active')
    .order('base_price_eur', { ascending: true }) || { data: [] }

  const localizedApartments = apartments?.map((apartment: ApartmentRecord) => {
    let imageUrls: string[] = []
    if (Array.isArray(apartment.images)) {
      imageUrls = apartment.images.map((img: Json) => {
        if (typeof img === 'object' && img !== null && 'url' in img) {
          return (img as { url: string }).url
        }
        if (typeof img === 'string') {
          return img
        }
        return ''
      }).filter(Boolean)
    }

    return {
      ...apartment,
      slug: apartment.slug as string | null,
      name: getLocalizedValue(apartment.name as unknown as MultiLanguageText, locale),
      description: getLocalizedValue(apartment.description as unknown as MultiLanguageText, locale),
      bed_type: getLocalizedValue(apartment.bed_type as unknown as MultiLanguageText, locale),
      images: imageUrls
    }
  })

  const breadcrumbSchema = generateBreadcrumbSchema('/apartments', locale)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, '\\u003c') }}
      />
      <div className="min-h-screen">
      {/* Page Hero */}
      <div className="py-20 text-center px-4 stagger-fade-in">
        <h1
          className="font-extrabold text-white text-shadow-strong mb-4"
          style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
        >
          {t('title')}
        </h1>
        <p className="text-white/90 text-shadow-medium text-lg max-w-2xl mx-auto">
          {t('description')}
        </p>
      </div>

      {/* Cards */}
      <div className="container pb-16 px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4 gap-6 lg:gap-8">
          {localizedApartments?.map((apartment: typeof localizedApartments[0]) => {
            const firstImage = Array.isArray(apartment.images) && apartment.images.length > 0
              ? apartment.images[0]
              : 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80'

            return (
              <div
                key={apartment.id}
                className="bg-white/85 backdrop-blur-md rounded-2xl shadow-lg border border-white/40 overflow-hidden flex flex-col group hover:-translate-y-1 transition-all duration-300"
              >
                {/* Image */}
                <Link href={`/${params.lang}/apartments/${apartment.slug}`} className="relative aspect-[16/10] overflow-hidden block">
                  <Badge className="absolute top-3 left-3 z-10 bg-primary/90 backdrop-blur text-primary-foreground border-0 shadow-lg px-2 py-0.5 text-[10px] font-bold">
                    {t('available')}
                  </Badge>
                  <div className="absolute top-3 right-3 z-10 bg-white/95 backdrop-blur px-3 py-1 rounded-full text-xs font-black shadow-lg text-foreground">
                    €{apartment.base_price_eur}
                    <span className="text-muted-foreground font-medium text-[10px]"> / {t('perNight')}</span>
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={firstImage}
                    alt={apartment.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </Link>

                {/* Content */}
                <div className="p-5 flex flex-col flex-grow">
                  <Link href={`/${params.lang}/apartments/${apartment.slug}`}>
                    <h2 className="text-lg font-black tracking-tight text-foreground hover:text-primary transition-colors mb-1">
                      {apartment.name}
                    </h2>
                  </Link>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-snug">
                    {apartment.description || t('description')}
                  </p>

                  {/* Quick stats */}
                  <div className="flex items-center gap-4 text-xs font-bold text-zinc-600 mb-4 bg-zinc-50 p-2.5 rounded-xl">
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>{apartment.capacity} {t('guests')}</span>
                    </div>
                    <div className="flex items-center gap-1.5 border-l pl-4 border-zinc-200">
                      <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      <span>{Math.ceil(apartment.capacity / 2) || 1} {t('bedroomsShort')}</span>
                    </div>
                  </div>

                  {/* Amenity badges */}
                  <div className="mb-5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 mb-1.5">{t('amenities')}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { id: 'WiFi', key: 'amenitiesWiFi' },
                        { id: 'AC', key: 'amenitiesAC' },
                        { id: 'Kitchen', key: 'amenitiesKitchen' },
                        { id: 'TV', key: 'amenitiesTV' }
                      ].map((amenity) => (
                        <Badge key={amenity.id} variant="secondary" className="px-2 py-0.5 rounded-lg text-[10px] font-bold">
                          {t(amenity.key)}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* CTAs */}
                  <div className="flex gap-2 mt-auto">
                    <Link href={`/${params.lang}/apartments/${apartment.slug}`} className="flex-1">
                      <button className="cta-pill secondary w-full text-sm py-2.5">
                        {t('viewDetails') || 'Detalji'}
                      </button>
                    </Link>
                    <Link href={`/${params.lang}/booking?apartment=${apartment.slug}`} className="flex-1">
                      <button className="cta-pill primary w-full text-sm py-2.5">
                        {t('bookNow')}
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {(!localizedApartments || localizedApartments.length === 0) && (
          <div className="text-center py-20 bg-white/85 backdrop-blur-md rounded-2xl border border-white/40 shadow-lg">
            <h2 className="text-xl font-bold mb-2 text-foreground">{t('noApartments.title')}</h2>
            <p className="text-muted-foreground">{t('noApartments.message')}</p>
          </div>
        )}
      </div>
    </div>
    </>
  )
}
