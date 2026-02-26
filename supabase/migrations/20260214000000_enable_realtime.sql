-- Enable Real-time for bookings table
-- This migration enables Supabase real-time subscriptions for the bookings table
-- allowing the availability calendar to update in real-time when bookings change

-- Enable the real-time extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_catalog.pg_replication_origin;

-- Check if real-time is already configured
-- Supabase uses a publication called 'supabase_realtime' for real-time updates

-- Add bookings table to the real-time publication
-- This allows clients to subscribe to changes on the bookings table
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;

-- Add apartments table to the real-time publication
-- This allows clients to subscribe to changes on the apartments table
ALTER PUBLICATION supabase_realtime ADD TABLE apartments;

-- Add availability table to the real-time publication
-- This allows clients to subscribe to changes on the availability table
ALTER PUBLICATION supabase_realtime ADD TABLE availability;

-- Optional: Create a function to notify on booking changes
-- This can be used for server-side notifications or webhooks
CREATE OR REPLACE FUNCTION notify_booking_change()
RETURNS TRIGGER AS $$
DECLARE
  payload JSONB;
BEGIN
  -- Build the payload
  IF TG_OP = 'INSERT' THEN
    payload = jsonb_build_object(
      'event', 'INSERT',
      'table', 'bookings',
      'record', to_jsonb(NEW)
    );
  ELSIF TG_OP = 'UPDATE' THEN
    payload = jsonb_build_object(
      'event', 'UPDATE',
      'table', 'bookings',
      'record', to_jsonb(NEW),
      'old_record', to_jsonb(OLD)
    );
  ELSIF TG_OP = 'DELETE' THEN
    payload = jsonb_build_object(
      'event', 'DELETE',
      'table', 'bookings',
      'old_record', to_jsonb(OLD)
    );
  END IF;
  
  -- Notify any listeners
  PERFORM pg_notify('booking_changes', payload::text);
  
  -- Return appropriate result
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for booking changes
DROP TRIGGER IF EXISTS booking_change_notify ON bookings;
CREATE TRIGGER booking_change_notify
  AFTER INSERT OR UPDATE OR DELETE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION notify_booking_change();

-- Create a view for easier availability queries
CREATE OR REPLACE VIEW availability_view AS
SELECT 
  a.id AS apartment_id,
  a.name AS apartment_name,
  a.type AS apartment_type,
  a.capacity,
  a.price_per_night,
  COALESCE(av.date, d.date) AS date,
  CASE 
    WHEN b.id IS NOT NULL AND b.status != 'cancelled' THEN 
      CASE 
        WHEN b.status = 'pending' THEN 'pending'
        ELSE 'booked'
      END
    WHEN av.available = false THEN 'blocked'
    ELSE 'available'
  END AS status,
  b.id AS booking_id,
  b.guest_id,
  b.checkin,
  b.checkout,
  b.status AS booking_status
FROM apartments a
CROSS JOIN (
  -- Generate dates for the next 2 years
  SELECT generate_series(
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '2 years',
    INTERVAL '1 day'
  )::date AS date
) d
LEFT JOIN availability av ON a.id = av.apartment_id AND av.date = d.date
LEFT JOIN bookings b ON a.id = b.apartment_id 
  AND d.date >= b.checkin 
  AND d.date <= b.checkout
  AND b.status != 'cancelled';

-- Create an index for faster availability queries
CREATE INDEX IF NOT EXISTS idx_bookings_status_checkin_checkout 
ON bookings(status, checkin, checkout) 
WHERE status != 'cancelled';

-- Grant necessary permissions for real-time
-- These permissions allow the anon and authenticated roles to subscribe to changes
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON bookings TO anon, authenticated;
GRANT SELECT ON apartments TO anon, authenticated;
GRANT SELECT ON availability TO anon, authenticated;
GRANT SELECT ON availability_view TO anon, authenticated;

-- Add comment explaining the real-time setup
COMMENT ON TABLE bookings IS 'Bookings table with real-time enabled for availability calendar updates';
COMMENT ON FUNCTION notify_booking_change() IS 'Trigger function that notifies listeners about booking changes via pg_notify';

-- Log migration completion
DO $$
BEGIN
  RAISE NOTICE 'Real-time migration completed successfully';
  RAISE NOTICE 'Tables added to supabase_realtime publication: bookings, apartments, availability';
  RAISE NOTICE 'Trigger created: booking_change_notify on bookings table';
  RAISE NOTICE 'View created: availability_view for easier availability queries';
END $$;