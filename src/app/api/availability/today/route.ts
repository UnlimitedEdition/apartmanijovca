import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { OCCUPYING_BOOKING_STATUSES } from '@/lib/validations/booking'

// Lightweight "occupied right now" check for the apartments list badge.
// Night model: an apartment is occupied TODAY only if an OCCUPYING booking
// (pending/confirmed/checked_in) has check_in <= today AND check_out > today
// (the checkout day itself is free). Cancelled/no_show/checked_out do NOT occupy.
// Returns just apartment_ids (no PII). Always dynamic (never cached).

export const dynamic = 'force-dynamic'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, key, { auth: { persistSession: false } })
}

export async function GET() {
  try {
    const now = new Date()
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

    const supabase = getSupabase()
    const [bookingsRes, blocksRes] = await Promise.all([
      supabase
        .from('bookings')
        .select('apartment_id')
        .in('status', OCCUPYING_BOOKING_STATUSES as unknown as string[])
        .lte('check_in', today)
        .gt('check_out', today),
      // Manual admin blocks (e.g. Booking.com dates) live only in `availability`
      // with booking_id IS NULL — the badge must count them as occupied too.
      supabase
        .from('availability')
        .select('apartment_id')
        .eq('is_available', false)
        .is('booking_id', null)
        .eq('date', today),
    ])

    if (bookingsRes.error) {
      console.error('[availability/today] bookings query error:', bookingsRes.error.message)
      return NextResponse.json({ occupied: [] })
    }
    if (blocksRes.error) {
      // Non-fatal: still return booking-based occupancy if the blocks query fails.
      console.error('[availability/today] blocks query error:', blocksRes.error.message)
    }

    const occupied = [...new Set([
      ...(bookingsRes.data || []).map((b) => b.apartment_id),
      ...(blocksRes.data || []).map((b) => b.apartment_id),
    ].filter(Boolean))]
    return NextResponse.json({ occupied })
  } catch (error) {
    console.error('[availability/today] error:', error)
    return NextResponse.json({ occupied: [] })
  }
}
