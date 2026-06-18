import { getRequestConfig } from 'next-intl/server'
import { IntlErrorCode } from 'next-intl'
import { notFound } from 'next/navigation'

const locales = ['sr', 'en', 'de', 'it'] as const
type AppLocale = (typeof locales)[number]

function isAppLocale(locale: string | undefined): locale is AppLocale {
  return locales.some((validLocale) => validLocale === locale)
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requestedLocale = await requestLocale

  if (!isAppLocale(requestedLocale)) {
    console.warn('⚠️ Invalid locale requested: ' + requestedLocale + '. Redirecting to 404.')
    notFound()
  }

  return {
    locale: requestedLocale,
    messages: (await import('../../messages/' + requestedLocale + '.json')).default,
    // Resilience: tolerate missing keys (partial translations) instead of crashing render/build
    onError(error) {
      if (error.code === IntlErrorCode.MISSING_MESSAGE) return
      console.error(error)
    },
    getMessageFallback: () => ''
  }
})
