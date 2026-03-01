import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { supabase } from '../lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Locale } from '@/lib/types/database'
import { getBaseUrl } from '@/lib/seo/config'
import { generateMetaTags } from '@/lib/seo/meta-generator'
import { generateHreflangTags } from '@/lib/seo/hreflang'
import { generateOpenGraphTags, generateTwitterCardTags } from '@/lib/seo/social-media'
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
}

interface AttractionsData {
  title?: string
  description?: string
  list?: Attraction[]
  mapLink?: string
}

export default async function AttractionsPage({ params }: PageProps) {
  const t = await getTranslations({ locale: params.lang, namespace: 'attractions' })
  const { data: content } = (await supabase
    .from('content')
    .select('data')
    .eq('lang', params.lang)
    .eq('section', 'attractions')
    .single()) as { data: AttractionsData | null } || { data: null }

  const attractionsData: AttractionsData = content || {}

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 3xl:py-12 4xl:py-16">
      <div className="text-center mb-8 sm:mb-12 3xl:mb-16 4xl:mb-20">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl 3xl:text-7xl 4xl:text-8xl font-bold mb-3 sm:mb-4 3xl:mb-6">
          {attractionsData.title || t('title')}
        </h1>
        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-6 sm:mb-8 px-4">
          {attractionsData.description || t('description')}
        </p>
      </div>

      {Array.isArray(attractionsData.list) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {attractionsData.list.map((attraction: Attraction, index: number) => (
            <Card key={index} className="h-full">
              <CardHeader className="p-4 sm:p-6">
                <h2 className="text-base sm:text-lg lg:text-xl">{attraction.name}</h2>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <p className="text-muted-foreground text-xs sm:text-sm lg:text-base">{attraction.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {attractionsData.mapLink && (
        <div className="text-center mt-8 sm:mt-12">
          <a
            href={attractionsData.mapLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 sm:px-6 py-2.5 sm:py-3 border border-transparent text-xs sm:text-sm lg:text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            {t('viewOnMap')}
          </a>
        </div>
      )}
    </div>
  )
}

