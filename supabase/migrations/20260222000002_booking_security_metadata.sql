-- Add security and metadata tracking for bookings
-- This helps prevent spam and abuse while complying with GDPR

-- Add metadata columns to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS ip_address INET;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS user_agent TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS fingerprint TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS consent_given BOOLEAN DEFAULT false;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS consent_timestamp TIMESTAMPTZ;

-- Create rate limiting table
CREATE TABLE IF NOT EXISTS booking_rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  identifier TEXT NOT NULL, -- IP address or fingerprint
  identifier_type TEXT NOT NULL CHECK (identifier_type IN ('ip', 'fingerprint', 'email')),
  attempt_count INT NOT NULL DEFAULT 1,
  first_attempt_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_attempt_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  blocked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON booking_rate_limits(identifier, identifier_type);
CREATE INDEX IF NOT EXISTS idx_rate_limits_blocked ON booking_rate_limits(blocked_until) WHERE blocked_until IS NOT NULL;

-- Create function to check and update rate limits
CREATE OR REPLACE FUNCTION check_booking_rate_limit(
  p_identifier TEXT,
  p_identifier_type TEXT,
  p_max_attempts INT DEFAULT 5,
  p_window_minutes INT DEFAULT 60,
  p_block_minutes INT DEFAULT 120
) RETURNS JSONB AS $$
DECLARE
  v_record RECORD;
  v_window_start TIMESTAMPTZ;
  v_is_blocked BOOLEAN;
  v_attempts_remaining INT;
BEGIN
  v_window_start := NOW() - (p_window_minutes || ' minutes')::INTERVAL;
  
  -- Get or create rate limit record
  SELECT * INTO v_record
  FROM booking_rate_limits
  WHERE identifier = p_identifier 
    AND identifier_type = p_identifier_type
  FOR UPDATE;
  
  -- Check if currently blocked
  IF v_record.blocked_until IS NOT NULL AND v_record.blocked_until > NOW() THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'rate_limit_exceeded',
      'blocked_until', v_record.blocked_until,
      'attempts_remaining', 0
    );
  END IF;
  
  -- If no record exists, create one
  IF v_record IS NULL THEN
    INSERT INTO booking_rate_limits (identifier, identifier_type, attempt_count, first_attempt_at, last_attempt_at)
    VALUES (p_identifier, p_identifier_type, 1, NOW(), NOW());
    
    RETURN jsonb_build_object(
      'allowed', true,
      'attempts_remaining', p_max_attempts - 1
    );
  END IF;
  
  -- If outside window, reset counter
  IF v_record.first_attempt_at < v_window_start THEN
    UPDATE booking_rate_limits
    SET attempt_count = 1,
        first_attempt_at = NOW(),
        last_attempt_at = NOW(),
        blocked_until = NULL,
        updated_at = NOW()
    WHERE id = v_record.id;
    
    RETURN jsonb_build_object(
      'allowed', true,
      'attempts_remaining', p_max_attempts - 1
    );
  END IF;
  
  -- Increment attempt counter
  UPDATE booking_rate_limits
  SET attempt_count = attempt_count + 1,
      last_attempt_at = NOW(),
      updated_at = NOW()
  WHERE id = v_record.id;
  
  v_attempts_remaining := p_max_attempts - (v_record.attempt_count + 1);
  
  -- Check if limit exceeded
  IF v_record.attempt_count + 1 >= p_max_attempts THEN
    UPDATE booking_rate_limits
    SET blocked_until = NOW() + (p_block_minutes || ' minutes')::INTERVAL,
        updated_at = NOW()
    WHERE id = v_record.id;
    
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'rate_limit_exceeded',
      'blocked_until', NOW() + (p_block_minutes || ' minutes')::INTERVAL,
      'attempts_remaining', 0
    );
  END IF;
  
  RETURN jsonb_build_object(
    'allowed', true,
    'attempts_remaining', v_attempts_remaining
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments
COMMENT ON COLUMN bookings.metadata IS 'Additional metadata (device info, browser, etc.)';
COMMENT ON COLUMN bookings.ip_address IS 'IP address of the user who created the booking';
COMMENT ON COLUMN bookings.user_agent IS 'User agent string of the browser';
COMMENT ON COLUMN bookings.fingerprint IS 'Browser fingerprint for tracking';
COMMENT ON COLUMN bookings.consent_given IS 'Whether user gave consent for data collection';
COMMENT ON COLUMN bookings.consent_timestamp IS 'When consent was given';

COMMENT ON TABLE booking_rate_limits IS 'Rate limiting for booking requests to prevent spam';
COMMENT ON FUNCTION check_booking_rate_limit IS 'Check if identifier is rate limited and update counters';
