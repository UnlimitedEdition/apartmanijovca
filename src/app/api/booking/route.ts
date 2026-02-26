import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'
import { 
  CreateBookingSchema, 
  BookingFilterSchema
} from '../../../lib/validations/booking'
import { 
  createBooking, 
  listBookings
} from '../../../lib/bookings/service'
import { extractLocale } from '../../../lib/localization/extract'

/**
 * GET /api/booking
 * List bookings with filtering options
 * Query params:
 * - startDate: Filter bookings starting from this date
 * - endDate: Filter bookings ending before this date
 * - apartmentId: Filter by apartment
 * - status: Filter by booking status
 * - guestId: Filter by guest ID
 * - guestEmail: Filter by guest email
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20, max: 100)
 * - locale: Language for localized content (default: 'sr')
 */
export async function GET(request: NextRequest) {
  try {
    // Extract locale from request
    const locale = extractLocale(request)

    // Parse and validate query parameters
    const searchParams = Object.fromEntries(request.nextUrl.searchParams)
    const parseResult = BookingFilterSchema.safeParse(searchParams)

    if (!parseResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid query parameters', 
          details: parseResult.error.flatten().fieldErrors 
        },
        { status: 400 }
      )
    }

    const filter = parseResult.data

    // Check if database is available
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 503 }
      )
    }

    // Get bookings with filtering and localization
    const result = await listBookings(filter, locale)

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json(result.data)

  } catch (error) {
    console.error('List bookings error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/booking
 * Create a new booking with security checks
 * Body: {
 *   apartmentId: string (UUID)
 *   checkIn: string (ISO date)
 *   checkOut: string (ISO date)
 *   guest: { name, email, phone }
 *   options?: { crib?, parking?, earlyCheckIn?, lateCheckOut?, notes? }
 *   security: { fingerprint, userAgent, consentGiven, deviceInfo }
 * }
 * Query params:
 * - locale: Language for localized content (default: 'sr')
 */
export async function POST(request: NextRequest) {
  try {
    // Extract locale from request
    const locale = extractLocale(request)

    // Get IP address
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') || 
                     'unknown'

    // Parse request body
    const body = await request.json()

    // Validate input
    const parseResult = CreateBookingSchema.safeParse(body)

    if (!parseResult.success) {
      console.error('[Booking API] Validation failed:', parseResult.error.flatten())
      return NextResponse.json(
        { 
          error: 'Neispravni podaci', 
          details: parseResult.error.flatten().fieldErrors 
        },
        { status: 400 }
      )
    }

    const validatedData = parseResult.data

    // Check if database is available
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 503 }
      )
    }

    // Check if consent was given
    if (!validatedData.security.consentGiven) {
      console.warn('[Booking API] GDPR consent not given')
      return NextResponse.json(
        { error: 'Morate prihvatiti uslove prikupljanja podataka' },
        { status: 403 }
      )
    }

    // RATE LIMITING CHECK - Professional implementation
    const { checkRateLimit, recordSuccessfulBooking } = await import('../../../lib/rate-limiting/service')
    
    const rateLimitCheck = await checkRateLimit(
      ipAddress,
      validatedData.guest.email,
      validatedData.security.fingerprint || 'unknown'
    )

    if (!rateLimitCheck.allowed) {
      console.warn('[Booking API] Rate limit exceeded:', {
        ip: ipAddress,
        email: validatedData.guest.email,
        reason: rateLimitCheck.reason
      })
      
      return NextResponse.json(
        { 
          error: rateLimitCheck.reason || 'Previše pokušaja. Molimo pokušajte ponovo kasnije.',
          blockedUntil: rateLimitCheck.blockedUntil?.toISOString()
        },
        { status: 429 }
      )
    }

    console.log('[Booking API] Rate limit check passed for:', ipAddress)
    console.log('[Booking API] Rate limit check passed for:', ipAddress)

    // Create booking with metadata
    const bookingInput = {
      apartmentId: validatedData.apartmentId,
      checkIn: validatedData.checkIn,
      checkOut: validatedData.checkOut,
      guest: validatedData.guest,
      options: validatedData.options,
      preferredLanguage: validatedData.preferredLanguage || locale, // Language from URL or fallback to detected
      metadata: {
        ipAddress,
        userAgent: validatedData.security.userAgent,
        fingerprint: validatedData.security.fingerprint,
        deviceInfo: validatedData.security.deviceInfo,
        consentGiven: validatedData.security.consentGiven,
        consentTimestamp: validatedData.security.consentTimestamp || new Date().toISOString()
      }
    } as Parameters<typeof createBooking>[0] & { metadata: unknown; preferredLanguage: string }

    const result = await createBooking(bookingInput as Parameters<typeof createBooking>[0], locale)

    if (result.error) {
      console.error('[Booking API] Creation failed:', result.error)
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    // Clear rate limits after successful booking
    await recordSuccessfulBooking(
      ipAddress,
      validatedData.guest.email,
      validatedData.security.fingerprint || 'unknown'
    )

    // Log successful booking
    console.log('[Booking API] Booking created successfully:', {
      bookingId: result.booking?.id,
      email: validatedData.guest.email,
      ipAddress,
      fingerprint: validatedData.security.fingerprint
    })

    return NextResponse.json(result.booking, { status: 201 })

  } catch (error) {
    console.error('[Booking API] Unexpected error:', error)
    
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Neispravan format podataka' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Greška pri kreiranju rezervacije' },
      { status: 500 }
    )
  }
}
