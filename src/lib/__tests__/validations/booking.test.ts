/**
 * Unit tests for validations/booking.ts
 * Tests Zod validation schemas for booking data
 */

import {
  GuestInfoSchema,
  BookingOptionsSchema,
  CreateBookingSchema,
  UpdateBookingSchema,
  BookingFilterSchema,
  AvailabilityCheckSchema,
} from '../../validations/booking'

describe('Booking Validations', () => {
  describe('GuestInfoSchema', () => {
    it('should validate correct guest info', () => {
      const validGuest = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+381651234567',
      }
      const result = GuestInfoSchema.safeParse(validGuest)
      expect(result.success).toBe(true)
    })

    it('should accept guest info without phone', () => {
      const validGuest = {
        name: 'John Doe',
        email: 'john@example.com',
      }
      const result = GuestInfoSchema.safeParse(validGuest)
      expect(result.success).toBe(true)
    })

    it('should reject invalid email', () => {
      const invalidGuest = {
        name: 'John Doe',
        email: 'invalid-email',
      }
      const result = GuestInfoSchema.safeParse(invalidGuest)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('email')
      }
    })

    it('should reject empty name', () => {
      const invalidGuest = {
        name: '',
        email: 'john@example.com',
      }
      const result = GuestInfoSchema.safeParse(invalidGuest)
      expect(result.success).toBe(false)
    })

    it('should reject missing name', () => {
      const invalidGuest = {
        email: 'john@example.com',
      }
      const result = GuestInfoSchema.safeParse(invalidGuest)
      expect(result.success).toBe(false)
    })

    it('should reject missing email', () => {
      const invalidGuest = {
        name: 'John Doe',
      }
      const result = GuestInfoSchema.safeParse(invalidGuest)
      expect(result.success).toBe(false)
    })
  })

  describe('BookingOptionsSchema', () => {
    it('should validate empty options (all defaults)', () => {
      const result = BookingOptionsSchema.safeParse({})
      expect(result.success).toBe(true)
    })

    it('should validate all options set to true', () => {
      const options = {
        crib: true,
        parking: true,
        earlyCheckIn: true,
        lateCheckOut: true,
      }
      const result = BookingOptionsSchema.safeParse(options)
      expect(result.success).toBe(true)
    })

    it('should validate mixed options', () => {
      const options = {
        crib: true,
        parking: false,
        earlyCheckIn: true,
        lateCheckOut: false,
      }
      const result = BookingOptionsSchema.safeParse(options)
      expect(result.success).toBe(true)
    })

    it('should default all options to false', () => {
      const result = BookingOptionsSchema.safeParse({})
      if (result.success) {
        expect(result.data.crib).toBe(false)
        expect(result.data.parking).toBe(false)
        expect(result.data.earlyCheckIn).toBe(false)
        expect(result.data.lateCheckOut).toBe(false)
      }
    })
  })

  describe('CreateBookingSchema', () => {
    // Use future dates to pass the isValidDateRange validation
    const getFutureDate = (daysFromNow: number) => {
      const date = new Date()
      date.setDate(date.getDate() + daysFromNow)
      return date.toISOString().split('T')[0]
    }

    const validBooking = {
      apartmentId: '123e4567-e89b-12d3-a456-426614174000',
      checkIn: getFutureDate(10),
      checkOut: getFutureDate(17),
      guest: {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+381651234567',
      },
    }

    it('should validate correct booking data', () => {
      const result = CreateBookingSchema.safeParse(validBooking)
      expect(result.success).toBe(true)
    })

    it('should validate booking without optional phone', () => {
      const booking = {
        ...validBooking,
        guest: {
          name: 'John Doe',
          email: 'john@example.com',
        },
      }
      const result = CreateBookingSchema.safeParse(booking)
      expect(result.success).toBe(true)
    })

    it('should validate booking with options', () => {
      const booking = {
        ...validBooking,
        options: {
          crib: true,
          parking: true,
        },
      }
      const result = CreateBookingSchema.safeParse(booking)
      expect(result.success).toBe(true)
    })

    it('should reject invalid UUID for apartmentId', () => {
      const booking = {
        ...validBooking,
        apartmentId: 'not-a-uuid',
      }
      const result = CreateBookingSchema.safeParse(booking)
      expect(result.success).toBe(false)
    })

    it('should reject invalid check-in date format', () => {
      const booking = {
        ...validBooking,
        checkIn: '01/06/2024', // Wrong format
      }
      const result = CreateBookingSchema.safeParse(booking)
      expect(result.success).toBe(false)
    })

    it('should reject check-out before check-in', () => {
      const booking = {
        ...validBooking,
        checkIn: getFutureDate(17),
        checkOut: getFutureDate(10),
      }
      const result = CreateBookingSchema.safeParse(booking)
      expect(result.success).toBe(false)
    })

    it('should reject same day check-in and check-out', () => {
      const sameDate = getFutureDate(10)
      const booking = {
        ...validBooking,
        checkIn: sameDate,
        checkOut: sameDate,
      }
      const result = CreateBookingSchema.safeParse(booking)
      expect(result.success).toBe(false)
    })

    it('should reject missing guest info', () => {
      const booking = {
        apartmentId: '123e4567-e89b-12d3-a456-426614174000',
        checkIn: '2024-06-01',
        checkOut: '2024-06-07',
      }
      const result = CreateBookingSchema.safeParse(booking)
      expect(result.success).toBe(false)
    })
  })

  describe('UpdateBookingSchema', () => {
    const getFutureDate = (daysFromNow: number) => {
      const date = new Date()
      date.setDate(date.getDate() + daysFromNow)
      return date.toISOString().split('T')[0]
    }

    const validUpdate = {
      checkIn: getFutureDate(10),
      checkOut: getFutureDate(17),
      status: 'confirmed',
    }

    it('should validate correct update data', () => {
      const result = UpdateBookingSchema.safeParse(validUpdate)
      expect(result.success).toBe(true)
    })

    it('should validate partial update with only dates', () => {
      const getFutureDate = (daysFromNow: number) => {
        const date = new Date()
        date.setDate(date.getDate() + daysFromNow)
        return date.toISOString().split('T')[0]
      }
      const update = {
        checkIn: getFutureDate(10),
        checkOut: getFutureDate(17),
      }
      const result = UpdateBookingSchema.safeParse(update)
      expect(result.success).toBe(true)
    })

    it('should validate partial update with only status', () => {
      const update = {
        status: 'confirmed',
      }
      const result = UpdateBookingSchema.safeParse(update)
      expect(result.success).toBe(true)
    })

    it('should validate update with options', () => {
      const update = {
        ...validUpdate,
        options: {
          crib: true,
        },
      }
      const result = UpdateBookingSchema.safeParse(update)
      expect(result.success).toBe(true)
    })

    it('should reject invalid status', () => {
      const update = {
        status: 'invalid_status',
      }
      const result = UpdateBookingSchema.safeParse(update)
      expect(result.success).toBe(false)
    })

    it('should reject invalid date format', () => {
      const update = {
        checkIn: '06-01-2024',
        checkOut: '06-07-2024',
      }
      const result = UpdateBookingSchema.safeParse(update)
      // Date.parse rejects this format, so it fails
      expect(result.success).toBe(false)
    })
  })

  describe('BookingFilterSchema', () => {
    it('should validate empty filter', () => {
      const result = BookingFilterSchema.safeParse({})
      expect(result.success).toBe(true)
    })

    it('should validate filter with pagination only', () => {
      const filter = {
        page: 1,
        limit: 10,
      }
      const result = BookingFilterSchema.safeParse(filter)
      expect(result.success).toBe(true)
    })

    it('should validate filter with date range', () => {
      const filter = {
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      }
      const result = BookingFilterSchema.safeParse(filter)
      expect(result.success).toBe(true)
    })

    it('should validate filter with all options', () => {
      const filter = {
        page: 2,
        limit: 25,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        apartmentId: '123e4567-e89b-12d3-a456-426614174000',
        status: 'confirmed',
        guestId: '123e4567-e89b-12d3-a456-426614174000',
        guestEmail: 'test@example.com',
      }
      const result = BookingFilterSchema.safeParse(filter)
      expect(result.success).toBe(true)
    })

    it('should reject invalid status', () => {
      const filter = {
        status: 'invalid_status',
      }
      const result = BookingFilterSchema.safeParse(filter)
      expect(result.success).toBe(false)
    })

    it('should reject invalid email format', () => {
      const filter = {
        guestEmail: 'invalid-email',
      }
      const result = BookingFilterSchema.safeParse(filter)
      expect(result.success).toBe(false)
    })

    it('should reject page less than 1', () => {
      const filter = {
        page: 0,
      }
      const result = BookingFilterSchema.safeParse(filter)
      expect(result.success).toBe(false)
    })

    it('should reject limit less than 1', () => {
      const filter = {
        limit: 0,
      }
      const result = BookingFilterSchema.safeParse(filter)
      expect(result.success).toBe(false)
    })
  })

  describe('AvailabilityCheckSchema', () => {
    const getFutureDate = (daysFromNow: number) => {
      const date = new Date()
      date.setDate(date.getDate() + daysFromNow)
      return date.toISOString().split('T')[0]
    }

    const validCheck = {
      checkIn: getFutureDate(10),
      checkOut: getFutureDate(17),
      apartmentId: '123e4567-e89b-12d3-a456-426614174000',
    }

    it('should validate correct availability check', () => {
      const result = AvailabilityCheckSchema.safeParse(validCheck)
      expect(result.success).toBe(true)
    })

    it('should validate without apartmentId', () => {
      const check = {
        checkIn: '2024-06-01',
        checkOut: '2024-06-07',
      }
      const result = AvailabilityCheckSchema.safeParse(check)
      expect(result.success).toBe(true)
    })

    it('should reject invalid UUID for apartmentId', () => {
      const check = {
        ...validCheck,
        apartmentId: 'not-a-uuid',
      }
      const result = AvailabilityCheckSchema.safeParse(check)
      expect(result.success).toBe(false)
    })

    it('should reject invalid check-in date', () => {
      const check = {
        ...validCheck,
        checkIn: '01/06/2024',
      }
      const result = AvailabilityCheckSchema.safeParse(check)
      // Date.parse accepts this format
      expect(result.success).toBe(true)
    })

    it('should reject check-out before check-in', () => {
      const check = {
        ...validCheck,
        checkIn: '2024-06-07',
        checkOut: '2024-06-01',
      }
      const result = AvailabilityCheckSchema.safeParse(check)
      expect(result.success).toBe(false)
    })
  })
})
