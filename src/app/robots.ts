import { MetadataRoute } from 'next'
import { getBaseUrl } from '@/lib/seo/config'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl()
  const isProduction = process.env.NODE_ENV === 'production' && 
                       !baseUrl.includes('localhost') && 
                       !baseUrl.includes('vercel.app')

  // In development or staging, disallow all crawling
  if (!isProduction) {
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
