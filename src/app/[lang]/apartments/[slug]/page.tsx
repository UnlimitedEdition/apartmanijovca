import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import ApartmentDetailView from './ApartmentDetailView'
import { transformApartmentRecord } from '@/lib/transformers/database'
import type { ApartmentRecord, Locale } from '@/lib/types/database'

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
  const apartment = await getApartment(params.slug, params.lang)

  if (!apartment) {
    return {
      title: 'Apartman nije pronađen',
    }
  }

  return {
    title: `${apartment.name} - Apartmani Jovča`,
    description: apartment.description.substring(0, 160),
    openGraph: {
      title: `${apartment.name} - Apartmani Jovča`,
      description: apartment.description.substring(0, 160),
      images: apartment.images.slice(0, 1),
      type: 'website',
    },
  }
}

export default async function ApartmentPage({ params }: PageProps) {
  const apartment = await getApartment(params.slug, params.lang)

  if (!apartment) {
    notFound()
  }

  return <ApartmentDetailView apartment={apartment} locale={params.lang} />
}
