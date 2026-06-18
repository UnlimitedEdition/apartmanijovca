import { MetadataRoute } from 'next'
import { getBaseUrl } from '@/lib/seo/config'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl()
  const isLocal = baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')

  // In local development, disallow crawling
  if (process.env.NODE_ENV !== 'production' || isLocal) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    }
  }

  // Production rules
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/*',
          '/portal/*',
          '/api/*',
          '/_next/*',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
