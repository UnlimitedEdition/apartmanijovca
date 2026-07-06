-- =====================================================
-- check_availability(): honor MANUAL availability blocks (not just bookings).
--
-- A date is unbookable if EITHER of these overlaps the requested stay:
--   1) an OCCUPYING booking — status pending / confirmed / checked_in
--   2) a MANUAL block in `availability` — is_available = FALSE AND booking_id IS NULL
--      (admin-set: maintenance / blocked, or dates already sold on Booking.com etc.)
--
-- Why: before this, the RPC (called by booking creation and /api/booking/check) only
-- looked at `bookings`, so a guest could book straight over a Booking.com date that the
-- admin had blocked by hand in the calendar. Supersedes 20260704120000 (which added
-- checked_in) — checked_in is kept here and the manual-block check is added.
--
-- Rows in `availability` that carry a booking_id are the trigger-synced mirror of a
-- booking; we intentionally IGNORE those here and let the booking (source of truth) drive
-- occupancy via source (1). That way a stale synced row for a checked_out / no_show
-- booking does not wrongly keep a date blocked.
--
-- SECURITY DEFINER so the anon booking flow evaluates the check with full visibility
-- regardless of RLS. Half-open [check_in, check_out) preserved — checkout day stays free
-- for same-day turnover. Function-only change (CREATE OR REPLACE) — no data migration,
-- cannot fail on existing rows.
-- =====================================================

CREATE OR REPLACE FUNCTION check_availability(
  p_apartment_id UUID,
  p_check_in DATE,
  p_check_out DATE
)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    NOT EXISTS (
      SELECT 1
      FROM bookings
      WHERE apartment_id = p_apartment_id
        AND status IN ('confirmed', 'pending', 'checked_in')
        AND daterange(check_in, check_out, '[)') && daterange(p_check_in, p_check_out, '[)')
    )
    AND NOT EXISTS (
      SELECT 1
      FROM availability
      WHERE apartment_id = p_apartment_id
        AND is_available = FALSE
        AND booking_id IS NULL
        AND date >= p_check_in
        AND date <  p_check_out
    );
$$;

COMMENT ON FUNCTION check_availability IS
  'Availability check, half-open [check_in, check_out). Unavailable if an occupying booking (confirmed/pending/checked_in) OR a manual availability block (is_available=false, booking_id null) overlaps. Ignores trigger-synced availability rows (booking_id set) — the booking drives those.';
