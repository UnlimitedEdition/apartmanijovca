import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/auth/require-admin'
import { getLocalizedValue } from '@/lib/localization/helpers'

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(
    supabaseUrl,
    process.env.NEXT_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey
  )
}

// GET - List bookings with filters
export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request)
  if (authError) return authError
  try {
    const { searchParams } = new URL(request.url)

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const apartmentId = searchParams.get('apartment_id')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const occupiedOn = searchParams.get('occupied_on')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sort_by') || 'created_at'
    const sortOrder = searchParams.get('sort_order') || 'desc'

    const supabaseAdmin = getSupabaseAdmin()

    // Build query
    let query = supabaseAdmin
      .from('bookings')
      .select(`
        *,
        apartments:apartment_id(name),
        guests:guest_id(full_name, email, phone)
      `, { count: 'exact' })

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }
    if (apartmentId) {
      query = query.eq('apartment_id', apartmentId)
    }
    if (startDate) {
      query = query.gte('check_in', startDate)
    }
    if (endDate) {
      query = query.lte('check_out', endDate)
    }
    
    // Filter by occupied on specific date (check_in <= date < check_out)
    if (occupiedOn) {
      query = query.lte('check_in', occupiedOn).gt('check_out', occupiedOn)
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) throw error

    // Transform data - extract localized apartment name
    const bookings = data?.map(booking => {
      let apartmentName = 'Unknown'
      
      try {
        // Check if apartments exists and has a name
        if (booking.apartments && booking.apartments.name) {
          const name = booking.apartments.name
          
          // Check if name is already a string (not a JSONB object)
          if (typeof name === 'string') {
            apartmentName = name
          } 
          // Check if name is an object (JSONB multi-language)
          else if (typeof name === 'object' && name !== null) {
            apartmentName = getLocalizedValue(name, 'sr')
          }
        }
      } catch (error) {
        console.error('Error localizing apartment name:', error)
        // Fall back to 'Unknown' if localization fails
      }
      
      return {
        id: booking.id,
        apartment_id: booking.apartment_id,
        apartment_name: apartmentName,
        guest_id: booking.guest_id,
        guest_name: booking.guests?.full_name || 'Unknown',
        guest_email: booking.guests?.email || 'Unknown',
        guest_phone: booking.guests?.phone,
        checkin: booking.check_in,
        checkout: booking.check_out,
        total_price: booking.total_price,
        status: booking.status,
        created_at: booking.created_at
      }
    }) || []

    // Filter by search if provided (search across guest name, email, phone, and apartment name)
    let filteredBookings = bookings
    if (search) {
      const searchLower = search.toLowerCase()
      filteredBookings = bookings.filter(
        b => 
          b.guest_name?.toLowerCase().includes(searchLower) ||
          b.guest_email?.toLowerCase().includes(searchLower) ||
          b.guest_phone?.toLowerCase().includes(searchLower) ||
          b.apartment_name?.toLowerCase().includes(searchLower)
      )
    }

    return NextResponse.json({
      bookings: filteredBookings,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    })
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}

// POST - Create booking (not used in admin, but for completeness)
export async function POST() {
  return NextResponse.json(
    { error: 'Use frontend booking flow to create bookings' },
    { status: 400 }
  )
}
