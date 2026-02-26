// __tests__/property/apartment-transformation.property.test.ts

import fc from 'fast-check'
import { transformApartmentRecord } from '@/lib/transformers/database'
import { ApartmentRecord, Locale } from '@/lib/types/database'

/**
 * Property-Based Tests for Apartment Transformation
 * 
 * **Validates: Requirements 2.16, 2.17, 2.18**
 * 
 * These tests use fast-check to generate random apartment records
 * and verify that transformation properties hold for ALL inputs.
 */

describe('Apartment Transformation Properties', () => {
  // Generator for MultiLanguageText objects
  const multiLanguageTextArb = fc.record({
    sr: fc.string({ minLength: 1, maxLength: 100 }),
    en: fc.string({ minLength: 1, maxLength: 100 }),
    de: fc.string({ minLength: 1, maxLength: 100 }),
    it: fc.string({ minLength: 1, maxLength: 100 })
  })

  // Generator for image records
  const imageRecordArb = fc.record({
    url: fc.webUrl(),
    alt: multiLanguageTextArb
  })

  // Generator for apartment records
  const apartmentRecordArb = fc.record({
    id: fc.uuid(),
    name: multiLanguageTextArb,
    description: multiLanguageTextArb,
    bed_type: multiLanguageTextArb,
    capacity: fc.integer({ min: 1, max: 10 }),
    amenities: fc.array(multiLanguageTextArb, { minLength: 0, maxLength: 10 }),
    base_price_eur: fc.double({ min: 10, max: 500, noNaN: true }),
    images: fc.array(imageRecordArb, { minLength: 0, maxLength: 10 }),
    status: fc.constantFrom('active' as const, 'inactive' as const, 'maintenance' as const),
    display_order: fc.integer({ min: 0, max: 100 }),
    created_at: fc.constant(new Date('2024-01-01T00:00:00Z').toISOString()),
    updated_at: fc.constant(new Date('2024-01-01T00:00:00Z').toISOString())
  })

  // Generator for locales
  const localeArb = fc.constantFrom<Locale>('sr', 'en', 'de', 'it')

  it('Property 1: name is always a non-empty string', () => {
    fc.assert(
      fc.property(
        apartmentRecordArb,
        localeArb,
        (record, locale) => {
          const localized = transformApartmentRecord(record as any, locale)
          
          expect(typeof localized.name).toBe('string')
          expect(localized.name.length).toBeGreaterThan(0)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('Property 2: description is always a non-empty string', () => {
    fc.assert(
      fc.property(
        apartmentRecordArb,
        localeArb,
        (record, locale) => {
          const localized = transformApartmentRecord(record as any, locale)
          
          expect(typeof localized.description).toBe('string')
          expect(localized.description.length).toBeGreaterThan(0)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('Property 3: bed_type is always a non-empty string', () => {
    fc.assert(
      fc.property(
        apartmentRecordArb,
        localeArb,
        (record, locale) => {
          const localized = transformApartmentRecord(record as any, locale)
          
          expect(typeof localized.bed_type).toBe('string')
          expect(localized.bed_type.length).toBeGreaterThan(0)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('Property 4: amenities is always an array of strings', () => {
    fc.assert(
      fc.property(
        apartmentRecordArb,
        localeArb,
        (record, locale) => {
          const localized = transformApartmentRecord(record as any, locale)
          
          expect(Array.isArray(localized.amenities)).toBe(true)
          localized.amenities.forEach(amenity => {
            expect(typeof amenity).toBe('string')
          })
        }
      ),
      { numRuns: 100 }
    )
  })

  it('Property 5: amenities array length is preserved', () => {
    fc.assert(
      fc.property(
        apartmentRecordArb,
        localeArb,
        (record, locale) => {
          const localized = transformApartmentRecord(record as any, locale)
          
          expect(localized.amenities.length).toBe(record.amenities.length)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('Property 6: images is always an array of strings (URLs)', () => {
    fc.assert(
      fc.property(
        apartmentRecordArb,
        localeArb,
        (record, locale) => {
          const localized = transformApartmentRecord(record as any, locale)
          
          expect(Array.isArray(localized.images)).toBe(true)
          localized.images.forEach(image => {
            expect(typeof image).toBe('string')
          })
        }
      ),
      { numRuns: 100 }
    )
  })

  it('Property 7: images array length is preserved', () => {
    fc.assert(
      fc.property(
        apartmentRecordArb,
        localeArb,
        (record, locale) => {
          const localized = transformApartmentRecord(record as any, locale)
          
          expect(localized.images.length).toBe(record.images.length)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('Property 8: base_price_eur is preserved exactly', () => {
    fc.assert(
      fc.property(
        apartmentRecordArb,
        localeArb,
        (record, locale) => {
          const localized = transformApartmentRecord(record as any, locale)
          
          expect(localized.base_price_eur).toBe(record.base_price_eur)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('Property 9: capacity is preserved exactly', () => {
    fc.assert(
      fc.property(
        apartmentRecordArb,
        localeArb,
        (record, locale) => {
          const localized = transformApartmentRecord(record as any, locale)
          
          expect(localized.capacity).toBe(record.capacity)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('Property 10: status is preserved exactly', () => {
    fc.assert(
      fc.property(
        apartmentRecordArb,
        localeArb,
        (record, locale) => {
          const localized = transformApartmentRecord(record as any, locale)
          
          expect(localized.status).toBe(record.status)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('Property 11: id is preserved exactly', () => {
    fc.assert(
      fc.property(
        apartmentRecordArb,
        localeArb,
        (record, locale) => {
          const localized = transformApartmentRecord(record as any, locale)
          
          expect(localized.id).toBe(record.id)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('Property 12: created_at is preserved exactly', () => {
    fc.assert(
      fc.property(
        apartmentRecordArb,
        localeArb,
        (record, locale) => {
          const localized = transformApartmentRecord(record as any, locale)
          
          expect(localized.created_at).toBe(record.created_at)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('Property 13: updated_at is preserved exactly', () => {
    fc.assert(
      fc.property(
        apartmentRecordArb,
        localeArb,
        (record, locale) => {
          const localized = transformApartmentRecord(record as any, locale)
          
          expect(localized.updated_at).toBe(record.updated_at)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('Property 14: transformation is deterministic (same input = same output)', () => {
    fc.assert(
      fc.property(
        apartmentRecordArb,
        localeArb,
        (record, locale) => {
          const localized1 = transformApartmentRecord(record as any, locale)
          const localized2 = transformApartmentRecord(record as any, locale)
          
          expect(localized1).toEqual(localized2)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('Property 15: different locales produce different names (when translations differ)', () => {
    fc.assert(
      fc.property(
        apartmentRecordArb,
        (record) => {
          const localizedSr = transformApartmentRecord(record as any, 'sr')
          const localizedEn = transformApartmentRecord(record as any, 'en')
          
          // If the Serbian and English translations are different, the localized names should differ
          if (record.name.sr !== record.name.en) {
            expect(localizedSr.name).not.toBe(localizedEn.name)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('Property 16: empty amenities array produces empty array', () => {
    fc.assert(
      fc.property(
        localeArb,
        (locale) => {
          const recordWithEmptyAmenities = {
            id: 'test-id',
            name: { sr: 'Test', en: 'Test', de: 'Test', it: 'Test' },
            description: { sr: 'Test', en: 'Test', de: 'Test', it: 'Test' },
            bed_type: { sr: 'Test', en: 'Test', de: 'Test', it: 'Test' },
            capacity: 2,
            amenities: [],
            base_price_eur: 50,
            images: [],
            status: 'active' as const,
            display_order: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          
          const localized = transformApartmentRecord(recordWithEmptyAmenities as any, locale)
          
          expect(localized.amenities).toEqual([])
        }
      ),
      { numRuns: 50 }
    )
  })

  it('Property 17: empty images array produces empty array', () => {
    fc.assert(
      fc.property(
        localeArb,
        (locale) => {
          const recordWithEmptyImages = {
            id: 'test-id',
            name: { sr: 'Test', en: 'Test', de: 'Test', it: 'Test' },
            description: { sr: 'Test', en: 'Test', de: 'Test', it: 'Test' },
            bed_type: { sr: 'Test', en: 'Test', de: 'Test', it: 'Test' },
            capacity: 2,
            amenities: [],
            base_price_eur: 50,
            images: [],
            status: 'active' as const,
            display_order: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          
          const localized = transformApartmentRecord(recordWithEmptyImages as any, locale)
          
          expect(localized.images).toEqual([])
        }
      ),
      { numRuns: 50 }
    )
  })
})
