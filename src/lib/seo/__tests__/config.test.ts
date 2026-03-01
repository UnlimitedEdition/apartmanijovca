/**
 * Tests for SEO Configuration Module
 */

import { validateBaseUrl, getBaseUrl, getSEOConfig } from '../config'

describe('SEO Config Module', () => {
  describe('validateBaseUrl', () => {
    it('should validate URLs with http protocol', () => {
      expect(validateBaseUrl('http://localhost:3000')).toBe(true)
      expect(validateBaseUrl('http://example.com')).toBe(true)
    })

    it('should validate URLs with https protocol', () => {
      expect(validateBaseUrl('https://example.com')).toBe(true)
      expect(validateBaseUrl('https://apartmani-jovca.vercel.app')).toBe(true)
    })

    it('should reject URLs without protocol', () => {
      expect(validateBaseUrl('example.com')).toBe(false)
      expect(validateBaseUrl('localhost:3000')).toBe(false)
    })

    it('should reject invalid URLs', () => {
      expect(validateBaseUrl('')).toBe(false)
      expect(validateBaseUrl('not a url')).toBe(false)
      expect(validateBaseUrl('ftp://example.com')).toBe(false)
    })

    it('should reject URLs without domain', () => {
      expect(validateBaseUrl('http://')).toBe(false)
      expect(validateBaseUrl('https://')).toBe(false)
    })
  })

  describe('getBaseUrl', () => {
    const originalEnv = process.env

    beforeEach(() => {
      jest.resetModules()
      process.env = { ...originalEnv }
    })

    afterAll(() => {
      process.env = originalEnv
    })

    it('should use NEXT_PUBLIC_BASE_URL when set', () => {
      process.env.NEXT_PUBLIC_BASE_URL = 'https://apartmani-jovca.rs'
      expect(getBaseUrl()).toBe('https://apartmani-jovca.rs')
    })

    it('should remove trailing slash from NEXT_PUBLIC_BASE_URL', () => {
      process.env.NEXT_PUBLIC_BASE_URL = 'https://apartmani-jovca.rs/'
      expect(getBaseUrl()).toBe('https://apartmani-jovca.rs')
    })

    it('should use NEXT_PUBLIC_VERCEL_URL when NEXT_PUBLIC_BASE_URL is not set', () => {
      delete process.env.NEXT_PUBLIC_BASE_URL
      process.env.NEXT_PUBLIC_VERCEL_URL = 'apartmani-jovca-preview.vercel.app'
      expect(getBaseUrl()).toBe('https://apartmani-jovca-preview.vercel.app')
    })

    it('should use VERCEL_URL when NEXT_PUBLIC_VERCEL_URL is not set', () => {
      delete process.env.NEXT_PUBLIC_BASE_URL
      delete process.env.NEXT_PUBLIC_VERCEL_URL
      process.env.VERCEL_URL = 'apartmani-jovca-git-main.vercel.app'
      expect(getBaseUrl()).toBe('https://apartmani-jovca-git-main.vercel.app')
    })

    it('should fallback to localhost when no environment variables are set', () => {
      delete process.env.NEXT_PUBLIC_BASE_URL
      delete process.env.NEXT_PUBLIC_VERCEL_URL
      delete process.env.VERCEL_URL
      expect(getBaseUrl()).toBe('http://localhost:3000')
    })

    it('should fallback to localhost when NEXT_PUBLIC_BASE_URL is invalid', () => {
      process.env.NEXT_PUBLIC_BASE_URL = 'invalid-url'
      expect(getBaseUrl()).toBe('http://localhost:3000')
    })
  })

  describe('getSEOConfig', () => {
    it('should return complete SEO configuration', () => {
      const config = getSEOConfig()
      
      expect(config).toHaveProperty('baseUrl')
      expect(config).toHaveProperty('siteName')
      expect(config).toHaveProperty('defaultLocale')
      expect(config).toHaveProperty('locales')
      expect(config).toHaveProperty('social')
      expect(config).toHaveProperty('business')
    })

    it('should have correct site name', () => {
      const config = getSEOConfig()
      expect(config.siteName).toBe('Apartmani Jovča')
    })

    it('should have Serbian as default locale', () => {
      const config = getSEOConfig()
      expect(config.defaultLocale).toBe('sr')
    })

    it('should support all four locales', () => {
      const config = getSEOConfig()
      expect(config.locales).toEqual(['sr', 'en', 'de', 'it'])
      expect(config.locales).toHaveLength(4)
    })

    it('should include social media profiles', () => {
      const config = getSEOConfig()
      expect(config.social.facebook).toBeDefined()
      expect(config.social.instagram).toBeDefined()
    })

    it('should include complete business information', () => {
      const config = getSEOConfig()
      
      expect(config.business.name).toBe('Apartmani Jovča')
      expect(config.business.phone).toBeDefined()
      expect(config.business.email).toBeDefined()
      
      expect(config.business.address.street).toBeDefined()
      expect(config.business.address.city).toBe('Aleksinac')
      expect(config.business.address.country).toBe('Serbia')
      
      expect(config.business.geo.latitude).toBeDefined()
      expect(config.business.geo.longitude).toBeDefined()
    })

    it('should include valid geo coordinates', () => {
      const config = getSEOConfig()
      
      expect(config.business.geo.latitude).toBeGreaterThan(0)
      expect(config.business.geo.longitude).toBeGreaterThan(0)
      expect(config.business.geo.latitude).toBeLessThan(90)
      expect(config.business.geo.longitude).toBeLessThan(180)
    })

    it('should have valid base URL', () => {
      const config = getSEOConfig()
      expect(validateBaseUrl(config.baseUrl)).toBe(true)
    })
  })
})
