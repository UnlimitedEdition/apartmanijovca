/**
 * Manual Test: Bookings API Localization Fix
 * 
 * This test validates that the bookings API properly handles:
 * 1. Null apartment data
 * 2. String apartment names (not JSONB)
 * 3. JSONB multi-language apartment names
 * 4. Error handling for localization failures
 * 
 * Run this test manually to verify the fix for task 3.2
 */

import { NextRequest } from 'next/server'
import { GET } from '@/app/api/admin/bookings/route'

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.NEXT_SERVICE_ROLE_KEY = 'test-service-key'

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn()
}))

describe('Bookings API Localization Fix - Manual Test', () => {
  let mockSupabase: any
  const { createClient } = require('@supabase/supabase-js')

  beforeEach(() => {
    jest.clearAllMocks()
    
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis()
    }
    
    createClient.mockReturnValue(mockSupabase)
  })

  it('should handle null apartments gracefully', async () => {
    // Mock booking with null apartments
    mockSupabase.range.mockResolvedValue({
      data: [
        {
          id: 'booking-1',
          apartment_id: 'apt-1',
          apartments: null, // NULL apartment
          guests: { full_name: 'John Doe', email: 'john@example.com' },
          check_in: '2024-06-01',
          check_out: '2024-06-05',
          total_price: 200,
          status: 'confirmed',
          created_at: '2024-05-01'
        }
      ],
      error: null,
      count: 1
    })

    const url = new URL('http://localhost:3000/api/admin/bookings')
    const request = new NextRequest(url)

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.bookings).toHaveLength(1)
    expect(data.bookings[0].apartment_name).toBe('Unknown')
  })

  it('should handle string apartment names (not JSONB)', async () => {
    // Mock booking with string apartment name
    mockSupabase.range.mockResolvedValue({
      data: [
        {
          id: 'booking-2',
          apartment_id: 'apt-2',
          apartments: { name: 'Simple String Name' }, // String, not JSONB
          guests: { full_name: 'Jane Smith', email: 'jane@example.com' },
          check_in: '2024-06-10',
          check_out: '2024-06-15',
          total_price: 300,
          status: 'confirmed',
          created_at: '2024-05-10'
        }
      ],
      error: null,
      count: 1
    })

    const url = new URL('http://localhost:3000/api/admin/bookings')
    const request = new NextRequest(url)

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.bookings).toHaveLength(1)
    expect(data.bookings[0].apartment_name).toBe('Simple String Name')
  })

  it('should handle JSONB multi-language apartment names', async () => {
    // Mock booking with JSONB multi-language apartment name
    mockSupabase.range.mockResolvedValue({
      data: [
        {
          id: 'booking-3',
          apartment_id: 'apt-3',
          apartments: {
            name: {
              sr: 'Apartman Sunce',
              en: 'Sunny Apartment',
              de: 'Sonnige Wohnung',
              it: 'Appartamento Soleggiato'
            }
          },
          guests: { full_name: 'Bob Johnson', email: 'bob@example.com' },
          check_in: '2024-06-20',
          check_out: '2024-06-25',
          total_price: 400,
          status: 'confirmed',
          created_at: '2024-05-20'
        }
      ],
      error: null,
      count: 1
    })

    const url = new URL('http://localhost:3000/api/admin/bookings')
    const request = new NextRequest(url)

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.bookings).toHaveLength(1)
    expect(data.bookings[0].apartment_name).toBe('Apartman Sunce') // Serbian locale
  })

  it('should handle apartments with undefined name', async () => {
    // Mock booking with apartment but no name field
    mockSupabase.range.mockResolvedValue({
      data: [
        {
          id: 'booking-4',
          apartment_id: 'apt-4',
          apartments: {}, // No name field
          guests: { full_name: 'Alice Brown', email: 'alice@example.com' },
          check_in: '2024-07-01',
          check_out: '2024-07-05',
          total_price: 250,
          status: 'pending',
          created_at: '2024-06-01'
        }
      ],
      error: null,
      count: 1
    })

    const url = new URL('http://localhost:3000/api/admin/bookings')
    const request = new NextRequest(url)

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.bookings).toHaveLength(1)
    expect(data.bookings[0].apartment_name).toBe('Unknown')
  })

  it('should handle mixed booking data types', async () => {
    // Mock multiple bookings with different data types
    mockSupabase.range.mockResolvedValue({
      data: [
        {
          id: 'booking-5',
          apartment_id: 'apt-5',
          apartments: null,
          guests: { full_name: 'User 1', email: 'user1@example.com' },
          check_in: '2024-08-01',
          check_out: '2024-08-05',
          total_price: 200,
          status: 'confirmed',
          created_at: '2024-07-01'
        },
        {
          id: 'booking-6',
          apartment_id: 'apt-6',
          apartments: { name: 'String Name' },
          guests: { full_name: 'User 2', email: 'user2@example.com' },
          check_in: '2024-08-10',
          check_out: '2024-08-15',
          total_price: 300,
          status: 'confirmed',
          created_at: '2024-07-10'
        },
        {
          id: 'booking-7',
          apartment_id: 'apt-7',
          apartments: {
            name: {
              sr: 'Apartman More',
              en: 'Sea Apartment'
            }
          },
          guests: { full_name: 'User 3', email: 'user3@example.com' },
          check_in: '2024-08-20',
          check_out: '2024-08-25',
          total_price: 400,
          status: 'confirmed',
          created_at: '2024-07-20'
        }
      ],
      error: null,
      count: 3
    })

    const url = new URL('http://localhost:3000/api/admin/bookings')
    const request = new NextRequest(url)

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.bookings).toHaveLength(3)
    expect(data.bookings[0].apartment_name).toBe('Unknown')
    expect(data.bookings[1].apartment_name).toBe('String Name')
    expect(data.bookings[2].apartment_name).toBe('Apartman More')
  })

  it('should preserve pagination metadata', async () => {
    mockSupabase.range.mockResolvedValue({
      data: [
        {
          id: 'booking-8',
          apartment_id: 'apt-8',
          apartments: { name: 'Test Apartment' },
          guests: { full_name: 'Test User', email: 'test@example.com' },
          check_in: '2024-09-01',
          check_out: '2024-09-05',
          total_price: 200,
          status: 'confirmed',
          created_at: '2024-08-01'
        }
      ],
      error: null,
      count: 50 // Total count
    })

    const url = new URL('http://localhost:3000/api/admin/bookings?page=2&limit=10')
    const request = new NextRequest(url)

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.total).toBe(50)
    expect(data.page).toBe(2)
    expect(data.limit).toBe(10)
    expect(data.totalPages).toBe(5)
  })

  it('should preserve filtering functionality', async () => {
    mockSupabase.range.mockResolvedValue({
      data: [
        {
          id: 'booking-9',
          apartment_id: 'apt-9',
          apartments: { name: 'Filtered Apartment' },
          guests: { full_name: 'Filtered User', email: 'filtered@example.com' },
          check_in: '2024-10-01',
          check_out: '2024-10-05',
          total_price: 200,
          status: 'confirmed',
          created_at: '2024-09-01'
        }
      ],
      error: null,
      count: 1
    })

    const url = new URL('http://localhost:3000/api/admin/bookings?status=confirmed&apartment_id=apt-9')
    const request = new NextRequest(url)

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(mockSupabase.eq).toHaveBeenCalledWith('status', 'confirmed')
    expect(mockSupabase.eq).toHaveBeenCalledWith('apartment_id', 'apt-9')
  })
})

console.log('Manual test file created. Run with: npm test -- bookings-api-manual-test')
