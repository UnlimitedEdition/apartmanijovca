import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { processScheduledEmails } from '@/lib/email/triggers'

// Daily cleanup cron (configured in vercel.json: "0 7 * * *" = 07:00 UTC ≈ 09:00 CEST / 08:00 CET — jutro po srpskom).
// Enforces GDPR storage limitation + clears stale operational rows.
//
// Auth: when CRON_SECRET is set, Vercel sends `Authorization: Bearer <secret>`.
// We verify it so the endpoint cannot be triggered by arbitrary callers.

export const dynamic = 'force-dynamic'

// Retention windows
const RATE_LIMIT_STALE_DAYS = 7
const ANALYTICS_RETENTION_DAYS = 365
const BOOKING_PII_RETENTION_DAYS = 365 * 3 // 3 years, per the consent disclosure

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (secret) {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: 'Service role not configured' },
      { status: 503 }
    )
  }

  const now = Date.now()
  const result: Record<string, unknown> = {}

  try {
    // 1) Drop stale rate-limit rows (they hold IP/email/fingerprint identifiers).
    const rateLimitCutoff = new Date(
      now - RATE_LIMIT_STALE_DAYS * 24 * 60 * 60 * 1000
    ).toISOString()
    const { error: rlError } = await supabaseAdmin
      .from('booking_rate_limits')
      .delete()
      .lt('last_attempt_at', rateLimitCutoff)
    result.rateLimits = rlError ? `error: ${rlError.message}` : 'ok'

    // 2) Drop old analytics events.
    const analyticsCutoff = new Date(
      now - ANALYTICS_RETENTION_DAYS * 24 * 60 * 60 * 1000
    ).toISOString()
    const { error: aError } = await supabaseAdmin
      .from('analytics_events')
      .delete()
      .lt('created_at', analyticsCutoff)
    result.analytics = aError ? `error: ${aError.message}` : 'ok'

    // 3) Anonymize booking security metadata older than the retention window.
    //    We keep the booking record (financial/legal) but strip the tracking PII.
    const piiCutoff = new Date(
      now - BOOKING_PII_RETENTION_DAYS * 24 * 60 * 60 * 1000
    ).toISOString()
    const { error: bError } = await supabaseAdmin
      .from('bookings')
      .update({ ip_address: null, user_agent: null, fingerprint: null })
      .lt('created_at', piiCutoff)
      .not('ip_address', 'is', null)
    result.bookingPii = bError ? `error: ${bError.message}` : 'ok'

    // 4) Send scheduled guest emails (check-in instructions, pre-arrival reminders, review requests).
    try {
      result.scheduledEmails = await processScheduledEmails()
    } catch (e) {
      result.scheduledEmails = `error: ${e instanceof Error ? e.message : 'unknown'}`
    }

    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    console.error('[Cron cleanup] error:', error)
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 })
  }
}
