-- =====================================================
-- 03_FUNCTIONS_COMPLETE.sql
-- Database functions and triggers
-- =====================================================

-- =====================================================
-- FUNCTION: check_availability
-- Check if an apartment is available for a date range
-- =====================================================
CREATE OR REPLACE FUNCTION check_availability(
  p_apartment_id UUID,
  p_check_in DATE,
  p_check_out DATE
)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
AS $$
  SELECT NOT EXISTS (
    SELECT 1
    FROM bookings
    WHERE apartment_id = p_apartment_id
      AND status IN ('confirmed', 'pending')
      AND daterange(check_in, check_out, '[]') && daterange(p_check_in, p_check_out, '[]')
  );
$$;

COMMENT ON FUNCTION check_availability IS 'Check if apartment is available for date range. Returns TRUE if available, FALSE if any booking overlaps.';

-- =====================================================
-- FUNCTION: get_available_apartments
-- Get list of available apartments for given dates and guest count
-- =====================================================
CREATE OR REPLACE FUNCTION get_available_apartments(
  p_check_in DATE,
  p_check_out DATE,
  p_num_guests INT
)
RETURNS TABLE (
  apartment_id UUID,
  name JSONB,
  description JSONB,
  capacity INT,
  base_price_eur DECIMAL,
  images JSONB[],
  amenities JSONB[]
)
LANGUAGE SQL
STABLE
AS $$
  SELECT
    a.id,
    a.name,
    a.description,
    a.capacity,
    a.base_price_eur,
    a.images,
    a.amenities
  FROM apartments a
  WHERE a.status = 'active'
    AND a.capacity >= p_num_guests
    AND check_availability(a.id, p_check_in, p_check_out) = TRUE
  ORDER BY a.base_price_eur ASC;
$$;

COMMENT ON FUNCTION get_available_apartments IS 'Get available apartments for date range and guest count. Returns apartments sorted by price.';

-- =====================================================
-- FUNCTION: get_admin_stats
-- Calculate dashboard statistics for admin panel
-- =====================================================
CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS JSONB
LANGUAGE SQL
STABLE
AS $$
  SELECT jsonb_build_object(
    'total_bookings', (
      SELECT COUNT(*) FROM bookings
    ),
    'confirmed_bookings', (
      SELECT COUNT(*) FROM bookings WHERE status = 'confirmed'
    ),
    'pending_bookings', (
      SELECT COUNT(*) FROM bookings WHERE status = 'pending'
    ),
    'cancelled_bookings', (
      SELECT COUNT(*) FROM bookings WHERE status = 'cancelled'
    ),
    'completed_bookings', (
      SELECT COUNT(*) FROM bookings WHERE status = 'completed'
    ),
    'total_revenue', (
      SELECT COALESCE(SUM(total_price), 0) FROM bookings WHERE status = 'confirmed'
    ),
    'total_guests', (
      SELECT COUNT(*) FROM guests
    ),
    'avg_rating', (
      SELECT COALESCE(ROUND(AVG(rating)::numeric, 2), 0) FROM reviews WHERE status = 'approved'
    ),
    'total_reviews', (
      SELECT COUNT(*) FROM reviews WHERE status = 'approved'
    ),
    'pending_reviews', (
      SELECT COUNT(*) FROM reviews WHERE status = 'pending'
    )
  );
$$;

COMMENT ON FUNCTION get_admin_stats IS 'Calculate dashboard statistics. Returns JSONB object with all key metrics.';

-- =====================================================
-- FUNCTION: generate_booking_number
-- Generate unique booking number in format BJ-YYYY-NNNN
-- =====================================================
CREATE OR REPLACE FUNCTION generate_booking_number()
RETURNS TEXT
LANGUAGE PLPGSQL
AS $$
DECLARE
  v_year TEXT;
  v_sequence INT;
  v_booking_number TEXT;
BEGIN
  -- Get current year
  v_year := TO_CHAR(NOW(), 'YYYY');
  
  -- Get next sequence number for this year
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(booking_number FROM 9) AS INT)
  ), 0) + 1
  INTO v_sequence
  FROM bookings
  WHERE booking_number LIKE 'BJ-' || v_year || '-%';
  
  -- Format booking number: BJ-2024-0001
  v_booking_number := 'BJ-' || v_year || '-' || LPAD(v_sequence::TEXT, 4, '0');
  
  RETURN v_booking_number;
END;
$$;

COMMENT ON FUNCTION generate_booking_number IS 'Generate unique booking number in format BJ-YYYY-NNNN';

-- =====================================================
-- FUNCTION: update_availability_for_booking
-- Update availability table when booking is created/updated/cancelled
-- =====================================================
CREATE OR REPLACE FUNCTION update_availability_for_booking(
  p_booking_id UUID,
  p_apartment_id UUID,
  p_check_in DATE,
  p_check_out DATE,
  p_status TEXT
)
RETURNS VOID
LANGUAGE PLPGSQL
AS $$
BEGIN
  -- If booking is confirmed or pending, mark dates as unavailable
  IF p_status IN ('confirmed', 'pending') THEN
    -- Insert or update availability records for each date in range
    INSERT INTO availability (apartment_id, date, is_available, reason, booking_id)
    SELECT
      p_apartment_id,
      generate_series(p_check_in, p_check_out - INTERVAL '1 day', INTERVAL '1 day')::DATE,
      FALSE,
      'booked',
      p_booking_id
    ON CONFLICT (apartment_id, date)
    DO UPDATE SET
      is_available = FALSE,
      reason = 'booked',
      booking_id = p_booking_id,
      updated_at = NOW();
  
  -- If booking is cancelled or completed, mark dates as available
  ELSIF p_status IN ('cancelled', 'completed') THEN
    UPDATE availability
    SET
      is_available = TRUE,
      reason = NULL,
      booking_id = NULL,
      updated_at = NOW()
    WHERE booking_id = p_booking_id;
  END IF;
END;
$$;

COMMENT ON FUNCTION update_availability_for_booking IS 'Update availability table when booking status changes';

-- =====================================================
-- TRIGGER FUNCTION: notify_booking_change
-- Send real-time notification when booking changes
-- =====================================================
CREATE OR REPLACE FUNCTION notify_booking_change()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$
BEGIN
  -- Send notification to 'booking_changes' channel
  PERFORM pg_notify(
    'booking_changes',
    json_build_object(
      'operation', TG_OP,
      'booking_id', COALESCE(NEW.id, OLD.id),
      'apartment_id', COALESCE(NEW.apartment_id, OLD.apartment_id),
      'status', COALESCE(NEW.status, OLD.status),
      'timestamp', NOW()
    )::text
  );
  
  -- Return appropriate record
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

COMMENT ON FUNCTION notify_booking_change IS 'Trigger function to send real-time notifications on booking changes';

-- Create trigger for booking changes
DROP TRIGGER IF EXISTS notify_booking_change_trigger ON bookings;
CREATE TRIGGER notify_booking_change_trigger
  AFTER INSERT OR UPDATE OR DELETE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION notify_booking_change();

-- =====================================================
-- TRIGGER FUNCTION: update_guest_stats
-- Automatically update guest statistics when booking status changes
-- =====================================================
CREATE OR REPLACE FUNCTION update_guest_stats()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$
BEGIN
  -- Handle INSERT: booking created with confirmed status
  IF TG_OP = 'INSERT' AND NEW.status = 'confirmed' THEN
    UPDATE guests
    SET
      total_bookings = total_bookings + 1,
      total_nights = total_nights + NEW.nights,
      updated_at = NOW()
    WHERE id = NEW.guest_id;
  
  -- Handle UPDATE: status changed
  ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    -- Status changed TO confirmed
    IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
      UPDATE guests
      SET
        total_bookings = total_bookings + 1,
        total_nights = total_nights + NEW.nights,
        updated_at = NOW()
      WHERE id = NEW.guest_id;
    
    -- Status changed FROM confirmed
    ELSIF OLD.status = 'confirmed' AND NEW.status != 'confirmed' THEN
      UPDATE guests
      SET
        total_bookings = GREATEST(total_bookings - 1, 0),
        total_nights = GREATEST(total_nights - OLD.nights, 0),
        updated_at = NOW()
      WHERE id = OLD.guest_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION update_guest_stats IS 'Trigger function to update guest statistics when booking status changes';

-- Create trigger for guest stats
DROP TRIGGER IF EXISTS update_guest_stats_trigger ON bookings;
CREATE TRIGGER update_guest_stats_trigger
  AFTER INSERT OR UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_guest_stats();

-- =====================================================
-- TRIGGER FUNCTION: set_booking_number
-- Automatically set booking number on insert
-- =====================================================
CREATE OR REPLACE FUNCTION set_booking_number()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$
BEGIN
  IF NEW.booking_number IS NULL OR NEW.booking_number = '' THEN
    NEW.booking_number := generate_booking_number();
  END IF;
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION set_booking_number IS 'Trigger function to automatically generate booking number';

-- Create trigger for booking number
DROP TRIGGER IF EXISTS set_booking_number_trigger ON bookings;
CREATE TRIGGER set_booking_number_trigger
  BEFORE INSERT ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION set_booking_number();

-- =====================================================
-- TRIGGER FUNCTION: update_updated_at
-- Automatically update updated_at timestamp
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION update_updated_at IS 'Trigger function to automatically update updated_at timestamp';

-- Create triggers for updated_at on all tables with updated_at column
DROP TRIGGER IF EXISTS update_apartments_updated_at ON apartments;
CREATE TRIGGER update_apartments_updated_at
  BEFORE UPDATE ON apartments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_guests_updated_at ON guests;
CREATE TRIGGER update_guests_updated_at
  BEFORE UPDATE ON guests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_availability_updated_at ON availability;
CREATE TRIGGER update_availability_updated_at
  BEFORE UPDATE ON availability
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_content_updated_at ON content;
CREATE TRIGGER update_content_updated_at
  BEFORE UPDATE ON content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
