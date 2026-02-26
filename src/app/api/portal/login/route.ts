import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'

export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    }
    const { email, bookingNumber } = await request.json()

    // Verify booking exists with this email and number
    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*, guests!inner(email)')
      .eq('guests.email', email)
      .eq('id', bookingNumber.split('-')[2]) // Extract ID from BJ-2024-XXXX
      .single()

    if (error || !booking) {
      return NextResponse.json({ error: 'Invalid booking details' }, { status: 400 })
    }

    // Send magic link
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        data: {
          booking_id: booking.id,
          booking_number: bookingNumber
        }
      }
    })

    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.json({ error: 'Failed to send magic link' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Magic link sent to your email' })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
