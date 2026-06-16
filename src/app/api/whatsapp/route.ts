// WhatsApp API Routes
// Handles sending messages and webhook endpoints for WhatsApp Business API

/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { 
  sendMessage, 
  sendTemplateMessage,
  sendBookingConfirmation,
  sendBookingRequest,
  sendBookingCancellation,
  sendBookingReminder,
  sendCheckInInstructions,
  sendCheckOutReminder,
  sendReviewRequest,
  sendPaymentReceived,
  sendPaymentReminder,
  isWhatsAppConfigured
} from '@/lib/whatsapp/service'
import { requireAdmin } from '@/lib/auth/require-admin'

// GET handler for webhook verification
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  // Verify the webhook
  if (mode === 'subscribe' && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    console.log('[WhatsApp Webhook] Verified successfully')
    return new NextResponse(challenge, { status: 200 })
  }

  console.log('[WhatsApp Webhook] Verification failed')
  return new NextResponse('Verification failed', { status: 403 })
}

// POST handler for incoming webhooks and sending messages
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || ''

    // Parse the body exactly once (the request stream can only be read once).
    let body: any = {}
    if (contentType.includes('application/json')) {
      body = await request.json()
    }

    // Handle WhatsApp webhook (called by Meta — must stay public, no admin cookie).
    if (body.object === 'whatsapp_business_account' || body.object === 'whatsapp') {
      // Process webhook entries
      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          const value = change.value

          // Handle incoming messages (PII redacted from logs)
          if (value.messages && value.messages.length > 0) {
            for (const message of value.messages) {
              console.log('[WhatsApp Webhook] Received message:', {
                type: message.type,
              })

              // You can process incoming messages here
              // For example, store them in the database or respond automatically
            }
          }

          // Handle status updates (delivery/read receipts)
          if (value.statuses && value.statuses.length > 0) {
            for (const status of value.statuses) {
              console.log('[WhatsApp Webhook] Status update:', {
                id: status.id,
                status: status.status,
                timestamp: status.timestamp,
              })
            }
          }
        }
      }

      return NextResponse.json({ success: true }, { status: 200 })
    }

    // Handle sending messages — admin only (prevents spam through the Business account).
    if (body.action === 'send') {
      const denied = await requireAdmin(request)
      if (denied) return denied
      return handleSendMessage(body)
    }

    // If no recognized action, return error
    return NextResponse.json(
      { success: false, error: 'Unknown request type' },
      { status: 400 }
    )

  } catch (error) {
    console.error('[WhatsApp API] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle send message requests
async function handleSendMessage(data: {
  type: string
  to: string
  message?: string
  templateName?: string
  templateData?: Record<string, string>
  language?: string
  bookingData?: {
    bookingId: string
    bookingNumber: string
    checkIn: string
    checkOut: string
    totalPrice: number
    currency: string
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
  guestData?: {
    name: string
    phone: string
    email?: string
    language?: string
  }
  options?: Record<string, unknown>
}) {
  const { 
    type, 
    to, 
    message, 
    templateName, 
    templateData, 
    language = 'en',
    bookingData,
    guestData,
    options 
  } = data

  // Validate required fields
  if (!to) {
    return NextResponse.json(
      { success: false, error: 'Recipient phone number is required' },
      { status: 400 }
    )
  }

  // Check if WhatsApp is configured
  if (!isWhatsAppConfigured()) {
    console.log('[WhatsApp API] Sending mock message (not configured):', {
      type,
      to,
      message,
    })
    return NextResponse.json({
      success: true,
      messageId: `mock-${Date.now()}`,
      status: 'sent',
      mock: true,
    })
  }

  try {
    let result

    switch (type) {
      // Simple text message
      case 'text':
        if (!message) {
          return NextResponse.json(
            { success: false, error: 'Message content is required for text messages' },
            { status: 400 }
          )
        }
        result = await sendMessage(to, message)
        break

      // Template message
      case 'template':
        if (!templateName) {
          return NextResponse.json(
            { success: false, error: 'Template name is required for template messages' },
            { status: 400 }
          )
        }
        // Import template functions dynamically to avoid issues
        const { getTemplateMessage } = await import('@/lib/whatsapp/templates')
        const template = getTemplateMessage(
          templateName as any, 
          language as any, 
          templateData || {}
        )
        result = await sendTemplateMessage(to, template as any)
        break

      // Booking-specific notifications
      case 'booking_confirmation':
        if (!bookingData || !guestData) {
          return NextResponse.json(
            { success: false, error: 'Booking and guest data are required' },
            { status: 400 }
          )
        }
        result = await sendBookingConfirmation(bookingData, guestData as any)
        break

      case 'booking_request':
        if (!bookingData || !guestData) {
          return NextResponse.json(
            { success: false, error: 'Booking and guest data are required' },
            { status: 400 }
          )
        }
        result = await sendBookingRequest(bookingData, guestData as any)
        break

      case 'booking_cancelled':
        if (!bookingData || !guestData) {
          return NextResponse.json(
            { success: false, error: 'Booking and guest data are required' },
            { status: 400 }
          )
        }
        result = await sendBookingCancellation(
          bookingData, 
          guestData as any, 
          options?.reason as string | undefined
        )
        break

      case 'booking_reminder':
        if (!bookingData || !guestData) {
          return NextResponse.json(
            { success: false, error: 'Booking and guest data are required' },
            { status: 400 }
          )
        }
        result = await sendBookingReminder(
          bookingData, 
          guestData as any, 
          (options?.daysUntilArrival as number) || 3
        )
        break

      case 'check_in_instructions':
        if (!bookingData || !guestData) {
          return NextResponse.json(
            { success: false, error: 'Booking and guest data are required' },
            { status: 400 }
          )
        }
        result = await sendCheckInInstructions(bookingData, guestData as any, options as any)
        break

      case 'check_out_reminder':
        if (!bookingData || !guestData) {
          return NextResponse.json(
            { success: false, error: 'Booking and guest data are required' },
            { status: 400 }
          )
        }
        result = await sendCheckOutReminder(bookingData, guestData as any)
        break

      case 'review_request':
        if (!bookingData || !guestData) {
          return NextResponse.json(
            { success: false, error: 'Booking and guest data are required' },
            { status: 400 }
          )
        }
        result = await sendReviewRequest(
          bookingData, 
          guestData as any, 
          options?.reviewUrl as string | undefined
        )
        break

      case 'payment_received':
        if (!bookingData || !guestData) {
          return NextResponse.json(
            { success: false, error: 'Booking and guest data are required' },
            { status: 400 }
          )
        }
        result = await sendPaymentReceived(
          bookingData, 
          guestData as any, 
          (options?.amount as number) || bookingData.totalPrice
        )
        break

      case 'payment_reminder':
        if (!bookingData || !guestData) {
          return NextResponse.json(
            { success: false, error: 'Booking and guest data are required' },
            { status: 400 }
          )
        }
        result = await sendPaymentReminder(
          bookingData, 
          guestData as any, 
          (options?.amountDue as number) || bookingData.totalPrice
        )
        break

      default:
        return NextResponse.json(
          { success: false, error: `Unknown message type: ${type}` },
          { status: 400 }
        )
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        status: result.status,
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
      }, { status: 500 })
    }

  } catch (error) {
    console.error('[WhatsApp API] Send error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
