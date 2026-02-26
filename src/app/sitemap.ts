import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://apartmani-jovca.com'
  const langs = ['en', 'sr', 'it', 'de']
  const pages = ['', 'gallery', 'prices', 'attractions', 'contact']

  const sitemap: MetadataRoute.Sitemap = []

  for (const lang of langs) {
    for (const page of pages) {
      sitemap.push({
        url: `${baseUrl}/${lang}${page ? `/${page}` : ''}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: page === '' ? 1 : 0.8,
      })
    }
  }

  return sitemap
}
