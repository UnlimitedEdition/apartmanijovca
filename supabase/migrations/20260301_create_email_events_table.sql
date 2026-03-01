-- Create email_events table for tracking Resend webhook events
CREATE TABLE IF NOT EXISTS email_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  email_to TEXT NOT NULL,
  email_from TEXT,
  email_subject TEXT,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_events_event_type ON email_events(event_type);
CREATE INDEX IF NOT EXISTS idx_email_events_email_to ON email_events(email_to);
CREATE INDEX IF NOT EXISTS idx_email_events_booking_id ON email_events(booking_id);
CREATE INDEX IF NOT EXISTS idx_email_events_created_at ON email_events(created_at DESC);

-- Enable RLS
ALTER TABLE email_events ENABLE ROW LEVEL SECURITY;

-- Admin-only access policy
CREATE POLICY "Admin can view all email events"
  ON email_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'apartmanijovca@gmail.com'
    )
  );

-- Add comment
COMMENT ON TABLE email_events IS 'Stores webhook events from Resend email service';
