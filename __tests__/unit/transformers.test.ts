// __tests__/unit/transformers.test.ts

import {
  transformApartmentRecord,
  transformBookingRecord,
  transformReviewRecord,
  reverseTransformApartmentData,
  BookingResponse,
  ReviewResponse
} from '@/lib/transformers/database'
import {
  ApartmentRecord,
  BookingRecord,
  ReviewRecord,
  GuestRecord,
  Locale,
  Json
} from '@/lib/types/database'

describe('Transformer Functions', () => {
  describe('transformApartmentRecord', () => {
    const mockApartmentRecord: ApartmentRecord = {
      id: 'apt-1',
      name: { sr: 'Apartman 1', en: 'Apartment 1', de: 'Wohnung 1', it: 'Appartamento 1' } as Json,
      description: { sr: 'Opis', en: 'Description', de: 'Beschreibung', it: 'Descrizione' } as Json,
      bed_type: { sr: 'Bračni krevet', en: 'Double bed', de: 'Doppelbett', it: 'Letto matrimoniale' } as Json,
      capacity: 4,
      amenities: [
        { sr: 'WiFi', en: 'WiFi', de: 'WiFi', it: 'WiFi' },
        { sr: 'Klima', en: 'AC', de: 'Klimaanlage', it: 'Aria condizionata' }
      ] as Json,
      base_price_eur: 50,
      images: [
        { url: 'https://example.com/img1.jpg', alt: { sr: 'Slika 1', en: 'Image 1', de: 'Bild 1', it: 'Immagine 1' } },
        { url: 'https://example.com/img2.jpg', alt: { sr: 'Slika 2', en: 'Image 2', de: 'Bild 2', it: 'Immagine 2' } }
      ] as Json,
      status: 'active',
      display_order: 1,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }

    it('should transform apartment record to Serbian locale', () => {
      const result = transformApartmentRecord(mockApartmentRecord, 'sr')
      
      expect(result.id).toBe('apt-1')
      expect(result.name).toBe('Apartman 1')
      expect(result.description).toBe('Opis')
      expect(result.bed_type).toBe('Bračni krevet')
      expect(result.capacity).toBe(4)
      expect(result.amenities).toEqual(['WiFi', 'Klima'])
      expect(result.base_price_eur).toBe(50)
      expect(result.images).toEqual(['https://example.com/img1.jpg', 'https://example.com/img2.jpg'])
      expect(result.status).toBe('active')
    })

    it('should transform apartment record to English locale', () => {
      const result = transformApartmentRecord(mockApartmentRecord, 'en')
      
      expect(result.name).toBe('Apartment 1')
      expect(result.description).toBe('Description')
      expect(result.bed_type).toBe('Double bed')
      expect(result.amenities).toEqual(['WiFi', 'AC'])
    })

    it('should transform apartment record to German locale', () => {
      const result = transformApartmentRecord(mockApartmentRecord, 'de')
      
      expect(result.name).toBe('Wohnung 1')
      expect(result.description).toBe('Beschreibung')
      expect(result.bed_type).toBe('Doppelbett')
      expect(result.amenities).toEqual(['WiFi', 'Klimaanlage'])
    })

    it('should transform apartment record to Italian locale', () => {
      const result = transformApartmentRecord(mockApartmentRecord, 'it')
      
      expect(result.name).toBe('Appartamento 1')
      expect(result.description).toBe('Descrizione')
      expect(result.bed_type).toBe('Letto matrimoniale')
      expect(result.amenities).toEqual(['WiFi', 'Aria condizionata'])
    })

    it('should handle empty amenities array', () => {
      const recordWithEmptyAmenities = {
        ...mockApartmentRecord,
        amenities: [] as Json
      }
      
      const result = transformApartmentRecord(recordWithEmptyAmenities, 'sr')
      expect(result.amenities).toEqual([])
    })

    it('should handle empty images array', () => {
      const recordWithEmptyImages = {
        ...mockApartmentRecord,
        images: [] as Json
      }
      
      const result = transformApartmentRecord(recordWithEmptyImages, 'sr')
      expect(result.images).toEqual([])
    })

    it('should fallback to Serbian when locale is missing', () => {
      const recordWithMissingLocale: ApartmentRecord = {
        ...mockApartmentRecord,
        name: { sr: 'Apartman 1', en: 'Apartment 1' } as Json
      }
      
      const result = transformApartmentRecord(recordWithMissingLocale, 'de')
      expect(result.name).toBe('Apartman 1') // Falls back to Serbian
    })
  })

  describe('transformBookingRecord', () => {
    const mockGuest: GuestRecord = {
      id: 'guest-1',
      full_name: 'John Doe',
      email: 'john@example.com',
      phone: '+381123456789',
      language: 'en',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }

    const mockApartment: ApartmentRecord = {
      id: 'apt-1',
      name: { sr: 'Apartman 1', en: 'Apartment 1', de: 'Wohnung 1', it: 'Appartamento 1' } as Json,
      description: { sr: 'Opis', en: 'Description', de: 'Beschreibung', it: 'Descrizione' } as Json,
      bed_type: { sr: 'Bračni krevet', en: 'Double bed', de: 'Doppelbett', it: 'Letto matrimoniale' } as Json,
      capacity: 4,
      amenities: [] as Json,
      base_price_eur: 50,
      images: [] as Json,
      status: 'active',
      display_order: 1,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }

    const mockBooking: BookingRecord & { apartment: ApartmentRecord; guest: GuestRecord } = {
      id: 'booking-1',
      booking_number: 'BK-2024-001',
      apartment_id: 'apt-1',
      guest_id: 'guest-1',
      check_in: '2024-06-01',
      check_out: '2024-06-05',
      nights: 4,
      total_price: 200,
      status: 'confirmed',
      options: { parking: true, crib: false } as Json,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      apartment: mockApartment,
      guest: mockGuest
    }

    it('should transform booking record with Serbian locale', () => {
      const result = transformBookingRecord(mockBooking, 'sr')
      
      expect(result.id).toBe('booking-1')
      expect(result.bookingNumber).toBe('BK-2024-001')
      expect(result.apartmentId).toBe('apt-1')
      expect(result.apartmentName).toBe('Apartman 1')
      expect(result.guestId).toBe('guest-1')
      expect(result.guestName).toBe('John Doe')
      expect(result.guestEmail).toBe('john@example.com')
      expect(result.guestPhone).toBe('+381123456789')
      expect(result.checkIn).toBe('2024-06-01')
      expect(result.checkOut).toBe('2024-06-05')
      expect(result.nights).toBe(4)
      expect(result.totalPrice).toBe(200)
      expect(result.status).toBe('confirmed')
      expect(result.options).toEqual({ parking: true, crib: false })
    })

    it('should transform booking record with English locale', () => {
      const result = transformBookingRecord(mockBooking, 'en')
      expect(result.apartmentName).toBe('Apartment 1')
    })

    it('should handle null options', () => {
      const bookingWithNullOptions = {
        ...mockBooking,
        options: null
      }
      
      const result = transformBookingRecord(bookingWithNullOptions, 'sr')
      expect(result.options).toBeUndefined()
    })
  })

  describe('transformReviewRecord', () => {
    const mockGuest: GuestRecord = {
      id: 'guest-1',
      full_name: 'Jane Smith',
      email: 'jane@example.com',
      phone: null,
      language: 'en',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }

    const mockApartment: ApartmentRecord = {
      id: 'apt-1',
      name: { sr: 'Apartman 1', en: 'Apartment 1', de: 'Wohnung 1', it: 'Appartamento 1' } as Json,
      description: { sr: 'Opis', en: 'Description', de: 'Beschreibung', it: 'Descrizione' } as Json,
      bed_type: { sr: 'Bračni krevet', en: 'Double bed', de: 'Doppelbett', it: 'Letto matrimoniale' } as Json,
      capacity: 4,
      amenities: [] as Json,
      base_price_eur: 50,
      images: [] as Json,
      status: 'active',
      display_order: 1,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }

    const mockReview: ReviewRecord & { apartment: ApartmentRecord; guest: GuestRecord } = {
      id: 'review-1',
      booking_id: 'booking-1',
      guest_id: 'guest-1',
      apartment_id: 'apt-1',
      rating: 5,
      title: 'Great stay!',
      comment: 'We had a wonderful time.',
      photos: ['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg'] as Json,
      status: 'approved',
      approved_at: '2024-01-02T00:00:00Z',
      language: 'en',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      apartment: mockApartment,
      guest: mockGuest
    }

    it('should transform review record with Serbian locale', () => {
      const result = transformReviewRecord(mockReview, 'sr')
      
      expect(result.id).toBe('review-1')
      expect(result.bookingId).toBe('booking-1')
      expect(result.apartmentId).toBe('apt-1')
      expect(result.apartmentName).toBe('Apartman 1')
      expect(result.guestId).toBe('guest-1')
      expect(result.guestName).toBe('Jane Smith')
      expect(result.rating).toBe(5)
      expect(result.title).toBe('Great stay!')
      expect(result.comment).toBe('We had a wonderful time.')
      expect(result.photos).toEqual(['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg'])
      expect(result.status).toBe('approved')
      expect(result.approvedAt).toBe('2024-01-02T00:00:00Z')
      expect(result.language).toBe('en')
    })

    it('should transform review record with English locale', () => {
      const result = transformReviewRecord(mockReview, 'en')
      expect(result.apartmentName).toBe('Apartment 1')
    })

    it('should handle null photos', () => {
      const reviewWithNullPhotos = {
        ...mockReview,
        photos: null
      }
      
      const result = transformReviewRecord(reviewWithNullPhotos, 'sr')
      expect(result.photos).toBeNull()
    })

    it('should handle null title and comment', () => {
      const reviewWithNulls = {
        ...mockReview,
        title: null,
        comment: null
      }
      
      const result = transformReviewRecord(reviewWithNulls, 'sr')
      expect(result.title).toBeNull()
      expect(result.comment).toBeNull()
    })
  })

  describe('reverseTransformApartmentData', () => {
    it('should reverse transform apartment data to JSONB format', () => {
      const frontendData = {
        name: { sr: 'Apartman 1', en: 'Apartment 1', de: 'Wohnung 1', it: 'Appartamento 1' },
        description: { sr: 'Opis', en: 'Description', de: 'Beschreibung', it: 'Descrizione' },
        bed_type: { sr: 'Bračni krevet', en: 'Double bed', de: 'Doppelbett', it: 'Letto matrimoniale' },
        amenities: [
          { sr: 'WiFi', en: 'WiFi', de: 'WiFi', it: 'WiFi' },
          { sr: 'Klima', en: 'AC', de: 'Klimaanlage', it: 'Aria condizionata' }
        ],
        images: [
          { url: 'https://example.com/img1.jpg', alt: { sr: 'Slika 1', en: 'Image 1', de: 'Bild 1', it: 'Immagine 1' } },
          { url: 'https://example.com/img2.jpg', alt: { sr: 'Slika 2', en: 'Image 2', de: 'Bild 2', it: 'Immagine 2' } }
        ]
      }

      const result = reverseTransformApartmentData(frontendData)
      
      expect(result.name).toEqual(frontendData.name)
      expect(result.description).toEqual(frontendData.description)
      expect(result.bed_type).toEqual(frontendData.bed_type)
      expect(result.amenities).toEqual(frontendData.amenities)
      expect(result.images).toEqual(frontendData.images)
    })

    it('should handle empty amenities array', () => {
      const frontendData = {
        name: { sr: 'Apartman 1', en: 'Apartment 1', de: 'Wohnung 1', it: 'Appartamento 1' },
        description: { sr: 'Opis', en: 'Description', de: 'Beschreibung', it: 'Descrizione' },
        bed_type: { sr: 'Bračni krevet', en: 'Double bed', de: 'Doppelbett', it: 'Letto matrimoniale' },
        amenities: [],
        images: []
      }

      const result = reverseTransformApartmentData(frontendData)
      
      expect(result.amenities).toEqual([])
      expect(result.images).toEqual([])
    })
  })
})
