import { z } from 'zod'

// Booking status enum
export const BookingStatus = z.enum([
  'pending',
  'confirmed',
  'checked_in',
  'checked_out',
  'cancelled',
  'no_show'
])

// Enhanced name validation - accepts both single name and full name
const nameRegex = /^[A-Za-zÀ-ÿ\u0400-\u04FF\s'-]{2,}$/
const phoneRegex = /^[\d\s\-\+\(\)]{8,20}$/
const sanitizeString = (str: string) => str.trim().replace(/\s+/g, ' ')

// Guest info schema with flexible validation
export const GuestInfoSchema = z.object({
  name: z.string()
    .min(2, 'Ime mora imati minimum 2 karaktera')
    .max(100, 'Ime ne sme biti duže od 100 karaktera')
    .transform(sanitizeString)
    .refine(val => nameRegex.test(val), {
      message: 'Molimo unesite validno ime'
    })
    .refine(val => !val.match(/(.)\1{3,}/), {
      message: 'Ime sadrži previše ponavljajućih karaktera'
    }),
  email: z.string()
    .email('Neispravna email adresa')
    .max(255, 'Email ne sme biti duži od 255 karaktera')
    .toLowerCase()
    .transform(sanitizeString)
    .refine(val => !val.includes('..'), {
      message: 'Email adresa ne sme sadržati uzastopne tačke'
    })
    .refine(val => {
      // Block common disposable email domains
      const disposableDomains = ['tempmail', 'throwaway', '10minutemail', 'guerrillamail', 'mailinator']
      return !disposableDomains.some(domain => val.includes(domain))
    }, {
      message: 'Molimo koristite validnu email adresu'
    }),
  phone: z.string()
    .min(8, 'Broj telefona mora imati minimum 8 cifara')
    .max(20, 'Broj telefona ne sme biti duži od 20 karaktera')
    .transform(sanitizeString)
    .refine(val => phoneRegex.test(val), {
      message: 'Molimo unesite ispravan broj telefona (npr. +381 69 123 4567)'
    })
    .refine(val => {
      const digitsOnly = val.replace(/\D/g, '')
      return digitsOnly.length >= 8 && digitsOnly.length <= 15
    }, {
      message: 'Broj telefona mora sadržati između 8 i 15 cifara'
    })
})

// Booking options schema with sanitization
export const BookingOptionsSchema = z.object({
  crib: z.boolean().optional().default(false),
  parking: z.boolean().optional().default(false),
  earlyCheckIn: z.boolean().optional().default(false),
  lateCheckOut: z.boolean().optional().default(false),
  notes: z.string()
    .max(500, 'Napomena ne sme biti duža od 500 karaktera')
    .optional()
    .transform(val => val ? sanitizeString(val) : undefined)
    .refine(val => !val || !val.match(/(.)\1{10,}/), {
      message: 'Napomena sadrži previše ponavljajućih karaktera'
    })
})

// Security metadata schema
export const SecurityMetadataSchema = z.object({
  fingerprint: z.string().optional(),
  userAgent: z.string().max(500).optional(),
  ipAddress: z.string().ip().optional(),
  consentGiven: z.boolean(),
  consentTimestamp: z.string().datetime().optional(),
  deviceInfo: z.object({
    platform: z.string().optional(),
    language: z.string().optional(),
    screenResolution: z.string().optional(),
    timezone: z.string().optional()
  }).optional()
})

// Date range validation helper
const isValidDateRange = (checkIn: string, checkOut: string): boolean => {
  const checkInDate = new Date(checkIn)
  const checkOutDate = new Date(checkOut)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // Check-in must be today or in the future
  if (checkInDate < today) return false
  
  // Check-out must be after check-in
  if (checkOutDate <= checkInDate) return false
  
  // Maximum booking length (e.g., 30 days)
  const maxDays = 30
  const diffTime = checkOutDate.getTime() - checkInDate.getTime()
  const diffDays = diffTime / (1000 * 60 * 60 * 24)
  if (diffDays > maxDays) return false
  
  return true
}

// Create booking schema with security metadata
export const CreateBookingSchema = z.object({
  apartmentId: z.string().uuid('Neispravan ID apartmana'),
  checkIn: z.string()
    .refine((val) => !isNaN(Date.parse(val)), 'Neispravan datum dolaska'),
  checkOut: z.string()
    .refine((val) => !isNaN(Date.parse(val)), 'Neispravan datum odlaska'),
  guest: GuestInfoSchema,
  options: BookingOptionsSchema.optional().default({
    crib: false,
    parking: false,
    earlyCheckIn: false,
    lateCheckOut: false
  }),
  security: SecurityMetadataSchema,
  preferredLanguage: z.enum(['sr', 'en', 'de', 'it']).optional()
}).refine(
  (data) => isValidDateRange(data.checkIn, data.checkOut),
  {
    message: 'Neispravan period: dolazak mora biti danas ili kasnije, odlazak posle dolaska, maksimalno 30 dana',
    path: ['checkIn']
  }
)

// Update booking schema
export const UpdateBookingSchema = z.object({
  checkIn: z.string()
    .refine((val) => !isNaN(Date.parse(val)), 'Invalid check-in date')
    .optional(),
  checkOut: z.string()
    .refine((val) => !isNaN(Date.parse(val)), 'Invalid check-out date')
    .optional(),
  status: BookingStatus.optional(),
  guest: GuestInfoSchema.partial().optional(),
  options: BookingOptionsSchema.partial().optional()
}).refine(
  (data) => {
    if (data.checkIn && data.checkOut) {
      return isValidDateRange(data.checkIn, data.checkOut)
    }
    return true
  },
  {
    message: 'Invalid date range: check-in must be today or later, and check-out must be after check-in',
    path: ['checkIn']
  }
)

// Booking filter schema for GET requests
export const BookingFilterSchema = z.object({
  startDate: z.string()
    .refine((val) => !isNaN(Date.parse(val)), 'Invalid start date')
    .optional(),
  endDate: z.string()
    .refine((val) => !isNaN(Date.parse(val)), 'Invalid end date')
    .optional(),
  apartmentId: z.string().uuid('Invalid apartment ID').optional(),
  status: BookingStatus.optional(),
  guestId: z.string().uuid('Invalid guest ID').optional(),
  guestEmail: z.string().email('Invalid email').optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20)
})

// Availability check schema
export const AvailabilityCheckSchema = z.object({
  checkIn: z.string()
    .refine((val) => !isNaN(Date.parse(val)), 'Invalid check-in date'),
  checkOut: z.string()
    .refine((val) => !isNaN(Date.parse(val)), 'Invalid check-out date'),
  apartmentId: z.string().uuid('Invalid apartment ID').optional()
}).refine(
  (data) => {
    const checkInDate = new Date(data.checkIn)
    const checkOutDate = new Date(data.checkOut)
    return checkOutDate > checkInDate
  },
  {
    message: 'Check-out date must be after check-in date',
    path: ['checkOut']
  }
)

// Type exports
export type GuestInfo = z.infer<typeof GuestInfoSchema>
export type BookingOptions = z.infer<typeof BookingOptionsSchema>
export type CreateBookingInput = z.infer<typeof CreateBookingSchema>
export type UpdateBookingInput = z.infer<typeof UpdateBookingSchema>
export type BookingFilter = z.infer<typeof BookingFilterSchema>
export type AvailabilityCheckInput = z.infer<typeof AvailabilityCheckSchema>

// Booking response types
export interface BookingResponse {
  id: string
  bookingNumber: string
  apartmentId: string
  apartmentName: string
  guestId: string
  guestName: string
  guestEmail: string
  guestPhone?: string
  checkIn: string
  checkOut: string
  nights: number
  totalPrice: number
  status: string
  options?: BookingOptions
  createdAt: string
  updatedAt: string
}

export interface BookingListResponse {
  bookings: BookingResponse[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface AvailabilityCheckResponse {
  available: boolean
  apartments?: Array<{
    id: string
    name: string
    type: string
    capacity: number
    pricePerNight: number
  }>
  message?: string
}
