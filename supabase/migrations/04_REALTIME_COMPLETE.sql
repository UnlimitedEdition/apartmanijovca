-- =====================================================
-- 04_REALTIME_COMPLETE.sql
-- Enable real-time subscriptions and create views
-- =====================================================

-- =====================================================
-- Enable real-time on tables
-- =====================================================

-- Note: In Supabase, real-time is enabled via the dashboard or API
-- These are the SQL equivalents for reference

-- Enable real-time on bookings
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;

-- Enable real-time on apartments
ALTER PUBLICATION supabase_realtime ADD TABLE apartments;

-- Enable real-time on availability
ALTER PUBLICATION supabase_realtime ADD TABLE availability;

-- Enable real-time on booking_messages
ALTER PUBLICATION supabase_realtime ADD TABLE booking_messages;

-- Enable real-time on analytics_events
ALTER PUBLICATION supabase_realtime ADD TABLE analytics_events;

-- =====================================================
-- VIEW: availability_view
-- Denormalized view for efficient calendar queries
-- =====================================================
CREATE OR REPLACE VIEW availability_view AS
SELECT
  a.id AS apartment_id,
  a.name AS apartment_name,
  a.base_price_eur,
  dates.date,
  COALESCE(av.is_available, TRUE) AS is_available,
  av.price_override,
  COALESCE(av.price_override, a.base_price_eur) AS effective_price,
  av.reason,
  av.booking_id,
  b.booking_number,
  b.status AS booking_status
FROM apartments a
CROSS JOIN generate_series(
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '365 days',
  INTERVAL '1 day'
)::DATE AS dates(date)
LEFT JOIN availability av ON av.apartment_id = a.id AND av.date = dates.date
LEFT JOIN bookings b ON b.id = av.booking_id
WHERE a.status = 'active'
ORDER BY a.id, dates.date;

COMMENT ON VIEW availability_view IS 'Denormalized calendar view with apartment details and availability for next 365 days';

-- =====================================================
-- VIEW: booking_details_view
-- Complete booking information with guest and apartment details
-- =====================================================
CREATE OR REPLACE VIEW booking_details_view AS
SELECT
  b.id AS booking_id,
  b.booking_number,
  b.status,
  b.check_in,
  b.check_out,
  b.nights,
  b.num_guests,
  b.total_price,
  b.requested_at,
  b.confirmed_at,
  
  -- Apartment details
  a.id AS apartment_id,
  a.name AS apartment_name,
  a.capacity AS apartment_capacity,
  
  -- Guest details
  g.id AS guest_id,
  g.full_name AS guest_name,
  g.email AS guest_email,
  g.phone AS guest_phone,
  g.language AS guest_language,
  
  -- Timestamps
  b.created_at,
  b.updated_at
FROM bookings b
JOIN apartments a ON a.id = b.apartment_id
JOIN guests g ON g.id = b.guest_id;

COMMENT ON VIEW booking_details_view IS 'Complete booking information with denormalized guest and apartment details';

-- =====================================================
-- VIEW: apartment_stats_view
-- Aggregate statistics per apartment
-- =====================================================
CREATE OR REPLACE VIEW apartment_stats_view AS
SELECT
  a.id AS apartment_id,
  a.name AS apartment_name,
  a.status,
  
  -- Booking statistics
  COUNT(DISTINCT b.id) FILTER (WHERE b.status = 'confirmed') AS total_bookings,
  COALESCE(SUM(b.nights) FILTER (WHERE b.status = 'confirmed'), 0) AS total_nights_booked,
  COALESCE(SUM(b.total_price) FILTER (WHERE b.status = 'confirmed'), 0) AS total_revenue,
  
  -- Review statistics
  COUNT(DISTINCT r.id) FILTER (WHERE r.status = 'approved') AS total_reviews,
  COALESCE(ROUND(AVG(r.rating) FILTER (WHERE r.status = 'approved'), 2), 0) AS avg_rating,
  
  -- Availability (next 30 days)
  COUNT(DISTINCT av.date) FILTER (
    WHERE av.is_available = TRUE
    AND av.date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
  ) AS available_days_next_30
FROM apartments a
LEFT JOIN bookings b ON b.apartment_id = a.id
LEFT JOIN reviews r ON r.apartment_id = a.id
LEFT JOIN availability av ON av.apartment_id = a.id
GROUP BY a.id, a.name, a.status;

COMMENT ON VIEW apartment_stats_view IS 'Aggregate statistics per apartment including bookings, reviews, and availability';
