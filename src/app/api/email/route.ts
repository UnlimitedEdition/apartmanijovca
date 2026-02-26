import { NextRequest, NextResponse } from 'next/server'
import { isResendConfigured, logEmailEvent, EMAIL_CONFIG } from '@/lib/resend'
import { sendEmailByType } from '@/lib/email/service'
import { EmailType } from '@/lib/email/types'

// POST /api/email - Send an email
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, bookingId, bookingData, guestData, additionalOptions } = body

    // Validate required fields
    if (!type || !bookingId || !bookingData || !guestData) {
      return NextResponse.json(
        { error: 'Missing required fields: type, bookingId, bookingData, guestData' },
        { status: 400 }
      )
    }

    // Validate email type
    const validTypes: EmailType[] = [
      'booking_confirmation',
      'booking_request',
      'check_in_instructions',
      'pre_arrival_reminder',
      'review_request',
    ]

    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid email type. Valid types: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Check if Resend is configured
    if (!isResendConfigured()) {
      // In development/missing API key, just log and return success
      logEmailEvent('send_attempt', {
        emailType: type,
        recipient: guestData.email,
        bookingId,
      })
      
      console.log('[Email API] Mock send:', { type, bookingId, guestData })
      
      return NextResponse.json({
        success: true,
        messageId: `mock-${Date.now()}`,
        mock: true,
        message: 'Email service not configured - running in mock mode',
      })
    }

    // Get language, default to English
    // const emailLanguage: EmailLanguage = language || guestData.language || 'en'

    // Send the email
    const result = await sendEmailByType(
      type,
      {
        ...bookingData,
        bookingId,
      },
      guestData,
      additionalOptions
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send email' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
    })
  } catch (error) {
    console.error('[Email API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/email - Health check or get email status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')

  // Return email service status
  if (action === 'status') {
    return NextResponse.json({
      configured: isResendConfigured(),
      fromEmail: EMAIL_CONFIG.fromEmail,
      adminEmail: EMAIL_CONFIG.adminEmail,
      supportPhone: EMAIL_CONFIG.supportPhone,
    })
  }

  // Default: Return API info
  return NextResponse.json({
    service: 'Apartmani Jovca Email API',
    version: '1.0.0',
    status: isResendConfigured() ? 'active' : 'mock',
    endpoints: {
      POST: {
        description: 'Send an email',
        body: {
          type: 'EmailType (booking_confirmation, booking_request, check_in_instructions, pre_arrival_reminder, review_request)',
          bookingId: 'string',
          bookingData: 'object',
          guestData: 'object',
          language: 'optional (sr, en, de, it)',
        },
      },
      GET: {
        actions: {
          status: 'Get email service status',
        },
      },
    },
  })
}
