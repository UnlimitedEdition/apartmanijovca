// src/lib/rate-limiting/service.ts

import { supabaseAdmin } from '../supabase'

export interface RateLimitCheck {
  allowed: boolean
  reason?: string
  blockedUntil?: Date
  attemptsRemaining?: number
}

export interface RateLimitConfig {
  ip: { maxAttempts: number; windowMinutes: number; blockMinutes: number }
  email: { maxAttempts: number; windowMinutes: number; blockMinutes: number }
  fingerprint: { maxAttempts: number; windowMinutes: number; blockMinutes: number }
}

/**
 * Check if a booking attempt is allowed based on rate limiting
 * Uses the database function check_booking_rate_limit()
 */
export async function checkRateLimit(
  ipAddress: string,
  email: string,
  fingerprint: string
): Promise<RateLimitCheck> {
  if (!supabaseAdmin) {
    console.error('[Rate Limit] Admin client not available')
    // Fail open - allow the request if we can't check rate limits
    return { allowed: true }
  }

  try {
    // Call the database function to check all three identifiers
    const { data, error } = await supabaseAdmin.rpc('check_booking_rate_limit', {
      p_ip_address: ipAddress,
      p_email: email,
      p_fingerprint: fingerprint
    })

    if (error) {
      console.error('[Rate Limit] Database error:', error)
      // Fail open - allow the request if there's a database error
      return { allowed: true }
    }

    // Database function returns true if allowed, false if blocked
    const allowed = data === true

    if (!allowed) {
      // Check which identifier is blocked to provide specific feedback
      const blockInfo = await getBlockInfo(ipAddress, email, fingerprint)
      return {
        allowed: false,
        reason: blockInfo.reason,
        blockedUntil: blockInfo.blockedUntil
      }
    }

    return { allowed: true }
  } catch (error) {
    console.error('[Rate Limit] Unexpected error:', error)
    // Fail open - allow the request on unexpected errors
    return { allowed: true }
  }
}

/**
 * Get detailed information about which identifier is blocked
 */
async function getBlockInfo(
  ipAddress: string,
  email: string,
  fingerprint: string
): Promise<{ reason: string; blockedUntil?: Date }> {
  if (!supabaseAdmin) {
    return { reason: 'Rate limit exceeded. Please try again later.' }
  }

  try {
    const now = new Date()

    // Check IP
    const { data: ipData } = await supabaseAdmin
      .from('booking_rate_limits')
      .select('blocked_until, attempt_count')
      .eq('identifier', ipAddress)
      .eq('identifier_type', 'ip')
      .gt('blocked_until', now.toISOString())
      .single()

    if (ipData?.blocked_until) {
      const blockedUntil = new Date(ipData.blocked_until)
      const minutesLeft = Math.ceil((blockedUntil.getTime() - now.getTime()) / 60000)
      return {
        reason: `Too many booking attempts from your IP address. Please try again in ${minutesLeft} minutes.`,
        blockedUntil
      }
    }

    // Check Email
    const { data: emailData } = await supabaseAdmin
      .from('booking_rate_limits')
      .select('blocked_until, attempt_count')
      .eq('identifier', email)
      .eq('identifier_type', 'email')
      .gt('blocked_until', now.toISOString())
      .single()

    if (emailData?.blocked_until) {
      const blockedUntil = new Date(emailData.blocked_until)
      const minutesLeft = Math.ceil((blockedUntil.getTime() - now.getTime()) / 60000)
      return {
        reason: `Too many booking attempts with this email address. Please try again in ${minutesLeft} minutes.`,
        blockedUntil
      }
    }

    // Check Fingerprint
    const { data: fpData } = await supabaseAdmin
      .from('booking_rate_limits')
      .select('blocked_until, attempt_count')
      .eq('identifier', fingerprint)
      .eq('identifier_type', 'fingerprint')
      .gt('blocked_until', now.toISOString())
      .single()

    if (fpData?.blocked_until) {
      const blockedUntil = new Date(fpData.blocked_until)
      const minutesLeft = Math.ceil((blockedUntil.getTime() - now.getTime()) / 60000)
      return {
        reason: `Too many booking attempts from your device. Please try again in ${minutesLeft} minutes.`,
        blockedUntil
      }
    }

    return { reason: 'Rate limit exceeded. Please try again later.' }
  } catch (error) {
    console.error('[Rate Limit] Error getting block info:', error)
    return { reason: 'Rate limit exceeded. Please try again later.' }
  }
}

/**
 * Record a successful booking (resets rate limits for this identifier)
 */
export async function recordSuccessfulBooking(
  ipAddress: string,
  email: string,
  fingerprint: string
): Promise<void> {
  if (!supabaseAdmin) return

  try {
    // Delete rate limit records for successful bookings
    await supabaseAdmin
      .from('booking_rate_limits')
      .delete()
      .in('identifier', [ipAddress, email, fingerprint])

    console.log('[Rate Limit] Cleared rate limits after successful booking')
  } catch (error) {
    console.error('[Rate Limit] Error recording successful booking:', error)
    // Non-critical error, don't throw
  }
}

/**
 * Get rate limit status for an identifier (for admin/debugging)
 */
export async function getRateLimitStatus(
  identifier: string,
  type: 'ip' | 'email' | 'fingerprint'
): Promise<{
  attempts: number
  blockedUntil: Date | null
  firstAttempt: Date
  lastAttempt: Date
} | null> {
  if (!supabaseAdmin) return null

  try {
    const { data, error } = await supabaseAdmin
      .from('booking_rate_limits')
      .select('*')
      .eq('identifier', identifier)
      .eq('identifier_type', type)
      .single()

    if (error || !data) return null

    return {
      attempts: data.attempt_count,
      blockedUntil: data.blocked_until ? new Date(data.blocked_until) : null,
      firstAttempt: new Date(data.first_attempt_at),
      lastAttempt: new Date(data.last_attempt_at)
    }
  } catch (error) {
    console.error('[Rate Limit] Error getting status:', error)
    return null
  }
}

/**
 * Manually clear rate limits for an identifier (admin function)
 */
export async function clearRateLimit(
  identifier: string,
  type: 'ip' | 'email' | 'fingerprint'
): Promise<boolean> {
  if (!supabaseAdmin) return false

  try {
    const { error } = await supabaseAdmin
      .from('booking_rate_limits')
      .delete()
      .eq('identifier', identifier)
      .eq('identifier_type', type)

    if (error) {
      console.error('[Rate Limit] Error clearing rate limit:', error)
      return false
    }

    console.log(`[Rate Limit] Cleared rate limit for ${type}: ${identifier}`)
    return true
  } catch (error) {
    console.error('[Rate Limit] Unexpected error clearing rate limit:', error)
    return false
  }
}
