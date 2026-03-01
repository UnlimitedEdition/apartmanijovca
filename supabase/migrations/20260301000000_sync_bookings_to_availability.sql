-- =====================================================
-- MIGRATION: Sync bookings to availability table
-- This ensures that when a booking is created/updated,
-- the availability table is automatically updated
-- =====================================================

-- Function to sync booking to availability table
CREATE OR REPLACE FUNCTION sync_booking_to_availability()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  booking_date DATE;
BEGIN
  -- Handle INSERT and UPDATE
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
    -- Only sync if status is confirmed or pending
    IF NEW.status IN ('confirmed', 'pending') THEN
      -- Loop through each date in the booking range
      booking_date := NEW.check_in;
      WHILE booking_date < NEW.check_out LOOP
        -- Insert or update availability record
        INSERT INTO availability (
          apartment_id,
          date,
          is_available,
          booking_id,
          reason,
          created_at,
          updated_at
        )
        VALUES (
          NEW.apartment_id,
          booking_date,
          FALSE, -- Not available because it's booked
          NEW.id,
          'booked', -- Reason must be one of: booked, maintenance, blocked
          NOW(),
          NOW()
        )
        ON CONFLICT (apartment_id, date)
        DO UPDATE SET
          is_available = FALSE,
          booking_id = NEW.id,
          reason = 'booked',
          updated_at = NOW();
        
        booking_date := booking_date + INTERVAL '1 day';
      END LOOP;
    END IF;
    
    -- If status changed to cancelled, checked_out, or no_show, remove from availability
    IF (TG_OP = 'UPDATE' AND OLD.status IN ('confirmed', 'pending') AND NEW.status IN ('cancelled', 'checked_out', 'no_show')) THEN
      -- Delete availability records for this booking
      DELETE FROM availability
      WHERE booking_id = NEW.id;
    END IF;
    
    RETURN NEW;
  END IF;
  
  -- Handle DELETE
  IF (TG_OP = 'DELETE') THEN
    -- Delete availability records for this booking
    DELETE FROM availability
    WHERE booking_id = OLD.id;
    
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$;

COMMENT ON FUNCTION sync_booking_to_availability IS 'Automatically sync booking changes to availability table';

-- Create trigger
DROP TRIGGER IF EXISTS sync_booking_to_availability_trigger ON bookings;
CREATE TRIGGER sync_booking_to_availability_trigger
  AFTER INSERT OR UPDATE OR DELETE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION sync_booking_to_availability();

COMMENT ON TRIGGER sync_booking_to_availability_trigger ON bookings IS 'Trigger to sync bookings to availability table';

-- Backfill existing bookings to availability table
-- This will populate availability for all existing confirmed/pending bookings
DO $$
DECLARE
  booking_record RECORD;
  booking_date DATE;
BEGIN
  -- Loop through all confirmed and pending bookings
  FOR booking_record IN
    SELECT id, apartment_id, check_in, check_out, status
    FROM bookings
    WHERE status IN ('confirmed', 'pending')
  LOOP
    -- Loop through each date in the booking range
    booking_date := booking_record.check_in;
    WHILE booking_date < booking_record.check_out LOOP
      -- Insert or update availability record
      INSERT INTO availability (
        apartment_id,
        date,
        is_available,
        booking_id,
        reason,
        created_at,
        updated_at
      )
      VALUES (
        booking_record.apartment_id,
        booking_date,
        FALSE,
        booking_record.id,
        'booked',
        NOW(),
        NOW()
      )
      ON CONFLICT (apartment_id, date)
      DO UPDATE SET
        is_available = FALSE,
        booking_id = booking_record.id,
        reason = 'booked',
        updated_at = NOW();
      
      booking_date := booking_date + INTERVAL '1 day';
    END LOOP;
  END LOOP;
END;
$$;
