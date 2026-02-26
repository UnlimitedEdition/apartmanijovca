import { ReactNode } from 'react'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { Layout } from './components/layout/layout'

interface LangLayoutProps {
  children: ReactNode
  params: { lang: string }
}

export default async function LangLayout({ children, params: { lang } }: LangLayoutProps) {
  const messages = await getMessages()

  return (
    <NextIntlClientProvider locale={lang} messages={messages}>
      <Layout>
        {children}
      </Layout>
    </NextIntlClientProvider>
  )
}
