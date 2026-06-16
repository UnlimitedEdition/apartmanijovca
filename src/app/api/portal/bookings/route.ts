import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireUser } from '@/lib/auth/require-user'

// Create Supabase client with service role for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey)
}

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Identity comes from the verified session, never from a query param (IDOR).
    const auth = await requireUser(request)
    if ('response' in auth) return auth.response
    const guestEmail = auth.user.email
    if (!guestEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getSupabase()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type') // 'upcoming', 'past', 'all', 'active'

    // Get guest by email
    const { data: guest, error: guestError } = await supabase
      .from('guests')
      .select('*')
      .eq('email', guestEmail)
      .single()

    if (guestError || !guest) {
      return NextResponse.json({ bookings: [] })
    }

    let query = supabase
      .from('bookings')
      .select(`
        *,
        apartments(
          id,
          name,
          type,
          description,
          max_guests,
          base_price_eur,
          amenities,
          images,
          address,
          map_link,
          check_in_instructions,
          contact_phone,
          contact_email
        )
      `)
      .eq('guest_id', guest.id)

    const now = new Date().toISOString()

    // Filter by type
    if (type === 'upcoming') {
      query = query.gte('check_in', now).neq('status', 'cancelled')
    } else if (type === 'past') {
      query = query.lt('check_out', now).or('status.eq.cancelled,status.eq.checked_out')
    } else if (type === 'active') {
      query = query
        .lte('check_in', now)
        .gte('check_out', now)
        .in('status', ['confirmed', 'checked_in'])
    }

    // Filter by status if provided
    if (status) {
      query = query.eq('status', status)
    }

    const { data: bookings, error: bookingsError } = await query
      .order('check_in', { ascending: type === 'past' })

    if (bookingsError) {
      console.error('Error fetching bookings:', bookingsError)
      return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
    }

    return NextResponse.json({ bookings: bookings || [] })
  } catch (error) {
    console.error('Error in portal bookings route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
