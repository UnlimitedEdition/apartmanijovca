/**
 * Integration Test: API Localization
 *
 * Tests the end-to-end localization flow:
 * 1. Request with locale parameter → API transformation → localized response
 * 2. Test the availability API endpoint with different locales (sr, en, de, it)
 * 3. Verify apartment data is properly localized (name, bed_type are strings, not JSONB objects)
 * 4. Test fallback behavior when translations are missing
 *
 * Validates Requirements: 8.1, 8.3, 8.4, 13.3
 *
 * NOTE: The route response exposes `bed_type` (localized), not `type` — `type` is not
 * part of the apartment contract returned by transformApartmentRecord(). Fallback is
 * `locale → sr → ''` (no "first available" fallback); these tests assert the real route
 * behaviour.
 */

import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/availability/route'
import type { MultiLanguageText } from '@/lib/types/database'

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'

// The availability route creates `supabase = createClient(...)` at MODULE LOAD, so a
// bare jest.mock + per-test mockReturnValue runs too late and never reaches the route.
// Instead we return a STABLE mocked client that reads per-test data from `mockState` at
// call time, and resolves the route's real query chains:
//   GET:  from('apartments').select()                  -> awaited list
//         from('bookings').select().gte().lte().neq()  -> awaited list
//   POST: rpc('check_availability')                    -> awaited value
//         from('apartments').select().eq().single()    -> awaited single
let mockState: any

jest.mock('@supabase/supabase-js', () => {
  // A thenable query builder: awaiting it resolves to `result`; chain methods return
  // another builder; single() resolves to `singleResult`.
  const makeChain = (result: any, singleResult: any): any => {
    const p: any = Promise.resolve(result)
    p.eq = jest.fn(() => makeChain(result, singleResult))
    p.gte = jest.fn(() => makeChain(result, singleResult))
    p.lte = jest.fn(() => makeChain(result, singleResult))
    p.neq = jest.fn(() => makeChain(result, singleResult))
    p.order = jest.fn(() => makeChain(result, singleResult))
    p.limit = jest.fn(() => makeChain(result, singleResult))
    p.single = jest.fn(() => Promise.resolve(singleResult))
    return p
  }

  const client = {
    from: jest.fn((table: string) => {
      if (table === 'apartments') {
        return { select: jest.fn(() => makeChain(mockState.apartments, mockState.apartmentSingle)) }
      }
      if (table === 'bookings') {
        return { select: jest.fn(() => makeChain(mockState.bookings, mockState.bookings)) }
      }
      return { select: jest.fn(() => makeChain({ data: [], error: null }, { data: null, error: null })) }
    }),
    rpc: jest.fn(() => Promise.resolve(mockState.rpc)),
  }

  return { createClient: jest.fn(() => client) }
})

describe('API Localization Integration Tests', () => {
  // Helper to get future dates for testing (GET rejects past check-in dates)
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
    jest.clearAllMocks()

    // Default per-test data; individual tests override fields of mockState as needed.
    mockState = {
      apartments: { data: mockApartments, error: null },
      apartmentSingle: { data: mockApartments[0], error: null },
      bookings: { data: [], error: null },
      rpc: { data: true, error: null },
    }
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
      expect(data.data.apartments[0].bed_type).toBe('Bračni krevet')
      expect(data.data.apartments[1].name).toBe('Apartman More')
      expect(data.data.apartments[1].bed_type).toBe('Dva kreveta')

      // Verify data types are strings, not objects
      expect(typeof data.data.apartments[0].name).toBe('string')
      expect(typeof data.data.apartments[0].bed_type).toBe('string')
    })

    it('should extract locale from query parameter and return localized English (en) data', async () => {
      const { checkIn, checkOut } = getFutureDates()

      // Create request with English locale
      const url = new URL(`http://localhost:3000/api/availability?checkIn=${checkIn}&checkOut=${checkOut}&locale=en`)
      const request = new NextRequest(url)

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)

      // Verify English localization
      expect(data.data.apartments[0].name).toBe('Sunny Apartment')
      expect(data.data.apartments[0].bed_type).toBe('Double bed')
      expect(data.data.apartments[1].name).toBe('Sea Apartment')
      expect(data.data.apartments[1].bed_type).toBe('Two beds')
    })

    it('should extract locale from query parameter and return localized German (de) data', async () => {
      const { checkIn, checkOut } = getFutureDates()

      // Create request with German locale
      const url = new URL(`http://localhost:3000/api/availability?checkIn=${checkIn}&checkOut=${checkOut}&locale=de`)
      const request = new NextRequest(url)

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)

      // Verify German localization
      expect(data.data.apartments[0].name).toBe('Sonnige Wohnung')
      expect(data.data.apartments[0].bed_type).toBe('Doppelbett')
      expect(data.data.apartments[1].name).toBe('Meer Wohnung')
      expect(data.data.apartments[1].bed_type).toBe('Zwei Betten')
    })

    it('should extract locale from query parameter and return localized Italian (it) data', async () => {
      const { checkIn, checkOut } = getFutureDates()

      // Create request with Italian locale
      const url = new URL(`http://localhost:3000/api/availability?checkIn=${checkIn}&checkOut=${checkOut}&locale=it`)
      const request = new NextRequest(url)

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)

      // Verify Italian localization
      expect(data.data.apartments[0].name).toBe('Appartamento Soleggiato')
      expect(data.data.apartments[0].bed_type).toBe('Letto matrimoniale')
      expect(data.data.apartments[1].name).toBe('Appartamento Mare')
      expect(data.data.apartments[1].bed_type).toBe('Due letti')
    })

    it('should default to Serbian (sr) when no locale is provided', async () => {
      const { checkIn, checkOut } = getFutureDates()

      // Create request without locale parameter
      const url = new URL(`http://localhost:3000/api/availability?checkIn=${checkIn}&checkOut=${checkOut}`)
      const request = new NextRequest(url)

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)

      // Should default to Serbian
      expect(data.data.apartments[0].name).toBe('Apartman Sunce')
      expect(data.data.apartments[0].bed_type).toBe('Bračni krevet')
    })

    it('should extract locale from Accept-Language header when query param is not provided', async () => {
      const { checkIn, checkOut } = getFutureDates()

      // Create request with Accept-Language header
      const url = new URL(`http://localhost:3000/api/availability?checkIn=${checkIn}&checkOut=${checkOut}`)
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
      expect(data.data.apartments[0].bed_type).toBe('Doppelbett')
    })
  })

  describe('Fallback Behavior for Missing Translations', () => {
    it('should fallback to Serbian (sr) when requested locale is missing', async () => {
      const { checkIn, checkOut } = getFutureDates()

      // Apartment missing German translation; should fall back to Serbian
      mockState.apartments = {
        data: [mockApartmentWithMissingTranslations],
        error: null
      }

      // Request German locale
      const url = new URL(`http://localhost:3000/api/availability?checkIn=${checkIn}&checkOut=${checkOut}&locale=de`)
      const request = new NextRequest(url)

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)

      // Should fallback to Serbian since German is missing
      expect(data.data.apartments[0].name).toBe('Apartman Planina')
      expect(data.data.apartments[0].bed_type).toBe('Tri kreveta')
    })

    it('should return empty string when requested locale and Serbian are both missing (no first-available fallback)', async () => {
      const { checkIn, checkOut } = getFutureDates()

      // Apartment with only English translation (no Serbian)
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

      mockState.apartments = {
        data: [apartmentOnlyEnglish],
        error: null
      }

      // Request German locale
      const url = new URL(`http://localhost:3000/api/availability?checkIn=${checkIn}&checkOut=${checkOut}&locale=de`)
      const request = new NextRequest(url)

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)

      // Transformer falls back locale -> sr -> '' (English is NOT used as a fallback)
      expect(data.data.apartments[0].name).toBe('')
      expect(data.data.apartments[0].bed_type).toBe('')
    })

    it('should return empty string when no translations are available', async () => {
      const { checkIn, checkOut } = getFutureDates()

      // Apartment with empty translations
      const apartmentNoTranslations = {
        id: 'apt-5',
        name: {} as MultiLanguageText,
        type: {} as MultiLanguageText,
        capacity: 2,
        base_price_eur: 60,
        bed_type: {} as MultiLanguageText
      }

      mockState.apartments = {
        data: [apartmentNoTranslations],
        error: null
      }

      const url = new URL(`http://localhost:3000/api/availability?checkIn=${checkIn}&checkOut=${checkOut}&locale=en`)
      const request = new NextRequest(url)

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)

      // Should return empty strings
      expect(data.data.apartments[0].name).toBe('')
      expect(data.data.apartments[0].bed_type).toBe('')
    })
  })

  describe('POST /api/availability - Locale Extraction and Transformation', () => {
    it('should extract locale and return localized data for specific apartment', async () => {
      const { checkIn, checkOut } = getFutureDates()

      // RPC availability check + single apartment fetch
      mockState.rpc = { data: true, error: null }
      mockState.apartmentSingle = { data: mockApartments[0], error: null }

      // Create POST request with English locale
      const url = new URL('http://localhost:3000/api/availability?locale=en')
      const request = new NextRequest(url, {
        method: 'POST',
        body: JSON.stringify({
          apartmentId: 'apt-1',
          checkIn,
          checkOut
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.apartments).toHaveLength(1)

      // Verify English localization
      expect(data.data.apartments[0].name).toBe('Sunny Apartment')
      expect(data.data.apartments[0].bed_type).toBe('Double bed')

      // Verify data types are strings
      expect(typeof data.data.apartments[0].name).toBe('string')
      expect(typeof data.data.apartments[0].bed_type).toBe('string')
    })

    it('should handle all supported locales in POST requests', async () => {
      const { checkIn, checkOut } = getFutureDates()

      const locales = [
        { locale: 'sr', expectedName: 'Apartman Sunce', expectedBedType: 'Bračni krevet' },
        { locale: 'en', expectedName: 'Sunny Apartment', expectedBedType: 'Double bed' },
        { locale: 'de', expectedName: 'Sonnige Wohnung', expectedBedType: 'Doppelbett' },
        { locale: 'it', expectedName: 'Appartamento Soleggiato', expectedBedType: 'Letto matrimoniale' }
      ]

      for (const { locale, expectedName, expectedBedType } of locales) {
        // Reset per-iteration data
        mockState.rpc = { data: true, error: null }
        mockState.apartmentSingle = { data: mockApartments[0], error: null }

        const url = new URL(`http://localhost:3000/api/availability?locale=${locale}`)
        const request = new NextRequest(url, {
          method: 'POST',
          body: JSON.stringify({
            apartmentId: 'apt-1',
            checkIn,
            checkOut
          })
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.data.apartments[0].name).toBe(expectedName)
        expect(data.data.apartments[0].bed_type).toBe(expectedBedType)
      }
    })
  })

  describe('Data Type Validation', () => {
    it('should ensure all localized fields are strings, not JSONB objects', async () => {
      const { checkIn, checkOut } = getFutureDates()

      const url = new URL(`http://localhost:3000/api/availability?checkIn=${checkIn}&checkOut=${checkOut}&locale=en`)
      const request = new NextRequest(url)

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)

      // Verify all apartments have string fields
      data.data.apartments.forEach((apartment: any) => {
        expect(typeof apartment.name).toBe('string')
        expect(typeof apartment.bed_type).toBe('string')
        expect(typeof apartment.id).toBe('string')
        expect(typeof apartment.capacity).toBe('number')
        expect(typeof apartment.base_price_eur).toBe('number')
        expect(typeof apartment.available).toBe('boolean')

        // Ensure they are NOT objects
        expect(apartment.name).not.toBeInstanceOf(Object)
        expect(apartment.bed_type).not.toBeInstanceOf(Object)
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      const { checkIn, checkOut } = getFutureDates()

      mockState.apartments = {
        data: null,
        error: { message: 'Database connection failed' }
      }

      const url = new URL(`http://localhost:3000/api/availability?checkIn=${checkIn}&checkOut=${checkOut}&locale=en`)
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
