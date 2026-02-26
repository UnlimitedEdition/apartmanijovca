// WhatsApp Types for Apartmani Jovca Notification System

export type WhatsAppLanguage = 'sr' | 'en' | 'de' | 'it'

export type WhatsAppStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed' | 'undelivered'

export type WhatsAppMessageType = 
  | 'text'
  | 'image'
  | 'document'
  | 'audio'
  | 'video'
  | 'template'

export type WhatsAppNotificationType = 
  | 'booking_confirmation'
  | 'booking_request'
  | 'booking_cancelled'
  | 'booking_reminder'
  | 'check_in_instructions'
  | 'check_out_reminder'
  | 'review_request'
  | 'payment_received'
  | 'payment_reminder'
  | 'general_message'

// Phone number with country code validation
export interface PhoneNumber {
  number: string
  countryCode?: string // e.g., "+381" for Serbia
}

// Format phone number for WhatsApp (must include country code)
export function formatWhatsAppPhone(phone: string, defaultCountryCode: string = '+381'): string {
  // Remove any non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '')
  
  // If already has country code, return as-is
  if (cleaned.startsWith('+')) {
    return cleaned
  }
  
  // If starts with country code without +, add +
  if (cleaned.startsWith(defaultCountryCode.replace('+', ''))) {
    return `+${cleaned}`
  }
  
  // Add default country code
  return `${defaultCountryCode}${phone.replace(/^0/, '')}`
}

// Base booking information shared across WhatsApp message types
export interface BookingWhatsAppData {
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

// Guest information for WhatsApp
export interface GuestWhatsAppData {
  name: string
  phone: string // WhatsApp phone number
  email?: string
  language?: WhatsAppLanguage
}

// WhatsApp message content
export interface WhatsAppMessageContent {
  body: string // Message text (for text messages)
  mediaUrl?: string // For image, document, audio, video messages
  caption?: string // Optional caption for media
}

// Template message component
export interface WhatsAppTemplateComponent {
  type: 'header' | 'body' | 'footer' | 'button'
  parameters?: Array<{
    type: 'text' | 'currency' | 'date_time' | 'image' | 'document'
    text?: string
    currency?: string
    date_time?: string
    image?: { id: string }
    document?: { id: string; filename: string }
  }>
}

// WhatsApp template message
export interface WhatsAppTemplateMessage {
  name: string // Template name from WhatsApp Business
  language: { code: string } // Language code object
  components?: WhatsAppTemplateComponent[]
}

// Generic WhatsApp send result
export interface WhatsAppSendResult {
  success: boolean
  messageId?: string
  status?: WhatsAppStatus
  error?: string
  timestamp?: string
}

// WhatsApp log entry for database
export interface WhatsAppLogEntry {
  id?: string
  bookingId?: string
  messageType: WhatsAppNotificationType
  recipientPhone: string
  status: WhatsAppStatus
  messageId?: string
  error?: string
  sentAt?: Date
  deliveredAt?: Date
  readAt?: Date
  failedAt?: Date
  createdAt?: Date
}

// Webhook payload from WhatsApp Cloud API
export interface WhatsAppWebhookEntry {
  id: string
  changes: Array<{
    value: {
      messaging_product: string
      to: string
      from: string
      type: string
      text?: { body: string }
      image?: { id: string; caption?: string }
      document?: { id: string; filename: string }
      audio?: { id: string }
      video?: { id: string; caption?: string }
      reaction?: { message_id: string; emoji: string }
      button?: { payload: string; text: string }
    }
    field: string
  }>
}

// Webhook payload structure
export interface WhatsAppWebhookPayload {
  object: string
  entry: WhatsAppWebhookEntry[]
}

// Webhook verification (GET request)
export interface WhatsAppWebhookVerify {
  mode: string
  token: string
  challenge: string
}

// Incoming WhatsApp message
export interface WhatsAppIncomingMessage {
  from: string // Sender's phone number
  type: WhatsAppMessageType
  content: string // Message text or caption
  mediaId?: string // Media ID for media messages
  messageId: string // WhatsApp message ID
  timestamp: string
}

// WhatsApp API configuration
export interface WhatsAppConfig {
  phoneNumberId: string
  businessAccountId: string
  accessToken: string
  webhookVerifyToken: string
  apiUrl: string
}

// WhatsApp connection status
export interface WhatsAppConnectionStatus {
  isConfigured: boolean
  isConnected: boolean
  lastChecked?: Date
  error?: string
  businessAccountId?: string
  phoneNumberId?: string
}

// API request types
export interface SendWhatsAppRequest {
  type: WhatsAppNotificationType
  bookingId?: string
  recipientPhone: string
  language?: WhatsAppLanguage
  customMessage?: string
  templateData?: Record<string, string>
}

export interface SendWhatsAppTemplateRequest {
  templateName: string
  recipientPhone: string
  language?: WhatsAppLanguage
  components?: WhatsAppTemplateComponent[]
}

export interface ManualWhatsAppRequest extends SendWhatsAppRequest {
  adminKey: string
}

// WhatsApp message for display
export interface WhatsAppMessageDisplay {
  id: string
  direction: 'inbound' | 'outbound'
  type: WhatsAppMessageType
  content: string
  status: WhatsAppStatus
  timestamp: string
  senderName?: string
  senderPhone?: string
}

// WhatsApp business profile
export interface WhatsAppBusinessProfile {
  name: string
  description: string
  email?: string
  websites?: string[]
  vertical?: string
  address?: string
}

// WhatsApp template category
export interface WhatsAppTemplateInfo {
  name: string
  language: string
  status: 'APPROVED' | 'PENDING' | 'REJECTED' | 'DISABLED'
  category: 'TRANSACTIONAL' | 'MARKETING' | 'AUTHENTICATION'
  components: WhatsAppTemplateComponent[]
}

// Supported languages for WhatsApp templates
export const WHATSAPP_LANGUAGES: Record<WhatsAppLanguage, string> = {
  sr: 'sr',
  en: 'en',
  de: 'de',
  it: 'it',
}

// WhatsApp template strings for localization (re-exported from templates)
export interface WhatsAppTemplateStrings {
  bookingConfirmationTitle: string
  bookingConfirmationBody: string
  bookingConfirmationDetails: string
  bookingConfirmationFooter: string
  
  bookingCancelledTitle: string
  bookingCancelledBody: string
  bookingCancelledDetails: string
  
  bookingReminderTitle: string
  bookingReminderBody: string
  bookingReminderDetails: string
  
  checkInInstructionsTitle: string
  checkInInstructionsBody: string
  checkInInstructionsDetails: string
  
  checkOutReminderTitle: string
  checkOutReminderBody: string
  checkOutReminderDetails: string
  
  reviewRequestTitle: string
  reviewRequestBody: string
  reviewRequestDetails: string
  
  paymentReceivedTitle: string
  paymentReceivedBody: string
  paymentReceivedDetails: string
  
  paymentReminderTitle: string
  paymentReminderBody: string
  paymentReminderDetails: string
}

// Default WhatsApp message types for booking flow
export const BOOKING_NOTIFICATION_TYPES: Record<WhatsAppNotificationType, string> = {
  booking_confirmation: 'booking_confirmation',
  booking_request: 'booking_request',
  booking_cancelled: 'booking_cancelled',
  booking_reminder: 'booking_reminder',
  check_in_instructions: 'check_in_instructions',
  check_out_reminder: 'check_out_reminder',
  review_request: 'review_request',
  payment_received: 'payment_received',
  payment_reminder: 'payment_reminder',
  general_message: 'general_message',
}
