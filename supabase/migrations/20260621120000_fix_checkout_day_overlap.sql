-- =====================================================
-- Fix: checkout day must be FREE for the next check-in.
-- Bug: ranges used '[]' (both ends inclusive), so a booking ending on the 10th
--      occupied the 10th and blocked a new booking starting on the 10th.
-- Fix: half-open '[)' ranges — check_out day is excluded (guest leaves 10:00,
--      new guest arrives 14:00 same day). Back-to-back bookings now allowed.
-- =====================================================

-- Needed for the exclusion constraint (uuid equality in a GiST index)
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- 1) check_availability(): '[]' -> '[)'  (this is what booking creation calls)
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
      AND daterange(check_in, check_out, '[)') && daterange(p_check_in, p_check_out, '[)')
  );
$$;

COMMENT ON FUNCTION check_availability IS 'Availability check (half-open [check_in, check_out) — checkout day is free).';

-- 2) Overlap exclusion: drop the old inclusive variants, recreate half-open.
DROP INDEX IF EXISTS idx_bookings_no_overlap;
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS no_overlapping_bookings;

ALTER TABLE bookings ADD CONSTRAINT no_overlapping_bookings
  EXCLUDE USING gist (
    apartment_id WITH =,
    (daterange(check_in, check_out, '[)')) WITH &&
  ) WHERE (status IN ('confirmed', 'pending'));

COMMENT ON CONSTRAINT no_overlapping_bookings ON bookings IS 'Prevents overlapping bookings; checkout day is free (half-open range).';
