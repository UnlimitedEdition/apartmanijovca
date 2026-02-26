import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'
import { 
  UpdateBookingSchema
} from '../../../../lib/validations/booking'
import { 
  getBookingById, 
  updateBooking, 
  cancelBooking,
  deleteBooking 
} from '../../../../lib/bookings/service'

interface RouteParams {
  params: {
    id: string
  }
}

/**
 * GET /api/booking/[id]
 * Get a single booking by ID with related data
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: 'Invalid booking ID format' },
        { status: 400 }
      )
    }

    // Check if database is available
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 503 }
      )
    }

    // Get booking
    const result = await getBookingById(id)

    if (result.error || !result.booking) {
      return NextResponse.json(
        { error: result.error || 'Booking not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ booking: result.booking })

  } catch (error) {
    console.error('Get booking error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/booking/[id]
 * Update a booking (dates, status, guest info)
 * Body: {
 *   checkIn?: string (ISO date)
 *   checkOut?: string (ISO date)
 *   status?: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'no_show'
 *   guest?: { name?, email?, phone? }
 *   options?: { crib?, parking?, earlyCheckIn?, lateCheckOut?, notes? }
 * }
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: 'Invalid booking ID format' },
        { status: 400 }
      )
    }

    // Parse request body
    const body = await request.json()

    // Validate input
    const parseResult = UpdateBookingSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid update data', 
          details: parseResult.error.flatten().fieldErrors 
        },
        { status: 400 }
      )
    }

    const input = parseResult.data

    // Check if at least one field is provided
    if (!input.checkIn && !input.checkOut && !input.status && !input.guest && !input.options) {
      return NextResponse.json(
        { error: 'At least one field must be provided for update' },
        { status: 400 }
      )
    }

    // Check if database is available
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 503 }
      )
    }

    // Update booking
    const result = await updateBooking(id, input)

    if (result.error || !result.booking) {
      return NextResponse.json(
        { error: result.error || 'Failed to update booking' },
        { status: 400 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      booking: result.booking 
    })

  } catch (error) {
    console.error('Update booking error:', error)
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/booking/[id]
 * Cancel or delete a booking
 * Query params:
 * - hard: If 'true', permanently delete the booking (use with caution)
 * - reason: Cancellation reason (optional)
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: 'Invalid booking ID format' },
        { status: 400 }
      )
    }

    // Check if database is available
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 503 }
      )
    }

    // Check for hard delete flag
    const hardDelete = request.nextUrl.searchParams.get('hard') === 'true'
    const reason = request.nextUrl.searchParams.get('reason') || undefined

    let result

    if (hardDelete) {
      // Permanently delete the booking
      result = await deleteBooking(id)
    } else {
      // Soft delete (cancel) the booking
      result = await cancelBooking(id, reason)
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to delete booking' },
        { status: 400 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: hardDelete ? 'Booking permanently deleted' : 'Booking cancelled'
    })

  } catch (error) {
    console.error('Delete booking error:', error)
    return NextResponse.json(
      { error: 'Failed to delete booking' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/booking/[id]
 * Partial update of a booking (alias for PUT)
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  return PUT(request, { params })
}
