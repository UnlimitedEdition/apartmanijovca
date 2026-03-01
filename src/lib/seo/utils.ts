/**
 * SEO Utility Functions
 * 
 * Helper functions for SEO operations including text manipulation,
 * URL handling, and content sanitization.
 */

/**
 * Truncates text to a maximum length, adding ellipsis if needed
 * Ensures truncation happens at word boundaries for better readability
 * 
 * @param text - The text to truncate
 * @param maxLength - Maximum length including ellipsis
 * @returns Truncated text with ellipsis if needed
 * 
 * @example
 * truncateText("This is a long description", 20) // "This is a long..."
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) {
    return text
  }

  // Reserve 3 characters for ellipsis
  const truncateAt = maxLength - 3

  // Find the last space before the truncation point
  const lastSpace = text.lastIndexOf(' ', truncateAt)

  // If there's a space, truncate there; otherwise truncate at exact length
  const truncated = lastSpace > 0 ? text.slice(0, lastSpace) : text.slice(0, truncateAt)

  return `${truncated}...`
}

/**
 * Sanitizes text for use in meta tags by removing HTML and special characters
 * Preserves basic punctuation and spaces
 * 
 * @param text - The text to sanitize
 * @returns Sanitized text safe for meta tags
 * 
 * @example
 * sanitizeMetaContent("<p>Hello & welcome!</p>") // "Hello & welcome!"
 */
export function sanitizeMetaContent(text: string): string {
  if (!text) {
    return ''
  }

  return text
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Decode common HTML entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    // Convert newlines and tabs to spaces
    .replace(/[\n\r\t]/g, ' ')
    // Remove control characters and non-printable characters
    .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Converts a relative path to an absolute URL using the base URL
 * Handles various path formats and ensures proper URL construction
 * 
 * @param path - The relative path (e.g., "/apartments/studio-1")
 * @param baseUrl - The base URL (e.g., "https://example.com")
 * @returns Absolute URL
 * 
 * @example
 * makeAbsoluteUrl("/apartments", "https://example.com") // "https://example.com/apartments"
 */
export function makeAbsoluteUrl(path: string, baseUrl: string): string {
  // If path is already absolute, return as-is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  // Remove trailing slash from base URL
  const cleanBaseUrl = baseUrl.replace(/\/$/, '')

  // Ensure path starts with /
  const cleanPath = path.startsWith('/') ? path : `/${path}`

  return `${cleanBaseUrl}${cleanPath}`
}

/**
 * Validates if a string is a valid URL
 * Checks for proper protocol and hostname
 * 
 * @param url - The URL string to validate
 * @returns true if valid URL, false otherwise
 * 
 * @example
 * isValidUrl("https://example.com") // true
 * isValidUrl("not a url") // false
 */
export function isValidUrl(url: string): boolean {
  if (!url) {
    return false
  }

  try {
    const parsed = new URL(url)
    return (parsed.protocol === 'http:' || parsed.protocol === 'https:') && !!parsed.hostname
  } catch {
    return false
  }
}

/**
 * Generates a URL-friendly slug from text
 * Converts to lowercase, replaces spaces with hyphens, removes special characters
 * Handles Cyrillic characters by transliterating to Latin
 * 
 * @param text - The text to convert to a slug
 * @returns URL-friendly slug
 * 
 * @example
 * generateSlug("Studio Apartment 1") // "studio-apartment-1"
 * generateSlug("Апартман Студио") // "apartman-studio"
 */
export function generateSlug(text: string): string {
  if (!text) {
    return ''
  }

  // Cyrillic to Latin transliteration map
  const cyrillicMap: Record<string, string> = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'ђ': 'dj', 'е': 'e',
    'ж': 'z', 'з': 'z', 'и': 'i', 'ј': 'j', 'к': 'k', 'л': 'l', 'љ': 'lj',
    'м': 'm', 'н': 'n', 'њ': 'nj', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's',
    'т': 't', 'ћ': 'c', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'c', 'ч': 'c',
    'џ': 'dz', 'ш': 's',
    'А': 'a', 'Б': 'b', 'В': 'v', 'Г': 'g', 'Д': 'd', 'Ђ': 'dj', 'Е': 'e',
    'Ж': 'z', 'З': 'z', 'И': 'i', 'Ј': 'j', 'К': 'k', 'Л': 'l', 'Љ': 'lj',
    'М': 'm', 'Н': 'n', 'Њ': 'nj', 'О': 'o', 'П': 'p', 'Р': 'r', 'С': 's',
    'Т': 't', 'Ћ': 'c', 'У': 'u', 'Ф': 'f', 'Х': 'h', 'Ц': 'c', 'Ч': 'c',
    'Џ': 'dz', 'Ш': 's'
  }

  return text
    // Transliterate Cyrillic characters
    .split('')
    .map(char => cyrillicMap[char] || char)
    .join('')
    // Convert to lowercase
    .toLowerCase()
    // Replace spaces and underscores with hyphens
    .replace(/[\s_]+/g, '-')
    // Remove special characters except hyphens
    .replace(/[^a-z0-9-]/g, '')
    // Remove multiple consecutive hyphens
    .replace(/-+/g, '-')
    // Remove leading and trailing hyphens
    .replace(/^-+|-+$/g, '')
}
