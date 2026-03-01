import { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { supabase } from '../lib/supabase/client'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { getLocalizedValue } from '@/lib/localization/helpers'
import type { Locale, ApartmentRecord, MultiLanguageText } from '@/lib/types/database'
import { getBaseUrl } from '@/lib/seo/config'
import { generateMetaTags } from '@/lib/seo/meta-generator'
import { generateHreflangTags } from '@/lib/seo/hreflang'
import { generateOpenGraphTags, generateTwitterCardTags } from '@/lib/seo/social-media'
import { generateBreadcrumbSchema } from '@/lib/seo/structured-data'
import { getKeywordsString } from '@/lib/seo/keywords'
import Breadcrumb from '@/components/Breadcrumb'

interface PageProps {
  params: { lang: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale = params.lang as Locale
  const t = await getTranslations({ locale, namespace: 'seo' })
  const baseUrl = getBaseUrl()
  
  // Generate meta tags
  const metaTags = generateMetaTags({
    title: t('apartments.title'),
    description: t('apartments.description'),
    keywords: getKeywordsString('apartment-list', locale),
    path: `/${locale}/apartments`,
    locale,
    type: 'website'
  })

  // Generate hreflang tags
  const hreflangTags = generateHreflangTags({
    path: '/apartments',
    locale
  })

  // Generate Open Graph tags
  const ogTags = generateOpenGraphTags({
    title: t('apartments.title'),
    description: t('apartments.description'),
    url: `${baseUrl}/${locale}/apartments`,
    type: 'website',
    locale,
    siteName: 'Apartmani Jovča',
    images: [{
      url: `${baseUrl}/images/background.jpg`,
      width: 1200,
      height: 630,
      alt: t('apartments.ogImageAlt')
    }]
  })

  // Generate Twitter Card tags
  const twitterTags = generateTwitterCardTags({
    url: `${baseUrl}/${locale}/apartments`,
    locale,
    title: t('apartments.title'),
    description: t('apartments.description'),
    card: 'summary_large_image',
    images: [{
      url: `${baseUrl}/images/background.jpg`,
      alt: t('apartments.ogImageAlt')
    }]
  })

  // Generate Breadcrumb schema
  const breadcrumbSchema = generateBreadcrumbSchema('/apartments', locale)

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
    other: {
      'application/ld+json': JSON.stringify(breadcrumbSchema)
    }
  }
}

export default async function ApartmentsPage({ params }: PageProps) {
  const t = await getTranslations({ locale: params.lang, namespace: 'apartments' })
  const commonT = await getTranslations({ locale: params.lang, namespace: 'common' })
  const locale = params.lang as Locale

  // Fetch apartments from Supabase
  const { data: apartments } = await supabase
    ?.from('apartments')
    .select('*')
    .eq('status', 'active')
    .order('base_price_eur', { ascending: true }) || { data: [] }

  // Transform JSONB fields to localized strings
  const localizedApartments = apartments?.map((apartment: ApartmentRecord) => {
    // Handle images - support both string[] and object[] formats
    let imageUrls: string[] = []
    if (Array.isArray(apartment.images)) {
      imageUrls = apartment.images.map((img: any) => {
        // If it's an object with url property, extract url
        if (typeof img === 'object' && img !== null && 'url' in img) {
          return img.url as string
        }
        // If it's already a string, use it directly
        if (typeof img === 'string') {
          return img
        }
        return ''
      }).filter(Boolean) // Remove empty strings
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

  // Breadcrumb items
  const breadcrumbItems = [
    { label: commonT('home'), href: `/${params.lang}` },
    { label: t('title'), current: true }
  ]

  return (
    <div className="container py-6 sm:py-10 3xl:py-14 4xl:py-16">
      <Breadcrumb items={breadcrumbItems} />
      
      <div className="mb-8 sm:mb-12 3xl:mb-16 4xl:mb-20 text-center px-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl 3xl:text-6xl 4xl:text-7xl font-bold mb-3 sm:mb-4 3xl:mb-6 tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground text-sm sm:text-base md:text-lg lg:text-xl 3xl:text-2xl 4xl:text-3xl max-w-2xl 3xl:max-w-4xl 4xl:max-w-6xl mx-auto">
          {t('description')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 3xl:gap-10 4xl:gap-12 px-3 sm:px-4 md:px-0">
        {localizedApartments?.map((apartment) => {
          // Get first image from database or use fallback
          const firstImage = Array.isArray(apartment.images) && apartment.images.length > 0 
            ? apartment.images[0] 
            : 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80'
          
          return (
          <Card key={apartment.id} className="overflow-hidden border shadow-lg hover:shadow-2xl transition-all duration-300 rounded-xl sm:rounded-2xl lg:rounded-3xl group flex flex-col h-full bg-card">
            {/* Make image clickable to detail page */}
            <Link href={`/${params.lang}/apartments/${apartment.slug}`} className="relative aspect-[16/10] overflow-hidden block">
              <Badge className="absolute top-2 sm:top-3 lg:top-4 left-2 sm:left-3 lg:left-4 z-10 bg-primary/90 backdrop-blur text-primary-foreground border-0 shadow-lg px-1.5 sm:px-2 lg:px-3 py-0.5 sm:py-0.5 lg:py-1 text-[9px] sm:text-[10px] lg:text-xs font-bold" variant="default">
                {t('available')}
              </Badge>
              <div className="absolute top-2 sm:top-3 lg:top-4 right-2 sm:right-3 lg:right-4 z-10 bg-background/95 backdrop-blur px-2 sm:px-3 lg:px-4 py-0.5 sm:py-1 lg:py-1.5 rounded-full text-[11px] sm:text-xs lg:text-sm font-black shadow-lg text-foreground border border-border/50">
                €{apartment.base_price_eur} <span className="text-muted-foreground font-medium text-[9px] sm:text-[10px] lg:text-xs">/ {t('perNight')}</span>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={firstImage} 
                alt={apartment.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            </Link>
            <CardHeader className="pb-2 pt-3 sm:pt-4 lg:pt-6 px-3 sm:px-4 lg:px-6">
              <div className="flex justify-between items-start mb-1 sm:mb-2">
                <Link href={`/${params.lang}/apartments/${apartment.slug}`}>
                  <CardTitle className="text-base sm:text-lg lg:text-xl xl:text-2xl text-foreground font-black tracking-tight hover:text-primary transition-colors cursor-pointer leading-tight">{apartment.name}</CardTitle>
                </Link>
              </div>
              <CardDescription className="text-[11px] sm:text-xs lg:text-sm text-muted-foreground line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem] lg:min-h-[3rem] leading-snug">
                {apartment.description || t('description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-3 sm:pb-4 lg:pb-6 px-3 sm:px-4 lg:px-6 flex-grow">
              <div className="flex items-center gap-2 sm:gap-3 lg:gap-6 text-[11px] sm:text-xs lg:text-sm font-bold text-zinc-600 mb-3 sm:mb-4 lg:mb-6 bg-zinc-50 p-2 sm:p-2.5 lg:p-3 rounded-lg sm:rounded-xl lg:rounded-2xl dark:bg-zinc-900 dark:text-zinc-400">
                <div className="flex items-center gap-1 sm:gap-1.5 lg:gap-2">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  <span className="whitespace-nowrap">{apartment.capacity} {t('guests')}</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-1.5 lg:gap-2 border-l pl-2 sm:pl-3 lg:pl-6 border-zinc-200 dark:border-zinc-800">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                  <span className="whitespace-nowrap">{Math.ceil(apartment.capacity / 2) || 1} {t('bedroomsShort')}</span>
                </div>
              </div>
              <div className="space-y-1.5 sm:space-y-2 lg:space-y-3">
                <p className="text-[9px] sm:text-[10px] lg:text-xs font-black uppercase tracking-widest text-muted-foreground/70">{t('amenities')}</p>
                <div className="flex flex-wrap gap-1 sm:gap-1.5 lg:gap-2">
                  {[
                    { id: 'WiFi', key: 'amenitiesWiFi' },
                    { id: 'AC', key: 'amenitiesAC' },
                    { id: 'Kitchen', key: 'amenitiesKitchen' },
                    { id: 'TV', key: 'amenitiesTV' }
                  ].map((amenity) => (
                    <Badge key={amenity.id} variant="secondary" className="px-1.5 sm:px-2 lg:px-3 py-0.5 sm:py-0.5 lg:py-1 rounded-md sm:rounded-lg text-[9px] sm:text-[10px] lg:text-xs font-bold border-zinc-100 dark:border-zinc-800">
                      {t(amenity.key)}
                    </Badge>
                  ))}
                </div>
              </div>

            </CardContent>
            <CardFooter className="pb-3 sm:pb-4 lg:pb-6 xl:pb-8 px-3 sm:px-4 lg:px-6 flex gap-1.5 sm:gap-2">
              <Link href={`/${params.lang}/apartments/${apartment.slug}`} className="flex-1">
                <Button variant="outline" className="w-full h-9 sm:h-10 lg:h-12 xl:h-14 rounded-lg sm:rounded-xl lg:rounded-2xl font-black text-[11px] sm:text-xs lg:text-base xl:text-lg transition-all">
                  {t('viewDetails') || 'Detalji'}
                </Button>
              </Link>
              <Link href={`/${params.lang}/booking?apartment=${apartment.slug}`} className="flex-1">
                <Button className="w-full h-9 sm:h-10 lg:h-12 xl:h-14 bg-primary text-primary-foreground hover:scale-[1.02] active:scale-95 rounded-lg sm:rounded-xl lg:rounded-2xl font-black text-[11px] sm:text-xs lg:text-base xl:text-lg transition-all shadow-xl shadow-primary/20">
                  {t('bookNow')}
                </Button>
              </Link>
            </CardFooter>
          </Card>
        )})}
      </div>

      {(!localizedApartments || localizedApartments.length === 0) && (
        <div className="text-center py-12 sm:py-20 bg-muted/20 rounded-2xl sm:rounded-3xl border-2 border-dashed mx-4 sm:mx-0">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2">{t('noApartments.title')}</h2>
          <p className="text-sm sm:text-base text-muted-foreground">{t('noApartments.message')}</p>
        </div>
      )}
    </div>
  )
}
