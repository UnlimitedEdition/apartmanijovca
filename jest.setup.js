// Jest setup file for Apartmani Jovca Next.js project
require('@testing-library/jest-dom')

// Mock environment variables
process.env.RESEND_API_KEY = 'test_resend_api_key'
process.env.EMAIL_FROM = 'noreply@apartmani-jovca.com'
process.env.SUPABASE_URL = 'https://test.supabase.co'
process.env.SUPABASE_ANON_KEY = 'test_anon_key'
process.env.WHATSAPP_TOKEN = 'test_whatsapp_token'
process.env.WHATSAPP_PHONE_NUMBER_ID = '123456789'

// Mock Resend client
jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: jest.fn().mockResolvedValue({
        data: {
          id: 'test_email_id',
        },
        error: null,
      }),
    },
  })),
}))

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: null, error: null }),
          then: jest.fn().mockResolvedValue({ data: [], error: null }),
        }),
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ 
              data: { id: 'test_id' }, 
              error: null 
            }),
          }),
        }),
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            then: jest.fn().mockResolvedValue({ error: null }),
          }),
        }),
        neq: jest.fn().mockReturnThis(),
        overlaps: jest.fn().mockReturnValue({
          then: jest.fn().mockResolvedValue({ data: [], error: null }),
        }),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnValue({
          range: jest.fn().mockResolvedValue({ data: [], error: null, count: 0 }),
        }),
      }),
      rpc: jest.fn().mockResolvedValue({ data: true, error: null }),
    }),
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
    },
  })),
}))

// Mock console methods to reduce noise in tests
const originalConsole = { ...console }
beforeAll(() => {
  console.log = jest.fn()
  console.warn = jest.fn()
  console.error = jest.fn()
})

afterAll(() => {
  Object.assign(console, originalConsole)
})

// Helper to create mock booking data
const createMockBooking = (overrides = {}) => ({
  id: 'test-booking-id',
  bookingNumber: 'BJ-2024-TEST',
  apartmentId: 'test-apartment-id',
  apartmentName: 'Test Apartment',
  guestId: 'test-guest-id',
  guestName: 'Test Guest',
  guestEmail: 'test@example.com',
  guestPhone: '+381651234567',
  checkIn: '2024-06-01',
  checkOut: '2024-06-07',
  nights: 6,
  totalPrice: 600,
  status: 'pending',
  options: {
    crib: false,
    parking: false,
    earlyCheckIn: false,
    lateCheckOut: false,
  },
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides,
})

// Helper to create mock guest data
const createMockGuest = (overrides = {}) => ({
  id: 'test-guest-id',
  name: 'Test Guest',
  email: 'test@example.com',
  phone: '+381651234567',
  language: 'en',
  ...overrides,
})

// Helper to create mock apartment data
const createMockApartment = (overrides = {}) => ({
  id: 'test-apartment-id',
  name: 'Test Apartment',
  nameSr: 'Test Apartman',
  nameDe: 'Test Wohnung',
  nameIt: 'Test Appartamento',
  pricePerNight: 100,
  maxGuests: 4,
  description: 'A beautiful test apartment',
  ...overrides,
})

// Helper to wait for a promise
const waitFor = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// Make helpers available globally
global.createMockBooking = createMockBooking
global.createMockGuest = createMockGuest
global.createMockApartment = createMockApartment
global.waitFor = waitFor
