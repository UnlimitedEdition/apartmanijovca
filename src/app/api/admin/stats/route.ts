import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Admin client with service role for full access
const supabaseAdmin = createClient(supabaseUrl, process.env.NEXT_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey)

interface Booking {
  id: string
  status: string
  check_in: string
  check_out: string
  total_price: number
  created_at: string
}

export async function GET() {
  try {
    // In production, you would verify admin auth here
    // For now, we'll allow access but you should add proper auth check

    // Get all bookings
    const { data: bookings, error: bookingsError } = await supabaseAdmin
      .from('bookings')
      .select('*')
    
    if (bookingsError) throw bookingsError
    
    console.log('[STATS] Total bookings:', bookings?.length)

    // Calculate total bookings
    const totalBookings = bookings?.length || 0

    // Calculate bookings by status
    const pendingBookings = bookings?.filter((b: Booking) => b.status === 'pending').length || 0
    const confirmedBookings = bookings?.filter((b: Booking) => b.status === 'confirmed').length || 0
    
    // Check-ins today: Use local date (Serbia timezone)
    const today = new Date()
    const localDateStr = today.getFullYear() + '-' + 
                        String(today.getMonth() + 1).padStart(2, '0') + '-' + 
                        String(today.getDate()).padStart(2, '0')
    
    console.log('[STATS] Local date string:', localDateStr)
    
    const { count: checkedInTodayCount } = await supabaseAdmin
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('check_in', localDateStr)
      .neq('status', 'cancelled')
    
    const checkedInToday = checkedInTodayCount || 0
    console.log('[STATS] Checked in today (from DB):', checkedInToday)
    
    // Check-outs today: Use local date (Serbia timezone)
    const { count: checkedOutTodayCount } = await supabaseAdmin
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('check_out', localDateStr)
      .neq('status', 'cancelled')
    
    const checkedOutToday = checkedOutTodayCount || 0
    console.log('[STATS] Checked out today (from DB):', checkedOutToday)

    // Calculate total revenue (only checked_in and checked_out = paid bookings)
    const totalRevenue = bookings
      ?.filter((b: Booking) => 
        (b.status === 'checked_in' || b.status === 'checked_out') && 
        b.total_price
      )
      .reduce((sum: number, b: Booking) => sum + Number(b.total_price), 0) || 0

    // Calculate monthly revenue (bookings created this month that are paid)
    const firstDayOfMonth = new Date()
    firstDayOfMonth.setDate(1)
    firstDayOfMonth.setHours(0, 0, 0, 0)
    const firstDayOfMonthStr = firstDayOfMonth.toISOString().split('T')[0]
    
    const monthlyRevenue = bookings
      ?.filter((b: Booking) => {
        const bookingDate = new Date(b.created_at).toISOString().split('T')[0]
        return bookingDate >= firstDayOfMonthStr && 
               (b.status === 'checked_in' || b.status === 'checked_out') && 
               b.total_price
      })
      .reduce((sum: number, b: Booking) => sum + Number(b.total_price), 0) || 0

    // Get total apartments
    const { count: totalApartments } = await supabaseAdmin
      .from('apartments')
      .select('*', { count: 'exact', head: true })

    // Calculate occupancy rate (bookings with check_in <= today < check_out / total apartments)
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const activeBookings = bookings?.filter((b: Booking) => {
      const checkIn = new Date(b.check_in)
      const checkOut = new Date(b.check_out)
      return checkIn <= now && checkOut > now && b.status !== 'cancelled'
    }).length || 0

    const occupancyRate = totalApartments 
      ? Math.round((activeBookings / totalApartments) * 100) 
      : 0

    return NextResponse.json({
      totalBookings,
      pendingBookings,
      confirmedBookings,
      checkedInToday,
      checkedOutToday,
      totalRevenue,
      monthlyRevenue,
      occupancyRate,
      totalApartments: totalApartments || 0
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
