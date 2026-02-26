import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { supabase } from '../lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'

type PageProps = {
  params: { lang: string }
}

// export async function generateStaticParams() {
//   return [
//     { lang: 'en' },
//     { lang: 'sr' },
//     { lang: 'it' },
//     { lang: 'de' }
//   ]
// }

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const t = await getTranslations({ locale: params.lang, namespace: 'attractions' })
  const { data: content } = (await supabase
    .from('content')
    .select('data')
    .eq('lang', params.lang)
    .eq('section', 'attractions')
    .single()) as { data: AttractionsData | null } || { data: null }

  const attractionsData: AttractionsData = content || {}

  return {
    title: `${attractionsData.title || t('title')} | Apartmani Jovča`,
    description: attractionsData.description || t('description'),
  }
}

interface Attraction {
  name: string
  description: string
}

interface AttractionsData {
  title?: string
  description?: string
  list?: Attraction[]
  mapLink?: string
}

export default async function AttractionsPage({ params }: PageProps) {
  const t = await getTranslations({ locale: params.lang, namespace: 'attractions' })
  const { data: content } = (await supabase
    .from('content')
    .select('data')
    .eq('lang', params.lang)
    .eq('section', 'attractions')
    .single()) as { data: AttractionsData | null } || { data: null }

  const attractionsData: AttractionsData = content || {}

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold mb-3 sm:mb-4">
          {attractionsData.title || t('title')}
        </h1>
        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-6 sm:mb-8 px-4">
          {attractionsData.description || t('description')}
        </p>
      </div>

      {Array.isArray(attractionsData.list) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {attractionsData.list.map((attraction: Attraction, index: number) => (
            <Card key={index} className="h-full">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg lg:text-xl">{attraction.name}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <p className="text-muted-foreground text-xs sm:text-sm lg:text-base">{attraction.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {attractionsData.mapLink && (
        <div className="text-center mt-8 sm:mt-12">
          <a
            href={attractionsData.mapLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 sm:px-6 py-2.5 sm:py-3 border border-transparent text-xs sm:text-sm lg:text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            {t('viewOnMap')}
          </a>
        </div>
      )}
    </div>
  )
}

