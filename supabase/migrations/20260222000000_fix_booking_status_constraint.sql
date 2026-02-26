-- Fix booking status constraint to match application code
-- The application uses: pending, confirmed, checked_in, checked_out, cancelled, no_show
-- But the database only allowed: pending, confirmed, cancelled, completed

-- Drop the old constraint
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;

-- Add the new constraint with all status values used by the application
ALTER TABLE bookings ADD CONSTRAINT bookings_status_check 
  CHECK (status IN ('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show'));

-- Update any existing 'completed' status to 'checked_out' (if any exist)
UPDATE bookings SET status = 'checked_out' WHERE status = 'completed';

-- Add comment explaining the status values
COMMENT ON COLUMN bookings.status IS 'Booking status: pending (awaiting confirmation), confirmed (booking confirmed), checked_in (guest arrived), checked_out (guest departed), cancelled (booking cancelled), no_show (guest did not arrive)';
