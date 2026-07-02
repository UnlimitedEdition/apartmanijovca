// Trajno beleženje neuspešnih slanja mejlova u `email_events` tabelu,
// da propalo slanje ne ostane samo u efemernom Vercel logu.

import { randomUUID } from 'crypto'
import { supabaseAdmin } from '../supabase'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export interface EmailFailureDetails {
  emailType?: string
  recipient: string
  subject?: string
  bookingId?: string
  error: string
}

/**
 * Upiši neuspešno slanje u `email_events` (event_type: 'send_failure').
 * Nikad ne baca — logovanje ne sme da obori slanje/booking tok.
 */
export async function recordEmailFailure(details: EmailFailureDetails): Promise<void> {
  if (!supabaseAdmin) {
    console.error('[Email] Cannot persist send failure (no admin client):', details)
    return
  }

  try {
    const { error } = await supabaseAdmin.from('email_events').insert({
      event_id: `send-failure-${randomUUID()}`,
      event_type: 'send_failure',
      email_to: details.recipient,
      email_subject: details.subject ?? null,
      // FK ka bookings(id) — upiši samo validan UUID (ručni API pozivi mogu poslati bilo šta)
      booking_id: details.bookingId && UUID_REGEX.test(details.bookingId) ? details.bookingId : null,
      payload: {
        source: 'internal_send',
        emailType: details.emailType ?? null,
        recipient: details.recipient,
        error: details.error,
        timestamp: new Date().toISOString(),
      },
    })

    if (error) {
      console.error('[Email] Failed to persist send failure:', error.message, details)
    }
  } catch (err) {
    console.error('[Email] Exception while persisting send failure:', err, details)
  }
}
