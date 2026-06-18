import { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import GalleryClient from '@/app/[lang]/gallery/GalleryClient'
import { Locale } from '@/lib/types/database'
import { getBaseUrl } from '@/lib/seo/config'
import { generateMetaTags } from '@/lib/seo/meta-generator'
import { generateHreflangTags } from '@/lib/seo/hreflang'
import { generateOpenGraphTags, generateTwitterCardTags } from '@/lib/seo/social-media'
import { convertTwitterToMetadata } from '@/lib/seo/metadata-adapter'
import { generateBreadcrumbSchema, generateImageSchema } from '@/lib/seo/structured-data'
import { getKeywordsString } from '@/lib/seo/keywords'
import { getTranslations } from 'next-intl/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const revalidate = 3600

interface PageProps {
  params: Promise<{ lang: string }>
}

export async function generateMetadata({ params: paramsInput }: PageProps): Promise<Metadata> {
  const params = await paramsInput
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

  const twitterTags = generateTwitterCardTags({
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
    twitter: convertTwitterToMetadata(twitterTags),
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

/** Resolve localized caption from gallery item (mirrors GalleryClient logic) */
function resolveCaption(
  caption: string | Record<string, string> | null,
  lang: string
): string {
  if (!caption) return ''
  if (typeof caption === 'string') {
    try {
      const parsed = JSON.parse(caption)
      if (typeof parsed === 'object' && parsed !== null) {
        return (parsed as Record<string, string>)[lang] || (parsed as Record<string, string>)['sr'] || ''
      }
      return caption
    } catch {
      return caption
    }
  }
  return caption[lang] || caption['sr'] || ''
}

export default async function GalleryPage({
  params
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const items = await getGalleryItems()

  const baseUrl = getBaseUrl()

  // Build ImageObject @graph — cap at 20 items to keep payload lean
  const imageSchemas = items.slice(0, 20).map(item => {
    const caption = resolveCaption(
      item.caption as string | Record<string, string> | null,
      lang
    )
    return generateImageSchema(item.url, caption || item.url, baseUrl)
  })

  const imageGalleryJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    name:
      lang === 'sr' ? 'Galerija — Apartmani Jovča' :
      lang === 'en' ? 'Gallery — Apartmani Jovča' :
      lang === 'de' ? 'Galerie — Apartmani Jovča' :
      lang === 'it' ? 'Galleria — Apartmani Jovča' : 'Galerija — Apartmani Jovča',
    url: `${baseUrl}/${lang}/gallery`,
    associatedMedia: imageSchemas
  }

  const title =
    lang === 'sr' ? 'Galerija' :
    lang === 'en' ? 'Gallery' :
    lang === 'de' ? 'Galerie' :
    lang === 'it' ? 'Galleria' : 'Galerija'

  const subtitle =
    lang === 'sr' ? 'Uživajte u prelepim prizorima Bovanskog jezera i enterijeru naših apartmana.' :
    lang === 'en' ? 'Enjoy the beautiful views of Lake Bovan and the interior of our apartments.' :
    lang === 'de' ? 'Genießen Sie die schöne Aussicht auf den Bovan-See und das Interieur unserer Apartments.' :
    lang === 'it' ? "Godetevi le bellissime viste del lago Bovan e gli interni dei nostri appartamenti." : ''

  return (
    <div className="min-h-screen">
      {/* ImageGallery + ImageObject JSON-LD (server-generated, no user input) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(imageGalleryJsonLd) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateBreadcrumbSchema('/gallery', lang as Locale)).replace(/</g, '\\u003c') }}
      />

      {/* Page Hero */}
      <div className="py-20 text-center px-4 stagger-fade-in">
        <h1
          className="font-extrabold text-white text-shadow-strong uppercase tracking-tight mb-4"
          style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
        >
          {title}
        </h1>
        <p className="text-white/90 text-shadow-medium max-w-2xl mx-auto italic text-lg">
          {subtitle}
        </p>
      </div>

      {/* Gallery content */}
      <div className="container mx-auto px-4 3xl:px-6 4xl:px-8 pb-16">
        <GalleryClient initialItems={items} lang={lang} />
      </div>
    </div>
  )
}
