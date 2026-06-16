import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Badge } from '../components/ui/badge'
import SafeImage from '../../../components/SafeImage'
import ContactForm from '../../../components/ContactForm'
import { Locale } from '@/lib/types/database'
import { getBaseUrl, CONTACT_PHONE } from '@/lib/seo/config'
import { generateMetaTags } from '@/lib/seo/meta-generator'
import { generateHreflangTags } from '@/lib/seo/hreflang'

import { generateLocalBusinessSchema, generateBreadcrumbSchema } from '@/lib/seo/structured-data'
import { getKeywordsString } from '@/lib/seo/keywords'

interface PageProps {
  params: { lang: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale = params.lang as Locale
  const t = await getTranslations({ locale, namespace: 'seo' })
  const baseUrl = getBaseUrl()

  // Generate meta tags
  const metaTags = generateMetaTags({
    title: t('contact.title'),
    description: t('contact.description'),
    keywords: getKeywordsString('contact', locale),
    path: `/${locale}/contact`,
    locale,
    type: 'website'
  })

  // Generate hreflang tags
  const hreflangTags = generateHreflangTags({
    path: '/contact',
    locale
  })

  // Generate LocalBusiness schema with NAP (Name, Address, Phone)
  const localBusinessSchema = generateLocalBusinessSchema(locale)

  // Generate Breadcrumb schema
  const breadcrumbSchema = generateBreadcrumbSchema('/contact', locale)

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
      title: t('contact.title'),
      description: t('contact.description'),
      url: `${baseUrl}/${locale}/contact`,
      type: 'website',
      locale,
      siteName: 'Apartmani Jovča',
      images: [{
        url: `${baseUrl}/images/background.jpg`,
        alt: t('contact.ogImageAlt')
      }]
    },
    twitter: {
      card: 'summary_large_image',
      title: t('contact.title'),
      description: t('contact.description'),
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

export default async function ContactPage({ params }: PageProps) {
  const contactT = await getTranslations({ locale: params.lang, namespace: 'contact' })
  const commonT = await getTranslations({ locale: params.lang, namespace: 'common' })

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 max-w-7xl 3xl:max-w-[2000px] 4xl:max-w-[2800px]">
      {/* Hero */}
      <div className="stagger-fade-in text-center py-20 text-white mb-10 sm:mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-shadow-strong tracking-wide mb-4">
          {contactT('title')}
        </h1>
        <p className="text-xl text-white/90 text-shadow-medium max-w-2xl mx-auto px-4">
          {contactT('description')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 sm:gap-12 3xl:gap-16 4xl:gap-20">
        {/* Contact Info */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          <div className="bg-white/85 backdrop-blur-md rounded-2xl shadow-lg border border-white/40 overflow-hidden">
            <div className="bg-zinc-950 text-white p-6 sm:p-8 3xl:p-10 4xl:p-12">
              <h2 className="text-lg sm:text-xl lg:text-2xl 3xl:text-3xl 4xl:text-4xl font-black tracking-tight">{contactT('info.title')}</h2>
              <p className="text-zinc-400 font-medium text-xs sm:text-sm 3xl:text-base 4xl:text-lg">{contactT('info.subtitle')}</p>
            </div>
            <div className="p-6 sm:p-8 3xl:p-10 4xl:p-12 space-y-6 sm:space-y-8 3xl:space-y-10 4xl:space-y-12">
              <div className="flex items-start gap-3 sm:gap-4 3xl:gap-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 3xl:w-16 3xl:h-16 4xl:w-20 4xl:h-20 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 3xl:w-8 3xl:h-8 4xl:w-10 4xl:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                </div>
                <div>
                  <p className="font-black uppercase tracking-widest text-[10px] 3xl:text-xs 4xl:text-sm text-muted-foreground mb-1">{contactT('info.phone')}</p>
                  <a href={`tel:${CONTACT_PHONE.replace(/\s/g, '')}`} className="text-lg sm:text-xl lg:text-2xl 3xl:text-3xl 4xl:text-4xl font-black hover:text-primary transition-colors tracking-tight text-foreground">
                    {CONTACT_PHONE}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 sm:gap-4 3xl:gap-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 3xl:w-16 3xl:h-16 4xl:w-20 4xl:h-20 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 3xl:w-8 3xl:h-8 4xl:w-10 4xl:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <div>
                  <p className="font-black uppercase tracking-widest text-[10px] 3xl:text-xs 4xl:text-sm text-muted-foreground mb-1">{contactT('info.email')}</p>
                  <a href="mailto:apartmanijovca@gmail.com" className="text-xl 3xl:text-2xl 4xl:text-3xl font-black hover:text-primary transition-colors tracking-tight text-foreground">
                    apartmanijovca@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 3xl:gap-6">
                <div className="w-12 h-12 3xl:w-16 3xl:h-16 4xl:w-20 4xl:h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <svg className="w-6 h-6 3xl:w-8 3xl:h-8 4xl:w-10 4xl:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <div>
                  <p className="font-black uppercase tracking-widest text-[10px] 3xl:text-xs 4xl:text-sm text-muted-foreground mb-1">{contactT('info.address')}</p>
                  <p className="text-xl 3xl:text-2xl 4xl:text-3xl font-black tracking-tight text-foreground">
                    {contactT('info.addressValue')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Owner Identity - Trust Building */}
          <div className="bg-white/85 backdrop-blur-md rounded-2xl shadow-lg border border-white/40 p-8 flex flex-col sm:flex-row gap-6 items-center sm:items-start">
            <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 shadow-xl border-4 border-white rotate-3">
              <SafeImage
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Jovca"
                fallbackSrc="https://api.dicebear.com/7.x/initials/svg?seed=J"
                alt={contactT('host.title')}
                className="w-full h-full object-cover bg-white"
              />
            </div>
            <div>
              <p className="font-black text-2xl tracking-tighter mb-1">{contactT('host.title')}</p>
              <p className="text-primary font-bold text-sm mb-4">{contactT('host.since')}</p>
              <p className="text-muted-foreground leading-relaxed font-medium mb-4 italic">
                &quot;{contactT('host.available')}&quot;
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-white/80 backdrop-blur border-primary/20 text-primary font-bold">{contactT('languages.sr')}</Badge>
                <Badge variant="outline" className="bg-white/80 backdrop-blur border-primary/20 text-primary font-bold">{contactT('languages.en')}</Badge>
                <Badge variant="outline" className="bg-white/80 backdrop-blur border-primary/20 text-primary font-bold">{contactT('languages.de')}</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-3">
          <div className="bg-white/85 backdrop-blur-md rounded-2xl shadow-lg border border-white/40 p-6 sm:p-8 md:p-12 3xl:p-16 4xl:p-20">
            <div className="mb-6">
              <h2 className="text-4xl 3xl:text-5xl 4xl:text-6xl font-black tracking-tighter mb-2">{contactT('form.submit')}</h2>
              <p className="text-lg 3xl:text-xl 4xl:text-2xl font-medium">{contactT('form.subtitle')}</p>
            </div>
            <ContactForm
              labels={{
                name: contactT('form.name'),
                email: contactT('form.email'),
                phone: contactT('form.phone'),
                message: contactT('form.message'),
                submit: commonT('send'),
                success: contactT('form.success'),
                error: contactT('form.error')
              }}
            />
          </div>
        </div>
      </div>

      {/* WhatsApp Button removed as it is now handled by global FloatingCTA component */}

      {/* WhatsAppStatus removed for better conversion focus */}
    </div>
  )
}
