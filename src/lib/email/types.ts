// Email Types for Apartmani Jovca Notification System

export type EmailLanguage = 'sr' | 'en' | 'de' | 'it'

export type EmailStatus = 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed'

export type EmailType = 
  | 'booking_confirmation'
  | 'booking_request'
  | 'check_in_instructions'
  | 'pre_arrival_reminder'
  | 'review_request'

// Base booking information shared across email types
export interface BookingEmailData {
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

// Guest information for emails
export interface GuestEmailData {
  name: string
  email: string
  phone?: string
  language?: EmailLanguage
}

// Admin recipient information
export interface AdminEmailData {
  email: string
  name?: string
}

// Props for booking confirmation email
export interface BookingConfirmationEmailProps {
  booking: BookingEmailData
  guest: GuestEmailData
  language: EmailLanguage
}

// Props for booking request email (admin notification)
export interface BookingRequestEmailProps {
  booking: BookingEmailData
  guest: GuestEmailData
  language: EmailLanguage
  adminUrl?: string
}

// Props for check-in instructions email
export interface CheckInInstructionsEmailProps {
  booking: BookingEmailData
  guest: GuestEmailData
  language: EmailLanguage
  checkInTime?: string
  checkOutTime?: string
  address?: string
  wifiCode?: string
  emergencyContact?: string
}

// Props for pre-arrival reminder email
export interface PreArrivalReminderEmailProps {
  booking: BookingEmailData
  guest: GuestEmailData
  language: EmailLanguage
  daysUntilArrival: number
}

// Props for review request email
export interface ReviewRequestEmailProps {
  booking: Pick<BookingEmailData, 'bookingId' | 'bookingNumber' | 'checkOut' | 'apartment'>
  guest: GuestEmailData
  language: EmailLanguage
  reviewUrl?: string
}

// Generic email send result
export interface EmailSendResult {
  success: boolean
  messageId?: string
  error?: string
}

// Email log entry for database
export interface EmailLogEntry {
  id?: string
  bookingId: string
  emailType: EmailType
  recipientEmail: string
  status: EmailStatus
  messageId?: string
  error?: string
  sentAt?: Date
  deliveredAt?: Date
  openedAt?: Date
  clickedAt?: Date
  bouncedAt?: Date
  failedAt?: Date
  createdAt?: Date
}

// Webhook event from Resend
export interface ResendWebhookEvent {
  type: 'email.sent' | 'email.delivered' | 'email.opened' | 'email.clicked' | 'email.bounced' | 'email.complained'
  created_at: string
  data: {
    email_id: string
    from: string
    to: string[]
    subject: string
    created_at: string
    // For clicked events
    click?: {
      link: string
      timestamp: string
    }
    // For opened events
    open?: {
      timestamp: string
    }
    // For bounced events
    bounce?: {
      message: string
      timestamp: string
    }
  }
}

// API request types
export interface SendEmailRequest {
  type: EmailType
  bookingId: string
  recipientEmail?: string // Optional override
  language?: EmailLanguage
}

export interface ManualEmailRequest extends SendEmailRequest {
  adminKey: string
  customMessage?: string
}

// Email template content
export interface EmailContent {
  subject: string
  html: string
  text: string
}

// Language-specific strings interface
export interface EmailStrings {
  subject: string
  greeting: string
  bookingDetails: string
  bookingNumber: string
  apartment: string
  checkIn: string
  checkOut: string
  totalPrice: string
  guestInformation: string
  name: string
  email: string
  phone: string
  specialRequests: string
  numberOfGuests: string
  closing: string
  contact: string
  checkInInstructions: string
  checkInTime: string
  checkOutTime: string
  bringValidId: string
  contactUponArrival: string
  wifiCode: string
  safeTravels: string
  whatToPrepare: string
  validIdForCheckIn: string
  specialRequestsRequirements: string
  transportationArrangements: string
  cantWaitToWelcome: string
  howWasYourStay: string
  enjoyedStay: string
  feedbackHelps: string
  leaveReview: string
  thankYouForChoosing: string
  reviewButton: string
  bookingConfirmed: string
  newBookingRequest: string
  pleaseReviewConfirm: string
  daysUntilArrival: string
}
