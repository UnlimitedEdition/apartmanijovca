import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { supabase } from '../lib/supabase/client'
import { Card, CardContent, CardHeader } from '../components/ui/card'
import { Locale } from '@/lib/types/database'
import { getBaseUrl } from '@/lib/seo/config'
import { generateMetaTags } from '@/lib/seo/meta-generator'
import { generateHreflangTags } from '@/lib/seo/hreflang'
import { generateBreadcrumbSchema } from '@/lib/seo/structured-data'
import { getKeywordsString } from '@/lib/seo/keywords'

type PageProps = {
  params: { lang: string }
}

// export async function generateStaticParams() {
//   return [
//     { lang: 'en' },
//     { lang: 'sr' },
//     { lang: 'it' },
//     { lang: 'de' }
//   ]
// }

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
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

  const hreflangTags = generateHreflangTags({
    path: '/attractions',
    locale
  })

  const breadcrumbSchema = generateBreadcrumbSchema('/attractions', locale)

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
      title: t('attractions.title'),
      description: t('attractions.description'),
      url: `${baseUrl}/${locale}/attractions`,
      type: 'website',
      locale,
      siteName: 'Apartmani Jovča',
      images: [{
        url: `${baseUrl}/images/background.jpg`,
        alt: t('attractions.ogImageAlt')
      }]
    },
    twitter: {
      card: 'summary_large_image',
      title: t('attractions.title'),
      description: t('attractions.description'),
      images: [`${baseUrl}/images/background.jpg`]
    },
    other: {
      'application/ld+json': JSON.stringify(breadcrumbSchema)
    }
  }
}

interface Attraction {
  name: string
  description: string
  distance?: string
  image?: string
  lat?: number
  lng?: number
}

export default async function AttractionsPage({ params }: PageProps) {
  const t = await getTranslations({ locale: params.lang, namespace: 'attractions' })
  // value je jsonb (Json tip) — castujemo na konkretan tip liste atrakcija.
  const result = await supabase
    .from('content')
    .select('value')
    .eq('key', 'attractions.list')
    .eq('language', params.lang)
    .maybeSingle()

  const row = result.data as { value: Attraction[] } | null
  const attractions: Attraction[] = Array.isArray(row?.value) ? row!.value : []

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 3xl:py-12 4xl:py-16">
      <div className="text-center mb-8 sm:mb-12 3xl:mb-16 4xl:mb-20">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl 3xl:text-7xl 4xl:text-8xl font-bold mb-3 sm:mb-4 3xl:mb-6">
          {t('title')}
        </h1>
        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-6 sm:mb-8 px-4">
          {t('description')}
        </p>
      </div>

      {attractions.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg font-semibold">{t('noAttractions.title')}</p>
          <p className="text-sm">{t('noAttractions.message')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {attractions.map((attraction, index) => (
            <Card key={index} className="h-full overflow-hidden flex flex-col">
              {attraction.image && (
                <div className="relative aspect-[4/3] bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={attraction.image}
                    alt={attraction.name}
                    className="w-full h-full object-cover"
                  />
                  {attraction.distance && (
                    <span className="absolute top-2 right-2 bg-black/70 text-white text-xs font-semibold px-2 py-1 rounded-full backdrop-blur-sm">
                      {attraction.distance}
                    </span>
                  )}
                </div>
              )}
              <CardHeader className="p-4 sm:p-6 pb-2">
                <h2 className="text-base sm:text-lg lg:text-xl font-bold">{attraction.name}</h2>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 flex flex-col flex-1">
                <p className="text-muted-foreground text-xs sm:text-sm lg:text-base flex-1">{attraction.description}</p>
                {typeof attraction.lat === 'number' && typeof attraction.lng === 'number' && (
                  <a
                    href={`https://www.google.com/maps?q=${attraction.lat},${attraction.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center mt-4 text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    {t('viewOnMap')}
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

