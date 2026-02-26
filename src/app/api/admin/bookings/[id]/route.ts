import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getLocalizedValue } from '@/lib/localization/helpers'
import { updateBooking } from '@/lib/bookings/service'
import type { ApartmentRecord, BookingRecord, GuestRecord, MultiLanguageText, Json } from '@/lib/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseAdmin = createClient(supabaseUrl, process.env.NEXT_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey)

// Type guard to check if a Json value is a MultiLanguageText object
function isMultiLanguageText(value: unknown): value is MultiLanguageText {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    'sr' in value &&
    'en' in value &&
    'de' in value &&
    'it' in value
  )
}

// GET - Get single booking with full details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const { data, error } = await supabaseAdmin
      .from('bookings')
      .select(`
        *,
        apartments:apartment_id(*),
        guests:guest_id(*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error

    if (!data) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Transform booking data
    const booking = data as BookingRecord & {
      apartments: ApartmentRecord
      guests: GuestRecord
    }

    // Localize apartment data (default to Serbian)
    let apartmentDetails = null
    if (booking.apartments) {
      const apt = booking.apartments
      const amenitiesArray = Array.isArray(apt.amenities) ? apt.amenities : []
      const imagesArray = Array.isArray(apt.images) ? apt.images : []
      
      apartmentDetails = {
        id: apt.id,
        name: isMultiLanguageText(apt.name) ? getLocalizedValue(apt.name, 'sr') : '',
        description: isMultiLanguageText(apt.description) ? getLocalizedValue(apt.description, 'sr') : '',
        bed_type: isMultiLanguageText(apt.bed_type) ? getLocalizedValue(apt.bed_type, 'sr') : '',
        capacity: apt.capacity,
        base_price_eur: apt.base_price_eur,
        amenities: amenitiesArray.map((a: Json) => {
          if (typeof a === 'string') return a
          if (isMultiLanguageText(a)) return getLocalizedValue(a, 'sr')
          return ''
        }),
        images: imagesArray.map((img: Json) => {
          if (typeof img === 'string') return img
          if (typeof img === 'object' && img !== null && !Array.isArray(img)) {
            const imgObj = img as Record<string, unknown>
            return typeof imgObj.url === 'string' ? imgObj.url : ''
          }
          return ''
        })
      }
    }

    // Build response matching BookingData interface with security metadata
    const response = {
      booking: {
        id: booking.id,
        apartment_id: booking.apartment_id,
        check_in: booking.check_in,
        check_out: booking.check_out,
        guest_name: booking.guests.full_name,
        guest_email: booking.guests.email,
        guest_phone: booking.guests.phone,
        status: booking.status,
        total_price: booking.total_price,
        number_of_guests: booking.num_guests || 1,
        created_at: booking.created_at,
        apartments: apartmentDetails,
        language: booking.language,
        // Security metadata
        ip_address: (booking as any).ip_address,
        fingerprint: (booking as any).fingerprint,
        user_agent: (booking as any).user_agent,
        metadata: (booking as any).metadata,
        consent_given: (booking as any).consent_given,
        consent_timestamp: (booking as any).consent_timestamp
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching booking:', error)
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    )
  }
}

// PATCH - Update booking status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { status } = body

    // Validate request body
    if (!status || typeof status !== 'string') {
      return NextResponse.json(
        { error: 'Status is required and must be a string' },
        { status: 400 }
      )
    }

    // Validate status value
    const validStatuses = ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    // Update booking using service with admin client
    console.log('[API] Updating booking:', id, 'to status:', status)
    console.log('[API] Request body:', body)
    console.log('[API] Using admin client:', !!supabaseAdmin)
    
    const result = await updateBooking(id, { status: status as 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'no_show' }, 'sr', supabaseAdmin)
    
    console.log('[API] Update result:', JSON.stringify(result, null, 2))

    if (result.error) {
      console.error('[API] Update failed with error:', result.error)
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      booking: result.booking
    })
  } catch (error) {
    console.error('[API] Error updating booking status:', error)
    
    // Log detailed error information
    if (error instanceof Error) {
      console.error('[API] Error name:', error.name)
      console.error('[API] Error message:', error.message)
      console.error('[API] Error stack:', error.stack)
    }
    
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update booking status' },
      { status: 500 }
    )
  }
}
