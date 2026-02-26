/**
 * Integration Test: Bookings API Column Names
 * 
 * This test validates that the bookings API uses correct database column names:
 * - check_in, check_out (NOT checkin/checkout)
 * - guests.full_name (NOT guests.name)
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

describe('Bookings API Column Names', () => {
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
      range: jest.fn().mockResolvedValue({
        data: [],
        error: null,
        count: 0
      })
    }
    
    createClient.mockReturnValue(mockSupabase)
  })

  it('should use correct column name "full_name" in SELECT query', async () => {
    const url = new URL('http://localhost:3000/api/admin/bookings')
    const request = new NextRequest(url)

    await GET(request)

    // Verify SELECT uses full_name, not name
    expect(mockSupabase.select).toHaveBeenCalledWith(
      expect.stringContaining('full_name'),
      expect.any(Object)
    )
    expect(mockSupabase.select).not.toHaveBeenCalledWith(
      expect.stringContaining('guests:guest_id(name,'),
      expect.any(Object)
    )
  })

  it('should use correct column name "check_in" for date filtering', async () => {
    const url = new URL('http://localhost:3000/api/admin/bookings?start_date=2024-01-01')
    const request = new NextRequest(url)

    await GET(request)

    // Verify filter uses check_in, not checkin
    expect(mockSupabase.gte).toHaveBeenCalledWith('check_in', '2024-01-01')
  })

  it('should use correct column name "check_out" for date filtering', async () => {
    const url = new URL('http://localhost:3000/api/admin/bookings?end_date=2024-12-31')
    const request = new NextRequest(url)

    await GET(request)

    // Verify filter uses check_out, not checkout
    expect(mockSupabase.lte).toHaveBeenCalledWith('check_out', '2024-12-31')
  })

  it('should correctly map database columns to response fields', async () => {
    // Mock booking with correct database column names
    mockSupabase.range.mockResolvedValue({
      data: [
        {
          id: 'booking-1',
          apartment_id: 'apt-1',
          apartments: { name: 'Test Apartment' },
          guests: { full_name: 'John Doe', email: 'john@example.com', phone: '123456' },
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
    
    // Verify correct mapping
    expect(data.bookings[0].guest_name).toBe('John Doe')
    expect(data.bookings[0].checkin).toBe('2024-06-01')
    expect(data.bookings[0].checkout).toBe('2024-06-05')
  })

  it('should return 200 with empty array when no bookings exist', async () => {
    mockSupabase.range.mockResolvedValue({
      data: [],
      error: null,
      count: 0
    })

    const url = new URL('http://localhost:3000/api/admin/bookings')
    const request = new NextRequest(url)

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.bookings).toEqual([])
    expect(data.total).toBe(0)
  })
})
