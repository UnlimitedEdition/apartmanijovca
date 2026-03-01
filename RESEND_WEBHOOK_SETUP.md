# Resend Webhook Setup Guide

This guide explains how to set up Resend webhooks to track email delivery events (sent, delivered, opened, bounced, etc.) in your Supabase database.

## 📋 Overview

The webhook integration allows you to:
- Track email delivery status in real-time
- Monitor email opens and clicks
- Detect bounces and complaints
- Link email events to booking records
- Debug email delivery issues

## 🗄️ Database Setup

### Step 1: Apply Migration

The `email_events` table has been created via migration. To apply it:

```bash
# If using Supabase CLI locally
supabase db push

# Or apply directly in Supabase Dashboard:
# 1. Go to SQL Editor
# 2. Copy contents of supabase/migrations/20260301_create_email_events_table.sql
# 3. Run the query
```

### Table Structure

```sql
email_events (
  id UUID PRIMARY KEY,
  event_id TEXT UNIQUE,           -- Resend email ID
  event_type TEXT,                -- email.sent, email.delivered, etc.
  email_to TEXT,                  -- Recipient email
  email_from TEXT,                -- Sender email
  email_subject TEXT,             -- Email subject
  booking_id UUID,                -- Link to bookings table (if applicable)
  payload JSONB,                  -- Full webhook payload
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

## 🔧 Resend Dashboard Setup

### Step 2: Get Your Webhook URL

Your webhook endpoint is:
```
https://apartmani-jovca.vercel.app/api/webhooks/resend
```

### Step 3: Create Webhook in Resend

1. Go to [Resend Dashboard](https://resend.com/webhooks)
2. Click "Create Webhook"
3. Enter webhook details:
   - **Endpoint URL**: `https://apartmani-jovca.vercel.app/api/webhooks/resend`
   - **Events to track** (select all that apply):
     - ✅ `email.sent` - Email was accepted by Resend
     - ✅ `email.delivered` - Email was delivered to recipient
     - ✅ `email.delivery_delayed` - Delivery was delayed
     - ✅ `email.bounced` - Email bounced (hard or soft)
     - ✅ `email.complained` - Recipient marked as spam
     - ✅ `email.opened` - Recipient opened the email
     - ✅ `email.clicked` - Recipient clicked a link
   - **Status**: Enabled

4. Click "Create Webhook"
5. **IMPORTANT**: Copy the "Signing Secret" (starts with `whsec_...`)

### Step 4: Add Signing Secret to Vercel

The signing secret is used to verify that webhooks are actually from Resend.

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `apartmani-jovca`
3. Go to Settings → Environment Variables
4. Add new variable:
   - **Name**: `RESEND_WEBHOOK_SECRET`
   - **Value**: `whsec_...` (paste the signing secret from Resend)
   - **Environment**: Production (and Preview if needed)
5. Click "Save"
6. **Redeploy** your application for the changes to take effect

### Step 5: Update .env.local (for local testing)

Add to your `.env.local` file:
```env
RESEND_WEBHOOK_SECRET=whsec_your_signing_secret_here
```

## 🧪 Testing the Webhook

### Test 1: Health Check

```bash
curl https://apartmani-jovca.vercel.app/api/webhooks/resend
```

Expected response:
```json
{
  "status": "ok",
  "message": "Resend webhook endpoint is active",
  "timestamp": "2026-03-01T..."
}
```

### Test 2: Send Test Email

Send a test email through your booking system or contact form, then check:

1. **Resend Dashboard** → Webhooks → Your webhook → Recent deliveries
2. **Supabase Dashboard** → Table Editor → `email_events`

You should see events appearing in the database.

### Test 3: Manual Webhook Test (Resend Dashboard)

1. Go to Resend Dashboard → Webhooks
2. Click on your webhook
3. Click "Send test event"
4. Select event type (e.g., `email.sent`)
5. Click "Send"
6. Check Supabase `email_events` table for the test event

## 📊 Viewing Email Events

### Option 1: Supabase Dashboard

1. Go to Supabase Dashboard
2. Table Editor → `email_events`
3. View all events with filters

### Option 2: SQL Query

```sql
-- Recent email events
SELECT 
  event_type,
  email_to,
  email_subject,
  created_at
FROM email_events
ORDER BY created_at DESC
LIMIT 20;

-- Events by type
SELECT 
  event_type,
  COUNT(*) as count
FROM email_events
GROUP BY event_type
ORDER BY count DESC;

-- Events for specific booking
SELECT 
  event_type,
  email_to,
  email_subject,
  created_at
FROM email_events
WHERE booking_id = 'your-booking-uuid'
ORDER BY created_at DESC;

-- Bounced emails
SELECT 
  email_to,
  email_subject,
  payload->>'data'->>'bounce_type' as bounce_type,
  created_at
FROM email_events
WHERE event_type = 'email.bounced'
ORDER BY created_at DESC;
```

### Option 3: Admin Panel (Future Enhancement)

You can create an admin page at `/admin/emails` to view email events with a nice UI.

## 🔍 Event Types Explained

| Event Type | Description | When It Fires |
|------------|-------------|---------------|
| `email.sent` | Email accepted by Resend | Immediately after sending |
| `email.delivered` | Email delivered to recipient's server | Usually within seconds/minutes |
| `email.delivery_delayed` | Delivery delayed (temporary issue) | When recipient server is slow |
| `email.bounced` | Email bounced (invalid address, full inbox) | When delivery fails permanently |
| `email.complained` | Recipient marked as spam | When user clicks "Report Spam" |
| `email.opened` | Recipient opened the email | When email is opened (requires tracking pixel) |
| `email.clicked` | Recipient clicked a link | When any link in email is clicked |

## 🔐 Security Features

### Signature Verification

The webhook endpoint verifies that requests are from Resend using HMAC-SHA256 signature verification:

1. Resend signs each webhook with your signing secret
2. The endpoint verifies the signature before processing
3. Invalid signatures are rejected with 401 Unauthorized

### RLS (Row Level Security)

The `email_events` table has RLS enabled:
- Only admin users (apartmanijovca@gmail.com) can view events
- No public access to email event data

## 🐛 Troubleshooting

### Webhook Not Receiving Events

1. **Check webhook status** in Resend Dashboard
   - Should be "Enabled"
   - Check "Recent deliveries" for errors

2. **Verify endpoint URL**
   - Must be: `https://apartmani-jovca.vercel.app/api/webhooks/resend`
   - Must use HTTPS (not HTTP)

3. **Check Vercel logs**
   ```bash
   vercel logs apartmani-jovca --follow
   ```

4. **Test endpoint manually**
   ```bash
   curl https://apartmani-jovca.vercel.app/api/webhooks/resend
   ```

### Signature Verification Failing

1. **Check signing secret** in Vercel environment variables
   - Must match the secret from Resend Dashboard
   - Must start with `whsec_`

2. **Redeploy** after adding environment variable
   ```bash
   vercel --prod
   ```

3. **Check logs** for signature errors
   - Look for "Invalid webhook signature" messages

### Events Not Appearing in Database

1. **Check Supabase connection**
   - Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
   - Verify `NEXT_SERVICE_ROLE_KEY` is set

2. **Check table exists**
   ```sql
   SELECT * FROM email_events LIMIT 1;
   ```

3. **Check for errors** in Vercel logs
   - Look for database insertion errors

### Duplicate Events

The webhook handles duplicate events automatically:
- If an event with the same `event_id` already exists, it updates the record
- This prevents duplicate entries if Resend retries the webhook

## 📈 Monitoring Best Practices

1. **Set up alerts** for bounced emails
   - High bounce rate may indicate email list issues

2. **Monitor delivery rates**
   - Track `email.delivered` vs `email.sent` ratio

3. **Check for spam complaints**
   - `email.complained` events should be rare

4. **Track open rates** (optional)
   - `email.opened` events show engagement

## 🔄 Webhook Retry Logic

Resend automatically retries failed webhooks:
- Retries up to 3 times
- Exponential backoff between retries
- Marks webhook as failed after 3 attempts

Your endpoint returns:
- `200 OK` - Event processed successfully
- `401 Unauthorized` - Invalid signature
- `500 Internal Server Error` - Processing failed (will retry)

## 📝 Next Steps

1. ✅ Apply database migration
2. ✅ Create webhook in Resend Dashboard
3. ✅ Add signing secret to Vercel
4. ✅ Test webhook with real email
5. ⏳ (Optional) Create admin UI to view events
6. ⏳ (Optional) Set up email alerts for critical events

## 🆘 Need Help?

- **Resend Documentation**: https://resend.com/docs/webhooks
- **Supabase Documentation**: https://supabase.com/docs
- **Vercel Documentation**: https://vercel.com/docs

---

**Last Updated**: March 1, 2026
**Status**: Ready for production use
