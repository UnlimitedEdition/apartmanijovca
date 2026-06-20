import { ReactNode } from 'react'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { Layout } from './components/layout/layout'
import HtmlLang from './HtmlLang'

interface LangLayoutProps {
  children: ReactNode
  params: Promise<{ lang: string }>
}

export function generateStaticParams() {
  return [{ lang: 'sr' }, { lang: 'en' }, { lang: 'de' }, { lang: 'it' }]
}

export default async function LangLayout({ children, params }: LangLayoutProps) {
  const { lang } = await params
  const messages = await getMessages()

  return (
    <NextIntlClientProvider locale={lang} messages={messages}>
      <HtmlLang lang={lang} />
      <Layout>
        {children}
      </Layout>
    </NextIntlClientProvider>
  )
}
