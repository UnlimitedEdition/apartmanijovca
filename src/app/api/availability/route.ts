import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { extractLocale } from '@/lib/localization/extract'
import { transformApartmentRecord } from '@/lib/transformers/database'
import type { ApartmentRecord } from '@/lib/types/database'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false
  }
})

// Types for API responses
interface ApartmentAvailability {
  id: string
  name: string
  capacity: number
  base_price_eur: number
  bed_type: string
  available: boolean
  unavailableDates: string[]
}

interface AvailabilityResponse {
  success: boolean
  data?: {
    apartments: ApartmentAvailability[]
    checkIn: string
    checkOut: string
    nights: number
  }
  error?: string
}

// Helper to format date for DB
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0]
}

// GET /api/availability - Check availability for date range
export async function GET(request: NextRequest): Promise<NextResponse<AvailabilityResponse>> {
  try {
    // Extract locale from request
    const locale = extractLocale(request)
    
    const searchParams = request.nextUrl.searchParams
    const checkInParam = searchParams.get('checkIn')
    const checkOutParam = searchParams.get('checkOut')
    const apartmentId = searchParams.get('apartmentId')

    // Validate required parameters
    if (!checkInParam || !checkOutParam) {
      return NextResponse.json({
        success: false,
        error: 'checkIn and checkOut parameters are required'
      }, { status: 400 })
    }

    const checkIn = new Date(checkInParam)
    const checkOut = new Date(checkOutParam)

    // Validate dates
    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      return NextResponse.json({
        success: false,
        error: 'Invalid date format. Use YYYY-MM-DD format.'
      }, { status: 400 })
    }

    if (checkIn >= checkOut) {
      return NextResponse.json({
        success: false,
        error: 'Check-out date must be after check-in date.'
      }, { status: 400 })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (checkIn < today) {
      return NextResponse.json({
        success: false,
        error: 'Check-in date cannot be in the past.'
      }, { status: 400 })
    }

    // Calculate nights
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))

    // Fetch apartments
    let apartmentsQuery = supabase
      .from('apartments')
      .select('id, name, capacity, base_price_eur, bed_type, status, amenities, images, description')
    
    if (apartmentId) {
      apartmentsQuery = apartmentsQuery.eq('id', apartmentId)
    }

    const { data: apartments, error: apartmentsError } = await apartmentsQuery

    if (apartmentsError) {
      console.error('Error fetching apartments:', apartmentsError)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch apartments'
      }, { status: 500 })
    }

    if (!apartments || apartments.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No apartments found'
      }, { status: 404 })
    }

    // Fetch bookings that overlap with the requested date range
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('apartment_id, check_in, check_out, status')
      .gte('check_out', formatDate(checkIn))
      .lte('check_in', formatDate(checkOut))
      .neq('status', 'cancelled')

    if (bookingsError) {
      console.error('Error fetching bookings:', bookingsError)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch bookings'
      }, { status: 500 })
    }

    // Process availability for each apartment
    const apartmentsWithAvailability: ApartmentAvailability[] = apartments.map((apartment) => {
      // Get all bookings for this apartment
      const apartmentBookings = (bookings || []).filter(
        (booking) => booking.apartment_id === apartment.id
      )

      // Find unavailable dates
      const unavailableDates: string[] = []
      apartmentBookings.forEach((booking) => {
        const bookingStart = new Date(booking.check_in)
        const bookingEnd = new Date(booking.check_out)
        
        // Add all dates in the booking range
        const current = new Date(bookingStart)
        while (current <= bookingEnd) {
          const dateStr = formatDate(current)
          // Only include dates that overlap with requested range
          if (current >= checkIn && current <= checkOut) {
            unavailableDates.push(dateStr)
          }
          current.setDate(current.getDate() + 1)
        }
      })

      // Check if apartment is available for the entire range
      const isAvailable = unavailableDates.length === 0

      // Transform JSONB fields to localized strings using transformer
      const localizedApartment = transformApartmentRecord(apartment as ApartmentRecord, locale)
      
      return {
        id: localizedApartment.id,
        name: localizedApartment.name,
        capacity: localizedApartment.capacity,
        base_price_eur: localizedApartment.base_price_eur,
        bed_type: localizedApartment.bed_type,
        available: isAvailable,
        unavailableDates: [...new Set(unavailableDates)].sort()
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        apartments: apartmentsWithAvailability,
        checkIn: formatDate(checkIn),
        checkOut: formatDate(checkOut),
        nights
      }
    })
  } catch (error) {
    console.error('Availability API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// POST /api/availability - Check specific apartment availability
export async function POST(request: NextRequest): Promise<NextResponse<AvailabilityResponse>> {
  try {
    // Extract locale from request
    const locale = extractLocale(request)
    
    const body = await request.json()
    const { apartmentId, checkIn, checkOut } = body

    // Validate required parameters
    if (!apartmentId || !checkIn || !checkOut) {
      return NextResponse.json({
        success: false,
        error: 'apartmentId, checkIn, and checkOut are required'
      }, { status: 400 })
    }

    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)

    // Validate dates
    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return NextResponse.json({
        success: false,
        error: 'Invalid date format'
      }, { status: 400 })
    }

    // Use the database function to check availability
    const { data: isAvailable, error: checkError } = await supabase
      .rpc('check_availability', {
        p_apartment_id: apartmentId,
        p_check_in: formatDate(checkInDate),
        p_check_out: formatDate(checkOutDate)
      })

    if (checkError) {
      console.error('Error checking availability:', checkError)
      return NextResponse.json({
        success: false,
        error: 'Failed to check availability'
      }, { status: 500 })
    }

    // Get apartment details
    const { data: apartment, error: apartmentError } = await supabase
      .from('apartments')
      .select('id, name, capacity, base_price_eur, bed_type, status, amenities, images, description')
      .eq('id', apartmentId)
      .single()

    if (apartmentError || !apartment) {
      return NextResponse.json({
        success: false,
        error: 'Apartment not found'
      }, { status: 404 })
    }

    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))

    // Transform JSONB fields to localized strings using transformer
    const localizedApartment = transformApartmentRecord(apartment as ApartmentRecord, locale)
    
    return NextResponse.json({
      success: true,
      data: {
        apartments: [{
          id: localizedApartment.id,
          name: localizedApartment.name,
          capacity: localizedApartment.capacity,
          base_price_eur: localizedApartment.base_price_eur,
          bed_type: localizedApartment.bed_type,
          available: isAvailable,
          unavailableDates: []
        }],
        checkIn: formatDate(checkInDate),
        checkOut: formatDate(checkOutDate),
        nights
      }
    })
  } catch (error) {
    console.error('Availability check error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}