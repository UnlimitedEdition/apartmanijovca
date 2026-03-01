/**
 * Metadata Adapter
 * 
 * Converts our SEO tag objects to Next.js Metadata API format
 */


import type { OpenGraphTags, TwitterCardTags, HreflangTag } from '@/lib/types/seo'

/**
 * Converts OpenGraph tags to Next.js openGraph format
 */
export function convertOpenGraphToMetadata(ogTags: OpenGraphTags) {
  return {
    title: ogTags['og:title'],
    description: ogTags['og:description'],
    url: ogTags['og:url'],
    siteName: ogTags['og:site_name'],
    images: [{
      url: ogTags['og:image'],
      width: 1200,
      height: 630,
      alt: ogTags['og:image:alt']
    }],
    locale: ogTags['og:locale'],
    type: ogTags['og:type'] as 'website' | 'article',
  }
}

/**
 * Converts Twitter Card tags to Next.js twitter format
 */
export function convertTwitterToMetadata(twitterTags: TwitterCardTags) {
  return {
    card: twitterTags['twitter:card'],
    title: twitterTags['twitter:title'],
    description: twitterTags['twitter:description'],
    images: [twitterTags['twitter:image']]
  }
}

/**
 * Converts hreflang tags to Next.js alternates.languages format
 */
export function convertHreflangToMetadata(hreflangTags: HreflangTag[]) {
  return hreflangTags.reduce((acc, tag) => {
    if (tag.hreflang !== 'x-default') {
      acc[tag.hreflang] = tag.href
    }
    return acc
  }, {} as Record<string, string>)
}
