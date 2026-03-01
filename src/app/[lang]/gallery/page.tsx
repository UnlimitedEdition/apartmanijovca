import { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import GalleryClient from '@/app/[lang]/gallery/GalleryClient'
import { Locale } from '@/lib/types/database'
import { getBaseUrl } from '@/lib/seo/config'
import { generateMetaTags } from '@/lib/seo/meta-generator'
import { generateHreflangTags } from '@/lib/seo/hreflang'
import { generateOpenGraphTags } from '@/lib/seo/social-media'
import { generateBreadcrumbSchema } from '@/lib/seo/structured-data'
import { getKeywordsString } from '@/lib/seo/keywords'
import { getTranslations } from 'next-intl/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const dynamic = 'force-dynamic'

interface PageProps {
  params: { lang: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale = params.lang as Locale
  const t = await getTranslations({ locale, namespace: 'seo' })
  const baseUrl = getBaseUrl()
  
  const metaTags = generateMetaTags({
    title: t('gallery.title'),
    description: t('gallery.description'),
    keywords: getKeywordsString('gallery', locale),
    path: `/${locale}/gallery`,
    locale,
    type: 'website'
  })

  const hreflangTags = generateHreflangTags({
    path: '/gallery',
    locale
  })

  generateOpenGraphTags({
    title: t('gallery.title'),
    description: t('gallery.description'),
    url: `${baseUrl}/${locale}/gallery`,
    type: 'website',
    locale,
    siteName: 'Apartmani Jovča',
    images: [{
      url: `${baseUrl}/images/background.jpg`,
      width: 1200,
      height: 630,
      alt: t('gallery.ogImageAlt')
    }]
  })

  const breadcrumbSchema = generateBreadcrumbSchema('/gallery', locale)

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
      title: t('gallery.title'),
      description: t('gallery.description'),
      url: `${baseUrl}/${locale}/gallery`,
      type: 'website',
      locale,
      siteName: 'Apartmani Jovča',
      images: [{
        url: `${baseUrl}/images/background.jpg`,
        alt: t('gallery.ogImageAlt')
      }]
    },
    twitter: {
      card: 'summary_large_image',
      title: t('gallery.title'),
      description: t('gallery.description'),
      images: [`${baseUrl}/images/background.jpg`]
    },
    other: {
      'application/ld+json': JSON.stringify(breadcrumbSchema)
    }
  }
}

async function getGalleryItems() {
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  const { data, error } = await supabase
    .from('gallery')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching gallery:', error)
    return []
  }
  return data || []
}

export default async function GalleryPage({
  params: { lang }
}: {
  params: { lang: string }
}) {
  const items = await getGalleryItems()

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4 3xl:px-6 4xl:px-8">
        <header className="mb-12 3xl:mb-16 4xl:mb-20 text-center">
          <h1 className="text-4xl md:text-5xl 3xl:text-6xl 4xl:text-7xl font-bold mb-4 3xl:mb-6 uppercase tracking-tight">
            {lang === 'sr' ? 'Galerija' : 
             lang === 'en' ? 'Gallery' : 
             lang === 'de' ? 'Galerie' :
             lang === 'it' ? 'Galleria' : 'Galerija'}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto italic">
            {lang === 'sr' ? 'Uživajte u prelepim prizorima Bovanaskog jezera i enterijeru naših apartmana.' : 
             lang === 'en' ? 'Enjoy the beautiful views of Lake Bovan and the interior of our apartments.' : 
             lang === 'de' ? 'Genießen Sie die schöne Aussicht auf den Bovan-See und das Innere naših Apartments.' : 
             lang === 'it' ? 'Godeti le bellisime viste del lago Bovan e l\'interno dei nostri appartamenti.' : 'Galerija'}
          </p>
        </header>

        <GalleryClient initialItems={items} lang={lang} />
      </div>
    </div>
  )
}
