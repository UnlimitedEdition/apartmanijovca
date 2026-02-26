
// WhatsApp Service for Apartmani Jovca
// Simplified implementation using WhatsApp Cloud API

import type { WhatsAppLanguage, WhatsAppNotificationType, WhatsAppTemplateComponent } from './types'
import { getTemplateMessage } from './templates'

// Simple WhatsApp send result type
export interface WhatsAppSendResult {
  success: boolean
  messageId?: string
  status?: string
  timestamp?: string
  error?: string
}

// Connection status type
export interface WhatsAppConnectionStatus {
  isConfigured: boolean
  isConnected: boolean
  lastChecked?: Date
  error?: string
  businessAccountId?: string
  phoneNumberId?: string
}

// Booking data type
interface BookingWhatsAppData {
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

// Guest data type
interface GuestWhatsAppData {
  full_name: string
  phone: string
  email?: string
  language?: WhatsAppLanguage
}

// WhatsApp API configuration
interface WhatsAppApiConfig {
  phoneNumberId: string
  businessAccountId: string
  accessToken: string
  webhookVerifyToken: string
  apiUrl: string
  adminPhoneNumber: string
}

// Default configuration from environment variables
function getWhatsAppConfig(): WhatsAppApiConfig {
  return {
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
    businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '',
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
    webhookVerifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'apartmani-jovca-whatsapp-verification',
    apiUrl: process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v21.0',
    adminPhoneNumber: process.env.WHATSAPP_ADMIN_PHONE || '+381652378080',
  }
}

// Format phone number for WhatsApp
export function formatWhatsAppPhone(phone: string, defaultCountryCode: string = '+381'): string {
  const cleaned = phone.replace(/[^\d+]/g, '')
  if (cleaned.startsWith('+')) return cleaned
  if (cleaned.startsWith(defaultCountryCode.replace('+', ''))) return `+${cleaned}`
  return `${defaultCountryCode}${phone.replace(/^0/, '')}`
}

// Check if WhatsApp is properly configured
export function isWhatsAppConfigured(): boolean {
  const config = getWhatsAppConfig()
  return !!(config.phoneNumberId && config.accessToken && config.businessAccountId)
}

// Get connection status
export async function getConnectionStatus(): Promise<WhatsAppConnectionStatus> {
  const config = getWhatsAppConfig()
  
  if (!isWhatsAppConfigured()) {
    return {
      isConfigured: false,
      isConnected: false,
      error: 'WhatsApp is not configured. Please add WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_ACCESS_TOKEN, and WHATSAPP_BUSINESS_ACCOUNT_ID to .env.local',
    }
  }

  try {
    return {
      isConfigured: true,
      isConnected: true,
      lastChecked: new Date(),
      businessAccountId: config.businessAccountId,
      phoneNumberId: config.phoneNumberId,
    }
  } catch (error) {
    return {
      isConfigured: true,
      isConnected: false,
      lastChecked: new Date(),
      error: error instanceof Error ? error.message : 'Failed to connect to WhatsApp',
    }
  }
}

// Log WhatsApp events
function logWhatsAppEvent(
  event: 'send_attempt' | 'send_success' | 'send_failure' | 'webhook_received',
  data: Record<string, unknown>
): void {
  console.log(`[WhatsApp ${new Date().toISOString()}] ${event}:`, JSON.stringify(data, null, 2))
}

// Send a simple text message
export async function sendMessage(
  to: string,
  message: string,
  options?: {
    bookingId?: string
    messageType?: WhatsAppNotificationType
  }
): Promise<WhatsAppSendResult> {
  const config = getWhatsAppConfig()
  const formattedPhone = formatWhatsAppPhone(to)

  logWhatsAppEvent('send_attempt', {
    to: formattedPhone,
    messageType: options?.messageType || 'general_message',
    bookingId: options?.bookingId,
    messageLength: message.length,
  })

  // Mock mode when not configured
  if (!isWhatsAppConfigured()) {
    console.log('[WhatsApp Mock] Sending message:', { to: formattedPhone, message, bookingId: options?.bookingId })
    return { success: true, messageId: `mock-${Date.now()}`, status: 'sent', timestamp: new Date().toISOString() }
  }

  try {
    const response = await fetch(`${config.apiUrl}/${config.phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: formattedPhone,
        type: 'text',
        text: { body: message },
      }),
    })

    const responseData = await response.json()

    if (!response.ok) {
      const error = responseData.error?.message || 'Failed to send WhatsApp message'
      logWhatsAppEvent('send_failure', { to: formattedPhone, error, statusCode: response.status })
      return { success: false, error }
    }

    const messageId = responseData.messages?.[0]?.id
    logWhatsAppEvent('send_success', { to: formattedPhone, messageId })
    return { success: true, messageId, status: 'sent', timestamp: new Date().toISOString() }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logWhatsAppEvent('send_failure', { to: formattedPhone, error: errorMessage })
    return { success: false, error: errorMessage }
  }
}

// Send a template message
export async function sendTemplateMessage(
  to: string,
  template: { name: string; language: { code: string }; components?: WhatsAppTemplateComponent[] },
  options?: {
    bookingId?: string
    messageType?: WhatsAppNotificationType
  }
): Promise<WhatsAppSendResult> {
  const config = getWhatsAppConfig()
  const formattedPhone = formatWhatsAppPhone(to)

  logWhatsAppEvent('send_attempt', {
    to: formattedPhone,
    templateName: template.name,
    messageType: options?.messageType || 'general_message',
    bookingId: options?.bookingId,
  })

  if (!isWhatsAppConfigured()) {
    console.log('[WhatsApp Mock] Sending template:', { to: formattedPhone, template: template.name, bookingId: options?.bookingId })
    return { success: true, messageId: `mock-template-${Date.now()}`, status: 'sent', timestamp: new Date().toISOString() }
  }

  try {
    const response = await fetch(`${config.apiUrl}/${config.phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: formattedPhone,
        type: 'template',
        template: template,
      }),
    })

    const responseData = await response.json()

    if (!response.ok) {
      const error = responseData.error?.message || 'Failed to send WhatsApp template'
      logWhatsAppEvent('send_failure', { to: formattedPhone, templateName: template.name, error })
      return { success: false, error }
    }

    const messageId = responseData.messages?.[0]?.id
    logWhatsAppEvent('send_success', { to: formattedPhone, messageId, templateName: template.name })
    return { success: true, messageId, status: 'sent', timestamp: new Date().toISOString() }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logWhatsAppEvent('send_failure', { to: formattedPhone, templateName: template.name, error: errorMessage })
    return { success: false, error: errorMessage }
  }
}

// Helper functions
function getWhatsAppLanguage(guest: GuestWhatsAppData): WhatsAppLanguage {
  return guest.language || 'en'
}

function getApartmentName(apartment: BookingWhatsAppData['apartment'], language: WhatsAppLanguage): string {
  switch (language) {
    case 'sr': return apartment.nameSr || apartment.name
    case 'de': return apartment.nameDe || apartment.name
    case 'it': return apartment.nameIt || apartment.name
    default: return apartment.name
  }
}

function formatDateForWhatsApp(dateString: string, language: WhatsAppLanguage): string {
  const date = new Date(dateString)
  const locales: Record<WhatsAppLanguage, string> = { sr: 'sr-RS', en: 'en-US', de: 'de-DE', it: 'it-IT' }
  return new Intl.DateTimeFormat(locales[language], { day: 'numeric', month: 'long', year: 'numeric' }).format(date)
}

function formatPriceForWhatsApp(price: number, currency: string = 'EUR'): string {
  return `${price.toLocaleString()} ${currency}`
}

// Main notification functions
export async function sendBookingConfirmation(booking: BookingWhatsAppData, guest: GuestWhatsAppData): Promise<WhatsAppSendResult> {
  const language = getWhatsAppLanguage(guest)
  const template = getTemplateMessage('booking_confirmation', language, {
    guestName: guest.full_name,
    apartmentName: getApartmentName(booking.apartment, language),
    checkInDate: formatDateForWhatsApp(booking.checkIn, language),
    checkOutDate: formatDateForWhatsApp(booking.checkOut, language),
    bookingNumber: booking.bookingNumber,
    totalPrice: formatPriceForWhatsApp(booking.totalPrice, booking.currency),
  })
  return sendTemplateMessage(guest.phone, template, { bookingId: booking.bookingId, messageType: 'booking_confirmation' })
}

export async function sendBookingRequest(booking: BookingWhatsAppData, guest: GuestWhatsAppData): Promise<WhatsAppSendResult> {
  const config = getWhatsAppConfig()
  const message = `🆕 New Booking Request

Guest: ${guest.full_name}
Phone: ${guest.phone}
Email: ${guest.email || 'N/A'}

Apartment: ${getApartmentName(booking.apartment, 'en')}
Check-in: ${formatDateForWhatsApp(booking.checkIn, 'en')}
Check-out: ${formatDateForWhatsApp(booking.checkOut, 'en')}
Guests: ${booking.numberOfGuests || 'N/A'}
Total: ${formatPriceForWhatsApp(booking.totalPrice, booking.currency)}

${booking.specialRequests ? `Special Requests: ${booking.specialRequests}` : ''}

Booking #: ${booking.bookingNumber}`

  return sendMessage(config.adminPhoneNumber, message, { bookingId: booking.bookingId, messageType: 'booking_confirmation' })
}

export async function sendBookingCancellation(booking: BookingWhatsAppData, guest: GuestWhatsAppData, reason?: string): Promise<WhatsAppSendResult> {
  const language = getWhatsAppLanguage(guest)
  const template = getTemplateMessage('booking_cancelled', language, {
    guestName: guest.full_name,
    bookingNumber: booking.bookingNumber,
    apartmentName: getApartmentName(booking.apartment, language),
    reason: reason || '',
  })
  return sendTemplateMessage(guest.phone, template, { bookingId: booking.bookingId, messageType: 'booking_cancelled' })
}

export async function sendBookingReminder(booking: BookingWhatsAppData, guest: GuestWhatsAppData, daysUntilArrival: number): Promise<WhatsAppSendResult> {
  const language = getWhatsAppLanguage(guest)
  const template = getTemplateMessage('booking_reminder', language, {
    guestName: guest.full_name,
    apartmentName: getApartmentName(booking.apartment, language),
    checkInDate: formatDateForWhatsApp(booking.checkIn, language),
    daysUntilArrival: daysUntilArrival.toString(),
  })
  return sendTemplateMessage(guest.phone, template, { bookingId: booking.bookingId, messageType: 'booking_reminder' })
}

export async function sendCheckInInstructions(booking: BookingWhatsAppData, guest: GuestWhatsAppData, options?: { checkInTime?: string; address?: string; contactPhone?: string }): Promise<WhatsAppSendResult> {
  const language = getWhatsAppLanguage(guest)
  const template = getTemplateMessage('check_in_instructions', language, {
    guestName: guest.full_name,
    apartmentName: getApartmentName(booking.apartment, language),
    checkInDate: formatDateForWhatsApp(booking.checkIn, language),
    checkInTime: options?.checkInTime || '14:00 - 20:00',
    address: options?.address || 'Banjski put bb, Vrnjačka Banja, Serbia',
    contactPhone: options?.contactPhone || '+381 65 237 8080',
  })
  return sendTemplateMessage(guest.phone, template, { bookingId: booking.bookingId, messageType: 'check_in_instructions' })
}

export async function sendCheckOutReminder(booking: BookingWhatsAppData, guest: GuestWhatsAppData): Promise<WhatsAppSendResult> {
  const language = getWhatsAppLanguage(guest)
  const template = getTemplateMessage('check_out_reminder', language, {
    guestName: guest.full_name,
    apartmentName: getApartmentName(booking.apartment, language),
    checkOutDate: formatDateForWhatsApp(booking.checkOut, language),
    checkOutTime: '10:00',
  })
  return sendTemplateMessage(guest.phone, template, { bookingId: booking.bookingId, messageType: 'check_out_reminder' })
}

export async function sendReviewRequest(booking: BookingWhatsAppData, guest: GuestWhatsAppData, reviewUrl?: string): Promise<WhatsAppSendResult> {
  const language = getWhatsAppLanguage(guest)
  const template = getTemplateMessage('review_request', language, {
    guestName: guest.full_name,
    apartmentName: getApartmentName(booking.apartment, language),
    reviewUrl: reviewUrl || 'https://apartmanijovca.com/reviews',
  })
  return sendTemplateMessage(guest.phone, template, { bookingId: booking.bookingId, messageType: 'review_request' })
}

export async function sendPaymentReceived(booking: BookingWhatsAppData, guest: GuestWhatsAppData, amount: number): Promise<WhatsAppSendResult> {
  const language = getWhatsAppLanguage(guest)
  const template = getTemplateMessage('payment_received', language, {
    guestName: guest.full_name,
    bookingNumber: booking.bookingNumber,
    amount: formatPriceForWhatsApp(amount, booking.currency),
  })
  return sendTemplateMessage(guest.phone, template, { bookingId: booking.bookingId, messageType: 'payment_received' })
}

export async function sendPaymentReminder(booking: BookingWhatsAppData, guest: GuestWhatsAppData, amountDue: number): Promise<WhatsAppSendResult> {
  const language = getWhatsAppLanguage(guest)
  const template = getTemplateMessage('payment_reminder', language, {
    guestName: guest.full_name,
    bookingNumber: booking.bookingNumber,
    amountDue: formatPriceForWhatsApp(amountDue, booking.currency),
    dueDate: formatDateForWhatsApp(booking.checkIn, language),
  })
  return sendTemplateMessage(guest.phone, template, { bookingId: booking.bookingId, messageType: 'payment_reminder' })
}

// Generic function to send any type of WhatsApp message
export async function sendWhatsAppByType(
  type: WhatsAppNotificationType,
  booking: BookingWhatsAppData,
  guest: GuestWhatsAppData,
  additionalOptions?: Record<string, unknown>
): Promise<WhatsAppSendResult> {
  switch (type) {
    case 'booking_confirmation': return sendBookingConfirmation(booking, guest)
    case 'booking_cancelled': return sendBookingCancellation(booking, guest, additionalOptions?.reason as string | undefined)
    case 'booking_reminder': return sendBookingReminder(booking, guest, additionalOptions?.daysUntilArrival as number || 3)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    case 'check_in_instructions': return sendCheckInInstructions(booking, guest, additionalOptions as any)
    case 'check_out_reminder': return sendCheckOutReminder(booking, guest)
    case 'review_request': return sendReviewRequest(booking, guest, additionalOptions?.reviewUrl as string | undefined)
    case 'payment_received': return sendPaymentReceived(booking, guest, additionalOptions?.amount as number || booking.totalPrice)
    case 'payment_reminder': return sendPaymentReminder(booking, guest, additionalOptions?.amountDue as number || booking.totalPrice)
    default: return { success: false, error: `Unknown WhatsApp message type: ${type}` }
  }
}

// Verify webhook token
export function verifyWebhookToken(token: string): boolean {
  const config = getWhatsAppConfig()
  return token === config.webhookVerifyToken
}

// Export types for external use
export type { BookingWhatsAppData, GuestWhatsAppData }
