import { Resend } from 'resend'
import type { EmailLanguage, EmailSendResult, EmailContent } from './email/types'
import { PRODUCTION_URL, CONTACT_PHONE, EMAIL_FROM, EMAIL_ADMIN } from './seo/config'

// Initialize Resend client with error handling
const getResendClient = () => {
  const apiKey = process?.env?.RESEND_API_KEY
  
  if (!apiKey) {
    console.warn('RESEND_API_KEY is not configured. Email sending will be disabled.')
    return null
  }
  
  return new Resend(apiKey)
}

// Export the client getter for use in services
export const resend = getResendClient()

// Email configuration constants
export const EMAIL_CONFIG = {
  fromEmail: process?.env?.EMAIL_FROM || EMAIL_FROM,
  adminEmail: process?.env?.ADMIN_EMAIL || EMAIL_ADMIN,
  companyName: 'Apartmani Jovča',
  websiteUrl: PRODUCTION_URL,
  supportPhone: CONTACT_PHONE,
} as const

// Check if Resend is properly configured
export function isResendConfigured(): boolean {
  return resend !== null && !!process?.env?.RESEND_API_KEY
}

// Interface for email options
export interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  replyTo?: string
  tags?: Record<string, string>
  headers?: Record<string, string>
}

// Send email with comprehensive error handling
export async function sendEmail(options: SendEmailOptions): Promise<EmailSendResult> {
  // Check if Resend is configured
  if (!isResendConfigured()) {
    console.error('Resend is not configured. Cannot send email.')
    return {
      success: false,
      error: 'Email service is not configured',
    }
  }

  try {
    const { data, error } = await resend!.emails.send({
      from: EMAIL_CONFIG.fromEmail,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      text: options.text || generatePlainText(options.html),
      replyTo: options.replyTo,
      tags: options.tags ? Object.entries(options.tags).map(([name, value]) => ({ name, value })) : undefined,
      headers: options.headers,
    })

    if (error) {
      console.error('Failed to send email:', error)
      return {
        success: false,
        error: error.message || 'Unknown error from Resend',
      }
    }

    console.log(`Email sent successfully. Message ID: ${data?.id}`)
    return {
      success: true,
      messageId: data?.id,
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
    console.error('Exception while sending email:', errorMessage)
    return {
      success: false,
      error: errorMessage,
    }
  }
}

// Generate plain text version from HTML (basic implementation)
function generatePlainText(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\s*\n\s*/g, '\n')
    .trim()
}

// Format currency for emails
export function formatCurrency(amount: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

// Format date for emails based on language
export function formatDateForEmail(date: string | Date, language: EmailLanguage): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  const localeMap: Record<EmailLanguage, string> = {
    sr: 'sr-RS',
    en: 'en-GB',
    de: 'de-DE',
    it: 'it-IT',
  }
  
  return new Intl.DateTimeFormat(localeMap[language], {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj)
}

// Get apartment name based on language
export function getApartmentName(
  apartment: { name: string; nameSr?: string; nameDe?: string; nameIt?: string },
  language: EmailLanguage
): string {
  switch (language) {
    case 'sr':
      return apartment.nameSr || apartment.name
    case 'de':
      return apartment.nameDe || apartment.name
    case 'it':
      return apartment.nameIt || apartment.name
    default:
      return apartment.name
  }
}

// Email logging helper
export function logEmailEvent(
  event: 'send_attempt' | 'send_success' | 'send_failure' | 'webhook_received',
  data: {
    emailType?: string
    recipient?: string
    bookingId?: string
    messageId?: string
    error?: string
  }
): void {
  const timestamp = new Date().toISOString()
  console.log(JSON.stringify({
    timestamp,
    event,
    ...data,
  }))
}

// Validate email address format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Get language-specific greeting
export function getGreeting(language: EmailLanguage, guestName: string): string {
  const greetings: Record<EmailLanguage, string> = {
    sr: `Poštovani ${guestName}`,
    en: `Dear ${guestName}`,
    de: `Sehr geehrte(r) ${guestName}`,
    it: `Gentile ${guestName}`,
  }
  return greetings[language]
}

// Get company signature for emails
export function getEmailSignature(language: EmailLanguage): string {
  const signatures: Record<EmailLanguage, string> = {
    sr: `
      <p>Srdačan pozdrav,<br>
      <strong>Tim Apartmana Jovča</strong><br>
      📞 ${CONTACT_PHONE}<br>
      🌐 ${PRODUCTION_URL.replace('https://', '')}</p>
    `,
    en: `
      <p>Best regards,<br>
      <strong>Apartmani Jovča Team</strong><br>
      📞 ${CONTACT_PHONE}<br>
      🌐 ${PRODUCTION_URL.replace('https://', '')}</p>
    `,
    de: `
      <p>Mit freundlichen Grüßen,<br>
      <strong>Team Apartmani Jovča</strong><br>
      📞 ${CONTACT_PHONE}<br>
      🌐 ${PRODUCTION_URL.replace('https://', '')}</p>
    `,
    it: `
      <p>Cordiali saluti,<br>
      <strong>Team Apartmani Jovča</strong><br>
      📞 ${CONTACT_PHONE}<br>
      🌐 ${PRODUCTION_URL.replace('https://', '')}</p>
    `,
  }
  return signatures[language]
}

// Re-export types
export type { EmailLanguage, EmailSendResult, EmailContent }
