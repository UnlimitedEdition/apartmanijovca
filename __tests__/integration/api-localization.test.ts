/**
 * Integration Test: API Localization
 * 
 * Tests the end-to-end localization flow:
 * 1. Request with locale parameter → API transformation → localized response
 * 2. Test the availability API endpoint with different locales (sr, en, de, it)
 * 3. Verify apartment data is properly localized (name, type are strings, not JSONB objects)
 * 4. Test fallback behavior when translations are missing
 * 
 * Validates Requirements: 8.1, 8.3, 8.4, 13.3
 */

import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/availability/route'
import { createClient } from '@supabase/supabase-js'
import type { MultiLanguageText } from '@/lib/types/database'

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'

// Mock Supabase client - override the global mock for this test
jest.mock('@supabase/supabase-js')

describe('API Localization Integration Tests', () => {
  let mockSupabase: any
  const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>

  // Helper to get future dates for testing
  const getFutureDates = () => {
    const checkIn = new Date()
    checkIn.setDate(checkIn.getDate() + 7) // 7 days from now
    const checkOut = new Date(checkIn)
    checkOut.setDate(checkOut.getDate() + 4) // 4 nights
    return {
      checkIn: checkIn.toISOString().split('T')[0],
      checkOut: checkOut.toISOString().split('T')[0]
    }
  }

  // Sample apartment data with JSONB multi-language fields
  const mockApartments = [
    {
      id: 'apt-1',
      name: {
        sr: 'Apartman Sunce',
        en: 'Sunny Apartment',
        de: 'Sonnige Wohnung',
        it: 'Appartamento Soleggiato'
      } as MultiLanguageText,
      type: {
        sr: 'Studio',
        en: 'Studio',
        de: 'Studio',
        it: 'Monolocale'
      } as MultiLanguageText,
      capacity: 2,
      base_price_eur: 50,
      bed_type: {
        sr: 'Bračni krevet',
        en: 'Double bed',
        de: 'Doppelbett',
        it: 'Letto matrimoniale'
      } as MultiLanguageText
    },
    {
      id: 'apt-2',
      name: {
        sr: 'Apartman More',
        en: 'Sea Apartment',
        de: 'Meer Wohnung',
        it: 'Appartamento Mare'
      } as MultiLanguageText,
      type: {
        sr: 'Jednosoban',
        en: 'One Bedroom',
        de: 'Ein Schlafzimmer',
        it: 'Una Camera'
      } as MultiLanguageText,
      capacity: 4,
      base_price_eur: 80,
      bed_type: {
        sr: 'Dva kreveta',
        en: 'Two beds',
        de: 'Zwei Betten',
        it: 'Due letti'
      } as MultiLanguageText
    }
  ]

  // Sample apartment with missing translations
  const mockApartmentWithMissingTranslations = {
    id: 'apt-3',
    name: {
      sr: 'Apartman Planina',
      en: 'Mountain Apartment'
      // Missing de and it translations
    } as Partial<MultiLanguageText>,
    type: {
      sr: 'Dvosoban'
      // Missing all other translations
    } as Partial<MultiLanguageText>,
    capacity: 6,
    base_price_eur: 100,
    bed_type: {
      sr: 'Tri kreveta'
      // Missing all other translations
    } as Partial<MultiLanguageText>
  }

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()

    // Setup mock Supabase client with proper promise-based chaining
    // The API does: let query = supabase.from('apartments').select(...); await query
    // So select() needs to return an awaitable query builder that also has methods
    
    mockSupabase = {
      from: jest.fn((table: string) => {
        if (table === 'apartments') {
          // Create a thenable query builder
          const createQueryBuilder = () => {
            const promise = Promise.resolve({ data: mockApartments, error: null })
            // Add query builder methods to the promise
            ;(promise as any).eq = jest.fn().mockReturnValue(createQueryBuilder())
            return promise
          }
          
          return {
            select: jest.fn().mockReturnValue(createQueryBuilder())
          }
        }
        if (table === 'bookings') {
          return {
            select: jest.fn().mockReturnValue({
              gte: jest.fn().mockReturnValue({
                lte: jest.fn().mockReturnValue({
                  neq: jest.fn().mockResolvedValue({ data: [], error: null })
                })
              })
            })
          }
        }
        return {
          select: jest.fn().mockResolvedValue({ data: [], error: null })
        }
      }),
      rpc: jest.fn().mockResolvedValue({ data: true, error: null })
    }

    mockCreateClient.mockReturnValue(mockSupabase as any)
  })

  describe('GET /api/availability - Locale Extraction and Transformation', () => {
    it('should extract locale from query parameter and return localized Serbian (sr) data', async () => {
      const { checkIn, checkOut } = getFutureDates()
      
      // Create request with Serbian locale
      const url = new URL(`http://localhost:3000/api/availability?checkIn=${checkIn}&checkOut=${checkOut}&locale=sr`)
      const request = new NextRequest(url)

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.apartments).toHaveLength(2)
      
      // Verify Serbian localization
      expect(data.data.apartments[0].name).toBe('Apartman Sunce')
      expect(data.data.apartments[0].type).toBe('Studio')
      expect(data.data.apartments[1].name).toBe('Apartman More')
      expect(data.data.apartments[1].type).toBe('Jednosoban')

      // Verify data types are strings, not objects
      expect(typeof data.data.apartments[0].name).toBe('string')
      expect(typeof data.data.apartments[0].type).toBe('string')
    })

    it('should extract locale from query parameter and return localized English (en) data', async () => {
      // Create request with English locale
      const url = new URL('http://localhost:3000/api/availability?checkIn=2024-06-01&checkOut=2024-06-05&locale=en')
      const request = new NextRequest(url)

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      
      // Verify English localization
      expect(data.data.apartments[0].name).toBe('Sunny Apartment')
      expect(data.data.apartments[0].type).toBe('Studio')
      expect(data.data.apartments[1].name).toBe('Sea Apartment')
      expect(data.data.apartments[1].type).toBe('One Bedroom')
    })

    it('should extract locale from query parameter and return localized German (de) data', async () => {
      // Create request with German locale
      const url = new URL('http://localhost:3000/api/availability?checkIn=2024-06-01&checkOut=2024-06-05&locale=de')
      const request = new NextRequest(url)

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      
      // Verify German localization
      expect(data.data.apartments[0].name).toBe('Sonnige Wohnung')
      expect(data.data.apartments[0].type).toBe('Studio')
      expect(data.data.apartments[1].name).toBe('Meer Wohnung')
      expect(data.data.apartments[1].type).toBe('Ein Schlafzimmer')
    })

    it('should extract locale from query parameter and return localized Italian (it) data', async () => {
      // Create request with Italian locale
      const url = new URL('http://localhost:3000/api/availability?checkIn=2024-06-01&checkOut=2024-06-05&locale=it')
      const request = new NextRequest(url)

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      
      // Verify Italian localization
      expect(data.data.apartments[0].name).toBe('Appartamento Soleggiato')
      expect(data.data.apartments[0].type).toBe('Monolocale')
      expect(data.data.apartments[1].name).toBe('Appartamento Mare')
      expect(data.data.apartments[1].type).toBe('Una Camera')
    })

    it('should default to Serbian (sr) when no locale is provided', async () => {
      // Create request without locale parameter
      const url = new URL('http://localhost:3000/api/availability?checkIn=2024-06-01&checkOut=2024-06-05')
      const request = new NextRequest(url)

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      
      // Should default to Serbian
      expect(data.data.apartments[0].name).toBe('Apartman Sunce')
      expect(data.data.apartments[0].type).toBe('Studio')
    })

    it('should extract locale from Accept-Language header when query param is not provided', async () => {
      // Create request with Accept-Language header
      const url = new URL('http://localhost:3000/api/availability?checkIn=2024-06-01&checkOut=2024-06-05')
      const request = new NextRequest(url, {
        headers: {
          'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8'
        }
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      
      // Should use German from Accept-Language header
      expect(data.data.apartments[0].name).toBe('Sonnige Wohnung')
    })
  })

  describe('Fallback Behavior for Missing Translations', () => {
    it('should fallback to Serbian (sr) when requested locale is missing', async () => {
      // Mock database responses with apartment missing German translation
      mockSupabase.select.mockResolvedValueOnce({
        data: [mockApartmentWithMissingTranslations],
        error: null
      })
      mockSupabase.neq.mockResolvedValueOnce({
        data: [],
        error: null
      })

      // Request German locale
      const url = new URL('http://localhost:3000/api/availability?checkIn=2024-06-01&checkOut=2024-06-05&locale=de')
      const request = new NextRequest(url)

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      
      // Should fallback to Serbian since German is missing
      expect(data.data.apartments[0].name).toBe('Apartman Planina')
      expect(data.data.apartments[0].type).toBe('Dvosoban')
    })

    it('should fallback to first available language when both requested locale and Serbian are missing', async () => {
      // Mock apartment with only English translation
      const apartmentOnlyEnglish = {
        id: 'apt-4',
        name: {
          en: 'English Only Apartment'
        } as Partial<MultiLanguageText>,
        type: {
          en: 'Studio'
        } as Partial<MultiLanguageText>,
        capacity: 2,
        base_price_eur: 60,
        bed_type: {
          en: 'Double bed'
        } as Partial<MultiLanguageText>
      }

      mockSupabase.select.mockResolvedValueOnce({
        data: [apartmentOnlyEnglish],
        error: null
      })
      mockSupabase.neq.mockResolvedValueOnce({
        data: [],
        error: null
      })

      // Request German locale
      const url = new URL('http://localhost:3000/api/availability?checkIn=2024-06-01&checkOut=2024-06-05&locale=de')
      const request = new NextRequest(url)

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      
      // Should fallback to English (first available)
      expect(data.data.apartments[0].name).toBe('English Only Apartment')
      expect(data.data.apartments[0].type).toBe('Studio')
    })

    it('should return empty string when no translations are available', async () => {
      // Mock apartment with empty translations
      const apartmentNoTranslations = {
        id: 'apt-5',
        name: {} as MultiLanguageText,
        type: {} as MultiLanguageText,
        capacity: 2,
        base_price_eur: 60,
        bed_type: {} as MultiLanguageText
      }

      mockSupabase.select.mockResolvedValueOnce({
        data: [apartmentNoTranslations],
        error: null
      })
      mockSupabase.neq.mockResolvedValueOnce({
        data: [],
        error: null
      })

      const url = new URL('http://localhost:3000/api/availability?checkIn=2024-06-01&checkOut=2024-06-05&locale=en')
      const request = new NextRequest(url)

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      
      // Should return empty strings
      expect(data.data.apartments[0].name).toBe('')
      expect(data.data.apartments[0].type).toBe('')
    })
  })

  describe('POST /api/availability - Locale Extraction and Transformation', () => {
    it('should extract locale and return localized data for specific apartment', async () => {
      // Mock RPC call for availability check
      mockSupabase.rpc.mockResolvedValueOnce({
        data: true,
        error: null
      })

      // Mock apartment fetch
      mockSupabase.single.mockResolvedValueOnce({
        data: mockApartments[0],
        error: null
      })

      // Create POST request with English locale
      const url = new URL('http://localhost:3000/api/availability?locale=en')
      const request = new NextRequest(url, {
        method: 'POST',
        body: JSON.stringify({
          apartmentId: 'apt-1',
          checkIn: '2024-06-01',
          checkOut: '2024-06-05'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.apartments).toHaveLength(1)
      
      // Verify English localization
      expect(data.data.apartments[0].name).toBe('Sunny Apartment')
      expect(data.data.apartments[0].type).toBe('Studio')
      
      // Verify data types are strings
      expect(typeof data.data.apartments[0].name).toBe('string')
      expect(typeof data.data.apartments[0].type).toBe('string')
    })

    it('should handle all supported locales in POST requests', async () => {
      const locales = [
        { locale: 'sr', expectedName: 'Apartman Sunce', expectedType: 'Studio' },
        { locale: 'en', expectedName: 'Sunny Apartment', expectedType: 'Studio' },
        { locale: 'de', expectedName: 'Sonnige Wohnung', expectedType: 'Studio' },
        { locale: 'it', expectedName: 'Appartamento Soleggiato', expectedType: 'Monolocale' }
      ]

      for (const { locale, expectedName, expectedType } of locales) {
        // Reset mocks for each iteration
        jest.clearAllMocks()
        mockCreateClient.mockReturnValue(mockSupabase as any)

        mockSupabase.rpc.mockResolvedValueOnce({
          data: true,
          error: null
        })

        mockSupabase.single.mockResolvedValueOnce({
          data: mockApartments[0],
          error: null
        })

        const url = new URL(`http://localhost:3000/api/availability?locale=${locale}`)
        const request = new NextRequest(url, {
          method: 'POST',
          body: JSON.stringify({
            apartmentId: 'apt-1',
            checkIn: '2024-06-01',
            checkOut: '2024-06-05'
          })
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.data.apartments[0].name).toBe(expectedName)
        expect(data.data.apartments[0].type).toBe(expectedType)
      }
    })
  })

  describe('Data Type Validation', () => {
    it('should ensure all localized fields are strings, not JSONB objects', async () => {
      mockSupabase.select.mockResolvedValueOnce({
        data: mockApartments,
        error: null
      })
      mockSupabase.neq.mockResolvedValueOnce({
        data: [],
        error: null
      })

      const url = new URL('http://localhost:3000/api/availability?checkIn=2024-06-01&checkOut=2024-06-05&locale=en')
      const request = new NextRequest(url)

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      
      // Verify all apartments have string fields
      data.data.apartments.forEach((apartment: any) => {
        expect(typeof apartment.name).toBe('string')
        expect(typeof apartment.type).toBe('string')
        expect(typeof apartment.id).toBe('string')
        expect(typeof apartment.capacity).toBe('number')
        expect(typeof apartment.base_price_eur).toBe('number')
        expect(typeof apartment.available).toBe('boolean')
        
        // Ensure they are NOT objects
        expect(apartment.name).not.toBeInstanceOf(Object)
        expect(apartment.type).not.toBeInstanceOf(Object)
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      mockSupabase.select.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database connection failed' }
      })

      const url = new URL('http://localhost:3000/api/availability?checkIn=2024-06-01&checkOut=2024-06-05&locale=en')
      const request = new NextRequest(url)

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Failed to fetch apartments')
    })

    it('should validate required parameters', async () => {
      const url = new URL('http://localhost:3000/api/availability?locale=en')
      const request = new NextRequest(url)

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('required')
    })
  })
})
