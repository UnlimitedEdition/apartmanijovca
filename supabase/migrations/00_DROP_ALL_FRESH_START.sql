-- =====================================================
-- 00_DROP_ALL_FRESH_START.sql
-- Drop all database objects for fresh start
-- WARNING: This will delete ALL data
-- =====================================================

-- Drop views
DROP VIEW IF EXISTS apartment_stats_view CASCADE;
DROP VIEW IF EXISTS booking_details_view CASCADE;
DROP VIEW IF EXISTS availability_view CASCADE;

-- Drop triggers
DROP TRIGGER IF EXISTS notify_booking_change_trigger ON bookings CASCADE;
DROP TRIGGER IF EXISTS update_guest_stats_trigger ON bookings CASCADE;
DROP TRIGGER IF EXISTS set_booking_number_trigger ON bookings CASCADE;
DROP TRIGGER IF EXISTS update_apartments_updated_at ON apartments CASCADE;
DROP TRIGGER IF EXISTS update_guests_updated_at ON guests CASCADE;
DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings CASCADE;
DROP TRIGGER IF EXISTS update_availability_updated_at ON availability CASCADE;
DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews CASCADE;
DROP TRIGGER IF EXISTS update_content_updated_at ON content CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS notify_booking_change() CASCADE;
DROP FUNCTION IF EXISTS update_guest_stats() CASCADE;
DROP FUNCTION IF EXISTS set_booking_number() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at() CASCADE;
DROP FUNCTION IF EXISTS check_availability(UUID, DATE, DATE) CASCADE;
DROP FUNCTION IF EXISTS get_available_apartments(DATE, DATE, INT) CASCADE;
DROP FUNCTION IF EXISTS get_admin_stats() CASCADE;
DROP FUNCTION IF EXISTS generate_booking_number() CASCADE;
DROP FUNCTION IF EXISTS update_availability_for_booking(UUID, UUID, DATE, DATE, TEXT) CASCADE;

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS analytics_events CASCADE;
DROP TABLE IF EXISTS content CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS booking_messages CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS availability CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS guests CASCADE;
DROP TABLE IF EXISTS apartments CASCADE;

-- Note: auth.users is managed by Supabase, do not drop
