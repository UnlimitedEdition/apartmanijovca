import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/auth/require-admin'
import { getBookedDatesForRange } from '@/lib/admin/availability-calendar'


export const dynamic = 'force-dynamic'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false
  }
})

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

// GET /api/admin/availability - Get availability records with filters
export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request)
  if (authError) return authError
  try {
    const searchParams = request.nextUrl.searchParams
    const apartmentId = searchParams.get('apartmentId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const isAvailable = searchParams.get('isAvailable')
    const includeBookings = searchParams.get('includeBookings') === 'true'
    // Clamp paging to sane bounds (prevents huge result-set queries).
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '100') || 100, 1), 500)
    const offset = Math.max(parseInt(searchParams.get('offset') || '0') || 0, 0)

    if (apartmentId && !UUID_RE.test(apartmentId)) {
      return NextResponse.json({ error: 'Invalid apartmentId' }, { status: 400 })
    }

    let query = supabase
      .from('availability')
      .select(
        'id, apartment_id, date, is_available, price_override, reason, booking_id, created_at, updated_at, apartments ( id, name )',
        { count: 'exact' }
      )
      .order('date', { ascending: false })
      .range(offset, offset + limit - 1)

    if (apartmentId) {
      query = query.eq('apartment_id', apartmentId)
    }

    if (startDate) {
      query = query.gte('date', startDate)
    }

    if (endDate) {
      query = query.lte('date', endDate)
    }

    if (isAvailable !== null && isAvailable !== undefined) {
      query = query.eq('is_available', isAvailable === 'true')
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching availability:', error)
      return NextResponse.json(
        { error: 'Failed to fetch availability data' },
        { status: 500 }
      )
    }

    let responseData = data || []

    if (includeBookings && apartmentId && startDate && endDate) {
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('id, apartment_id, check_in, check_out, status')
        .eq('apartment_id', apartmentId)
        .lte('check_in', endDate)
        .gte('check_out', startDate)
        .neq('status', 'cancelled')

      if (bookingsError) throw bookingsError

      const byDate = new Map(responseData.map(record => [record.date, record]))

      ;(bookings || []).forEach(booking => {
        getBookedDatesForRange(booking, startDate, endDate).forEach(date => {
          byDate.set(date, {
            id: 'booking-' + booking.id + '-' + date,
            apartment_id: apartmentId,
            date,
            is_available: false,
            price_override: null,
            reason: 'booking',
            booking_id: booking.id,
            created_at: null,
            updated_at: null,
            apartments: []
          })
        })
      })

      responseData = Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date))
    }

    return NextResponse.json({
      success: true,
      data: responseData,
      count: includeBookings ? responseData.length : count,
      limit,
      offset
    })
  } catch (error) {
    console.error('Availability API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/admin/availability - Create or update availability record
export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request)
  if (authError) return authError
  try {
    const body = await request.json()
    const { apartmentId, date, isAvailable, priceOverride, reason, bookingId } = body

    if (!apartmentId || !date) {
      return NextResponse.json(
        { error: 'apartmentId and date are required' },
        { status: 400 }
      )
    }

    if (!UUID_RE.test(apartmentId) || !DATE_RE.test(date)) {
      return NextResponse.json(
        { error: 'Invalid apartmentId or date format' },
        { status: 400 }
      )
    }

    if (bookingId && !UUID_RE.test(bookingId)) {
      return NextResponse.json({ error: 'Invalid bookingId' }, { status: 400 })
    }

    // Check if record exists
    const { data: existing } = await supabase
      .from('availability')
      .select('id')
      .eq('apartment_id', apartmentId)
      .eq('date', date)
      .single()

    let result

    if (existing) {
      // Update existing record
      const { data, error } = await supabase
        .from('availability')
        .update({
          is_available: isAvailable,
          price_override: priceOverride,
          reason,
          booking_id: bookingId,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) throw error
      result = data
    } else {
      // Insert new record
      const { data, error } = await supabase
        .from('availability')
        .insert({
          apartment_id: apartmentId,
          date,
          is_available: isAvailable ?? true,
          price_override: priceOverride,
          reason,
          booking_id: bookingId
        })
        .select()
        .single()

      if (error) throw error
      result = data
    }

    return NextResponse.json({
      success: true,
      data: result
    }, { status: existing ? 200 : 201 })
  } catch (error) {
    console.error('Error saving availability:', error)
    return NextResponse.json(
      { error: 'Failed to save availability data' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/availability - Delete availability record
export async function DELETE(request: NextRequest) {
  const authError = await requireAdmin(request)
  if (authError) return authError
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id || !UUID_RE.test(id)) {
      return NextResponse.json(
        { error: 'Valid id is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('availability')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting availability:', error)
    return NextResponse.json(
      { error: 'Failed to delete availability data' },
      { status: 500 }
    )
  }
}
