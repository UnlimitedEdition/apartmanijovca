import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Locale } from '@/lib/types/database'
import { getBaseUrl } from '@/lib/seo/config'
import { generateMetaTags } from '@/lib/seo/meta-generator'
import { generateHreflangTags } from '@/lib/seo/hreflang'
import { generateOpenGraphTags, generateTwitterCardTags } from '@/lib/seo/social-media'
import { 
  generateLocalBusinessSchema, 
  generateOrganizationSchema,
  generateFAQSchema 
} from '@/lib/seo/structured-data'
import { getKeywordsString } from '@/lib/seo/keywords'
import { 
  convertOpenGraphToMetadata, 
  convertTwitterToMetadata, 
  convertHreflangToMetadata 
} from '@/lib/seo/metadata-adapter'
import { generateApartmentImageAlt, generateAltText } from '@/lib/seo/alt-text'
import LazyImage from '@/components/LazyImage'

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
  
  // Generate meta tags
  const metaTags = generateMetaTags({
    title: t('home.title'),
    description: t('home.description'),
    keywords: getKeywordsString('home', locale),
    path: `/${locale}`,
    locale,
    type: 'website'
  })

  // Generate hreflang tags
  const hreflangTags = generateHreflangTags({
    path: '/',
    locale
  })

  // Generate Open Graph tags
  const ogTags = generateOpenGraphTags({
    title: t('home.title'),
    description: t('home.description'),
    url: `${baseUrl}/${locale}`,
    type: 'website',
    locale,
    siteName: 'Apartmani Jovča',
    images: [{
      url: `${baseUrl}/images/background.jpg`,
      width: 1200,
      height: 630,
      alt: t('home.ogImageAlt')
    }]
  })

  // Generate Twitter Card tags
  const twitterTags = generateTwitterCardTags({
    title: t('home.title'),
    description: t('home.description'),
    url: `${baseUrl}/${locale}`,
    locale,
    images: [{
      url: `${baseUrl}/images/background.jpg`,
      alt: t('home.ogImageAlt')
    }]
  })

  // Generate structured data
  const localBusinessSchema = generateLocalBusinessSchema(locale)
  const organizationSchema = generateOrganizationSchema()
  
  // Generate FAQ schema if FAQs exist
  const faqTranslations = await getTranslations({ locale, namespace: 'faq' })
  const faqs = [
    { question: faqTranslations('q1'), answer: faqTranslations('a1') },
    { question: faqTranslations('q2'), answer: faqTranslations('a2') },
    { question: faqTranslations('q3'), answer: faqTranslations('a3') },
    { question: faqTranslations('q4'), answer: faqTranslations('a4') },
    { question: faqTranslations('q5'), answer: faqTranslations('a5') }
  ]
  const faqSchema = generateFAQSchema(faqs, locale)

  return {
    title: metaTags.title,
    description: metaTags.description,
    keywords: getKeywordsString('home', locale).split(', '),
    robots: metaTags.robots,
    alternates: {
      canonical: metaTags.canonical,
      languages: convertHreflangToMetadata(hreflangTags)
    },
    openGraph: convertOpenGraphToMetadata(ogTags),
    twitter: convertTwitterToMetadata(twitterTags),
    other: {
      'application/ld+json': JSON.stringify([
        localBusinessSchema,
        organizationSchema,
        faqSchema
      ])
    }
  }
}

export default async function HomePage({ params }: PageProps) {
  let content = null
  let apartments = null
  let reviews = null
  // averageRating removed

  if (supabase) {
    try {
      const { data: contentData } = await supabase
        .from('content')
        .select('data')
        .eq('lang', params.lang)
        .eq('section', 'home')
        .single()
      content = contentData
    } catch (error) {
      console.error('Error fetching content:', error)
    }

    try {
      const { data: apartmentsData } = await supabase
        .from('apartments')
        .select('*')
        .eq('status', 'active')
        .limit(4)
      apartments = apartmentsData
      
      // Transform JSONB fields to localized strings using transformer
      if (apartments) {
        const locale = params.lang as Locale
        const { localizeApartments } = await import('@/lib/localization/transformer')
        apartments = localizeApartments(apartments, locale)
      }
    } catch (error) {
      console.error('Error fetching apartments:', error)
    }

    try {
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('*')
        .eq('status', 'approved')
        .limit(5)
        .order('created_at', { ascending: false })
      reviews = reviewsData

      // averageRating removed for better conversion focus
    } catch (error) {
      console.error('Error fetching reviews:', error)
    }
  }

  const t = await getTranslations({ locale: params.lang, namespace: 'home' })
  const commonT = await getTranslations({ locale: params.lang, namespace: 'common' })
  const aptT = await getTranslations({ locale: params.lang, namespace: 'apartments' })

  const homeData = content?.data || {}

  interface Testimonial {
    id: string
    rating: number
    comment: string
    guest_name?: string
    created_at: string
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black/20 z-10" />
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="/images/background.jpg" 
            alt={homeData.title || t('title')}
            fetchPriority="high"
            decoding="sync"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container relative z-20 text-center text-white px-4">
          <h1 className="text-4xl md:text-7xl 3xl:text-8xl 4xl:text-9xl font-bold mb-6 tracking-tight drop-shadow-lg">
            {homeData.title || t('title')}
          </h1>
          <p className="text-xl md:text-3xl 3xl:text-4xl 4xl:text-5xl mb-10 max-w-3xl 3xl:max-w-5xl 4xl:max-w-7xl mx-auto font-medium drop-shadow-md">
            {homeData.subtitle || t('subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 3xl:gap-6 4xl:gap-8 justify-center items-center">
            <a
              href={`https://wa.me/381652378080?text=${encodeURIComponent('Zdravo! Interesuje me smeštaj u Apartmanima Jovča.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center bg-[#25D366] hover:bg-[#22c35e] text-white font-bold py-4 px-10 3xl:py-6 3xl:px-14 4xl:py-8 4xl:px-16 rounded-full text-xl 3xl:text-2xl 4xl:text-3xl transition-all hover:scale-105 shadow-xl"
            >
              <span className="mr-2">WhatsApp</span>
              <svg className="w-6 h-6 3xl:w-8 3xl:h-8 4xl:w-10 4xl:h-10" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.742.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488"/>
              </svg>
            </a>

            <a
              href="viber://chat?number=%2B381652378080"
              className="w-full sm:w-auto inline-flex items-center justify-center bg-[#7360f2] hover:bg-[#6251d1] text-white font-bold py-4 px-10 3xl:py-6 3xl:px-14 4xl:py-8 4xl:px-16 rounded-full text-xl 3xl:text-2xl 4xl:text-3xl transition-all hover:scale-105 shadow-xl"
            >
              <span className="mr-2">Viber</span>
              <svg className="w-6 h-6 3xl:w-8 3xl:h-8 4xl:w-10 4xl:h-10" viewBox="0 0 512 512" fill="currentColor">
                <path d="M444 49.9C431.3 38.2 379.9.9 265.3.4c0 0-135.1-8.1-200.9 52.3C27.8 89.3 14.9 143 13.5 209.5c-1.4 66.5-3.1 191.1 117 224.9h.1l-.1 51.6s-.8 20.9 13 25.1c16.6 5.2 26.4-10.7 42.3-27.8 8.7-9.4 20.7-23.2 29.8-33.7 82.2 6.9 145.3-8.9 152.5-11.2 16.6-5.4 110.5-17.4 125.7-142 15.8-128.6-7.6-209.8-49.8-246.5zM457.9 287c-12.9 104-89 110.6-103 115.1-6 1.9-61.5 15.7-131.2 11.2 0 0-52 62.7-68.2 79-5.3 5.3-11.1 4.8-11-5.7 0-6.9.4-85.7.4-85.7-.1 0-.1 0 0 0-101.8-28.2-95.8-134.3-94.7-189.8 1.1-55.5 11.6-101 42.6-131.6 55.7-50.5 170.4-43 170.4-43 96.9.4 143.3 29.6 154.1 39.4 35.7 30.6 53.9 103.8 40.6 211.1zm-139-80.8c.4 8.6-12.5 9.2-12.9.6-1.1-22-11.4-32.7-32.6-33.9-8.6-.5-7.8-13.4.7-12.9 27.9 1.5 43.4 17.5 44.8 46.2zm20.3 11.3c1-42.4-25.5-75.6-75.8-79.3-8.5-.6-7.6-13.5.9-12.9 58 4.2 88.9 44.1 87.8 92.5-.1 8.6-13.1 8.2-12.9-.3zm47 13.4c.1 8.6-12.9 8.7-12.9.1-.6-81.5-54.9-125.9-120.8-126.4-8.5-.1-8.5-12.9 0-12.9 73.7.5 133 51.4 133.7 139.2zM374.9 329v.2c-10.8 19-31 40-51.8 33.3l-.2-.3c-21.1-5.9-70.8-31.5-102.2-56.5-16.2-12.8-31-27.9-42.4-42.4-10.3-12.9-20.7-28.2-30.8-46.6-21.3-38.5-26-55.7-26-55.7-6.7-20.8 14.2-41 33.3-51.8h.2c9.2-4.8 18-3.2 23.9 3.9 0 0 12.4 14.8 17.7 22.1 5 6.8 11.7 17.7 15.2 23.8 6.1 10.9 2.3 22-3.7 26.6l-12 9.6c-6.1 4.9-5.3 14-5.3 14s17.8 67.3 84.3 84.3c0 0 9.1.8 14-5.3l9.6-12c4.6-6 15.7-9.8 26.6-3.7 14.7 8.3 33.4 21.2 45.8 32.9 7 5.7 8.6 14.4 3.8 23.6z"/>
              </svg>
            </a>

            <Link href={`/${params.lang}/booking`}>
              <Button size="lg" className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white backdrop-blur border-white/20 font-bold py-7 px-10 3xl:py-9 3xl:px-14 4xl:py-11 4xl:px-16 rounded-full text-xl 3xl:text-2xl 4xl:text-3xl shadow-xl">
                {t('hero.book')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust & Features Bar */}
      <section className="bg-muted py-8 border-y">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { name: t('trust.secure'), icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg> },
              { name: t('trust.flexible'), icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
              { name: t('trust.prime'), icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
              { name: t('trust.bestPrice'), icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z" /></svg> },
            ].map((item) => (
              <div key={item.name} className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  {item.icon}
                </div>
                <p className="font-bold text-sm text-foreground">{item.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-6xl 3xl:max-w-7xl 4xl:max-w-[90rem]">
          <div className="text-center mb-12 3xl:mb-16 4xl:mb-20">
            <h2 className="text-3xl md:text-5xl 3xl:text-6xl 4xl:text-7xl font-bold mb-6 3xl:mb-8 text-foreground">{t('about.title')}</h2>
          </div>
          <div className="prose prose-lg 3xl:prose-xl 4xl:prose-2xl max-w-none text-muted-foreground leading-relaxed">
            <p className="text-base md:text-lg 3xl:text-xl 4xl:text-2xl text-center">
              {t('about.content')}
            </p>
          </div>
        </div>
      </section>

      {/* Featured Apartments */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-5xl 3xl:text-6xl 4xl:text-7xl font-bold mb-4 text-foreground">{t('featured.title')}</h2>
              <p className="text-xl 3xl:text-2xl 4xl:text-3xl text-muted-foreground">{t('featured.subtitle')}</p>
            </div>
            <Link href={`/${params.lang}/apartments`}>
              <Button variant="outline" className="hidden md:flex gap-2 rounded-full px-6">
                {t('featured.viewAll')} <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4 gap-10 3xl:gap-12 4xl:gap-16">
            {apartments && Array.isArray(apartments) && apartments.map((apt) => {
              // Get first image from database or use fallback
              const firstImage = Array.isArray(apt.images) && apt.images.length > 0 
                ? apt.images[0] 
                : 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80'
              
              return (
              <Card key={apt.id} className="overflow-hidden border shadow-lg hover:shadow-2xl transition-all duration-300 rounded-2xl group border-border bg-card text-card-foreground">
                <Link href={`/${params.lang}/apartments/${apt.slug || apt.id}`} className="block">
                  <div className="relative aspect-video overflow-hidden">
                    <div className="absolute top-4 left-4 z-10 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                      {t('featured.badge')}
                    </div>
                    <LazyImage
                      src={firstImage}
                      alt={generateApartmentImageAlt(apt.name, params.lang as Locale)}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                      <p className="text-white font-bold text-xl">{apt.name}</p>
                      <p className="text-white/80 text-sm">{apt.description}</p>
                    </div>
                  </div>
                </Link>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <span className="text-2xl font-bold text-primary">€{apt.base_price_eur}</span>
                      <span className="text-muted-foreground text-sm"> / {aptT('perNight')}</span>
                    </div>
                    <div className="flex gap-4 text-muted-foreground text-sm">
                      <span className="flex items-center gap-1">👥 {apt.capacity}</span>
                      <span className="flex items-center gap-1">🛏️ {apt.bed_type}</span>
                    </div>
                  </div>
                  <Link href={`/${params.lang}/booking?apartment=${apt.slug || apt.id}`} className="w-full">
                    <Button className="w-full h-12 bg-primary text-primary-foreground hover:opacity-90 rounded-xl font-bold text-lg transition-all">
                      {t('featured.checkAvailability')}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )})}
          </div>
        </div>
      </section>

      {/* Amenities Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-16 items-center">
            <div className="flex-1">
              <h2 className="text-3xl md:text-5xl 3xl:text-6xl 4xl:text-7xl font-bold mb-6 text-foreground">{t('features.title')}</h2>
              <p className="text-xl 3xl:text-2xl 4xl:text-3xl text-muted-foreground mb-10 leading-relaxed">
                {t('features.description')}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { name: t('features.wiFi'), icon: '📶' },
                  { name: t('features.climate'), icon: '❄️' },
                  { name: t('features.parking'), icon: '🚗' },
                  { name: t('features.kitchen'), icon: '🍳' },
                  { name: t('features.tv'), icon: '📺' },
                  { name: t('features.linens'), icon: '🛏️' },
                  { name: t('features.lakeAccess'), icon: '🏖️' },
                  { name: t('features.bbq'), icon: '🔥' },
                ].map((item) => (
                  <div key={item.name} className="flex items-center gap-3 p-4 bg-card rounded-xl shadow-sm border border-border">
                    <span className="text-2xl">{item.icon}</span>
                    <span className="font-bold text-foreground">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1 relative">
              <div className="aspect-square bg-muted rounded-3xl overflow-hidden shadow-2xl skew-y-3">
                <LazyImage
                  src="https://i.ibb.co/xS8Z2xmn/DJI-0150.avif?auto=format&fit=crop&w=1200&q=80"
                  alt={generateAltText('', 'location', params.lang as Locale, 'Bovansko jezero')}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-10 -left-10 bg-primary p-6 rounded-2xl shadow-xl max-w-sm hidden lg:block text-primary-foreground transform -rotate-3 border-4 border-background">
                <p className="font-bold italic text-lg mb-2">&quot;{t('testimonials.sampleQuote')}&quot;</p>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">{t('testimonials.sampleInitials')}</div>
                  <div>
                    <p className="font-bold">{t('testimonials.sampleName')}</p>
                    <p className="text-xs opacity-80">{t('testimonials.guestFrom')} {t('testimonials.sampleLocation')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 md:px-16">
          <h2 className="text-3xl md:text-5xl 3xl:text-6xl 4xl:text-7xl font-bold mb-12 text-center text-foreground">{t('faq.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            <div className="space-y-6">
              {[
                { q: t('faq.q1'), a: t('faq.a1') },
                { q: t('faq.q2'), a: t('faq.a2') },
                { q: t('faq.q3'), a: t('faq.a3') },
                { q: t('faq.q4'), a: t('faq.a4') },
                { q: t('faq.q5'), a: t('faq.a5') },
              ].map((faq, i) => (
                <div key={i} className="bg-muted/20 p-6 rounded-2xl border border-border">
                  <h3 className="text-lg font-bold mb-2 text-foreground">{faq.q}</h3>
                  <p className="text-muted-foreground">{faq.a}</p>
                </div>
              ))}
            </div>
            <div className="space-y-6">
              {[
                { q: t('faq.q6'), a: t('faq.a6') },
                { q: t('faq.q7'), a: t('faq.a7') },
                { q: t('faq.q8'), a: t('faq.a8') },
                { q: t('faq.q9'), a: t('faq.a9') },
                { q: t('faq.q10'), a: t('faq.a10') },
              ].map((faq, i) => (
                <div key={i} className="bg-muted/20 p-6 rounded-2xl border border-border">
                  <h3 className="text-lg font-bold mb-2 text-foreground">{faq.q}</h3>
                  <p className="text-muted-foreground">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="text-center mt-12 text-muted-foreground">
            {t('faq.moreQuestions')}? <Link href={`/${params.lang}/contact`} className="text-primary font-bold underline">{commonT('contactUs')}</Link>
          </p>
        </div>
      </section>

      {/* Reviews Section */}
      {Array.isArray(reviews) && reviews.length > 0 && (
        <section className="py-20 bg-background border-y">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-5xl 3xl:text-6xl 4xl:text-7xl font-bold text-center mb-16">
              {t('testimonials.title')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {reviews.slice(0, 3).map((review: Testimonial) => (
                <div key={review.id} className="bg-white p-8 rounded-2xl shadow-sm border">
                  <div className="flex items-center gap-1 mb-4 text-yellow-400">
                    {[...Array(review.rating)].map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>
                  <p className="text-lg mb-6 italic leading-relaxed">&quot;{review.comment}&quot;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center font-bold">
                      {review.guest_name?.[0] || 'G'}
                    </div>
                    <div>
                      <p className="font-bold">{review.guest_name || commonT('guest')}</p>
                      <p className="text-xs text-muted-foreground">{t('testimonials.guestFrom')} {new Date(review.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Final CTA Section */}
      <section className="relative py-24 bg-black text-white overflow-hidden bg-fixed" style={{ backgroundImage: 'url(/images/background.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
        <div className="absolute inset-0 bg-black/30" />
        <div className="container relative z-10 mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl 3xl:text-7xl 4xl:text-8xl font-bold mb-6">
            {t('cta.ready')}
          </h2>
          <p className="text-xl md:text-2xl 3xl:text-3xl 4xl:text-4xl mb-12 max-w-2xl 3xl:max-w-4xl 4xl:max-w-6xl mx-auto opacity-90">
            {t('cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-6 3xl:gap-8 4xl:gap-10 justify-center">
            <Link href={`/${params.lang}/booking`}>
              <Button size="lg" className="bg-green-500 hover:bg-green-600 text-white font-bold py-8 px-12 3xl:py-10 3xl:px-16 4xl:py-12 4xl:px-20 rounded-full text-2xl 3xl:text-3xl 4xl:text-4xl shadow-2xl transition-transform hover:scale-105">
                {t('cta.book')}
              </Button>
            </Link>
            <a 
              href="tel:+381652378080"
              className="inline-flex items-center justify-center bg-white text-black hover:bg-zinc-100 font-bold py-4 px-12 3xl:py-6 3xl:px-16 4xl:py-8 4xl:px-20 rounded-full text-2xl 3xl:text-3xl 4xl:text-4xl shadow-2xl transition-transform hover:scale-105"
            >
              {t('cta.call')}
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
