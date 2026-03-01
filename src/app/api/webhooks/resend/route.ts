import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// Helper function to get Supabase client (lazy initialization)
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, supabaseKey)
}

// Resend webhook event types
type ResendEventType =
  | 'email.sent'
  | 'email.delivered'
  | 'email.delivery_delayed'
  | 'email.complained'
  | 'email.bounced'
  | 'email.opened'
  | 'email.clicked'

interface ResendWebhookPayload {
  type: ResendEventType
  created_at: string
  data: {
    email_id: string
    from: string
    to: string[]
    subject: string
    created_at: string
    [key: string]: any
  }
}

/**
 * Verify webhook signature from Resend
 * @param payload - Raw request body
 * @param signature - Signature from x-resend-signature header
 * @param secret - Webhook signing secret
 */
function verifyWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature || !secret) {
    return false
  }

  try {
    const hmac = crypto.createHmac('sha256', secret)
    const digest = hmac.update(payload).digest('hex')
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))
  } catch (error) {
    console.error('Error verifying webhook signature:', error)
    return false
  }
}

/**
 * Extract booking ID from email subject or tags
 * Looks for patterns like "Booking #123" or booking ID in tags
 */
function extractBookingId(payload: ResendWebhookPayload): string | null {
  // Try to extract from subject
  const subjectMatch = payload.data.subject?.match(/booking[#\s-]*([a-f0-9-]{36})/i)
  if (subjectMatch) {
    return subjectMatch[1]
  }

  // Try to extract from tags if available
  if (payload.data.tags && Array.isArray(payload.data.tags)) {
    const bookingTag = payload.data.tags.find((tag: any) => 
      tag.name === 'booking_id' || tag.name === 'bookingId'
    )
    if (bookingTag) {
      return bookingTag.value
    }
  }

  return null
}

/**
 * POST /api/webhooks/resend
 * Receives webhook events from Resend and stores them in the database
 */
export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text()
    const signature = request.headers.get('x-resend-signature')
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET

    // Verify webhook signature if secret is configured
    if (webhookSecret) {
      const isValid = verifyWebhookSignature(rawBody, signature, webhookSecret)
      if (!isValid) {
        console.error('Invalid webhook signature')
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        )
      }
    } else {
      console.warn('RESEND_WEBHOOK_SECRET not configured - skipping signature verification')
    }

    // Parse the webhook payload
    const payload: ResendWebhookPayload = JSON.parse(rawBody)

    // Log the event
    console.log(`Received Resend webhook: ${payload.type} for email ${payload.data.email_id}`)

    // Extract booking ID if available
    const bookingId = extractBookingId(payload)

    // Get Supabase client
    const supabase = getSupabaseClient()

    // Store the event in the database
    const { data, error } = await supabase
      .from('email_events')
      .insert({
        event_id: payload.data.email_id,
        event_type: payload.type,
        email_to: payload.data.to[0], // Store first recipient
        email_from: payload.data.from,
        email_subject: payload.data.subject,
        booking_id: bookingId,
        payload: payload as any,
      })
      .select()
      .single()

    if (error) {
      // If duplicate event_id, update the existing record
      if (error.code === '23505') {
        const { error: updateError } = await supabase
          .from('email_events')
          .update({
            event_type: payload.type,
            payload: payload as any,
            updated_at: new Date().toISOString(),
          })
          .eq('event_id', payload.data.email_id)

        if (updateError) {
          console.error('Error updating email event:', updateError)
          return NextResponse.json(
            { error: 'Failed to update event' },
            { status: 500 }
          )
        }

        console.log(`Updated existing email event: ${payload.data.email_id}`)
        return NextResponse.json({ success: true, updated: true })
      }

      console.error('Error storing email event:', error)
      return NextResponse.json(
        { error: 'Failed to store event' },
        { status: 500 }
      )
    }

    console.log(`Stored email event: ${data.id}`)
    return NextResponse.json({ success: true, id: data.id })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/webhooks/resend
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Resend webhook endpoint is active',
    timestamp: new Date().toISOString(),
  })
}
