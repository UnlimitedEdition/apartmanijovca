import { Metadata } from 'next'
import { useTranslations } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Locale } from '@/lib/types/database'
import { getBaseUrl, CONTACT_EMAIL, CONTACT_PHONE, WHATSAPP_NUMBER } from '@/lib/seo/config'
import { generateMetaTags } from '@/lib/seo/meta-generator'
import { generateHreflangTags } from '@/lib/seo/hreflang'
import { generateOpenGraphTags, generateTwitterCardTags } from '@/lib/seo/social-media'
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
    title: t('privacy.title'),
    description: t('privacy.description'),
    keywords: getKeywordsString('privacy', locale),
    path: `/${locale}/privacy`,
    locale,
    type: 'website'
  })

  const hreflangTags = generateHreflangTags({
    path: '/privacy',
    locale
  })

  const ogTags = generateOpenGraphTags({
    title: t('privacy.title'),
    description: t('privacy.description'),
    url: `${baseUrl}/${locale}/privacy`,
    type: 'website',
    locale,
    siteName: 'Apartmani Jovča',
    images: [{
      url: `${baseUrl}/images/background.jpg`,
      width: 1200,
      height: 630,
      alt: t('privacy.ogImageAlt')
    }]
  })

  const breadcrumbSchema = generateBreadcrumbSchema('/privacy', locale)

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
      title: t('privacy.title'),
      description: t('privacy.description'),
      url: `${baseUrl}/${locale}/privacy`,
      type: 'website',
      locale,
      siteName: 'Apartmani Jovča',
      images: [{
        url: `${baseUrl}/images/background.jpg`,
        alt: t('privacy.ogImageAlt')
      }]
    },
    twitter: {
      card: 'summary_large_image',
      title: t('privacy.title'),
      description: t('privacy.description'),
      images: [`${baseUrl}/images/background.jpg`]
    },
    other: {
      'application/ld+json': JSON.stringify(breadcrumbSchema)
    }
  }
}

export default function PrivacyPage() {
  const t = useTranslations('legal.privacy')

  return (
    <div className="container mx-auto px-4 py-16 3xl:py-20 4xl:py-24 max-w-5xl 3xl:max-w-6xl 4xl:max-w-7xl">
      <div className="mb-12 3xl:mb-16 4xl:mb-20">
        <h1 className="text-5xl md:text-6xl 3xl:text-7xl 4xl:text-8xl font-black tracking-tighter mb-4 3xl:mb-6">{t('title')}</h1>
        <p className="text-xl text-muted-foreground">{t('intro')}</p>
        <p className="text-sm text-muted-foreground mt-4">{t('lastUpdated')}</p>
      </div>

      <div className="space-y-6">
        <Card className="border-0 shadow-lg rounded-3xl overflow-hidden">
          <CardHeader className="bg-zinc-950 text-white p-8">
            <CardTitle className="text-2xl font-black">{t('s1.title')}</CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-4">
            <p className="leading-relaxed">{t('s1.content')}</p>
            <div className="bg-blue-50 dark:bg-blue-950/20 p-6 rounded-2xl border-2 border-blue-100 dark:border-blue-900">
              <p className="font-bold mb-3">{t('s1.dataTitle')}</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li className="leading-relaxed">{t('s1.item1')}</li>
                <li className="leading-relaxed">{t('s1.item2')}</li>
                <li className="leading-relaxed">{t('s1.item3')}</li>
                <li className="leading-relaxed">{t('s1.item4')}</li>
                <li className="leading-relaxed">{t('s1.item5')}</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg rounded-3xl overflow-hidden">
          <CardHeader className="bg-zinc-950 text-white p-8">
            <CardTitle className="text-2xl font-black">{t('s2.title')}</CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-4">
            <p className="leading-relaxed">{t('s2.content')}</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li className="leading-relaxed">{t('s2.item1')}</li>
              <li className="leading-relaxed">{t('s2.item2')}</li>
              <li className="leading-relaxed">{t('s2.item3')}</li>
              <li className="leading-relaxed">{t('s2.item4')}</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg rounded-3xl overflow-hidden">
          <CardHeader className="bg-zinc-950 text-white p-8">
            <CardTitle className="text-2xl font-black">{t('s3.title')}</CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-4">
            <p className="leading-relaxed">{t('s3.content')}</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li className="leading-relaxed">{t('s3.item1')}</li>
              <li className="leading-relaxed">{t('s3.item2')}</li>
              <li className="leading-relaxed">{t('s3.item3')}</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg rounded-3xl overflow-hidden">
          <CardHeader className="bg-zinc-950 text-white p-8">
            <CardTitle className="text-2xl font-black">{t('s4.title')}</CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-4">
            <p className="leading-relaxed">{t('s4.content')}</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li className="leading-relaxed">{t('s4.item1')}</li>
              <li className="leading-relaxed">{t('s4.item2')}</li>
              <li className="leading-relaxed">{t('s4.item3')}</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg rounded-3xl overflow-hidden">
          <CardHeader className="bg-zinc-950 text-white p-8">
            <CardTitle className="text-2xl font-black">{t('s5.title')}</CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-4">
            <p className="leading-relaxed">{t('s5.content')}</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li className="leading-relaxed">{t('s5.item1')}</li>
              <li className="leading-relaxed">{t('s5.item2')}</li>
              <li className="leading-relaxed">{t('s5.item3')}</li>
              <li className="leading-relaxed">{t('s5.item4')}</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg rounded-3xl overflow-hidden">
          <CardHeader className="bg-zinc-950 text-white p-8">
            <CardTitle className="text-2xl font-black">{t('s6.title')}</CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-4">
            <p className="leading-relaxed">{t('s6.content')}</p>
          </CardContent>
        </Card>

        <div className="bg-zinc-50 dark:bg-zinc-900 p-8 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
          <h3 className="font-black text-xl mb-4">{t('contact.title')}</h3>
          <p className="leading-relaxed mb-4">{t('contact.content')}</p>
          <div className="space-y-2">
            <p className="font-bold">Email: {CONTACT_EMAIL}</p>
            <p className="font-bold">Telefon: {CONTACT_PHONE}</p>
            <p className="font-bold">WhatsApp: {WHATSAPP_NUMBER}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
