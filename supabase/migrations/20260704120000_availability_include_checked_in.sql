-- =====================================================
-- Align availability semantics: an OCCUPYING booking is pending / confirmed /
-- checked_in. Everything else (cancelled, no_show, checked_out, legacy completed)
-- frees the dates for new bookings.
--
-- Bug context: the public site marked a room "booked" whenever ANY non-cancelled
-- booking overlapped (app queries used `.neq('status','cancelled')`), so rejected,
-- no-show and checked-out bookings kept blocking the room even though the admin
-- panel showed them as free. App code now filters on OCCUPYING_BOOKING_STATUSES
-- (pending/confirmed/checked_in); this migration adds `checked_in` to the DB
-- availability function so the RPC (used at booking creation / /api/booking/check)
-- shares the exact same rule — a guest currently in the room must still block.
--
-- Function-only change (CREATE OR REPLACE) — no data migration, cannot fail on
-- existing rows. Half-open [check_in, check_out) range is preserved (checkout day
-- stays free for same-day turnover).
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
      AND status IN ('confirmed', 'pending', 'checked_in')
      AND daterange(check_in, check_out, '[)') && daterange(p_check_in, p_check_out, '[)')
  );
$$;

COMMENT ON FUNCTION check_availability IS 'Availability check (half-open [check_in, check_out) — checkout day is free). Occupying statuses: confirmed/pending/checked_in.';
