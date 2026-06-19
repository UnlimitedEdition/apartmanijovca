import { Resend } from 'resend'
import type { EmailLanguage, EmailSendResult, EmailContent } from './email/types'
import { PRODUCTION_URL, CONTACT_PHONE, EMAIL_FROM, EMAIL_ADMIN } from './seo/config'

// Initialize Resend client with error handling
const getResendClient = () => {
  const apiKey = process?.env?.RESEND_API_KEY

  if (!apiKey) {
    // Brevo may still be configured; only warn when no provider is set at all.
    if (!process?.env?.BREVO_API_KEY) {
      console.warn('No email provider configured (RESEND_API_KEY / BREVO_API_KEY missing). Email sending will be disabled.')
    }
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
  // Brevo sender must be a verified email on the Brevo account (single-sender
  // verification). Falls back to the admin/contact inbox which is what gets verified.
  brevoSenderEmail: process?.env?.BREVO_SENDER_EMAIL || process?.env?.ADMIN_EMAIL || EMAIL_ADMIN,
} as const

// Check if Resend is properly configured
export function isResendConfigured(): boolean {
  return resend !== null && !!process?.env?.RESEND_API_KEY
}

// Check if Brevo is configured. Brevo allows sending to ANY recipient after a
// one-click single-sender verification — no custom domain required — so it's the
// preferred bridge until a domain is verified in Resend.
export function isBrevoConfigured(): boolean {
  return !!process?.env?.BREVO_API_KEY
}

// True when ANY email provider is usable. Services use this to decide between a
// real send and the mock/log fallback.
export function isEmailConfigured(): boolean {
  return isBrevoConfigured() || isResendConfigured()
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

// Send email via Brevo (transactional email API).
// Docs: https://developers.brevo.com/reference/sendtransacemail
// Brevo needs no custom domain — only a one-click verified sender — and can send
// to any recipient, which is why it's preferred over Resend test mode.
async function sendViaBrevo(options: SendEmailOptions): Promise<EmailSendResult> {
  try {
    const recipients = (Array.isArray(options.to) ? options.to : [options.to]).map((email) => ({ email }))

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY as string,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: EMAIL_CONFIG.companyName,
          email: EMAIL_CONFIG.brevoSenderEmail,
        },
        to: recipients,
        replyTo: options.replyTo ? { email: options.replyTo } : undefined,
        subject: options.subject,
        htmlContent: options.html,
        textContent: options.text || generatePlainText(options.html),
        // Brevo tags are a flat list of strings.
        tags: options.tags ? Object.values(options.tags) : undefined,
        headers: options.headers,
      }),
    })

    if (!response.ok) {
      let detail = `HTTP ${response.status}`
      try {
        const body = await response.json()
        detail = body?.message || body?.code || detail
      } catch {
        // ignore non-JSON error bodies
      }
      console.error('Failed to send email via Brevo:', detail)
      return { success: false, error: detail }
    }

    const data = await response.json().catch(() => ({}))
    console.log(`Email sent successfully via Brevo. Message ID: ${data?.messageId}`)
    return { success: true, messageId: data?.messageId }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
    console.error('Exception while sending email via Brevo:', errorMessage)
    return { success: false, error: errorMessage }
  }
}

// Send email with comprehensive error handling.
// Provider priority: Brevo (if configured) → Resend. This lets us deliver to real
// guests via Brevo's verified single sender while Resend stays domain-gated.
export async function sendEmail(options: SendEmailOptions): Promise<EmailSendResult> {
  if (isBrevoConfigured()) {
    return sendViaBrevo(options)
  }

  // Check if Resend is configured
  if (!isResendConfigured()) {
    console.error('No email provider is configured. Cannot send email.')
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
