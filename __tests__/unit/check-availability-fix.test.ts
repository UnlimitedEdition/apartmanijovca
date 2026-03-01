/**
 * Test for checkAvailability boolean handling fix
 * 
 * This test verifies that the checkAvailability function correctly handles
 * boolean return values from the database RPC function.
 */

import { checkAvailability } from '../../src/lib/bookings/service'

// Mock supabase
jest.mock('../../src/lib/supabase', () => ({
  supabase: {
    rpc: jest.fn(),
    from: jest.fn()
  }
}))

import { supabase } from '../../src/lib/supabase'

describe('checkAvailability - Boolean Handling Fix', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return available: true when RPC returns true', async () => {
    // Mock RPC to return true (apartment is available)
    if (!supabase) throw new Error('Supabase not initialized')
    ;(supabase.rpc as jest.Mock).mockResolvedValue({
      data: true,
      error: null
    })

    const result = await checkAvailability(
      'apt-123',
      '2024-06-01',
      '2024-06-05'
    )

    expect(result.available).toBe(true)
    expect(result.reason).toBeUndefined()
  })

  it('should return available: false when RPC returns false', async () => {
    // Mock RPC to return false (apartment is NOT available)
    if (!supabase) throw new Error('Supabase not initialized')
    ;(supabase.rpc as jest.Mock).mockResolvedValue({
      data: false,
      error: null
    })

    const result = await checkAvailability(
      'apt-123',
      '2024-06-01',
      '2024-06-05'
    )

    expect(result.available).toBe(false)
    expect(result.reason).toBe('Apartment is not available for selected dates')
  })

  it('should handle RPC errors correctly', async () => {
    // Mock RPC to return an error
    if (!supabase) throw new Error('Supabase not initialized')
    ;(supabase.rpc as jest.Mock).mockResolvedValue({
      data: null,
      error: { message: 'Database error' }
    })

    const result = await checkAvailability(
      'apt-123',
      '2024-06-01',
      '2024-06-05'
    )

    expect(result.available).toBe(false)
    expect(result.reason).toBe('Failed to check availability')
  })
})
