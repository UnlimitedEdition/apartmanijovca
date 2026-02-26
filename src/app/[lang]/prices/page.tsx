import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { supabase } from '../lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { getLocalizedValue } from '@/lib/localization/helpers'
import { Locale, ApartmentRecord, MultiLanguageText } from '@/lib/types/database'

interface PageProps {
  params: { lang: string }
}

interface PricesData {
  title?: string
  description?: string
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const t = await getTranslations({ locale: params.lang, namespace: 'prices' })
  return {
    title: `${t('title')} | Apartmani Jovča`,
    description: t('description'),
  }
}

export default async function PricesPage({ params }: PageProps) {
  const t = await getTranslations({ locale: params.lang, namespace: 'prices' })
  const aptT = await getTranslations({ locale: params.lang, namespace: 'apartments' })

  const { data: content } = (await supabase
    ?.from('content')
    .select('data')
    .eq('lang', params.lang)
    .eq('section', 'prices')
    .single()) || { data: null }

  const pricesData: PricesData = content || {}

  // Fetch apartments for dynamic prices
  const { data: apartments } = (await supabase
    ?.from('apartments')
    .select('*')
    .order('base_price_eur', { ascending: true })) as { data: ApartmentRecord[] | null } || { data: [] }

  // Transform JSONB fields to localized strings
  const locale = params.lang as Locale
  const localizedApartments = (apartments || []).map((apt: ApartmentRecord) => ({
    ...apt,
    name: getLocalizedValue(apt.name as unknown as MultiLanguageText, locale),
    description: getLocalizedValue(apt.description as unknown as MultiLanguageText, locale),
    bed_type: getLocalizedValue(apt.bed_type as unknown as MultiLanguageText, locale)
  }))

  return (
    <div className="container py-8 sm:py-12 lg:py-16 max-w-7xl px-4">
      <div className="text-center mb-12 sm:mb-16 lg:mb-20">
        <Badge className="mb-3 sm:mb-4 px-2 sm:px-3 py-0.5 sm:py-1 bg-primary/10 text-primary border-0 font-bold uppercase tracking-widest text-[10px] sm:text-xs">
          {t('title')}
        </Badge>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black tracking-tighter mb-4 sm:mb-6 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
          {pricesData.title || t('title')}
        </h1>
        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto font-medium px-4">
          {pricesData.description || t('description')}
        </p>
      </div>

      {/* Main Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16 lg:mb-20">
        {localizedApartments?.map((apt) => (
          <Card key={apt.id} className="relative overflow-hidden border-0 shadow-2xl shadow-zinc-200/50 dark:shadow-none bg-card group hover:scale-[1.02] transition-all duration-500 rounded-2xl sm:rounded-3xl flex flex-col h-full">
            <div className="h-1.5 sm:h-2 bg-primary w-full" />
            <CardHeader className="p-6 sm:p-8 pb-3 sm:pb-4">
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <Badge variant="outline" className="border-primary/20 text-primary font-bold text-[10px] sm:text-xs">
                  {apt.bed_type}
                </Badge>
              </div>
              <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight mb-2">{apt.name}</CardTitle>
              <CardDescription className="text-base font-medium line-clamp-2">
                {apt.description || aptT('description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0 flex-grow">
              <div className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl p-6 mb-6">
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-5xl font-black tracking-tighter">€{apt.base_price_eur}</span>
                  <span className="text-muted-foreground font-bold">{aptT('perNight')}</span>
                </div>
                <p className="text-sm text-muted-foreground font-medium">{t('allInclusive')}</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm font-bold">
                  <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                  </div>
                  <span>{apt.capacity} {aptT('capacity')}</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-bold">
                  <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                  </div>
                  <span>{Math.ceil(apt.capacity / 2) || 1} {aptT('bedroomLong')}</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-bold">
                  <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                  </div>
                  <span>{t('amenitiesWiFi')}</span>
                </div>
              </div>
            </CardContent>
            <div className="p-8 pt-0">
              <Button className="w-full h-14 bg-zinc-950 text-white hover:bg-primary transition-all rounded-2xl font-black text-lg" size="lg">
                {aptT('bookNow')}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Guest Reviews Section - Trust Anchor */}
      <div className="mt-32">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-12">
          <div className="max-w-xl">
            <h2 className="text-4xl font-black tracking-tighter mb-4">{t('realExperiences')}</h2>
            <p className="text-muted-foreground font-medium text-lg leading-relaxed">
              {t('guestExperiencesDesc')}
            </p>
          </div>
        </div>

        <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-900 rounded-3xl border border-dashed">
          <p className="text-muted-foreground font-bold italic">{t('guestExperiencesDesc')}</p>
        </div>

      </div>
    </div>
  )
}
