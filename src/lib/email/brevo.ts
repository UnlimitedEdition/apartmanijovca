// Brevo (formerly Sendinblue) transactional email provider.
// Alternative to Resend — provider selection lives in ../resend.ts (getEmailProvider).
// Uses the Brevo REST API directly via fetch (no @getbrevo/brevo SDK dependency).

import type { SendEmailOptions } from '../resend'
import type { EmailSendResult } from './types'
import { EMAIL_FROM } from '../seo/config'

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email'

// Sender display name (kept in sync with EMAIL_CONFIG.companyName in ../resend.ts;
// duplicated here to avoid a runtime import cycle resend.ts <-> brevo.ts).
const SENDER_NAME = 'Apartmani Jovča'

// Check if Brevo is configured (has API key)
export function isBrevoConfigured(): boolean {
  return !!process?.env?.BREVO_API_KEY
}

// Basic HTML -> plain text fallback (mirrors the one in ../resend.ts)
function generatePlainText(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\s*\n\s*/g, '\n')
    .trim()
}

// Send a transactional email via the Brevo REST API.
// IMPORTANT: the sender email (EMAIL_FROM) must be a Brevo-verified sender or
// belong to a Brevo-verified domain, otherwise Brevo rejects the request.
export async function sendViaBrevo(options: SendEmailOptions): Promise<EmailSendResult> {
  const apiKey = process?.env?.BREVO_API_KEY

  if (!apiKey) {
    return { success: false, error: 'Brevo is not configured (BREVO_API_KEY missing)' }
  }

  const senderEmail = process?.env?.EMAIL_FROM || EMAIL_FROM
  const recipients = (Array.isArray(options.to) ? options.to : [options.to]).map((email) => ({
    email,
  }))

  const payload: Record<string, unknown> = {
    sender: { name: SENDER_NAME, email: senderEmail },
    to: recipients,
    subject: options.subject,
    htmlContent: options.html,
    textContent: options.text || generatePlainText(options.html),
  }

  // Brevo expects replyTo as an object and tags as an array of strings.
  if (options.replyTo) payload.replyTo = { email: options.replyTo }
  if (options.headers) payload.headers = options.headers
  if (options.tags) payload.tags = Object.values(options.tags)

  try {
    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      const error =
        (data && (data.message || data.code)) || `Brevo error (HTTP ${response.status})`
      console.error('Failed to send email via Brevo:', error)
      return { success: false, error: String(error) }
    }

    console.log(`Email sent via Brevo. Message ID: ${data?.messageId}`)
    return { success: true, messageId: data?.messageId }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
    console.error('Exception while sending email via Brevo:', errorMessage)
    return { success: false, error: errorMessage }
  }
}
