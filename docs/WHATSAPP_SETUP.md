# WhatsApp Business Integration Setup Guide

This document describes how to set up WhatsApp Business API for the Apartmani Jovca booking system.

## Overview

The WhatsApp integration allows you to:
- Send booking confirmations to guests
- Notify staff of new booking requests
- Send check-in instructions and reminders
- Request reviews after checkout
- Handle payment reminders

## Prerequisites

1. A Meta Developer Account
2. A Facebook Business Account verified
3. A phone number that hasn't been used on WhatsApp before (or can be migrated)

## Setup Steps

### Step 1: Create a Meta Developer Account

1. Go to [developers.facebook.com](https://developers.facebook.com/)
2. Click "My Apps" → "Create App"
3. Select "Other" → "Business"
4. Fill in your business details
5. Add "WhatsApp" as a product

### Step 2: Configure WhatsApp Business Account

1. In the WhatsApp product setup, you'll get:
   - **Phone Number ID** - Your WhatsApp business phone number ID
   - **Business Account ID** - Your business account identifier
   - **Temporary Access Token** - For testing (expires in 24h)

2. Set up a permanent access token:
   - Go to App Settings → Advanced → Upgrade
   - Generate a permanent access token with `whatsapp_business_management` and `whatsapp_business_messaging` permissions

### Step 3: Configure Environment Variables

Add the following to your `.env.local` file:

```env
# WhatsApp Cloud API Configuration
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
WHATSAPP_ACCESS_TOKEN=your_permanent_access_token
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_secure_verification_token
WHATSAPP_ADMIN_PHONE=+381652378080
WHATSAPP_API_URL=https://graph.facebook.com/v21.0
```

**Variable Descriptions:**

| Variable | Description | Example |
|----------|-------------|---------|
| `WHATSAPP_PHONE_NUMBER_ID` | Your WhatsApp business phone number ID | `123456789012345` |
| `WHATSAPP_BUSINESS_ACCOUNT_ID` | Your business account ID | `987654321098765` |
| `WHATSAPP_ACCESS_TOKEN` | Permanent access token from Meta | `EAAG...` |
| `WHATSAPP_WEBHOOK_VERIFY_TOKEN` | Secret token for webhook verification | `apartmani-jovca-whatsapp-verification` |
| `WHATSAPP_ADMIN_PHONE` | Admin phone for notifications | `+381652378080` |
| `WHATSAPP_API_URL` | WhatsApp API endpoint | `https://graph.facebook.com/v21.0` |

### Step 4: Configure Webhook

1. Go to the WhatsApp → Configuration in Meta Developer Portal
2. Click "Edit" next to Callback URL
3. Enter your webhook URL: `https://your-domain.com/api/whatsapp`
4. Enter the verification token you set in `.env.local`
5. Click "Verify and Save"
6. Subscribe to the following webhook fields:
   - `messages` - Incoming and outgoing messages
   - `message_template_status` - Template status updates
   - `messages_sent` - Delivery status
   - `messages_delivered` - Read receipts

### Step 5: Create Message Templates

For the WhatsApp integration to work properly, you need to create templates in WhatsApp Business Manager:

1. Go to [business.facebook.com](https://business.facebook.com/)
2. Select your business account
3. Go to Account Tools → Message Templates
4. Create templates with these exact names:

#### Template: booking_confirmation
```
Hello {{1}}, your booking at Apartmani Jovča is confirmed!

Apartment: {{2}}
Check-in: {{3}}
Check-out: {{4}}
Booking #: {{5}}
Total: {{6}}

We look forward to welcoming you!
```

#### Template: booking_cancelled
```
Hello {{1}}, your booking has been cancelled.

Booking #: {{2}}
Apartment: {{3}}
{{4}}

Please contact us if you have any questions.
```

#### Template: booking_reminder
```
Hello {{1}}, your arrival is in {{2}} days!

Apartment: {{3}}
Check-in: {{4}}

See you soon!
```

#### Template: check_in_instructions
```
Hello {{1}}, here are your check-in details:

Apartment: {{2}}
Check-in: {{3}}
Check-in time: {{4}}
Address: {{5}}
Contact: {{6}}

See you soon!
```

#### Template: check_out_reminder
```
Hello {{1}}, we hope you enjoyed your stay!

Check-out: {{2}}
Check-out time: {{3}}

Safe travels!
```

#### Template: review_request
```
Hello {{1}}, how was your stay at {{2}}?

Leave a review: {{3}}

Thank you for choosing Apartmani Jovča!
```

#### Template: payment_received
```
Hello {{1}}, we received your payment!

Amount: {{2}}
Booking #: {{3}}

Thank you!
```

#### Template: payment_reminder
```
Hello {{1}}, this is a reminder about your booking.

Booking #: {{2}}
Amount due: {{3}}
Due date: {{4}}

Please complete your payment to confirm your booking.
```

### Step 6: Testing

Test your WhatsApp integration:

1. Start the development server
2. Make a test booking through the website
3. Check if the WhatsApp message is received

Or use curl to test directly:

```bash
curl -X POST https://your-domain.com/api/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "action": "send",
    "type": "text",
    "to": "+381651234567",
    "message": "Test message from Apartmani Jovca WhatsApp integration!"
  }'
```

## Using the WhatsApp API

### Send a Text Message

```javascript
import { sendMessage } from '@/lib/whatsapp/service'

await sendMessage('+381651234567', 'Hello from Apartmani Jovca!')
```

### Send a Booking Confirmation

```javascript
import { sendBookingConfirmation } from '@/lib/whatsapp/service'

await sendBookingConfirmation(
  {
    bookingId: '123',
    bookingNumber: 'BJ-2024-001',
    checkIn: '2024-06-15',
    checkOut: '2024-06-20',
    totalPrice: 500,
    currency: 'EUR',
    apartment: { id: '1', name: 'Apartment 1' }
  },
  {
    name: 'John Doe',
    phone: '+381651234567',
    language: 'en'
  }
)
```

### Send via API Endpoint

```javascript
const response = await fetch('/api/whatsapp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'send',
    type: 'booking_confirmation',
    to: '+381651234567',
    bookingData: { /* booking data */ },
    guestData: { /* guest data */ }
  })
})
```

## Troubleshooting

### Messages Not Sending

1. Check if the phone number is verified on WhatsApp
2. Verify the access token hasn't expired
3. Check the template is approved by Meta

### Webhook Not Receiving Events

1. Verify the webhook URL is publicly accessible
2. Check the verification token matches
3. Ensure SSL certificate is valid

### Template Rejected

1. Ensure templates follow WhatsApp Business policies
2. Avoid promotional content in transactional templates
3. Use proper variable placeholders {{1}}, {{2}}, etc.

## Security Considerations

1. **Never expose access tokens** in client-side code
2. **Rotate access tokens** periodically
3. **Use secure verification tokens** for webhooks
4. **Validate incoming webhook signatures** in production

## Rate Limits

WhatsApp Cloud API has rate limits:
- 1,000 messages per second per phone number
- 250 unique customer conversations per day (free tier)

## Support

For issues with the WhatsApp Business API:
- [WhatsApp Business Documentation](https://developers.facebook.com/docs/whatsapp)
- [Meta Developer Support](https://developers.facebook.com/support)
