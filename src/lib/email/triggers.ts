// Email Triggers for Booking Lifecycle
// This module provides functions to trigger emails at various booking lifecycle events


import { 
  sendBookingConfirmation, 
  sendBookingRequest, 
  sendCheckInInstructions, 
  sendPreArrivalReminder, 
  sendReviewRequest 
} from './service'
import type { BookingData, GuestData } from './service'
import type { EmailLanguage } from './types'



// Trigger confirmation email when booking is created/confirmed
export async function triggerBookingConfirmation(
  booking: BookingData,
  guest: GuestData
): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await sendBookingConfirmation(booking, guest)
    return { success: result.success, error: result.error }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[Email Trigger] Booking confirmation failed:', errorMessage)
    return { success: false, error: errorMessage }
  }
}

// Trigger admin notification when new booking is requested
export async function triggerBookingRequestNotification(
  booking: BookingData,
  guest: GuestData
): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await sendBookingRequest(booking, guest)
    return { success: result.success, error: result.error }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[Email Trigger] Booking request notification failed:', errorMessage)
    return { success: false, error: errorMessage }
  }
}

// Trigger check-in instructions 1 day before check-in
export async function triggerCheckInInstructions(
  booking: BookingData,
  guest: GuestData
): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await sendCheckInInstructions(booking, guest)
    return { success: result.success, error: result.error }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[Email Trigger] Check-in instructions failed:', errorMessage)
    return { success: false, error: errorMessage }
  }
}

// Trigger pre-arrival reminder (typically 3 days before arrival)
export async function triggerPreArrivalReminder(
  booking: BookingData,
  guest: GuestData,
  daysBeforeArrival: number = 3
): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await sendPreArrivalReminder(booking, guest, daysBeforeArrival)
    return { success: result.success, error: result.error }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[Email Trigger] Pre-arrival reminder failed:', errorMessage)
    return { success: false, error: errorMessage }
  }
}

// Trigger review request 1 day after checkout
export async function triggerReviewRequest(
  booking: BookingData,
  guest: GuestData
): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await sendReviewRequest(booking, guest)
    return { success: result.success, error: result.error }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[Email Trigger] Review request failed:', errorMessage)
    return { success: false, error: errorMessage }
  }
}

// Check if check-in is tomorrow (for triggering check-in instructions)
export function isCheckInTomorrow(checkInDate: string): boolean {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  const checkIn = new Date(checkInDate)
  
  return (
    checkIn.getFullYear() === tomorrow.getFullYear() &&
    checkIn.getMonth() === tomorrow.getMonth() &&
    checkIn.getDate() === tomorrow.getDate()
  )
}

// Check if check-in is in the specified number of days
export function isCheckInInDays(checkInDate: string, days: number): boolean {
  const targetDate = new Date()
  targetDate.setDate(targetDate.getDate() + days)
  
  const checkIn = new Date(checkInDate)
  
  return (
    checkIn.getFullYear() === targetDate.getFullYear() &&
    checkIn.getMonth() === targetDate.getMonth() &&
    checkIn.getDate() === targetDate.getDate()
  )
}

// Check if checkout was yesterday (for triggering review request)
export function wasCheckoutYesterday(checkoutDate: string): boolean {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  
  const checkout = new Date(checkoutDate)
  
  return (
    checkout.getFullYear() === yesterday.getFullYear() &&
    checkout.getMonth() === yesterday.getMonth() &&
    checkout.getDate() === yesterday.getDate()
  )
}

// Process scheduled email tasks (called by cron job or scheduled function)
export async function processScheduledEmails(): Promise<{
  processed: number
  success: number
  failed: number
}> {
  const { supabase } = await import('../supabase')
  
  let processed = 0
  let success = 0
  let failed = 0

  if (!supabase) {
    console.error('[Email Trigger] Database not available')
    return { processed: 0, success: 0, failed: 0 }
  }

  try {
    // Get all confirmed bookings
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        id,
        booking_number,
        check_in,
        check_out,
        total_price,
        status,
        apartment:apartments!inner(
          id,
          name,
          name_sr,
          name_de,
          name_it
        ),
        guest:guests!inner(
          id,
          name,
          email,
          phone,
          language
        )
      `)
      .eq('status', 'confirmed')

    if (error || !bookings) {
      console.error('[Email Trigger] Failed to fetch bookings:', error)
      return { processed: 0, success: 0, failed: 0 }
    }

    for (const booking of bookings) {
      processed++

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rawApartment = booking.apartment as any
      const apt = Array.isArray(rawApartment) ? rawApartment[0] : rawApartment

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rawGuest = booking.guest as any
      const gst = Array.isArray(rawGuest) ? rawGuest[0] : rawGuest

      const bookingData: BookingData = {
        bookingId: booking.id,
        bookingNumber: booking.booking_number,
        checkIn: booking.check_in,
        checkOut: booking.check_out,
        totalPrice: booking.total_price,
        apartment: {
          id: apt.id,
          name: apt.name,
          nameSr: apt.name_sr,
          nameDe: apt.name_de,
          nameIt: apt.name_it,
        },
      }

      const guestData: GuestData = {
        full_name: gst.full_name,
        email: gst.email,
        phone: gst.phone,
        language: (gst.language as EmailLanguage) || 'en',
      }

      try {
        // Check if we should send check-in instructions (1 day before)
        if (isCheckInTomorrow(booking.check_in)) {
          const result = await sendCheckInInstructions(bookingData, guestData)
          if (result.success) success++
          else failed++
          console.log(`[Email Trigger] Check-in instructions for ${booking.booking_number}:`, result.success ? 'sent' : 'failed')
        }

        // Check if we should send pre-arrival reminder (3 days before)
        if (isCheckInInDays(booking.check_in, 3)) {
          const result = await sendPreArrivalReminder(bookingData, guestData, 3)
          if (result.success) success++
          else failed++
          console.log(`[Email Trigger] Pre-arrival reminder for ${booking.booking_number}:`, result.success ? 'sent' : 'failed')
        }
      } catch (emailError) {
        console.error(`[Email Trigger] Error sending email for ${booking.booking_number}:`, emailError)
        failed++
      }
    }

    // Get all checked-out bookings for review requests
    const { data: checkedOutBookings } = await supabase
      .from('bookings')
      .select(`
        id,
        booking_number,
        check_out,
        total_price,
        apartment:apartments!inner(
          id,
          name,
          name_sr,
          name_de,
          name_it
        ),
        guest:guests!inner(
          id,
          name,
          email,
          phone,
          language
        )
      `)
      .eq('status', 'checked_out')
      .eq('review_requested', false)
      .or('review_requested.is.null')

    if (checkedOutBookings) {
      for (const booking of checkedOutBookings) {
        processed++

        if (wasCheckoutYesterday(booking.check_out)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const rawApartment = booking.apartment as any
          const apt = Array.isArray(rawApartment) ? rawApartment[0] : rawApartment

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const rawGuest = booking.guest as any
          const gst = Array.isArray(rawGuest) ? rawGuest[0] : rawGuest

          const bookingData: BookingData = {
            bookingId: booking.id,
            bookingNumber: booking.booking_number,
            checkIn: '', // Not needed for review request
            checkOut: booking.check_out,
            totalPrice: booking.total_price,
            apartment: {
              id: apt.id,
              name: apt.name,
              nameSr: apt.name_sr,
              nameDe: apt.name_de,
              nameIt: apt.name_it,
            },
          }

          const guestData: GuestData = {
            full_name: gst.full_name,
            email: gst.email,
            phone: gst.phone,
            language: (gst.language as EmailLanguage) || 'en',
          }

          try {
            const result = await sendReviewRequest(bookingData, guestData)
            if (result.success) {
              success++
              // Mark as review requested
              await supabase
                .from('bookings')
                .update({ review_requested: true })
                .eq('id', booking.id)
            } else {
              failed++
            }
            console.log(`[Email Trigger] Review request for ${booking.booking_number}:`, result.success ? 'sent' : 'failed')
          } catch (emailError) {
            console.error(`[Email Trigger] Error sending review request for ${booking.booking_number}:`, emailError)
            failed++
          }
        }
      }
    }

    return { processed, success, failed }
  } catch (error) {
    console.error('[Email Trigger] Process scheduled emails error:', error)
    return { processed, success, failed }
  }
}
