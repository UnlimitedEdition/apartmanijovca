import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Lightweight "occupied right now" check for the apartments list badge.
// Night model: an apartment is occupied TODAY only if a non-cancelled booking
// has check_in <= today AND check_out > today (the checkout day itself is free).
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
    const { data, error } = await supabase
      .from('bookings')
      .select('apartment_id')
      .neq('status', 'cancelled')
      .lte('check_in', today)
      .gt('check_out', today)

    if (error) {
      console.error('[availability/today] query error:', error.message)
      return NextResponse.json({ occupied: [] })
    }

    const occupied = [...new Set((data || []).map((b) => b.apartment_id).filter(Boolean))]
    return NextResponse.json({ occupied })
  } catch (error) {
    console.error('[availability/today] error:', error)
    return NextResponse.json({ occupied: [] })
  }
}
