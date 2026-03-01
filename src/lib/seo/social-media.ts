/**
 * Social Media Optimizer Module
 * 
 * Generates Open Graph and Twitter Card metadata for rich social media sharing.
 * Optimizes images for social media display (1200x630 dimensions).
 * Supports multi-language metadata with locale and alternate locale tags.
 */

import type { SocialMediaInput, OpenGraphTags, TwitterCardTags, Locale } from '@/lib/types/seo'
import { getSEOConfig } from './config'

/**
 * Generates Open Graph tags for Facebook, LinkedIn, and other platforms
 * 
 * @param input - Social media metadata input
 * @returns Open Graph tags object
 * 
 * @example
 * const ogTags = generateOpenGraphTags({
 *   title: "Studio Apartment 1",
 *   description: "Cozy studio apartment near Bovan Lake",
 *   image: "https://res.cloudinary.com/.../apartment.jpg",
 *   url: "https://apartmani-jovca.rs/en/apartments/studio-1",
 *   locale: "en",
 *   type: "website"
 * })
 */
export function generateOpenGraphTags(input: SocialMediaInput): OpenGraphTags {
  const config = getSEOConfig()
  
  // Map locale to Open Graph locale format
  const localeMap: Record<Locale, string> = {
    sr: 'sr_RS',
    en: 'en_US',
    de: 'de_DE',
    it: 'it_IT'
  }
  
  // Get all alternate locales (all locales except current)
  const alternateLocales = config.locales
    .filter(loc => loc !== input.locale)
    .map(loc => localeMap[loc])
  
  // Get first image or use empty string
  const firstImage = input.images && input.images.length > 0 ? input.images[0] : { url: '', alt: '' }
  
  // Optimize image for social media if it's a Cloudinary URL
  const optimizedImage = optimizeImageForSocial(firstImage.url)
  
  return {
    'og:title': input.title,
    'og:description': input.description,
    'og:image': optimizedImage,
    'og:image:alt': firstImage.alt,
    'og:url': input.url,
    'og:type': input.type || 'website',
    'og:locale': localeMap[input.locale],
    'og:locale:alternate': alternateLocales,
    'og:site_name': input.siteName || config.siteName
  }
}

/**
 * Generates Twitter Card tags for enhanced Twitter link previews
 * 
 * @param input - Social media metadata input
 * @returns Twitter Card tags object
 * 
 * @example
 * const twitterTags = generateTwitterCardTags({
 *   title: "Studio Apartment 1",
 *   description: "Cozy studio apartment near Bovan Lake",
 *   image: "https://res.cloudinary.com/.../apartment.jpg",
 *   url: "https://apartmani-jovca.rs/en/apartments/studio-1",
 *   locale: "en"
 * })
 */
export function generateTwitterCardTags(input: SocialMediaInput): TwitterCardTags {
  // Get first image or use empty string
  const firstImage = input.images && input.images.length > 0 ? input.images[0] : { url: '', alt: '' }
  
  // Optimize image for social media if it's a Cloudinary URL
  const optimizedImage = optimizeImageForSocial(firstImage.url)
  
  return {
    'twitter:card': 'summary_large_image',
    'twitter:title': input.title,
    'twitter:description': input.description,
    'twitter:image': optimizedImage,
    'twitter:image:alt': firstImage.alt
  }
}

/**
 * Optimizes an image URL for social media display
 * Ensures 1200x630 dimensions for optimal Open Graph and Twitter Card display
 * 
 * For Cloudinary URLs, applies transformations:
 * - Width: 1200px
 * - Height: 630px
 * - Crop: fill (maintains aspect ratio, fills entire area)
 * - Format: auto (WebP with fallback)
 * - Quality: auto (optimized for file size)
 * 
 * For non-Cloudinary URLs, returns the original URL unchanged
 * 
 * @param imageUrl - The image URL to optimize
 * @returns Optimized image URL
 * 
 * @example
 * // Cloudinary URL
 * optimizeImageForSocial("https://res.cloudinary.com/dp2aulqeb/image/upload/v1234/apartment.jpg")
 * // Returns: "https://res.cloudinary.com/dp2aulqeb/image/upload/w_1200,h_630,c_fill,f_auto,q_auto/v1234/apartment.jpg"
 * 
 * // Non-Cloudinary URL
 * optimizeImageForSocial("https://example.com/image.jpg")
 * // Returns: "https://example.com/image.jpg"
 */
export function optimizeImageForSocial(imageUrl: string): string {
  if (!imageUrl) {
    return imageUrl
  }
  
  // Check if this is a Cloudinary URL
  const cloudinaryPattern = /^https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\//
  
  if (!cloudinaryPattern.test(imageUrl)) {
    // Not a Cloudinary URL, return as-is
    return imageUrl
  }
  
  // Apply Cloudinary transformations for social media optimization
  // Dimensions: 1200x630 (optimal for Open Graph and Twitter Cards)
  // Crop: fill (maintains aspect ratio while filling the entire area)
  // Format: auto (serves WebP to supporting browsers)
  // Quality: auto (optimizes file size while maintaining visual quality)
  return imageUrl.replace(
    '/upload/',
    '/upload/w_1200,h_630,c_fill,f_auto,q_auto/'
  )
}
