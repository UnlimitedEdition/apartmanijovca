import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { supabase } from '../lib/supabase/client'
import { getLocalizedValue } from '@/lib/localization/helpers'
import { Locale, ApartmentRecord, MultiLanguageText, Json } from '@/lib/types/database'
import { getBaseUrl } from '@/lib/seo/config'
import { generateMetaTags } from '@/lib/seo/meta-generator'
import { generateHreflangTags } from '@/lib/seo/hreflang'
import { generateOpenGraphTags, generateTwitterCardTags } from '@/lib/seo/social-media'
import { convertTwitterToMetadata } from '@/lib/seo/metadata-adapter'
import { generateBreadcrumbSchema } from '@/lib/seo/structured-data'
import { getKeywordsString } from '@/lib/seo/keywords'
import { getPublishedSectionContent, getContentText } from '@/lib/content/public-content'
import { AMENITY_OPTIONS } from '@/lib/apartment-options'
import { pluralizeGuests, pluralizeBeds, pluralizeBathrooms } from '@/lib/utils'

interface PageProps {
  params: Promise<{ lang: string }>
}

function getApartmentImages(images: Json): string[] {
  if (!Array.isArray(images)) return []

  return images
    .map((image) => {
      if (typeof image === 'string') return image
      if (image && typeof image === 'object' && 'url' in image) {
        const url = (image as { url?: unknown }).url
        return typeof url === 'string' ? url : ''
      }
      return ''
    })
    .filter(Boolean)
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

export async function generateMetadata({ params: paramsInput }: PageProps): Promise<Metadata> {
  const params = await paramsInput
  const locale = params.lang as Locale
  const t = await getTranslations({ locale, namespace: 'seo' })
  const baseUrl = getBaseUrl()

  const metaTags = generateMetaTags({
    title: t('prices.title'),
    description: t('prices.description'),
    keywords: getKeywordsString('prices', locale),
    path: `/${locale}/prices`,
    locale,
    type: 'website'
  })

  const hreflangTags = generateHreflangTags({
    path: '/prices',
    locale
  })

  generateOpenGraphTags({
    title: t('prices.title'),
    description: t('prices.description'),
    url: `${baseUrl}/${locale}/prices`,
    type: 'website',
    locale,
    siteName: 'Apartmani Jovča',
    images: [{
      url: `${baseUrl}/images/background.jpg`,
      width: 1200,
      height: 630,
      alt: t('prices.ogImageAlt')
    }]
  })

  const twitterTags = generateTwitterCardTags({
    title: t('prices.title'),
    description: t('prices.description'),
    url: `${baseUrl}/${locale}/prices`,
    type: 'website',
    locale,
    siteName: 'Apartmani Jovča',
    images: [{
      url: `${baseUrl}/images/background.jpg`,
      alt: t('prices.ogImageAlt')
    }]
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
      title: t('prices.title'),
      description: t('prices.description'),
      url: `${baseUrl}/${locale}/prices`,
      type: 'website',
      locale,
      siteName: 'Apartmani Jovča',
      images: [{
        url: `${baseUrl}/images/background.jpg`,
        alt: t('prices.ogImageAlt')
      }]
    },
    twitter: convertTwitterToMetadata(twitterTags),
  }
}

export default async function PricesPage({ params: paramsInput }: PageProps) {
  const params = await paramsInput
  const t = await getTranslations({ locale: params.lang, namespace: 'prices' })
  const aptT = await getTranslations({ locale: params.lang, namespace: 'apartments' })

  const { data: apartments } = (await supabase
    ?.from('apartments')
    .select('*')
    .eq('status', 'active')
    .order('display_order', { ascending: true })
    .order('base_price_eur', { ascending: true })) as { data: ApartmentRecord[] | null } || { data: [] }

  const locale = params.lang as Locale
  const content = await getPublishedSectionContent('prices', locale)
  const pageText = (key: string) => getContentText(content, key, t(key))
  const localizedApartments = (apartments || []).map((apt: ApartmentRecord) => ({
    ...apt,
    name: getLocalizedValue(apt.name as unknown as MultiLanguageText, locale),
    description: getLocalizedValue(apt.description as unknown as MultiLanguageText, locale),
    bed_type: getLocalizedValue(apt.bed_type as unknown as MultiLanguageText, locale),
    imageUrls: getApartmentImages(apt.images)
  }))

  const breadcrumbSchema = generateBreadcrumbSchema('/prices', locale)

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

      {/* Pricing Cards */}
      <div className="container pb-16 px-4 md:px-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {localizedApartments.map((apt) => {
            const firstImage = apt.imageUrls[0]
            const totalBeds = getTotalBeds(apt.bed_counts)
            const visibleAmenityIds = getVisibleAmenityIds(apt)

            return (
              <div
                key={apt.id}
                className="bg-white/85 backdrop-blur-md rounded-2xl shadow-lg border border-white/40 overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row">
                  <Link href={'/' + params.lang + '/apartments/' + apt.slug} className="relative md:w-40 lg:w-48 aspect-[16/10] md:aspect-auto md:min-h-56 flex-shrink-0 bg-gray-100 overflow-hidden">
                    {firstImage ? (
                      <img
                        src={firstImage}
                        alt={apt.name}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-gray-400">
                        Nema slike
                      </div>
                    )}
                  </Link>

                  <div className="flex-1 p-4 sm:p-5 flex flex-col min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0">
                        <Link href={'/' + params.lang + '/apartments/' + apt.slug}>
                          <h2 className="font-black text-lg sm:text-xl tracking-tight text-foreground hover:text-primary transition-colors truncate">
                            {apt.name}
                          </h2>
                        </Link>
                      </div>
                      <div className="px-2 py-1 rounded bg-green-100 text-green-800 text-xs font-bold flex-shrink-0">
                        Aktivno
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {apt.description || aptT('description')}
                    </p>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-500">👥</span>
                        <span className="font-semibold">{pluralizeGuests(apt.capacity)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-500">📐</span>
                        <span className="font-semibold">{apt.size_sqm ? apt.size_sqm + 'm²' : 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-500">🛏️</span>
                        <span className="font-semibold">{totalBeds > 0 ? pluralizeBeds(totalBeds) : apt.bed_type}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-500">🚿</span>
                        <span className="font-semibold">{pluralizeBathrooms(apt.bathroom_count || 1)}</span>
                      </div>
                      {apt.floor !== null && apt.floor !== undefined && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-500">🏢</span>
                          <span className="font-semibold">Sprat {apt.floor}</span>
                        </div>
                      )}
                      {apt.balcony && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-500">🌿</span>
                          <span className="font-semibold">Balkon</span>
                        </div>
                      )}
                    </div>

                    {visibleAmenityIds.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1.5">
                          {visibleAmenityIds.slice(0, 4).map((amenityId) => {
                            const amenity = AMENITY_OPTIONS.find((item) => item.id === amenityId)
                            return amenity ? (
                              <span key={amenityId} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-semibold">
                                {amenity.label.sr}
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

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-auto pt-4 border-t border-white/70">
                      <div>
                        <div className="text-2xl font-black text-primary">€{apt.base_price_eur}</div>
                        <div className="text-xs text-muted-foreground font-semibold">{aptT('perNight')} · {t('allInclusive')}</div>
                      </div>
                      <div className="flex gap-2">
                        <Link href={'/' + params.lang + '/apartments/' + apt.slug} className="flex-1 sm:flex-none">
                          <button className="w-full px-4 py-2 rounded-full border border-primary text-primary text-xs font-bold hover:bg-primary hover:text-white transition-colors">
                            {aptT('viewDetails')}
                          </button>
                        </Link>
                        <Link href={'/' + params.lang + '/booking?apartment=' + apt.slug} className="flex-1 sm:flex-none">
                          <button className="w-full px-4 py-2 rounded-full bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                            {aptT('bookNow')}
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Guest Reviews Section */}
        <div className="mt-24">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-12">
            <div className="max-w-xl">
              <h2
                className="font-extrabold text-white text-shadow-strong mb-3"
                style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)' }}
              >
                {t('realExperiences')}
              </h2>
              <p className="text-white/85 text-shadow-light font-medium text-lg leading-relaxed">
                {t('guestExperiencesDesc')}
              </p>
            </div>
          </div>

          <div className="bg-white/85 backdrop-blur-md rounded-2xl border border-white/40 shadow-lg p-10 text-center">
            <p className="text-muted-foreground font-bold italic">{t('guestExperiencesDesc')}</p>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
