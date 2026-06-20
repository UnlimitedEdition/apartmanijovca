import { Metadata } from 'next'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { Locale } from '@/lib/types/database'
import { getBaseUrl } from '@/lib/seo/config'
import { generateMetaTags } from '@/lib/seo/meta-generator'
import { generateHreflangTags } from '@/lib/seo/hreflang'
import { generateTwitterCardTags } from '@/lib/seo/social-media'
import { convertTwitterToMetadata } from '@/lib/seo/metadata-adapter'
import {
  generateBreadcrumbSchema,
  generateTouristAttractionSchema,
  generateTouristDestinationSchema,
} from '@/lib/seo/structured-data'
import { getKeywordsString } from '@/lib/seo/keywords'
import { STATIC_ATTRACTIONS, AttractionEntry } from '@/data/attractions'
import { getVisibleAttractions } from '@/lib/attractions/db'

type PageProps = {
  params: Promise<{ lang: string }>
}

export const revalidate = 7200

export async function generateMetadata({ params: paramsInput }: PageProps): Promise<Metadata> {
  const params = await paramsInput
  const locale = params.lang as Locale
  const t = await getTranslations({ locale, namespace: 'seo' })
  const baseUrl = getBaseUrl()

  const metaTags = generateMetaTags({
    title: t('attractions.title'),
    description: t('attractions.description'),
    keywords: getKeywordsString('attractions', locale),
    path: `/${locale}/attractions`,
    locale,
    type: 'website'
  })

  const hreflangTags = generateHreflangTags({ path: '/attractions', locale })

  const twitterTags = generateTwitterCardTags({
    title: t('attractions.title'),
    description: t('attractions.description'),
    url: `${baseUrl}/${locale}/attractions`,
    type: 'website',
    locale,
    siteName: 'Apartmani Jovča',
    images: [{ url: `${baseUrl}/images/background.jpg`, alt: t('attractions.ogImageAlt') }]
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
      title: t('attractions.title'),
      description: t('attractions.description'),
      url: `${baseUrl}/${locale}/attractions`,
      type: 'website',
      locale,
      siteName: 'Apartmani Jovča',
      images: [{ url: `${baseUrl}/images/background.jpg`, alt: t('attractions.ogImageAlt') }]
    },
    twitter: convertTwitterToMetadata(twitterTags),
  }
}

export default async function AttractionsPage({ params: paramsInput }: PageProps) {
  const params = await paramsInput
  const lang = params.lang
  const locale = lang as Locale
  const t = await getTranslations({ locale: lang, namespace: 'attractions' })

  // Primary source: DB attractions table (admin-managed)
  const dbAttractions = await getVisibleAttractions(locale)

  // Fallback: static data if DB returned nothing (migration not yet done / DB unavailable)
  const staticFallback: AttractionEntry[] = STATIC_ATTRACTIONS[lang] ?? STATIC_ATTRACTIONS['sr']
  const attractions: AttractionEntry[] = dbAttractions.length > 0 ? dbAttractions : staticFallback

  // Structured data: one TouristAttraction per attraction + one TouristDestination
  const attractionSchemas = attractions.map(a => generateTouristAttractionSchema(a, locale))
  const destinationSchema = generateTouristDestinationSchema(locale, attractions)

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 3xl:py-12 4xl:py-16">
      {attractionSchemas.map((schema, i) => (
        <script
          key={"attraction-schema-" + i}
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(destinationSchema) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateBreadcrumbSchema('/attractions', locale)).replace(/</g, '\\u003c') }}
      />
      {/* Hero */}
      <div className="stagger-fade-in text-center py-20 text-white mb-8 sm:mb-12 3xl:mb-16 4xl:mb-20">
        <h1 className="text-4xl md:text-5xl font-extrabold text-shadow-strong tracking-wide mb-4">
          {t('title')}
        </h1>
        <p className="text-xl text-white/90 text-shadow-medium max-w-2xl mx-auto px-4">
          {t('description')}
        </p>
      </div>

      {attractions.length === 0 ? (
        <div className="bg-white/85 backdrop-blur-md rounded-2xl shadow-lg border border-white/40 p-12 text-center text-muted-foreground">
          <p className="text-lg font-semibold">{t('noAttractions.title')}</p>
          <p className="text-sm">{t('noAttractions.message')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {attractions.map((attraction, index) => (
            <div
              key={index}
              className="bg-white/85 backdrop-blur-md rounded-2xl shadow-lg border border-white/40 overflow-hidden flex flex-col hover:-translate-y-1 hover:shadow-xl transition-all"
            >
              {attraction.image && (
                <div className="relative aspect-[4/3] bg-muted">
                  {attraction.image.startsWith('/') ? (
                    <Image
                      src={attraction.image}
                      alt={attraction.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element -- DB image host nije garantovano u remotePatterns; siguran fallback */
                    <img
                      src={attraction.image}
                      alt={attraction.name}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}
                  {attraction.distance && (
                    <span className="absolute top-2 right-2 bg-black/70 text-white text-xs font-semibold px-2 py-1 rounded-full backdrop-blur-sm">
                      {attraction.distance}
                    </span>
                  )}
                </div>
              )}
              <div className="p-4 sm:p-6 pb-2">
                <h2 className="text-base sm:text-lg lg:text-xl font-bold">{attraction.name}</h2>
              </div>
              <div className="p-4 sm:p-6 pt-0 flex flex-col flex-1">
                <p className="text-muted-foreground text-xs sm:text-sm lg:text-base flex-1">{attraction.description}</p>
                {typeof attraction.lat === 'number' && typeof attraction.lng === 'number' && (
                  <a
                    href={`https://www.google.com/maps?q=${attraction.lat},${attraction.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center mt-4 text-xs sm:text-sm font-semibold text-primary hover:text-primary/80 border border-primary rounded-full px-4 py-1.5 hover:bg-primary hover:text-white transition-all self-start"
                  >
                    {t('viewOnMap')}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
