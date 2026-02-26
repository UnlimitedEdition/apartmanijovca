-- Add timestamp columns for checked_in and checked_out statuses
-- These columns track when guests actually check in and check out

-- Add checked_in_at column
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMPTZ;

-- Add checked_out_at column  
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS checked_out_at TIMESTAMPTZ;

-- Add comments
COMMENT ON COLUMN bookings.checked_in_at IS 'Timestamp when guest checked in (status changed to checked_in)';
COMMENT ON COLUMN bookings.checked_out_at IS 'Timestamp when guest checked out (status changed to checked_out)';
