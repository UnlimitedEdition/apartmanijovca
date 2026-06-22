import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { supabase } from '../lib/supabase/client'
import { AvailabilityBadge } from './AvailabilityBadge'
import { getLocalizedValue } from '@/lib/localization/helpers'
import type { Locale, ApartmentRecord, MultiLanguageText, Json } from '@/lib/types/database'
import { getBaseUrl } from '@/lib/seo/config'
import { generateMetaTags } from '@/lib/seo/meta-generator'
import { generateHreflangTags } from '@/lib/seo/hreflang'
import { generateBreadcrumbSchema } from '@/lib/seo/structured-data'
import { getKeywordsString } from '@/lib/seo/keywords'
import { getPublishedSectionContent, getContentText } from '@/lib/content/public-content'
import { AMENITY_OPTIONS, getAmenityIconLabel } from '@/lib/apartment-options'
import { pluralizeGuests, pluralizeBeds, pluralizeBathrooms } from '@/lib/utils'

interface PageProps {
  params: Promise<{ lang: string }>
}

function getTotalBeds(bedCounts: ApartmentRecord['bed_counts']): number {
  if (!bedCounts || typeof bedCounts !== 'object' || Array.isArray(bedCounts)) return 0

  return Object.values(bedCounts as Record<string, unknown>).reduce<number>((total, value) => {
    return total + (typeof value === 'number' ? value : 0)
  }, 0)
}

function getVisibleAmenityIds(apartment: ApartmentRecord): string[] {
  return (apartment.selected_amenities || []).filter((amenityId) => {
    return amenityId !== 'balcony' || apartment.balcony === true
  })
}

// ISR — lista apartmana se prerenderuje i kešira na CDN-u (revalidate 1h).
export const revalidate = 3600

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
  const content = await getPublishedSectionContent('apartments', locale)
  const pageText = (key: string) => getContentText(content, key, t(key))

  const { data: apartments } = await supabase
    ?.from('apartments')
    .select('*')
    .eq('status', 'active')
    .order('display_order', { ascending: true })
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
          {pageText('title')}
        </h1>
        <p className="text-white/90 text-shadow-medium text-lg max-w-2xl mx-auto">
          {pageText('description')}
        </p>
      </div>

      {/* Cards */}
      <div className="container pb-16 px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4 gap-6 lg:gap-8">
          {localizedApartments?.map((apartment: typeof localizedApartments[0]) => {
            const firstImage = Array.isArray(apartment.images) && apartment.images.length > 0
              ? apartment.images[0]
              : 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80'

            const visibleAmenityIds = getVisibleAmenityIds(apartment)

            return (
              <div
                key={apartment.id}
                className="bg-white/85 backdrop-blur-md rounded-2xl shadow-lg border border-white/40 overflow-hidden flex flex-col group hover:-translate-y-1 transition-all duration-300"
              >
                {/* Image */}
                <Link href={`/${params.lang}/apartments/${apartment.slug}`} className="relative aspect-[16/10] overflow-hidden block">
                  <AvailabilityBadge
                    apartmentId={apartment.id}
                    availableLabel={t('available')}
                    bookedLabel={t('booked')}
                  />
                  <div className="absolute top-3 right-3 z-10 bg-white/95 backdrop-blur px-3 py-1 rounded-full text-xs font-black shadow-lg text-foreground">
                    €{apartment.base_price_eur}
                    <span className="text-muted-foreground font-medium text-[10px]"> / {t('perNight')}</span>
                  </div>
                  <Image
                    src={firstImage}
                    alt={apartment.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
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

                  {/* Detailed stats */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4 rounded-xl bg-zinc-50/90 p-2.5 text-xs text-zinc-700">
                    <div className="flex items-center gap-1.5">
                      <span className="text-zinc-500">👥</span>
                      <span className="font-semibold">{pluralizeGuests(apartment.capacity)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-zinc-500">📐</span>
                      <span className="font-semibold">{apartment.size_sqm ? apartment.size_sqm + 'm²' : 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-zinc-500">🛏️</span>
                      <span className="font-semibold">{getTotalBeds(apartment.bed_counts) > 0 ? pluralizeBeds(getTotalBeds(apartment.bed_counts)) : apartment.bed_type}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-zinc-500">🚿</span>
                      <span className="font-semibold">{pluralizeBathrooms(apartment.bathroom_count || 1)}</span>
                    </div>
                    {apartment.floor !== null && apartment.floor !== undefined && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-zinc-500">🏢</span>
                        <span className="font-semibold">Sprat {apartment.floor}</span>
                      </div>
                    )}
                    {apartment.balcony === true && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-zinc-500">🌿</span>
                        <span className="font-semibold">Balkon</span>
                      </div>
                    )}
                  </div>

                  {/* Amenity badges */}
                  {visibleAmenityIds.length > 0 && (
                    <div className="mb-5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 mb-1.5">{t('amenities')}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {visibleAmenityIds.slice(0, 4).map((amenityId) => {
                          const amenity = AMENITY_OPTIONS.find((item) => item.id === amenityId)
                          return amenity ? (
                            <span key={amenityId} className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-semibold">
                              <span aria-hidden="true">{getAmenityIconLabel(amenityId)}</span>
                              <span>{amenity.label.sr}</span>
                            </span>
                          ) : null
                        })}
                        {visibleAmenityIds.length > 4 && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-semibold">
                            +{visibleAmenityIds.length - 4}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* CTAs */}
                  <div className="flex gap-2 mt-auto">
                    <Link href={`/${params.lang}/apartments/${apartment.slug}`} className="flex-1">
                      <button className="w-full rounded-full bg-zinc-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-zinc-800">
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
