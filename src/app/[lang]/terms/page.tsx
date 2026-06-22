import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Locale } from '@/lib/types/database'
import { getBaseUrl, CONTACT_EMAIL, CONTACT_PHONE, WHATSAPP_NUMBER } from '@/lib/seo/config'
import { generateMetaTags } from '@/lib/seo/meta-generator'
import { generateHreflangTags } from '@/lib/seo/hreflang'
import { generateBreadcrumbSchema } from '@/lib/seo/structured-data'
import { getKeywordsString } from '@/lib/seo/keywords'
import { getPublishedSectionContent, getContentText } from '@/lib/content/public-content'

interface PageProps {
  params: Promise<{ lang: string }>
}

export async function generateMetadata({ params: paramsInput }: PageProps): Promise<Metadata> {
  const params = await paramsInput
  const locale = params.lang as Locale
  const t = await getTranslations({ locale, namespace: 'seo' })
  const baseUrl = getBaseUrl()

  const metaTags = generateMetaTags({
    title: t('terms.title'),
    description: t('terms.description'),
    keywords: getKeywordsString('terms', locale),
    path: `/${locale}/terms`,
    locale,
    type: 'website'
  })

  const hreflangTags = generateHreflangTags({
    path: '/terms',
    locale
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
      title: t('terms.title'),
      description: t('terms.description'),
      url: `${baseUrl}/${locale}/terms`,
      type: 'website',
      locale,
      siteName: 'Apartmani Jovča',
      images: [{
        url: `${baseUrl}/images/background.jpg`,
        alt: t('terms.ogImageAlt')
      }]
    },
    twitter: {
      card: 'summary_large_image',
      title: t('terms.title'),
      description: t('terms.description'),
      images: [`${baseUrl}/images/background.jpg`]
    },
  }
}

export default async function TermsPage({ params: paramsInput }: PageProps) {
  const params = await paramsInput
  const locale = params.lang as Locale
  const t = await getTranslations({ locale, namespace: 'legal.terms' })
  const content = await getPublishedSectionContent('terms', locale)
  const legalText = (key: string) => getContentText(content, key, t(key))
  const breadcrumbSchema = generateBreadcrumbSchema('/terms', locale)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, '\\u003c') }}
      />
      <div className="container mx-auto px-4 py-16 3xl:py-20 4xl:py-24">
      {/* Hero */}
      <div className="stagger-fade-in text-center py-20 text-white mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-shadow-strong tracking-wide mb-4">
          {legalText('title')}
        </h1>
        <p className="text-xl text-white/90 text-shadow-medium max-w-2xl mx-auto">
          {legalText('intro')}
        </p>
        <p className="text-sm text-white/70 text-shadow-light mt-3">{legalText('lastUpdated')}</p>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/40 overflow-hidden">
          <div className="bg-zinc-950 text-white p-8">
            <h2 className="text-2xl font-black">{legalText('s1.title')}</h2>
          </div>
          <div className="p-8 space-y-4">
            <p className="leading-relaxed text-gray-700">{legalText('s1.content')}</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li className="leading-relaxed text-gray-700">{legalText('s1.item1')}</li>
              <li className="leading-relaxed text-gray-700">{legalText('s1.item2')}</li>
              <li className="leading-relaxed text-gray-700">{legalText('s1.item3')}</li>
              <li className="leading-relaxed text-gray-700">{legalText('s1.item4')}</li>
            </ul>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/40 overflow-hidden">
          <div className="bg-zinc-950 text-white p-8">
            <h2 className="text-2xl font-black">{legalText('s2.title')}</h2>
          </div>
          <div className="p-8 space-y-4">
            <p className="leading-relaxed text-gray-700">{legalText('s2.content')}</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li className="leading-relaxed text-gray-700">{legalText('s2.item1')}</li>
              <li className="leading-relaxed text-gray-700">{legalText('s2.item2')}</li>
              <li className="leading-relaxed text-gray-700">{legalText('s2.item3')}</li>
            </ul>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/40 overflow-hidden">
          <div className="bg-zinc-950 text-white p-8">
            <h2 className="text-2xl font-black">{legalText('s3.title')}</h2>
          </div>
          <div className="p-8 space-y-4">
            <p className="leading-relaxed text-gray-700">{legalText('s3.content')}</p>
            <div className="bg-primary/5 p-6 rounded-xl border border-primary/20">
              <p className="font-bold mb-2 text-gray-900">{legalText('s3.cancellationTitle')}</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li className="leading-relaxed text-gray-700">{legalText('s3.item1')}</li>
                <li className="leading-relaxed text-gray-700">{legalText('s3.item2')}</li>
                <li className="leading-relaxed text-gray-700">{legalText('s3.item3')}</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/40 overflow-hidden">
          <div className="bg-zinc-950 text-white p-8">
            <h2 className="text-2xl font-black">{legalText('s4.title')}</h2>
          </div>
          <div className="p-8 space-y-4">
            <p className="leading-relaxed text-gray-700">{legalText('s4.content')}</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li className="leading-relaxed text-gray-700">{legalText('s4.item1')}</li>
              <li className="leading-relaxed text-gray-700">{legalText('s4.item2')}</li>
              <li className="leading-relaxed text-gray-700">{legalText('s4.item3')}</li>
              <li className="leading-relaxed text-gray-700">{legalText('s4.item4')}</li>
            </ul>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/40 overflow-hidden">
          <div className="bg-zinc-950 text-white p-8">
            <h2 className="text-2xl font-black">{legalText('s5.title')}</h2>
          </div>
          <div className="p-8 space-y-4">
            <p className="leading-relaxed text-gray-700">{legalText('s5.content')}</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li className="leading-relaxed text-gray-700">{legalText('s5.item1')}</li>
              <li className="leading-relaxed text-gray-700">{legalText('s5.item2')}</li>
              <li className="leading-relaxed text-gray-700">{legalText('s5.item3')}</li>
            </ul>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/40 overflow-hidden">
          <div className="bg-zinc-950 text-white p-8">
            <h2 className="text-2xl font-black">{legalText('s6.title')}</h2>
          </div>
          <div className="p-8 space-y-4">
            <p className="leading-relaxed text-gray-700">{legalText('s6.content')}</p>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/40 overflow-hidden">
          <div className="bg-zinc-950 text-white p-8">
            <h2 className="text-2xl font-black">{legalText('s7.title')}</h2>
          </div>
          <div className="p-8 space-y-4">
            <p className="leading-relaxed text-gray-700">{legalText('s7.content')}</p>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/40 p-8">
          <h3 className="font-black text-xl mb-4 text-gray-900">{legalText('contact.title')}</h3>
          <p className="leading-relaxed mb-4 text-gray-700">{legalText('contact.content')}</p>
          <div className="space-y-2">
            <p className="font-bold text-gray-900">Email: <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">{CONTACT_EMAIL}</a></p>
            <p className="font-bold text-gray-900">Telefon: <a href={`tel:${CONTACT_PHONE.replace(/\s/g, '')}`} className="text-primary hover:underline">{CONTACT_PHONE}</a></p>
            <p className="font-bold text-gray-900">WhatsApp: {WHATSAPP_NUMBER}</p>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
