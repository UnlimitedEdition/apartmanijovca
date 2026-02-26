import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'
import { 
  AvailabilityCheckSchema,
  type AvailabilityCheckResponse 
} from '../../../../lib/validations/booking'
import { 
  checkAvailability,
  getAvailableApartments 
} from '../../../../lib/bookings/service'

/**
 * GET /api/booking/check
 * Quick availability check endpoint
 * Query params:
 * - checkIn: Check-in date (ISO format)
 * - checkOut: Check-out date (ISO format)
 * - apartmentId: Optional - check specific apartment
 * 
 * Returns available apartments for the date range
 */
export async function GET(request: NextRequest) {
  try {
    // Parse and validate query parameters
    const searchParams = Object.fromEntries(request.nextUrl.searchParams)
    const parseResult = AvailabilityCheckSchema.safeParse(searchParams)

    if (!parseResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid query parameters', 
          details: parseResult.error.flatten().fieldErrors 
        },
        { status: 400 }
      )
    }

    const { checkIn, checkOut, apartmentId } = parseResult.data

    // Check if database is available
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 503 }
      )
    }

    // If specific apartment is requested
    if (apartmentId) {
      const result = await checkAvailability(apartmentId, checkIn, checkOut)

      const response: AvailabilityCheckResponse = {
        available: result.available,
        message: result.reason || (result.available 
          ? 'Apartment is available for selected dates' 
          : 'Apartment is not available for selected dates')
      }

      return NextResponse.json(response)
    }

    // Get all available apartments for the date range
    const result = await getAvailableApartments(checkIn, checkOut)

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    const response: AvailabilityCheckResponse = {
      available: (result.apartments?.length || 0) > 0,
      apartments: result.apartments,
      message: result.apartments?.length 
        ? `${result.apartments.length} apartment(s) available`
        : 'No apartments available for selected dates'
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Availability check error:', error)
    return NextResponse.json(
      { error: 'Failed to check availability' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/booking/check
 * Alternative POST endpoint for availability check
 * Useful for complex queries or when query string length is a concern
 * 
 * Body: {
 *   checkIn: string (ISO date)
 *   checkOut: string (ISO date)
 *   apartmentId?: string (UUID)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()

    // Validate input
    const parseResult = AvailabilityCheckSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request data', 
          details: parseResult.error.flatten().fieldErrors 
        },
        { status: 400 }
      )
    }

    const { checkIn, checkOut, apartmentId } = parseResult.data

    // Check if database is available
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 503 }
      )
    }

    // If specific apartment is requested
    if (apartmentId) {
      const result = await checkAvailability(apartmentId, checkIn, checkOut)

      const response: AvailabilityCheckResponse = {
        available: result.available,
        message: result.reason || (result.available 
          ? 'Apartment is available for selected dates' 
          : 'Apartment is not available for selected dates')
      }

      return NextResponse.json(response)
    }

    // Get all available apartments for the date range
    const result = await getAvailableApartments(checkIn, checkOut)

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    const response: AvailabilityCheckResponse = {
      available: (result.apartments?.length || 0) > 0,
      apartments: result.apartments,
      message: result.apartments?.length 
        ? `${result.apartments.length} apartment(s) available`
        : 'No apartments available for selected dates'
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Availability check error:', error)
    return NextResponse.json(
      { error: 'Failed to check availability' },
      { status: 500 }
    )
  }
}
