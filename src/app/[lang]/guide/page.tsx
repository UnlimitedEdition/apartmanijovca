import { Metadata } from 'next'
import { Locale } from '@/lib/types/database'
import { getBaseUrl } from '@/lib/seo/config'
import { generateHreflangTags } from '@/lib/seo/hreflang'
import { convertHreflangToMetadata } from '@/lib/seo/metadata-adapter'
import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo/structured-data'
import { getGuide } from '@/data/guide'

export const revalidate = 86400

interface PageProps {
  params: Promise<{ lang: string }>
}

export async function generateMetadata({ params: paramsInput }: PageProps): Promise<Metadata> {
  const params = await paramsInput
  const locale = params.lang as Locale
  const guide = getGuide(locale)
  const baseUrl = getBaseUrl()

  const hreflangTags = generateHreflangTags({ path: '/guide', locale })

  const canonicalUrl = `${baseUrl}/${locale}/guide`
  const ogImageUrl = `${baseUrl}/images/background.jpg`

  return {
    title: guide.metaTitle,
    description: guide.metaDescription,
    alternates: {
      canonical: canonicalUrl,
      languages: convertHreflangToMetadata(hreflangTags),
    },
    openGraph: {
      title: guide.metaTitle,
      description: guide.metaDescription,
      url: canonicalUrl,
      type: 'article',
      locale,
      siteName: 'Apartmani Jovča',
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: guide.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: guide.metaTitle,
      description: guide.metaDescription,
      images: [ogImageUrl],
    },
  }
}

export default async function GuidePage({ params: paramsInput }: PageProps) {
  const params = await paramsInput
  const locale = params.lang as Locale
  const guide = getGuide(locale)

  const breadcrumbSchema = generateBreadcrumbSchema('/guide', locale)
  const faqSchema = generateFAQSchema(guide.faq, locale)
  const schemas = faqSchema ? [breadcrumbSchema, faqSchema] : [breadcrumbSchema]
  // Safe: content is server-generated structured data (JSON-LD), no user input
  const schemaHtml = JSON.stringify(schemas).replace(/</g, '\\u003c')

  return (
    <>
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schemaHtml }} />
      <div className="container mx-auto px-4 py-10 3xl:py-14 4xl:py-16">
      {/* Hero */}
      <div className="stagger-fade-in text-center py-20 text-white mb-8 3xl:mb-12 4xl:mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-shadow-strong tracking-wide mb-4">
          {guide.title}
        </h1>
        <p className="text-xl text-white/90 text-shadow-medium max-w-2xl mx-auto">
          {guide.intro}
        </p>
        <p className="text-sm text-white/60 mt-3">{guide.updated}</p>
      </div>

      {/* Sections */}
      <div className="max-w-3xl mx-auto space-y-6">
        {guide.sections.map((section, i) => (
          <div
            key={i}
            className="bg-white/85 backdrop-blur-md rounded-2xl shadow-lg border border-white/40 p-8"
          >
            <h2 className="text-2xl font-bold mb-4 text-gray-900">{section.heading}</h2>
            <div className="space-y-3">
              {section.paragraphs.map((paragraph, j) => (
                <p key={j} className="text-gray-700 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        ))}

        {/* FAQ */}
        {guide.faq.length > 0 && (
          <div className="bg-white/85 backdrop-blur-md rounded-2xl shadow-lg border border-white/40 p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">FAQ</h2>
            <div className="space-y-6">
              {guide.faq.map((item, i) => (
                <div key={i} className="border-b border-white/60 pb-6 last:border-b-0 last:pb-0">
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">{item.question}</h3>
                  <p className="text-gray-700 leading-relaxed">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  )
}
