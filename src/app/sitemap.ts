import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'
import { PRODUCTION_URL } from '@/lib/seo/config'

const LOCALES = ['sr', 'en', 'de', 'it'] as const
type Locale = typeof LOCALES[number]

// Always use production URL for sitemap (not preview URLs)
const BASE_URL = PRODUCTION_URL

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface SitemapEntry {
  url: string
  lastModified?: string | Date
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority?: number
  alternates?: {
    languages?: Record<string, string>
  }
}

// Static pages configuration
const STATIC_PAGES = [
  { path: '', priority: 1.0, changeFreq: 'daily' as const },
  { path: '/apartments', priority: 0.9, changeFreq: 'daily' as const },
  { path: '/location', priority: 0.8, changeFreq: 'monthly' as const },
  { path: '/contact', priority: 0.8, changeFreq: 'monthly' as const },
  { path: '/gallery', priority: 0.7, changeFreq: 'weekly' as const },
  { path: '/attractions', priority: 0.7, changeFreq: 'monthly' as const },
  { path: '/prices', priority: 0.7, changeFreq: 'weekly' as const },
  { path: '/privacy', priority: 0.3, changeFreq: 'yearly' as const },
  { path: '/terms', priority: 0.3, changeFreq: 'yearly' as const },
]

function getStaticPages(): SitemapEntry[] {
  const entries: SitemapEntry[] = []

  for (const page of STATIC_PAGES) {
    for (const locale of LOCALES) {
      const url = `${BASE_URL}/${locale}${page.path}`
      
      // Generate alternate language URLs
      const alternates: Record<string, string> = {}
      for (const altLocale of LOCALES) {
        alternates[altLocale] = `${BASE_URL}/${altLocale}${page.path}`
      }

      entries.push({
        url,
        lastModified: new Date(),
        changeFrequency: page.changeFreq,
        priority: page.priority,
        alternates: {
          languages: alternates
        }
      })
    }
  }

  return entries
}

async function getDynamicPages(): Promise<SitemapEntry[]> {
  const entries: SitemapEntry[] = []

  try {
    // Fetch all active apartments
    const { data: apartments, error } = await supabase
      .from('apartments')
      .select('slug, updated_at')
      .eq('status', 'active')

    if (error) {
      console.error('Error fetching apartments for sitemap:', error)
      return entries
    }

    if (!apartments || apartments.length === 0) {
      return entries
    }

    // Generate sitemap entries for each apartment in all locales
    for (const apartment of apartments) {
      if (!apartment.slug) continue

      for (const locale of LOCALES) {
        const url = `${BASE_URL}/${locale}/apartments/${apartment.slug}`
        
        // Generate alternate language URLs
        const alternates: Record<string, string> = {}
        for (const altLocale of LOCALES) {
          alternates[altLocale] = `${BASE_URL}/${altLocale}/apartments/${apartment.slug}`
        }

        entries.push({
          url,
          lastModified: apartment.updated_at ? new Date(apartment.updated_at) : new Date(),
          changeFrequency: 'weekly',
          priority: 0.7,
          alternates: {
            languages: alternates
          }
        })
      }
    }
  } catch (error) {
    console.error('Error generating dynamic sitemap entries:', error)
  }

  return entries
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = getStaticPages()
  const dynamicPages = await getDynamicPages()

  return [...staticPages, ...dynamicPages]
}
