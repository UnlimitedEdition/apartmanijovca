import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { supabase } from '../lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import SafeImage from '../../../components/SafeImage'
import ContactForm from '../../../components/ContactForm'

interface PageProps {
  params: { lang: string }
}

interface ContactData {
  title?: string
  description?: string
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const t = await getTranslations({ locale: params.lang, namespace: 'contact' })
  return {
    title: `${t('title')} | Apartmani Jovča`,
    description: t('description'),
  }
}

export default async function ContactPage({ params }: PageProps) {
  const contactT = await getTranslations({ locale: params.lang, namespace: 'contact' })
  const commonT = await getTranslations({ locale: params.lang, namespace: 'common' })

  const { data: content } = (await supabase
    ?.from('content')
    .select('data')
    .eq('lang', params.lang)
    .eq('section', 'contact')
    .single()) || { data: null }

  const contactData: ContactData = content || {}

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 max-w-7xl">
      <div className="text-center mb-10 sm:mb-16">
        <Badge className="mb-3 sm:mb-4 px-2 sm:px-3 py-0.5 sm:py-1 bg-primary/10 text-primary border-0 font-bold uppercase tracking-widest text-[10px] sm:text-xs">
          {contactT('title')}
        </Badge>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black tracking-tighter mb-4 sm:mb-6 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
          {contactData.title || contactT('title')}
        </h1>
        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto font-medium px-4">
          {contactData.description || contactT('description')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 sm:gap-12">
        {/* Contact Info */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          <Card className="border-0 shadow-2xl shadow-zinc-200/50 dark:shadow-none overflow-hidden rounded-2xl sm:rounded-3xl">
            <CardHeader className="bg-zinc-950 text-white p-6 sm:p-8">
              <CardTitle className="text-lg sm:text-xl lg:text-2xl font-black tracking-tight">{contactT('info.title')}</CardTitle>
              <CardDescription className="text-zinc-400 font-medium text-xs sm:text-sm">{contactT('info.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent className="p-6 sm:p-8 space-y-6 sm:space-y-8">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                </div>
                <div>
                  <p className="font-black uppercase tracking-widest text-[10px] text-muted-foreground mb-1">{contactT('info.phone')}</p>
                  <a href="tel:+381652378080" className="text-lg sm:text-xl lg:text-2xl font-black hover:text-primary transition-colors tracking-tight text-foreground">
                    +381 65 237 8080
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <div>
                  <p className="font-black uppercase tracking-widest text-[10px] text-muted-foreground mb-1">{contactT('info.email')}</p>
                  <a href="mailto:apartmanijovca@gmail.com" className="text-xl font-black hover:text-primary transition-colors tracking-tight text-foreground">
                    apartmanijovca@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <div>
                  <p className="font-black uppercase tracking-widest text-[10px] text-muted-foreground mb-1">{contactT('info.address')}</p>
                  <p className="text-xl font-black tracking-tight text-foreground">
                    {contactT('info.addressValue')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Owner Identity - Trust Building */}
          <Card className="border-0 bg-primary/5 rounded-3xl overflow-hidden p-8 flex flex-col sm:flex-row gap-6 items-center sm:items-start">
            <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 shadow-xl border-4 border-white rotate-3">
              <SafeImage 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Jovca" 
                fallbackSrc="https://api.dicebear.com/7.x/initials/svg?seed=J"
                alt={contactT('host.title')} 
                className="w-full h-full object-cover bg-white"
              />
            </div>
            <div>
              <h3 className="font-black text-2xl tracking-tighter mb-1">{contactT('host.title')}</h3>
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
          </Card>
        </div>


        {/* Contact Form */}
        <div className="lg:col-span-3">
          <Card className="border-0 shadow-2xl shadow-zinc-200/50 rounded-3xl p-4 sm:p-8 md:p-12">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-4xl font-black tracking-tighter mb-2">{contactT('form.submit')}</CardTitle>
              <CardDescription className="text-lg font-medium">{contactT('form.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
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
            </CardContent>
          </Card>
        </div>
      </div>

      {/* WhatsApp Button removed as it is now handled by global FloatingCTA component */}


      {/* WhatsAppStatus removed for better conversion focus */}
    </div>
  )
}
