import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Locale } from '@/lib/types/database'
import { getBaseUrl } from '@/lib/seo/config'
import { generateMetaTags } from '@/lib/seo/meta-generator'
import { generateHreflangTags } from '@/lib/seo/hreflang'
import { generateOpenGraphTags } from '@/lib/seo/social-media'
import { generateLocalBusinessSchema, generateBreadcrumbSchema } from '@/lib/seo/structured-data'
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
    title: t('location.title'),
    description: t('location.description'),
    keywords: getKeywordsString('location', locale),
    path: `/${locale}/location`,
    locale,
    type: 'website'
  })

  // Generate hreflang tags
  const hreflangTags = generateHreflangTags({
    path: '/location',
    locale
  })

  // Generate Open Graph tags
  generateOpenGraphTags({
    title: t('location.title'),
    description: t('location.description'),
    url: `${baseUrl}/${locale}/location`,
    type: 'website',
    locale,
    siteName: 'Apartmani Jovča',
    images: [{
      url: `${baseUrl}/images/background.jpg`,
      width: 1200,
      height: 630,
      alt: t('location.ogImageAlt')
    }]
  })

  // Generate LocalBusiness schema with geo coordinates
  const localBusinessSchema = generateLocalBusinessSchema(locale)

  // Generate Breadcrumb schema
  const breadcrumbSchema = generateBreadcrumbSchema('/location', locale)

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
      title: t('location.title'),
      description: t('location.description'),
      url: `${baseUrl}/${locale}/location`,
      type: 'website',
      locale,
      siteName: 'Apartmani Jovča',
      images: [{
        url: `${baseUrl}/images/background.jpg`,
        alt: t('location.ogImageAlt')
      }]
    },
    twitter: {
      card: 'summary_large_image',
      title: t('location.title'),
      description: t('location.description'),
      images: [`${baseUrl}/images/background.jpg`]
    },
    other: {
      'application/ld+json': JSON.stringify([
        localBusinessSchema,
        breadcrumbSchema
      ])
    }
  }
}

export default async function LocationPage({ params }: PageProps) {
  const t = await getTranslations({ locale: params.lang, namespace: 'location' })
  const commonT = await getTranslations({ locale: params.lang, namespace: 'common' })

  // Breadcrumb items
  const breadcrumbItems = [
    { label: commonT('home'), href: `/${params.lang}` },
    { label: t('title'), current: true }
  ]

  return (
    <div className="container py-10 3xl:py-14 4xl:py-16">
      <Breadcrumb items={breadcrumbItems} />
      
      <div className="mb-8 3xl:mb-12 4xl:mb-16 text-center">
        <h1 className="text-4xl 3xl:text-5xl 4xl:text-6xl font-bold mb-4 3xl:mb-6">{t('title')}</h1>
        <p className="text-muted-foreground text-lg 3xl:text-xl 4xl:text-2xl">
          {t('description')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 3xl:gap-16 4xl:gap-20 items-start">
        <div className="lg:col-span-1 space-y-10">
          <div className="bg-white p-8 rounded-2xl border shadow-sm">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              {t('address')}
            </h2>
            <address className="not-italic text-lg text-zinc-700 leading-relaxed mb-6 font-medium">
              {t('addressName')}<br />
              {t('addressStreet')}<br />
              {t('addressLake')}<br />
              {t('addressCity')}
            </address>
            <div className="space-y-4">
              <a 
                href="https://www.google.com/maps/dir//43.64617888011119,21.702344251651983"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-black text-white hover:bg-zinc-800 px-6 py-3 rounded-full font-bold transition-all shadow-lg"
              >
                {t('googleMaps')}
              </a>
              <a 
                href="tel:+381652378080"
                className="flex items-center justify-center gap-2 w-full bg-zinc-100 text-black hover:bg-zinc-200 px-6 py-3 rounded-full font-bold transition-all"
              >
                {t('callDirections')}
              </a>
            </div>
          </div>

          <div className="bg-zinc-50 p-8 rounded-2xl border">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {t('reachTitle')}
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-lg mb-2">{t('byCarTitle')}</h3>
                <p className="text-muted-foreground">
                  {t('byCarDesc')}
                </p>
              </div>
              <div className="border-t pt-4">
                <h3 className="font-bold text-lg mb-2">{t('byBusTitle')}</h3>
                <p className="text-muted-foreground">
                  {t('byBusDesc')}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 h-[600px] bg-zinc-100 rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d606.8016731075406!2d21.702344251651983!3d43.64617888011119!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zNDPCsDM4JzQ1LjkiTiAyMcKwNDInMDkuNyJF!5e1!3m2!1ssr!2srs!4v1771085634374!5m2!1ssr!2srs"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={`${t('title')} - Apartmani Jovca`}
          />
        </div>
      </div>


      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">{t('nearbyTitle')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 border rounded-lg">
            <h3 className="font-semibold mb-2">{t('bovanLake')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('bovanLakeDesc')}
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="font-semibold mb-2">{t('sokolica')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('sokolicaDesc')}
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="font-semibold mb-2">{t('nis')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('nisDesc')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
