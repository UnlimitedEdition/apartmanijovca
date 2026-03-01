
import { supabase, supabaseAdmin } from '../supabase'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { 
  CreateBookingInput, 
  UpdateBookingInput, 
  BookingFilter,
  BookingResponse,
  BookingListResponse,
  BookingOptions
} from '../validations/booking'
import type { EmailLanguage } from '../email/types'
import type { Locale, MultiLanguageText } from '../types/database'
import { getLocalizedValue } from '../localization/helpers'
import { 
  triggerBookingConfirmation, 
  triggerBookingRequestNotification,
  triggerReviewRequest 
} from '../email/triggers'

// Constants for pricing
const PRICING = {
  CRIB_PER_NIGHT: 10,
  PARKING_PER_NIGHT: 5,
  EARLY_CHECK_IN: 20,
  LATE_CHECK_OUT: 15
}

// Valid status transitions
const STATUS_TRANSITIONS: Record<string, string[]> = {
  'pending': ['confirmed', 'cancelled'],
  'confirmed': ['checked_in', 'cancelled'],
  'checked_in': ['checked_out', 'no_show'],
  'checked_out': [], // Terminal state
  'cancelled': [], // Terminal state
  'no_show': [] // Terminal state
}

/**
 * Calculate total price for a booking
 */
export function calculateTotalPrice(
  pricePerNight: number,
  checkIn: string,
  checkOut: string,
  options?: BookingOptions
): number {
  const nights = calculateNights(checkIn, checkOut)
  let total = nights * pricePerNight

  if (options?.crib) {
    total += nights * PRICING.CRIB_PER_NIGHT
  }
  if (options?.parking) {
    total += nights * PRICING.PARKING_PER_NIGHT
  }
  if (options?.earlyCheckIn) {
    total += PRICING.EARLY_CHECK_IN
  }
  if (options?.lateCheckOut) {
    total += PRICING.LATE_CHECK_OUT
  }

  return total
}

/**
 * Calculate number of nights between two dates
 */
export function calculateNights(checkIn: string, checkOut: string): number {
  const checkInDate = new Date(checkIn)
  const checkOutDate = new Date(checkOut)
  const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Generate a unique booking number
 */
export function generateBookingNumber(): string {
  const year = new Date().getFullYear()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `BJ-${year}-${random}`
}

/**
 * Check if apartment is available for given dates
 */
export async function checkAvailability(
  apartmentId: string,
  checkIn: string,
  checkOut: string,
  excludeBookingId?: string
): Promise<{ available: boolean; reason?: string }> {
  if (!supabase) {
    return { available: false, reason: 'Database connection not available' }
  }

  try {
    // Use the database function for availability check
    const { data, error } = await supabase.rpc('check_availability', {
      p_apartment_id: apartmentId,
      p_check_in: checkIn,
      p_check_out: checkOut
    })

    if (error) {
      console.error('Availability check error:', error)
      return { available: false, reason: 'Failed to check availability' }
    }

    // data is a boolean - true means available, false means not available
    if (data === false) {
      return { available: false, reason: 'Apartment is not available for selected dates' }
    }

    // If we're updating an existing booking, we need to check if the only conflict is with itself
    if (excludeBookingId) {
      const { data: conflicts, error: conflictError } = await supabase
        .from('bookings')
        .select('id')
        .eq('apartment_id', apartmentId)
        .neq('id', excludeBookingId)
        .neq('status', 'cancelled')
        .overlaps('booking_range', `[${checkIn},${checkOut})`)

      if (conflictError) {
        console.error('Conflict check error:', conflictError)
        return { available: false, reason: 'Failed to check for conflicts' }
      }

      if (conflicts && conflicts.length > 0) {
        return { available: false, reason: 'Dates overlap with existing booking' }
      }
    }

    return { available: true }
  } catch (error) {
    console.error('Availability check exception:', error)
    return { available: false, reason: 'An unexpected error occurred' }
  }
}

/**
 * Validate status transition
 */
export function isValidStatusTransition(
  currentStatus: string,
  newStatus: string
): boolean {
  const allowedTransitions = STATUS_TRANSITIONS[currentStatus]
  return allowedTransitions?.includes(newStatus) ?? false
}

/**
 * Create or get existing guest
 * Uses supabaseAdmin for privileged operations
 */
export async function createOrGetGuest(
  name: string,
  email: string,
  phone?: string
): Promise<{ id: string; error?: string }> {
  if (!supabaseAdmin) {
    return { id: '', error: 'Database connection not available' }
  }

  try {
    // Check if guest exists
    const { data: existingGuest } = await supabaseAdmin
      .from('guests')
      .select('id, full_name, phone')
      .eq('email', email)
      .single()

    if (existingGuest) {
      // Update guest info if needed
      if (existingGuest.full_name !== name || existingGuest.phone !== phone) {
        const { error: updateError } = await supabaseAdmin
          .from('guests')
          .update({ full_name: name, phone })
          .eq('id', existingGuest.id)

        if (updateError) {
          console.error('Guest update error:', updateError)
        }
      }
      return { id: existingGuest.id }
    }

    // Create new guest
    const { data: newGuest, error: createError } = await supabaseAdmin
      .from('guests')
      .insert({ full_name: name, email, phone })
      .select('id')
      .single()

    if (createError) {
      console.error('Guest creation error:', createError)
      return { id: '', error: 'Failed to create guest' }
    }

    return { id: newGuest.id }
  } catch (error) {
    console.error('Guest creation exception:', error)
    return { id: '', error: 'An unexpected error occurred' }
  }
}

/**
 * Create a new booking
 */
export async function createBooking(
  input: CreateBookingInput,
  locale: Locale = 'sr'
): Promise<{ booking?: BookingResponse; error?: string }> {
  if (!supabaseAdmin) {
    return { error: 'Database connection not available' }
  }

  try {
    // Check availability
    const availability = await checkAvailability(
      input.apartmentId,
      input.checkIn,
      input.checkOut
    )

    if (!availability.available) {
      return { error: availability.reason || 'Apartment not available' }
    }

    // Get apartment details for pricing
    const { data: apartment, error: apartmentError } = await supabaseAdmin
      .from('apartments')
      .select('id, name, base_price_eur')
      .eq('id', input.apartmentId)
      .single()

    if (apartmentError || !apartment) {
      return { error: 'Apartment not found' }
    }

    // Localize apartment name
    const apartmentName = getLocalizedValue(apartment.name as MultiLanguageText, locale)

    // Create or get guest
    const guestResult = await createOrGetGuest(
      input.guest.name,
      input.guest.email,
      input.guest.phone
    )

    if (!guestResult.id) {
      return { error: guestResult.error || 'Failed to create guest' }
    }

    // Calculate total price and nights
    const nights = calculateNights(input.checkIn, input.checkOut)
    const pricePerNight = apartment.base_price_eur
    const totalPrice = calculateTotalPrice(
      pricePerNight,
      input.checkIn,
      input.checkOut,
      input.options
    )

    // Generate booking number
    const bookingNumber = generateBookingNumber()

    // Create booking with all required columns including security metadata
    // Use preferredLanguage from input (URL parameter) if available, otherwise fallback to locale
    const bookingLanguage = (input as Record<string, unknown>).preferredLanguage as string || locale
    
    const insertData: Record<string, unknown> = {
      booking_number: bookingNumber,
      apartment_id: input.apartmentId,
      guest_id: guestResult.id,
      check_in: input.checkIn,
      check_out: input.checkOut,
      num_guests: 1,
      price_per_night: pricePerNight,
      total_price: totalPrice,
      status: 'pending',
      source: 'website',
      language: bookingLanguage,
      requested_at: new Date().toISOString()
    }

    // Add security metadata if provided
    if ((input as Record<string, unknown>).metadata) {
      const metadata = (input as Record<string, unknown>).metadata as Record<string, unknown>
      if (metadata.ipAddress) insertData.ip_address = metadata.ipAddress
      if (metadata.userAgent) insertData.user_agent = metadata.userAgent
      if (metadata.fingerprint) insertData.fingerprint = metadata.fingerprint
      if (metadata.consentGiven !== undefined) insertData.consent_given = metadata.consentGiven
      if (metadata.consentTimestamp) insertData.consent_timestamp = metadata.consentTimestamp
      if (metadata.deviceInfo) {
        insertData.metadata = {
          deviceInfo: metadata.deviceInfo,
          timestamp: new Date().toISOString()
        }
      }
    }

    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .insert(insertData)
      .select('id, created_at, updated_at')
      .single()

    if (bookingError) {
      console.error('Booking creation error:', bookingError)
      return { error: 'Failed to create booking' }
    }

    // Trigger booking request notification to admin
    // Note: This is async and we don't wait for it
    triggerBookingRequestNotification(
      {
        bookingId: booking.id,
        bookingNumber,
        checkIn: input.checkIn,
        checkOut: input.checkOut,
        totalPrice,
        apartment: {
          id: input.apartmentId,
          name: apartmentName,
        },
      },
      {
        full_name: input.guest.name,
        email: input.guest.email,
        phone: input.guest.phone,
      }
    ).catch(console.error)

    return {
      booking: {
        id: booking.id,
        bookingNumber,
        apartmentId: input.apartmentId,
        apartmentName: apartmentName,
        guestId: guestResult.id,
        guestName: input.guest.name,
        guestEmail: input.guest.email,
        guestPhone: input.guest.phone,
        checkIn: input.checkIn,
        checkOut: input.checkOut,
        nights: nights,
        totalPrice,
        status: 'pending',
        options: input.options,
        createdAt: booking.created_at,
        updatedAt: booking.updated_at
      }
    }
  } catch (error) {
    console.error('Booking creation exception:', error)
    return { error: 'An unexpected error occurred' }
  }
}


/**
 * Get booking by ID with related data
 */
export async function getBookingById(
  id: string,
  locale: Locale = 'sr',
  supabaseClient?: SupabaseClient
): Promise<{ booking?: BookingResponse; error?: string }> {
  const client = supabaseClient || supabase
  if (!client) {
    return { error: 'Database connection not available' }
  }

  try {
    const { data, error } = await client
      .from('bookings')
      .select(`
        id,
        check_in,
        check_out,
        total_price,
        status,
        created_at,
        updated_at,
        apartments!inner(id, name),
        guests!inner(id, full_name, email, phone)
      `)
      .eq('id', id)
      .single()

    if (error || !data) {
      return { error: 'Booking not found' }
    }

    // Extract apartment data and localize name
    const apartmentData = (data.apartments as unknown as Record<string, unknown>).id ? (data.apartments as unknown as Record<string, unknown>) : (data.apartments as unknown as Array<Record<string, unknown>>)[0]
    const apartmentName = getLocalizedValue(apartmentData.name as MultiLanguageText, locale)

    return {
      booking: {
        id: data.id,
        bookingNumber: `BJ-${new Date(data.created_at).getFullYear()}-${data.id.substring(0, 4).toUpperCase()}`,
        apartmentId: apartmentData.id as string,
        apartmentName: apartmentName,
        guestId: (data.guests as unknown as Record<string, unknown>).id as string || (data.guests as unknown as Array<Record<string, unknown>>)[0]?.id as string,
        guestName: (data.guests as unknown as Record<string, unknown>).full_name as string || (data.guests as unknown as Array<Record<string, unknown>>)[0]?.full_name as string,
        guestEmail: (data.guests as unknown as Record<string, unknown>).email as string || (data.guests as unknown as Array<Record<string, unknown>>)[0]?.email as string,
        guestPhone: ((data.guests as unknown as Record<string, unknown>).phone as string | null || (data.guests as unknown as Array<Record<string, unknown>>)[0]?.phone as string | null) ?? undefined,
        checkIn: data.check_in,
        checkOut: data.check_out,
        nights: calculateNights(data.check_in, data.check_out),
        totalPrice: data.total_price,
        status: data.status,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }
    }
  } catch (error) {
    console.error('Get booking exception:', error)
    return { error: 'An unexpected error occurred' }
  }
}

/**
 * List bookings with filtering
 */
export async function listBookings(
  filter: BookingFilter,
  locale: Locale = 'sr'
): Promise<{ data?: BookingListResponse; error?: string }> {
  if (!supabase) {
    return { error: 'Database connection not available' }
  }

  try {
    const offset = (filter.page - 1) * filter.limit

    // Build query
    let query = supabase
      .from('bookings')
      .select(`
        id,
        check_in,
        check_out,
        total_price,
        status,
        created_at,
        updated_at,
        apartments!inner(id, name),
        guests!inner(id, full_name, email, phone)
      `, { count: 'exact' })

    // Apply filters
    if (filter.startDate) {
      query = query.gte('check_in', filter.startDate)
    }
    if (filter.endDate) {
      query = query.lte('check_out', filter.endDate)
    }
    if (filter.apartmentId) {
      query = query.eq('apartment_id', filter.apartmentId)
    }
    if (filter.status) {
      query = query.eq('status', filter.status)
    }
    if (filter.guestId) {
      query = query.eq('guest_id', filter.guestId)
    }
    if (filter.guestEmail) {
      query = query.eq('guests.email', filter.guestEmail)
    }

    // Apply pagination and ordering
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + filter.limit - 1)

    if (error) {
      console.error('List bookings error:', error)
      return { error: 'Failed to fetch bookings' }
    }

    interface BookingData {
      id: string
      check_in: string
      check_out: string
      total_price: number
      status: string
      created_at: string
      updated_at: string
      apartments: { id: string; name: MultiLanguageText } | { id: string; name: MultiLanguageText }[]
      guests: { id: string; full_name: string; email: string; phone?: string } | { id: string; full_name: string; email: string; phone?: string }[]
    }

    const bookings: BookingResponse[] = (data || []).map((booking: BookingData) => {
      const apartmentData = Array.isArray(booking.apartments) ? booking.apartments[0] : booking.apartments
      const apartmentName = getLocalizedValue(apartmentData.name, locale)
      
      return {
        id: booking.id,
        bookingNumber: `BJ-${new Date(booking.created_at).getFullYear()}-${booking.id.substring(0, 4).toUpperCase()}`,
        apartmentId: apartmentData.id,
        apartmentName: apartmentName,
        guestId: Array.isArray(booking.guests) ? booking.guests[0].id : booking.guests.id,
        guestName: Array.isArray(booking.guests) ? booking.guests[0].full_name : booking.guests.full_name,
        guestEmail: Array.isArray(booking.guests) ? booking.guests[0].email : booking.guests.email,
        guestPhone: Array.isArray(booking.guests) ? booking.guests[0]?.phone : booking.guests.phone,
        checkIn: booking.check_in,
        checkOut: booking.check_out,
        nights: calculateNights(booking.check_in, booking.check_out),
        totalPrice: booking.total_price,
        status: booking.status,
        createdAt: booking.created_at,
        updatedAt: booking.updated_at
      }
    })

    return {
      data: {
        bookings,
        total: count || 0,
        page: filter.page,
        limit: filter.limit,
        totalPages: Math.ceil((count || 0) / filter.limit)
      }
    }
  } catch (error) {
    console.error('List bookings exception:', error)
    return { error: 'An unexpected error occurred' }
  }
}

/**
 * Update a booking
 */
export async function updateBooking(
  id: string,
  input: UpdateBookingInput,
  locale: Locale = 'sr',
  supabaseClient?: SupabaseClient
): Promise<{ booking?: BookingResponse; error?: string }> {
  const client = supabaseClient || supabase
  if (!client) {
    console.error('[updateBooking] No database client available')
    return { error: 'Database connection not available' }
  }

  console.log('[updateBooking] Starting update for booking:', id, 'with input:', input)

  try {
    // Get current booking
    const { data: currentBooking, error: fetchError } = await client
      .from('bookings')
      .select('id, status, check_in, check_out, apartment_id, guest_id')
      .eq('id', id)
      .single()

    if (fetchError || !currentBooking) {
      console.error('[updateBooking] Booking not found:', fetchError)
      return { error: 'Booking not found' }
    }

    console.log('[updateBooking] Current booking:', currentBooking)

    // Validate status transition if status is being changed
    if (input.status) {
      if (input.status === currentBooking.status) {
        console.log('[updateBooking] Status unchanged (already', input.status, '), returning current booking')
        // Status is already set to this value, just return current booking
        return getBookingById(id, locale, client)
      }
      
      console.log('[updateBooking] Validating transition from', currentBooking.status, 'to', input.status)
      const isValid = isValidStatusTransition(currentBooking.status, input.status)
      console.log('[updateBooking] Transition valid?', isValid)
      console.log('[updateBooking] Allowed transitions:', STATUS_TRANSITIONS[currentBooking.status])
      
      if (!isValid) {
        console.error('[updateBooking] Invalid status transition')
        return { 
          error: `Cannot transition from '${currentBooking.status}' to '${input.status}'` 
        }
      }
    }

    // Check availability if dates are being changed
    if (input.checkIn || input.checkOut) {
      const newCheckIn = input.checkIn || currentBooking.check_in
      const newCheckOut = input.checkOut || currentBooking.check_out

      const availability = await checkAvailability(
        currentBooking.apartment_id,
        newCheckIn,
        newCheckOut,
        id // Exclude current booking from conflict check
      )

      if (!availability.available) {
        return { error: availability.reason || 'Dates not available' }
      }
    }

    // Update guest info if provided
    if (input.guest) {
      const updateData: { full_name?: string; phone?: string } = {}
      if (input.guest.name) updateData.full_name = input.guest.name
      if (input.guest.phone !== undefined) updateData.phone = input.guest.phone

      if (Object.keys(updateData).length > 0) {
        await client
          .from('guests')
          .update(updateData)
          .eq('id', currentBooking.guest_id)
      }
    }

    // Build update object
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (input.checkIn) updateData.check_in = input.checkIn
    if (input.checkOut) updateData.check_out = input.checkOut
    if (input.status) {
      updateData.status = input.status
      
      // Set timestamp columns based on status
      const now = new Date().toISOString()
      if (input.status === 'confirmed') {
        updateData.confirmed_at = now
      } else if (input.status === 'checked_in') {
        updateData.checked_in_at = now
      } else if (input.status === 'checked_out') {
        updateData.checked_out_at = now
        updateData.completed_at = now // Also set completed_at for backward compatibility
      } else if (input.status === 'cancelled') {
        updateData.cancelled_at = now
      }
    }

    // Recalculate price if dates changed
    if (input.checkIn || input.checkOut) {
      const { data: apartment } = await client
        .from('apartments')
        .select('base_price_eur')
        .eq('id', currentBooking.apartment_id)
        .single()

      if (apartment) {
        const newCheckIn = input.checkIn || currentBooking.check_in
        const newCheckOut = input.checkOut || currentBooking.check_out
        // Convert partial options to full options with defaults
        const fullOptions: BookingOptions | undefined = input.options ? {
          crib: input.options.crib ?? false,
          parking: input.options.parking ?? false,
          earlyCheckIn: input.options.earlyCheckIn ?? false,
          lateCheckOut: input.options.lateCheckOut ?? false,
          notes: input.options.notes
        } : undefined
        updateData.total_price = calculateTotalPrice(
          apartment.base_price_eur,
          newCheckIn,
          newCheckOut,
          fullOptions
        )
      }
    }

    // Update booking and return updated data immediately
    const { data: updatedData, error: updateError } = await client
      .from('bookings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Booking update error:', updateError)
      return { error: 'Failed to update booking' }
    }

    console.log('[updateBooking] Successfully updated booking:', id, 'with data:', updateData)
    console.log('[updateBooking] Updated booking from DB:', updatedData)

    // Trigger email notifications based on status change
    if (input.status === 'confirmed' || input.status === 'checked_out') {
      // Get booking details for email
      const { data: updatedBooking } = await client
        .from('bookings')
        .select(`
          id, 
          booking_number, 
          status, 
          check_in, 
          check_out, 
          total_price,
          apartment_id,
          guest_id
        `)
        .eq('id', id)
        .single()

      if (updatedBooking) {
        const { data: apartment } = await client
          .from('apartments')
          .select('id, name')
          .eq('id', updatedBooking.apartment_id)
          .single()

        const { data: guest } = await client
          .from('guests')
          .select('id, full_name, email, phone, language')
          .eq('id', updatedBooking.guest_id)
          .single()

        if (input.status === 'confirmed') {
          // Extract localized apartment name
          const guestLocale = (guest?.language as Locale) || 'sr'
          const apartmentName = apartment?.name 
            ? getLocalizedValue(apartment.name as MultiLanguageText, guestLocale)
            : ''
          
          triggerBookingConfirmation(
            {
              bookingId: updatedBooking.id,
              bookingNumber: updatedBooking.booking_number,
              checkIn: updatedBooking.check_in,
              checkOut: updatedBooking.check_out,
              totalPrice: updatedBooking.total_price,
              apartment: {
                id: apartment?.id || '',
                name: apartmentName,
              },
            },
            {
              full_name: guest?.full_name || '',
              email: guest?.email || '',
              phone: guest?.phone,
              language: (guest?.language as EmailLanguage) || 'en',
            }
          ).catch(console.error)
        }

        if (input.status === 'checked_out') {
          // Extract localized apartment name
          const guestLocale = (guest?.language as Locale) || 'sr'
          const apartmentName = apartment?.name 
            ? getLocalizedValue(apartment.name as MultiLanguageText, guestLocale)
            : ''
          
          triggerReviewRequest(
            {
              bookingId: updatedBooking.id,
              bookingNumber: updatedBooking.booking_number,
              checkIn: updatedBooking.check_in,
              checkOut: updatedBooking.check_out,
              totalPrice: updatedBooking.total_price,
              apartment: {
                id: apartment?.id || '',
                name: apartmentName,
              },
            },
            {
              full_name: guest?.full_name || '',
              email: guest?.email || '',
              phone: guest?.phone,
              language: (guest?.language as EmailLanguage) || 'en',
            }
          ).catch(console.error)
        }
      }
    }

    // Return updated booking - use the data we just got from the update
    // This ensures we return the actual updated data, not stale cached data
    return getBookingById(id, locale, client)
  } catch (error) {
    console.error('[updateBooking] Exception occurred:', error)
    if (error instanceof Error) {
      console.error('[updateBooking] Error message:', error.message)
      console.error('[updateBooking] Error stack:', error.stack)
    }
    return { error: 'An unexpected error occurred' }
  }
}

/**
 * Cancel a booking (soft delete via status change)
 */
export async function cancelBooking(
  id: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _reason?: string
): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Database connection not available' }
  }

  try {
    // Get current booking
    const { data: currentBooking, error: fetchError } = await supabase
      .from('bookings')
      .select('id, status')
      .eq('id', id)
      .single()

    if (fetchError || !currentBooking) {
      return { success: false, error: 'Booking not found' }
    }

    // Check if booking can be cancelled
    if (!isValidStatusTransition(currentBooking.status, 'cancelled')) {
      return { 
        success: false, 
        error: `Cannot cancel booking with status '${currentBooking.status}'` 
      }
    }

    // Update status to cancelled
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ 
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (updateError) {
      console.error('Booking cancellation error:', updateError)
      return { success: false, error: 'Failed to cancel booking' }
    }

    return { success: true }
  } catch (error) {
    console.error('Booking cancellation exception:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Delete a booking (hard delete - use with caution)
 */
export async function deleteBooking(id: string): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Database connection not available' }
  }

  try {
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Booking deletion error:', error)
      return { success: false, error: 'Failed to delete booking' }
    }

    return { success: true }
  } catch (error) {
    console.error('Booking deletion exception:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Get available apartments for a date range
 */
export async function getAvailableApartments(
  checkIn: string,
  checkOut: string,
  locale: Locale = 'sr'
): Promise<{ 
  apartments?: Array<{
    id: string
    name: string
    type: string
    capacity: number
    pricePerNight: number
  }>;
  error?: string 
}> {
  if (!supabase) {
    return { error: 'Database connection not available' }
  }

  try {
    const { data, error } = await supabase.rpc('get_available_apartments', {
      checkin: checkIn,
      checkout: checkOut
    })

    if (error) {
      console.error('Get available apartments error:', error)
      return { error: 'Failed to fetch available apartments' }
    }

    return {
      apartments: (data || []).map((apt: { id: string; name: MultiLanguageText; type: string; capacity: number; base_price_eur: number }) => ({
        id: apt.id,
        name: getLocalizedValue(apt.name, locale),
        type: apt.type,
        capacity: apt.capacity,
        pricePerNight: apt.base_price_eur
      }))
    }
  } catch (error) {
    console.error('Get available apartments exception:', error)
    return { error: 'An unexpected error occurred' }
  }
}
