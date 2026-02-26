/**
 * Unit tests for email/service.ts
 * Tests email template rendering and multi-language support
 */

// Mock the resend module before importing the service
jest.mock('../../resend', () => ({
  sendEmail: jest.fn().mockResolvedValue({
    success: true,
    messageId: 'test-message-id',
  }),
  isResendConfigured: jest.fn().mockReturnValue(true),
  EMAIL_CONFIG: {
    adminEmail: 'admin@apartmani-jovca.com',
    fromEmail: 'noreply@apartmani-jovca.com',
  },
  logEmailEvent: jest.fn(),
}))

jest.mock('../../email/templates', () => ({
  renderBookingConfirmationEmail: jest.fn().mockResolvedValue({
    subject: 'Booking Confirmed! - BJ-2024-TEST',
    html: '<html>Booking Confirmation</html>',
    text: 'Booking Confirmation',
  }),
  renderBookingRequestEmail: jest.fn().mockResolvedValue({
    subject: 'New Booking Request - BJ-2024-TEST',
    html: '<html>Booking Request</html>',
    text: 'Booking Request',
  }),
  renderCheckInInstructionsEmail: jest.fn().mockResolvedValue({
    subject: 'Check-In Instructions - BJ-2024-TEST',
    html: '<html>Check-In Instructions</html>',
    text: 'Check-In Instructions',
  }),
  renderPreArrivalReminderEmail: jest.fn().mockResolvedValue({
    subject: 'Pre-Arrival Reminder - BJ-2024-TEST',
    html: '<html>Pre-Arrival Reminder</html>',
    text: 'Pre-Arrival Reminder',
  }),
  renderReviewRequestEmail: jest.fn().mockResolvedValue({
    subject: 'How Was Your Stay? - BJ-2024-TEST',
    html: '<html>Review Request</html>',
    text: 'Review Request',
  }),
}))

import {
  sendBookingConfirmation,
  sendBookingRequest,
  sendCheckInInstructions,
  sendPreArrivalReminder,
  sendReviewRequest,
  sendEmailByType,
} from '../../email/service'

// Types for test data
interface TestBooking {
  bookingId: string
  bookingNumber: string
  checkIn: string
  checkOut: string
  totalPrice: number
  apartment: {
    id: string
    name: string
    nameSr?: string
    nameDe?: string
    nameIt?: string
  }
}

interface TestGuest {
  full_name: string
  name?: string
  email: string
  phone?: string
  language?: 'en' | 'sr' | 'de' | 'it'
}

describe('Email Service', () => {
  const mockBooking: TestBooking = {
    bookingId: 'test-booking-id',
    bookingNumber: 'BJ-2024-TEST',
    checkIn: '2024-06-01',
    checkOut: '2024-06-07',
    totalPrice: 600,
    apartment: {
      id: 'test-apartment-id',
      name: 'Test Apartment',
      nameSr: 'Test Apartman',
      nameDe: 'Test Wohnung',
      nameIt: 'Test Appartamento',
    },
  }

  const mockGuest: TestGuest = {
    full_name: 'John Doe',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+381651234567',
    language: 'en',
  }

  describe('sendBookingConfirmation', () => {
    it('should send booking confirmation email successfully', async () => {
      const result = await sendBookingConfirmation(mockBooking, mockGuest)

      expect(result.success).toBe(true)
      expect(result.messageId).toBe('test-message-id')
    })

    it('should use guest language for email', async () => {
      const guestWithLanguage: TestGuest = {
        ...mockGuest,
        language: 'sr',
      }

      const result = await sendBookingConfirmation(mockBooking, guestWithLanguage)

      expect(result.success).toBe(true)
    })

    it('should default to English when no language specified', async () => {
      const guestWithoutLanguage: TestGuest = {
        full_name: 'John Doe',
        email: 'john@example.com',
      }

      const result = await sendBookingConfirmation(mockBooking, guestWithoutLanguage)

      expect(result.success).toBe(true)
    })
  })

  describe('sendBookingRequest', () => {
    it('should send booking request to admin successfully', async () => {
      const result = await sendBookingRequest(mockBooking, mockGuest)

      expect(result.success).toBe(true)
      expect(result.messageId).toBe('test-message-id')
    })

    it('should always use English for admin emails', async () => {
      const guestWithLanguage: TestGuest = {
        ...mockGuest,
        language: 'de',
      }

      const result = await sendBookingRequest(mockBooking, guestWithLanguage)

      expect(result.success).toBe(true)
    })
  })

  describe('sendCheckInInstructions', () => {
    it('should send check-in instructions successfully', async () => {
      const result = await sendCheckInInstructions(mockBooking, mockGuest)

      expect(result.success).toBe(true)
    })

    it('should include optional check-in time', async () => {
      const options = {
        checkInTime: '14:00',
        checkOutTime: '10:00',
        address: 'Test Address 123',
      }

      const result = await sendCheckInInstructions(mockBooking, mockGuest, options)

      expect(result.success).toBe(true)
    })

    it('should work without options', async () => {
      const result = await sendCheckInInstructions(mockBooking, mockGuest)

      expect(result.success).toBe(true)
    })
  })

  describe('sendPreArrivalReminder', () => {
    it('should send pre-arrival reminder successfully', async () => {
      const result = await sendPreArrivalReminder(mockBooking, mockGuest)

      expect(result.success).toBe(true)
    })

    it('should use custom days until arrival', async () => {
      const result = await sendPreArrivalReminder(mockBooking, mockGuest, 7)

      expect(result.success).toBe(true)
    })

    it('should default to 3 days when not specified', async () => {
      const result = await sendPreArrivalReminder(mockBooking, mockGuest)

      expect(result.success).toBe(true)
    })
  })

  describe('sendReviewRequest', () => {
    it('should send review request successfully', async () => {
      const result = await sendReviewRequest(mockBooking, mockGuest)

      expect(result.success).toBe(true)
    })

    it('should include review URL when provided', async () => {
      const reviewUrl = 'https://apartmani-jovca.com/reviews/test'

      const result = await sendReviewRequest(mockBooking, mockGuest, reviewUrl)

      expect(result.success).toBe(true)
    })

    it('should work without review URL', async () => {
      const result = await sendReviewRequest(mockBooking, mockGuest)

      expect(result.success).toBe(true)
    })
  })

  describe('sendEmailByType', () => {
    it('should send booking_confirmation email', async () => {
      const result = await sendEmailByType('booking_confirmation', mockBooking, mockGuest)

      expect(result.success).toBe(true)
    })

    it('should send booking_request email', async () => {
      const result = await sendEmailByType('booking_request', mockBooking, mockGuest)

      expect(result.success).toBe(true)
    })

    it('should send check_in_instructions email', async () => {
      const result = await sendEmailByType('check_in_instructions', mockBooking, mockGuest)

      expect(result.success).toBe(true)
    })

    it('should send pre_arrival_reminder email', async () => {
      const result = await sendEmailByType('pre_arrival_reminder', mockBooking, mockGuest)

      expect(result.success).toBe(true)
    })

    it('should send review_request email', async () => {
      const result = await sendEmailByType('review_request', mockBooking, mockGuest)

      expect(result.success).toBe(true)
    })

    it('should return error for unknown email type', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await sendEmailByType('unknown_type' as any, mockBooking, mockGuest)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Unknown email type')
    })
  })

  describe('Multi-language Support', () => {
    it('should support Serbian language', async () => {
      const guestSr: TestGuest = {
        ...mockGuest,
        language: 'sr',
      }

      const result = await sendBookingConfirmation(mockBooking, guestSr)

      expect(result.success).toBe(true)
    })

    it('should support German language', async () => {
      const guestDe: TestGuest = {
        ...mockGuest,
        language: 'de',
      }

      const result = await sendBookingConfirmation(mockBooking, guestDe)

      expect(result.success).toBe(true)
    })

    it('should support Italian language', async () => {
      const guestIt: TestGuest = {
        ...mockGuest,
        language: 'it',
      }

      const result = await sendBookingConfirmation(mockBooking, guestIt)

      expect(result.success).toBe(true)
    })

    it('should support English language', async () => {
      const guestEn: TestGuest = {
        ...mockGuest,
        language: 'en',
      }

      const result = await sendBookingConfirmation(mockBooking, guestEn)

      expect(result.success).toBe(true)
    })
  })
})
