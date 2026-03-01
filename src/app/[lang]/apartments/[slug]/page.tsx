import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
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
  params: { lang: Locale; slug: string }
}

async function getApartment(slug: string, locale: Locale) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  )

  const { data, error } = await supabase
    .from('apartments')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'active')
    .single()

  if (error || !data) return null

  return transformApartmentRecord(data as ApartmentRecord, locale)
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale = params.lang
  const apartment = await getApartment(params.slug, locale)
  const t = await getTranslations({ locale, namespace: 'seo' })
  const baseUrl = getBaseUrl()

  if (!apartment) {
    return {
      title: t('apartmentDetail.notFound'),
    }
  }

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

  // Fetch apartment record for structured data
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  )

  const { data: apartmentRecord } = await supabase
    .from('apartments')
    .select('*')
    .eq('slug', params.slug)
    .single()

  // Generate LodgingBusiness schema
  const lodgingSchema = apartmentRecord 
    ? generateLodgingBusinessSchema({
        id: apartmentRecord.id,
        slug: apartmentRecord.slug || '',
        name: apartment.name,
        description: apartment.description,
        images: apartment.images,
        basePrice: apartmentRecord.base_price_eur,
        capacity: apartmentRecord.capacity,
        numberOfRooms: apartmentRecord.bathroom_count || undefined,
        amenities: apartment.amenities
      }, locale)
    : null

  // Generate Breadcrumb schema
  const breadcrumbSchema = generateBreadcrumbSchema(`/apartments/${params.slug}`, locale)

  // Fetch reviews for Review schema
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*')
    .eq('apartment_id', apartmentRecord?.id)
    .eq('status', 'approved')

  const reviewSchema = reviews && reviews.length > 0 
    ? generateReviewSchema(reviews.map(r => ({
        id: r.id,
        author: r.guest_name,
        rating: r.rating,
        comment: r.comment || '',
        createdAt: r.created_at,
        approved: r.status === 'approved'
      })))
    : null

  // Combine structured data
  const structuredData = [
    lodgingSchema,
    breadcrumbSchema,
    reviewSchema
  ].filter(Boolean)

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
    other: {
      'application/ld+json': JSON.stringify(structuredData)
    }
  }
}

export default async function ApartmentPage({ params }: PageProps) {
  const apartment = await getApartment(params.slug, params.lang)

  if (!apartment || !apartment.slug) {
    notFound()
  }

  // Type assertion is safe here because we've checked slug is not null
  return <ApartmentDetailView apartment={apartment as typeof apartment & { slug: string }} locale={params.lang} />
}
