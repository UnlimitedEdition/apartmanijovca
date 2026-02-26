import { getRequestConfig } from 'next-intl/server'
import { notFound } from 'next/navigation'

const locales = ['sr', 'en', 'de', 'it']

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as string)) {
    console.warn(`⚠️ Invalid locale requested: "${locale}". Redirecting to 404.`)
    notFound()
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});
