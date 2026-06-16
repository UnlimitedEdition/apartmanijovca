import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { supabase } from '../lib/supabase/client'
import { Badge } from '../components/ui/badge'
import { getLocalizedValue } from '@/lib/localization/helpers'
import { Locale, ApartmentRecord, MultiLanguageText } from '@/lib/types/database'
import { getBaseUrl } from '@/lib/seo/config'
import { generateMetaTags } from '@/lib/seo/meta-generator'
import { generateHreflangTags } from '@/lib/seo/hreflang'
import { generateOpenGraphTags } from '@/lib/seo/social-media'
import { generateBreadcrumbSchema } from '@/lib/seo/structured-data'
import { getKeywordsString } from '@/lib/seo/keywords'

interface PageProps {
  params: { lang: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
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

  const breadcrumbSchema = generateBreadcrumbSchema('/prices', locale)

  return {
    title: metaTags.title,
    description: metaTags.description,
    keywords: metaTags.keywords,
    robots: metaTags.robots,
    alternates: {
      canonical: metaTags.canonical,
      languages: hreflangTags.reduce((acc, tag) => {
        if (tag.hreflang !== 'x-default') {
          acc[tag.hreflang] = tag.href
        }
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
    twitter: {
      card: 'summary_large_image',
      title: t('prices.title'),
      description: t('prices.description'),
      images: [`${baseUrl}/images/background.jpg`]
    },
    other: {
      'application/ld+json': JSON.stringify(breadcrumbSchema)
    }
  }
}

export default async function PricesPage({ params }: PageProps) {
  const t = await getTranslations({ locale: params.lang, namespace: 'prices' })
  const aptT = await getTranslations({ locale: params.lang, namespace: 'apartments' })

  const { data: apartments } = (await supabase
    ?.from('apartments')
    .select('*')
    .eq('status', 'active')
    .order('base_price_eur', { ascending: true })) as { data: ApartmentRecord[] | null } || { data: [] }

  const locale = params.lang as Locale
  const localizedApartments = (apartments || []).map((apt: ApartmentRecord) => ({
    ...apt,
    name: getLocalizedValue(apt.name as unknown as MultiLanguageText, locale),
    description: getLocalizedValue(apt.description as unknown as MultiLanguageText, locale),
    bed_type: getLocalizedValue(apt.bed_type as unknown as MultiLanguageText, locale)
  }))

  return (
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

      {/* Pricing Cards */}
      <div className="container pb-16 px-4 md:px-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {localizedApartments?.map((apt, idx) => (
            <div
              key={apt.id}
              className="bg-white/85 backdrop-blur-md rounded-2xl shadow-lg border border-white/40 overflow-hidden flex flex-col hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
            >
              {/* Top accent bar — blue like old Astro card border */}
              <div className="h-1.5 bg-primary w-full" />

              <div className="p-6 sm:p-8 flex flex-col flex-grow">
                {/* Badge + name */}
                <div className="flex justify-between items-start mb-4">
                  <Badge variant="outline" className="border-primary/30 text-primary font-bold text-xs">
                    {apt.bed_type}
                  </Badge>
                  {/* "Recommended" ribbon for middle card */}
                  {localizedApartments.length >= 3 && idx === 1 && (
                    <span className="bg-primary text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                      ★ Popular
                    </span>
                  )}
                </div>

                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground mb-2">
                  {apt.name}
                </h2>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-6">
                  {apt.description || aptT('description')}
                </p>

                {/* Price block — Astro style: big amount, subtle label */}
                <div className="bg-zinc-50 rounded-2xl p-5 mb-6 text-center">
                  <div className="flex items-baseline justify-center gap-1 mb-1">
                    <span className="text-5xl font-black tracking-tighter text-foreground">
                      €{apt.base_price_eur}
                    </span>
                    <span className="text-muted-foreground font-semibold text-sm">
                      {aptT('perNight')}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{t('allInclusive')}</p>
                </div>

                {/* Feature list — check icons like Astro */}
                <ul className="space-y-3 mb-8 flex-grow">
                  <li className="flex items-center gap-3 text-sm font-semibold text-foreground">
                    <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                      </svg>
                    </span>
                    {apt.capacity} {aptT('capacity')}
                  </li>
                  <li className="flex items-center gap-3 text-sm font-semibold text-foreground">
                    <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                      </svg>
                    </span>
                    {Math.ceil(apt.capacity / 2) || 1} {aptT('bedroomLong')}
                  </li>
                  <li className="flex items-center gap-3 text-sm font-semibold text-foreground">
                    <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                      </svg>
                    </span>
                    {t('amenitiesWiFi')}
                  </li>
                </ul>

                {/* CTA button — Astro: rounded-25px, blue, full width */}
                <Link href={`/${params.lang}/booking?apartment=${apt.slug}`}>
                  <button className="w-full px-6 py-3 bg-primary text-white font-bold text-sm rounded-full uppercase tracking-wide hover:bg-primary/90 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 shadow-lg shadow-primary/20">
                    {aptT('bookNow')}
                  </button>
                </Link>
              </div>
            </div>
          ))}
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
  )
}
