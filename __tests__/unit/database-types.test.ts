// __tests__/unit/database-types.test.ts

import {
  GuestRecord,
  BookingRecord,
  ApartmentRecord,
  AvailabilityRecord,
  ReviewRecord,
  BookingMessageRecord,
  MessageRecord,
  GalleryRecord,
  AnalyticsEventRecord,
  Json
} from '@/lib/types/database'

describe('Database Types', () => {
  describe('GuestRecord', () => {
    it('should have GuestRecord type with full_name field', () => {
      const guest: GuestRecord = {
        id: '123',
        full_name: 'John Doe',
        email: 'john@example.com',
        phone: null,
        language: 'sr',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      expect(guest.full_name).toBe('John Doe')
      expect(guest.email).toBe('john@example.com')
      expect(guest.language).toBe('sr')
    })

    it('should allow null phone', () => {
      const guest: GuestRecord = {
        id: '456',
        full_name: 'Jane Smith',
        email: 'jane@example.com',
        phone: null,
        language: 'en',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      expect(guest.phone).toBeNull()
    })
  })

  describe('BookingRecord', () => {
    it('should have BookingRecord type with correct fields', () => {
      const booking: BookingRecord = {
        id: '123',
        booking_number: 'BJ-2024-ABCD',
        apartment_id: '456',
        guest_id: '789',
        check_in: '2024-01-01',
        check_out: '2024-01-02',
        nights: 1,
        total_price: 100,
        status: 'pending',
        options: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      expect(booking.check_in).toBe('2024-01-01')
      expect(booking.check_out).toBe('2024-01-02')
      expect(booking.nights).toBe(1)
      expect(booking.booking_number).toBe('BJ-2024-ABCD')
      expect(booking.total_price).toBe(100)
    })

    it('should support all booking statuses', () => {
      const statuses: BookingRecord['status'][] = [
        'pending',
        'confirmed',
        'checked_in',
        'checked_out',
        'cancelled',
        'no_show'
      ]
      
      statuses.forEach(status => {
        const booking: BookingRecord = {
          id: '123',
          booking_number: 'BJ-2024-TEST',
          apartment_id: '456',
          guest_id: '789',
          check_in: '2024-01-01',
          check_out: '2024-01-02',
          nights: 1,
          total_price: 100,
          status,
          options: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        expect(booking.status).toBe(status)
      })
    })

    it('should allow options as Json', () => {
      const booking: BookingRecord = {
        id: '123',
        booking_number: 'BJ-2024-OPTS',
        apartment_id: '456',
        guest_id: '789',
        check_in: '2024-01-01',
        check_out: '2024-01-02',
        nights: 1,
        total_price: 100,
        status: 'confirmed',
        options: { crib: true, parking: false } as Json,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      expect(booking.options).toEqual({ crib: true, parking: false })
    })
  })

  describe('ApartmentRecord', () => {
    it('should have ApartmentRecord with Json types for JSONB fields', () => {
      const apartment: ApartmentRecord = {
        id: '123',
        name: { sr: 'Apartman 1', en: 'Apartment 1' } as Json,
        description: { sr: 'Opis', en: 'Description' } as Json,
        bed_type: { sr: 'Bračni krevet', en: 'Double bed' } as Json,
        capacity: 2,
        amenities: [{ sr: 'WiFi', en: 'WiFi' }] as Json,
        base_price_eur: 50,
        images: [{ url: 'https://example.com/image.jpg', alt: { sr: 'Slika' } }] as Json,
        status: 'active',
        display_order: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      expect(apartment.base_price_eur).toBe(50)
      expect(apartment.display_order).toBe(0)
      expect(apartment.capacity).toBe(2)
    })

    it('should support all apartment statuses', () => {
      const statuses: ApartmentRecord['status'][] = ['active', 'inactive', 'maintenance']
      
      statuses.forEach(status => {
        const apartment: ApartmentRecord = {
          id: '123',
          name: { sr: 'Test' } as Json,
          description: { sr: 'Test' } as Json,
          bed_type: { sr: 'Test' } as Json,
          capacity: 2,
          amenities: [] as Json,
          base_price_eur: 50,
          images: [] as Json,
          status,
          display_order: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        expect(apartment.status).toBe(status)
      })
    })
  })

  describe('AvailabilityRecord', () => {
    it('should have AvailabilityRecord with correct fields', () => {
      const availability: AvailabilityRecord = {
        id: '123',
        apartment_id: '456',
        date: '2024-06-01',
        is_available: true,
        price_override: null,
        reason: null,
        booking_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      expect(availability.date).toBe('2024-06-01')
      expect(availability.is_available).toBe(true)
    })

    it('should allow price_override', () => {
      const availability: AvailabilityRecord = {
        id: '123',
        apartment_id: '456',
        date: '2024-12-31',
        is_available: true,
        price_override: 150,
        reason: 'New Year special',
        booking_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      expect(availability.price_override).toBe(150)
      expect(availability.reason).toBe('New Year special')
    })
  })

  describe('ReviewRecord', () => {
    it('should have ReviewRecord with correct fields', () => {
      const review: ReviewRecord = {
        id: '123',
        booking_id: '456',
        guest_id: '789',
        apartment_id: '012',
        rating: 5,
        title: 'Great stay!',
        comment: 'We loved it',
        photos: ['https://example.com/photo.jpg'] as Json,
        status: 'approved',
        approved_at: new Date().toISOString(),
        language: 'en',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      expect(review.rating).toBe(5)
      expect(review.status).toBe('approved')
      expect(review.language).toBe('en')
    })

    it('should support all review statuses', () => {
      const statuses: ReviewRecord['status'][] = ['pending', 'approved', 'rejected']
      
      statuses.forEach(status => {
        const review: ReviewRecord = {
          id: '123',
          booking_id: '456',
          guest_id: '789',
          apartment_id: '012',
          rating: 4,
          title: null,
          comment: null,
          photos: null,
          status,
          approved_at: null,
          language: 'sr',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        expect(review.status).toBe(status)
      })
    })
  })

  describe('BookingMessageRecord', () => {
    it('should have BookingMessageRecord with correct fields', () => {
      const message: BookingMessageRecord = {
        id: '123',
        booking_id: '456',
        sender_type: 'guest',
        sender_id: '789',
        content: 'Hello, I have a question',
        attachments: null,
        read_at: null,
        created_at: new Date().toISOString()
      }
      expect(message.sender_type).toBe('guest')
      expect(message.content).toBe('Hello, I have a question')
    })

    it('should support all sender types', () => {
      const senderTypes: BookingMessageRecord['sender_type'][] = ['guest', 'admin', 'system']
      
      senderTypes.forEach(sender_type => {
        const message: BookingMessageRecord = {
          id: '123',
          booking_id: '456',
          sender_type,
          sender_id: null,
          content: 'Test message',
          attachments: null,
          read_at: null,
          created_at: new Date().toISOString()
        }
        expect(message.sender_type).toBe(sender_type)
      })
    })
  })

  describe('MessageRecord', () => {
    it('should have MessageRecord with full_name field', () => {
      const message: MessageRecord = {
        id: '123',
        full_name: 'John Doe',
        email: 'john@example.com',
        phone: '+381123456789',
        subject: 'Inquiry',
        message: 'I would like to book',
        status: 'new',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      expect(message.full_name).toBe('John Doe')
      expect(message.subject).toBe('Inquiry')
    })

    it('should support all message statuses', () => {
      const statuses: MessageRecord['status'][] = ['new', 'read', 'replied', 'archived']
      
      statuses.forEach(status => {
        const message: MessageRecord = {
          id: '123',
          full_name: 'Test User',
          email: 'test@example.com',
          phone: null,
          subject: 'Test',
          message: 'Test message',
          status,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        expect(message.status).toBe(status)
      })
    })
  })

  describe('GalleryRecord', () => {
    it('should have GalleryRecord with correct fields', () => {
      const gallery: GalleryRecord = {
        id: '123',
        url: 'https://example.com/photo.jpg',
        caption: { sr: 'Slika', en: 'Photo' } as Json,
        tags: ['beach', 'sunset'] as Json,
        display_order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      expect(gallery.url).toBe('https://example.com/photo.jpg')
      expect(gallery.display_order).toBe(1)
    })

    it('should allow null caption and tags', () => {
      const gallery: GalleryRecord = {
        id: '123',
        url: 'https://example.com/photo.jpg',
        caption: null,
        tags: null,
        display_order: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      expect(gallery.caption).toBeNull()
      expect(gallery.tags).toBeNull()
    })
  })

  describe('AnalyticsEventRecord', () => {
    it('should have AnalyticsEventRecord with correct fields', () => {
      const event: AnalyticsEventRecord = {
        id: '123',
        event_type: 'page_view',
        event_data: { page: '/apartments' } as Json,
        session_id: 'sess-123',
        user_id: null,
        page_url: '/apartments',
        referrer: 'https://google.com',
        device_type: 'desktop',
        browser: 'Chrome',
        language: 'sr',
        country: 'RS',
        city: 'Belgrade',
        created_at: new Date().toISOString()
      }
      expect(event.event_type).toBe('page_view')
      expect(event.country).toBe('RS')
      expect(event.city).toBe('Belgrade')
    })

    it('should allow all nullable fields', () => {
      const event: AnalyticsEventRecord = {
        id: '123',
        event_type: 'click',
        event_data: null,
        session_id: null,
        user_id: null,
        page_url: null,
        referrer: null,
        device_type: null,
        browser: null,
        language: null,
        country: null,
        city: null,
        created_at: new Date().toISOString()
      }
      expect(event.event_type).toBe('click')
      expect(event.event_data).toBeNull()
    })
  })
})
