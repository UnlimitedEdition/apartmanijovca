/**
 * Unit Tests for SEO Utility Functions
 */

import {
  truncateText,
  sanitizeMetaContent,
  makeAbsoluteUrl,
  isValidUrl,
  generateSlug,
} from '../utils'

describe('truncateText', () => {
  it('should return text unchanged if shorter than maxLength', () => {
    expect(truncateText('Short text', 20)).toBe('Short text')
  })

  it('should return text unchanged if equal to maxLength', () => {
    expect(truncateText('Exactly twenty chars', 20)).toBe('Exactly twenty chars')
  })

  it('should truncate text longer than maxLength with ellipsis', () => {
    const result = truncateText('This is a very long text that needs truncation', 20)
    expect(result).toBe('This is a very...')
    expect(result.length).toBeLessThanOrEqual(20)
  })

  it('should truncate at word boundaries when possible', () => {
    const result = truncateText('This is a test', 10)
    expect(result).toBe('This is...')
  })

  it('should handle empty string', () => {
    expect(truncateText('', 10)).toBe('')
  })

  it('should handle text with no spaces', () => {
    const result = truncateText('verylongtextwithoutspaces', 10)
    expect(result).toBe('verylon...')
    expect(result.length).toBe(10)
  })

  it('should truncate meta descriptions to 160 chars', () => {
    const longDesc = 'A'.repeat(200)
    const result = truncateText(longDesc, 160)
    expect(result.length).toBeLessThanOrEqual(160)
  })

  it('should truncate titles to 60 chars', () => {
    const longTitle = 'This is a very long title that exceeds the recommended length for SEO'
    const result = truncateText(longTitle, 60)
    expect(result.length).toBeLessThanOrEqual(60)
  })
})

describe('sanitizeMetaContent', () => {
  it('should remove HTML tags', () => {
    expect(sanitizeMetaContent('<p>Hello world</p>')).toBe('Hello world')
    expect(sanitizeMetaContent('<div><span>Test</span></div>')).toBe('Test')
  })

  it('should decode HTML entities', () => {
    expect(sanitizeMetaContent('Hello&nbsp;world')).toBe('Hello world')
    expect(sanitizeMetaContent('Tom &amp; Jerry')).toBe('Tom & Jerry')
    expect(sanitizeMetaContent('&lt;tag&gt;')).toBe('<tag>')
    expect(sanitizeMetaContent('&quot;quoted&quot;')).toBe('"quoted"')
    expect(sanitizeMetaContent('&#39;apostrophe&#39;')).toBe("'apostrophe'")
  })

  it('should normalize whitespace', () => {
    expect(sanitizeMetaContent('Multiple   spaces')).toBe('Multiple spaces')
    expect(sanitizeMetaContent('Line\nbreaks\nhere')).toBe('Line breaks here')
    expect(sanitizeMetaContent('  Leading and trailing  ')).toBe('Leading and trailing')
  })

  it('should remove control characters', () => {
    expect(sanitizeMetaContent('Text\x00with\x1Fcontrol')).toBe('Textwithcontrol')
  })

  it('should handle empty string', () => {
    expect(sanitizeMetaContent('')).toBe('')
  })

  it('should handle complex HTML with entities', () => {
    const input = '<p>Welcome to <strong>Apartmani&nbsp;Jovča</strong> &amp; enjoy!</p>'
    expect(sanitizeMetaContent(input)).toBe('Welcome to Apartmani Jovča & enjoy!')
  })

  it('should preserve basic punctuation', () => {
    expect(sanitizeMetaContent('Hello, world! How are you?')).toBe('Hello, world! How are you?')
  })
})

describe('makeAbsoluteUrl', () => {
  it('should combine base URL and path', () => {
    expect(makeAbsoluteUrl('/apartments', 'https://example.com'))
      .toBe('https://example.com/apartments')
  })

  it('should handle base URL with trailing slash', () => {
    expect(makeAbsoluteUrl('/apartments', 'https://example.com/'))
      .toBe('https://example.com/apartments')
  })

  it('should handle path without leading slash', () => {
    expect(makeAbsoluteUrl('apartments', 'https://example.com'))
      .toBe('https://example.com/apartments')
  })

  it('should return absolute URLs unchanged', () => {
    expect(makeAbsoluteUrl('https://other.com/page', 'https://example.com'))
      .toBe('https://other.com/page')
    expect(makeAbsoluteUrl('http://other.com/page', 'https://example.com'))
      .toBe('http://other.com/page')
  })

  it('should handle complex paths', () => {
    expect(makeAbsoluteUrl('/sr/apartments/studio-1', 'https://example.com'))
      .toBe('https://example.com/sr/apartments/studio-1')
  })

  it('should handle root path', () => {
    expect(makeAbsoluteUrl('/', 'https://example.com'))
      .toBe('https://example.com/')
  })
})

describe('isValidUrl', () => {
  it('should validate HTTPS URLs', () => {
    expect(isValidUrl('https://example.com')).toBe(true)
    expect(isValidUrl('https://example.com/path')).toBe(true)
    expect(isValidUrl('https://subdomain.example.com')).toBe(true)
  })

  it('should validate HTTP URLs', () => {
    expect(isValidUrl('http://example.com')).toBe(true)
    expect(isValidUrl('http://localhost:3000')).toBe(true)
  })

  it('should reject invalid URLs', () => {
    expect(isValidUrl('not a url')).toBe(false)
    expect(isValidUrl('example.com')).toBe(false)
    expect(isValidUrl('/relative/path')).toBe(false)
    expect(isValidUrl('')).toBe(false)
  })

  it('should reject URLs with invalid protocols', () => {
    expect(isValidUrl('ftp://example.com')).toBe(false)
    expect(isValidUrl('file:///path/to/file')).toBe(false)
  })

  it('should handle malformed URLs', () => {
    expect(isValidUrl('https://')).toBe(false)
    expect(isValidUrl('https:///')).toBe(false)
  })
})

describe('generateSlug', () => {
  it('should convert text to lowercase', () => {
    expect(generateSlug('Studio Apartment')).toBe('studio-apartment')
  })

  it('should replace spaces with hyphens', () => {
    expect(generateSlug('Studio Apartment 1')).toBe('studio-apartment-1')
  })

  it('should remove special characters', () => {
    expect(generateSlug('Studio @ Apartment #1!')).toBe('studio-apartment-1')
  })

  it('should handle multiple consecutive spaces', () => {
    expect(generateSlug('Studio    Apartment')).toBe('studio-apartment')
  })

  it('should remove leading and trailing hyphens', () => {
    expect(generateSlug('  Studio Apartment  ')).toBe('studio-apartment')
  })

  it('should handle underscores', () => {
    expect(generateSlug('studio_apartment_1')).toBe('studio-apartment-1')
  })

  it('should handle empty string', () => {
    expect(generateSlug('')).toBe('')
  })

  it('should transliterate Serbian Cyrillic to Latin', () => {
    expect(generateSlug('Апартман Студио')).toBe('apartman-studio')
    expect(generateSlug('Јовча')).toBe('jovca')
    expect(generateSlug('Бованско Језеро')).toBe('bovansko-jezero')
  })

  it('should handle mixed Cyrillic and Latin', () => {
    expect(generateSlug('Studio Апартман 1')).toBe('studio-apartman-1')
  })

  it('should handle special Serbian characters', () => {
    expect(generateSlug('Ђорђе')).toBe('djordje')
    expect(generateSlug('Љубљана')).toBe('ljubljana')
    expect(generateSlug('Њујорк')).toBe('njujork')
    expect(generateSlug('Ћирилица')).toBe('cirilica')
    expect(generateSlug('Џез')).toBe('dzez')
  })

  it('should handle numbers', () => {
    expect(generateSlug('Apartment 123')).toBe('apartment-123')
  })

  it('should remove multiple consecutive hyphens', () => {
    expect(generateSlug('Studio -- Apartment')).toBe('studio-apartment')
  })
})
