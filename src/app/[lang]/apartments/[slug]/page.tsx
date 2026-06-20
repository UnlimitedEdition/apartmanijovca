import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import { createClient } from '@supabase/supabase-js'
import ApartmentDetailView from './ApartmentDetailView'
import { transformApartmentRecord } from '@/lib/transformers/database'
import type { ApartmentRecord, Locale } from '@/lib/types/database'
import { getBaseUrl } from '@/lib/seo/config'
import { generateMetaTags } from '@/lib/seo/meta-generator'
import { generateHreflangTags } from '@/lib/seo/hreflang'
import { generateOpenGraphTags, generateTwitterCardTags, optimizeImageForSocial } from '@/lib/seo/social-media'
import {
  generateLodgingBusinessSchema,
  generateBreadcrumbSchema,
  generateReviewSchema
} from '@/lib/seo/structured-data'
import { getKeywordsString } from '@/lib/seo/keywords'
import { truncateText } from '@/lib/seo/utils'
import { getTranslations } from 'next-intl/server'
import {
  convertOpenGraphToMetadata,
  convertTwitterToMetadata,
  convertHreflangToMetadata
} from '@/lib/seo/metadata-adapter'

interface PageProps {
  params: Promise<{ lang: Locale; slug: string }>
}

const LOCALES: Locale[] = ['sr', 'en', 'de', 'it']

// ISR — apartman stranice se prerenderuju i keširaju na CDN-u (revalidate 1h).
export const revalidate = 3600

// Public anon client (BEZ cookies) — drži rutu statički renderibilnom (ISR/SSG).
// Korišćenje cookies()/createServerClient bi rutu prebacilo na force-dynamic
// (bez CDN keša → visok TTFB → loš mobilni LCP).
const supabasePublic = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Dedupe apartment fetch između generateMetadata + page u istom request-u.
const getApartmentRaw = cache(async (slug: string): Promise<ApartmentRecord | null> => {
  const { data, error } = await supabasePublic
    .from('apartments')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'active')
    .single()

  if (error || !data) return null
  return data as ApartmentRecord
})

export async function generateStaticParams() {
  const { data } = await supabasePublic
    .from('apartments')
    .select('slug')
    .eq('status', 'active')

  return (data ?? []).flatMap((a: { slug: string | null }) =>
    a.slug ? LOCALES.map((lang) => ({ lang, slug: a.slug as string })) : []
  )
}

export async function generateMetadata({ params: paramsInput }: PageProps): Promise<Metadata> {
  const params = await paramsInput
  const locale = params.lang
  const raw = await getApartmentRaw(params.slug)
  const t = await getTranslations({ locale, namespace: 'seo' })
  const baseUrl = getBaseUrl()

  if (!raw) {
    return {
      title: t('apartmentDetail.notFound'),
    }
  }

  const apartment = transformApartmentRecord(raw, locale)

  // Get first image for og:image
  const firstImage = apartment.images && apartment.images.length > 0
    ? apartment.images[0]
    : `${baseUrl}/images/background.jpg`

  // Optimize image for social media (1200x630)
  const ogImage = optimizeImageForSocial(firstImage)

  // Truncate description to 160 characters
  const description = truncateText(apartment.description, 160)

  // Generate meta tags
  const metaTags = generateMetaTags({
    title: `${apartment.name} - ${t('apartmentDetail.titleSuffix')}`,
    description,
    keywords: getKeywordsString('apartment-detail', locale),
    path: `/${locale}/apartments/${params.slug}`,
    locale,
    type: 'website'
  })

  // Generate hreflang tags
  const hreflangTags = generateHreflangTags({
    path: `/apartments/${params.slug}`,
    locale
  })

  // Generate Open Graph tags
  const ogTags = generateOpenGraphTags({
    title: `${apartment.name} - Apartmani Jovča`,
    description,
    url: `${baseUrl}/${locale}/apartments/${params.slug}`,
    type: 'website',
    locale,
    siteName: 'Apartmani Jovča',
    images: [{
      url: ogImage,
      width: 1200,
      height: 630,
      alt: apartment.name
    }]
  })

  // Generate Twitter Card tags
  const twitterTags = generateTwitterCardTags({
    title: `${apartment.name} - Apartmani Jovča`,
    description,
    url: `${baseUrl}/${locale}/apartments/${params.slug}`,
    locale,
    images: [{
      url: ogImage,
      alt: apartment.name
    }]
  })

  return {
    title: metaTags.title,
    description: metaTags.description,
    keywords: getKeywordsString('apartment-detail', locale).split(', '),
    robots: metaTags.robots,
    alternates: {
      canonical: metaTags.canonical,
      languages: convertHreflangToMetadata(hreflangTags)
    },
    openGraph: convertOpenGraphToMetadata(ogTags),
    twitter: convertTwitterToMetadata(twitterTags),
  }
}

export default async function ApartmentPage({ params: paramsInput }: PageProps) {
  const params = await paramsInput
  const locale = params.lang
  const raw = await getApartmentRaw(params.slug)

  if (!raw || !raw.slug) {
    notFound()
  }

  const apartment = transformApartmentRecord(raw, locale)

  // Reviews for structured data (separate table, single query)
  const { data: reviews } = await supabasePublic
    .from('reviews')
    .select('*')
    .eq('apartment_id', raw.id)
    .eq('status', 'approved')

  const reviewData = reviews && reviews.length > 0
    ? generateReviewSchema(reviews.map(r => ({
        id: r.id,
        author: r.guest_name,
        rating: r.rating,
        comment: r.comment || '',
        createdAt: r.created_at,
        approved: r.status === 'approved'
      })))
    : null

  const lodgingSchema = (() => {
    const schema = generateLodgingBusinessSchema({
      id: raw.id,
      slug: raw.slug || '',
      name: apartment.name,
      description: apartment.description,
      images: apartment.images,
      basePrice: raw.base_price_eur,
      capacity: raw.capacity,
      amenities: apartment.amenities,
      size_sqm: raw.size_sqm ?? null,
      bed_type: apartment.bed_type || null,
      bathroom_count: raw.bathroom_count ?? null
    }, locale)
    if (reviewData) {
      schema.aggregateRating = reviewData.aggregateRating
      schema.review = reviewData.review
    }
    return schema
  })()

  const breadcrumbSchema = generateBreadcrumbSchema(`/apartments/${params.slug}`, locale)

  const structuredData = [lodgingSchema, breadcrumbSchema].filter(Boolean)

  // Type assertion is safe here because we've checked slug is not null
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }}
      />
      <ApartmentDetailView apartment={apartment as typeof apartment & { slug: string }} locale={locale} />
    </>
  )
}
