// Email Service for Apartmani Jovca
// Provides functions to send all types of booking-related emails

import { 
  sendEmail, 
  isResendConfigured, 
  EMAIL_CONFIG, 
  logEmailEvent 
} from '../resend'
import type { 
  EmailLanguage, 
  EmailSendResult, 
  EmailType 
} from './types'
import {
  renderBookingConfirmationEmail,
  renderBookingRequestEmail,
  renderCheckInInstructionsEmail,
  renderPreArrivalReminderEmail,
  renderReviewRequestEmail,
} from './templates'

// Booking data interface (simplified from full booking)
interface BookingData {
  bookingId: string
  bookingNumber: string
  checkIn: string
  checkOut: string
  totalPrice: number
  currency?: string
  apartment: {
    id: string
    name: string
    nameSr?: string
    nameDe?: string
    nameIt?: string
  }
  specialRequests?: string
  numberOfGuests?: number
}

// Guest data interface
interface GuestData {
  full_name: string
  email: string
  phone?: string
  language?: EmailLanguage
}

// Helper to determine language from guest or default to English
function getEmailLanguage(guest: GuestData): EmailLanguage {
  return guest.language || 'en'
}

// Send booking confirmation email to guest
export async function sendBookingConfirmation(
  booking: BookingData,
  guest: GuestData
): Promise<EmailSendResult> {
  const language = getEmailLanguage(guest)
  
  logEmailEvent('send_attempt', {
    emailType: 'booking_confirmation',
    recipient: guest.email,
    bookingId: booking.bookingId,
  })

  if (!isResendConfigured()) {
    console.log('[Email Mock] Booking Confirmation:', {
      to: guest.email,
      bookingNumber: booking.bookingNumber,
      language,
    })
    return { success: true, messageId: 'mock-message-id' }
  }

  try {
    const emailContent = await renderBookingConfirmationEmail({
      booking: {
        bookingNumber: booking.bookingNumber,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        totalPrice: booking.totalPrice,
        apartment: booking.apartment,
      },
      guest: {
        full_name: guest.full_name,
      },
      language,
    })

    const result = await sendEmail({
      to: guest.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
      tags: {
        type: 'booking_confirmation',
        bookingId: booking.bookingId,
      },
    })

    if (result.success) {
      logEmailEvent('send_success', {
        emailType: 'booking_confirmation',
        recipient: guest.email,
        bookingId: booking.bookingId,
        messageId: result.messageId,
      })
    } else {
      logEmailEvent('send_failure', {
        emailType: 'booking_confirmation',
        recipient: guest.email,
        bookingId: booking.bookingId,
        error: result.error,
      })
    }

    return result
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logEmailEvent('send_failure', {
      emailType: 'booking_confirmation',
      recipient: guest.email,
      bookingId: booking.bookingId,
      error: errorMessage,
    })
    return { success: false, error: errorMessage }
  }
}

// Send booking request notification to admin
export async function sendBookingRequest(
  booking: BookingData,
  guest: GuestData
): Promise<EmailSendResult> {
  const language: EmailLanguage = 'en' // Admin emails always in English
  
  logEmailEvent('send_attempt', {
    emailType: 'booking_request',
    recipient: EMAIL_CONFIG.adminEmail,
    bookingId: booking.bookingId,
  })

  if (!isResendConfigured()) {
    console.log('[Email Mock] Booking Request to Admin:', {
      to: EMAIL_CONFIG.adminEmail,
      bookingNumber: booking.bookingNumber,
      guestfull_name: guest.full_name,
    })
    return { success: true, messageId: 'mock-message-id' }
  }

  try {
    const emailContent = await renderBookingRequestEmail({
      booking: {
        bookingNumber: booking.bookingNumber,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        totalPrice: booking.totalPrice,
        apartment: booking.apartment,
      },
      guest: {
        full_name: guest.full_name,
        email: guest.email,
        phone: guest.phone || '',
      },
      language,
    })

    const result = await sendEmail({
      to: EMAIL_CONFIG.adminEmail,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
      tags: {
        type: 'booking_request',
        bookingId: booking.bookingId,
      },
    })

    if (result.success) {
      logEmailEvent('send_success', {
        emailType: 'booking_request',
        recipient: EMAIL_CONFIG.adminEmail,
        bookingId: booking.bookingId,
        messageId: result.messageId,
      })
    } else {
      logEmailEvent('send_failure', {
        emailType: 'booking_request',
        recipient: EMAIL_CONFIG.adminEmail,
        bookingId: booking.bookingId,
        error: result.error,
      })
    }

    return result
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logEmailEvent('send_failure', {
      emailType: 'booking_request',
      recipient: EMAIL_CONFIG.adminEmail,
      bookingId: booking.bookingId,
      error: errorMessage,
    })
    return { success: false, error: errorMessage }
  }
}

// Send check-in instructions email to guest
export async function sendCheckInInstructions(
  booking: BookingData,
  guest: GuestData,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  options?: { checkInTime?: string; address?: string; contactPhone?: string }
): Promise<EmailSendResult> {
  const language = getEmailLanguage(guest)
  
  logEmailEvent('send_attempt', {
    emailType: 'check_in_instructions',
    recipient: guest.email,
    bookingId: booking.bookingId,
  })

  if (!isResendConfigured()) {
    console.log('[Email Mock] Check-In Instructions:', {
      to: guest.email,
      bookingNumber: booking.bookingNumber,
      language,
    })
    return { success: true, messageId: 'mock-message-id' }
  }

  try {
    const emailContent = await renderCheckInInstructionsEmail({
      booking: {
        bookingNumber: booking.bookingNumber,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        apartment: booking.apartment,
      },
      guest: {
        full_name: guest.full_name,
      },
      language,
    })

    const result = await sendEmail({
      to: guest.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
      tags: {
        type: 'check_in_instructions',
        bookingId: booking.bookingId,
      },
    })

    if (result.success) {
      logEmailEvent('send_success', {
        emailType: 'check_in_instructions',
        recipient: guest.email,
        bookingId: booking.bookingId,
        messageId: result.messageId,
      })
    } else {
      logEmailEvent('send_failure', {
        emailType: 'check_in_instructions',
        recipient: guest.email,
        bookingId: booking.bookingId,
        error: result.error,
      })
    }

    return result
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logEmailEvent('send_failure', {
      emailType: 'check_in_instructions',
      recipient: guest.email,
      bookingId: booking.bookingId,
      error: errorMessage,
    })
    return { success: false, error: errorMessage }
  }
}

// Send pre-arrival reminder email to guest
export async function sendPreArrivalReminder(
  booking: BookingData,
  guest: GuestData,
  daysUntilArrival: number = 3
): Promise<EmailSendResult> {
  const language = getEmailLanguage(guest)
  
  logEmailEvent('send_attempt', {
    emailType: 'pre_arrival_reminder',
    recipient: guest.email,
    bookingId: booking.bookingId,
  })

  if (!isResendConfigured()) {
    console.log('[Email Mock] Pre-Arrival Reminder:', {
      to: guest.email,
      bookingNumber: booking.bookingNumber,
      daysUntilArrival,
      language,
    })
    return { success: true, messageId: 'mock-message-id' }
  }

  try {
    const emailContent = await renderPreArrivalReminderEmail({
      booking: {
        bookingNumber: booking.bookingNumber,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        apartment: booking.apartment,
      },
      guest: {
        full_name: guest.full_name,
      },
      language,
    })

    const result = await sendEmail({
      to: guest.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
      tags: {
        type: 'pre_arrival_reminder',
        bookingId: booking.bookingId,
      },
    })

    if (result.success) {
      logEmailEvent('send_success', {
        emailType: 'pre_arrival_reminder',
        recipient: guest.email,
        bookingId: booking.bookingId,
        messageId: result.messageId,
      })
    } else {
      logEmailEvent('send_failure', {
        emailType: 'pre_arrival_reminder',
        recipient: guest.email,
        bookingId: booking.bookingId,
        error: result.error,
      })
    }

    return result
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logEmailEvent('send_failure', {
      emailType: 'pre_arrival_reminder',
      recipient: guest.email,
      bookingId: booking.bookingId,
      error: errorMessage,
    })
    return { success: false, error: errorMessage }
  }
}

// Send review request email to guest after checkout
export async function sendReviewRequest(
  booking: BookingData,
  guest: GuestData,
  reviewUrl?: string
): Promise<EmailSendResult> {
  const language = getEmailLanguage(guest)
  
  logEmailEvent('send_attempt', {
    emailType: 'review_request',
    recipient: guest.email,
    bookingId: booking.bookingId,
  })

  if (!isResendConfigured()) {
    console.log('[Email Mock] Review Request:', {
      to: guest.email,
      bookingNumber: booking.bookingNumber,
      language,
    })
    return { success: true, messageId: 'mock-message-id' }
  }

  try {
    const emailContent = await renderReviewRequestEmail({
      booking: {
        bookingNumber: booking.bookingNumber,
        checkOut: booking.checkOut,
        apartment: booking.apartment,
      },
      guest: {
        full_name: guest.full_name,
      },
      language,
      reviewUrl,
    })

    const result = await sendEmail({
      to: guest.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
      tags: {
        type: 'review_request',
        bookingId: booking.bookingId,
      },
    })

    if (result.success) {
      logEmailEvent('send_success', {
        emailType: 'review_request',
        recipient: guest.email,
        bookingId: booking.bookingId,
        messageId: result.messageId,
      })
    } else {
      logEmailEvent('send_failure', {
        emailType: 'review_request',
        recipient: guest.email,
        bookingId: booking.bookingId,
        error: result.error,
      })
    }

    return result
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logEmailEvent('send_failure', {
      emailType: 'review_request',
      recipient: guest.email,
      bookingId: booking.bookingId,
      error: errorMessage,
    })
    return { success: false, error: errorMessage }
  }
}

// Generic function to send any type of email
export async function sendEmailByType(
  type: EmailType,
  booking: BookingData,
  guest: GuestData,
  additionalOptions?: Record<string, unknown>
): Promise<EmailSendResult> {
  switch (type) {
    case 'booking_confirmation':
      return sendBookingConfirmation(booking, guest)
    case 'booking_request':
      return sendBookingRequest(booking, guest)
    case 'check_in_instructions':
      return sendCheckInInstructions(booking, guest)
    case 'pre_arrival_reminder':
      return sendPreArrivalReminder(
        booking, 
        guest, 
        additionalOptions?.daysUntilArrival as number || 3
      )
    case 'review_request':
      return sendReviewRequest(booking, guest, additionalOptions?.reviewUrl as string)
    default:
      return { success: false, error: `Unknown email type: ${type}` }
  }
}

// Export types for external use
export type { BookingData, GuestData }
