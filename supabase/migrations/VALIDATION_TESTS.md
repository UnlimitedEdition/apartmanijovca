# Database Migration Validation Tests

This document provides SQL queries to validate that all migration scripts executed successfully.

## Prerequisites

Before running these tests, ensure you have executed all migration scripts in order:
1. 00_DROP_ALL_FRESH_START.sql (optional)
2. 01_SCHEMA_COMPLETE.sql
3. 02_RLS_POLICIES_COMPLETE.sql
4. 03_FUNCTIONS_COMPLETE.sql
5. 04_REALTIME_COMPLETE.sql
6. 05_SEED_DATA_COMPLETE.sql

## Test 1: Verify All Tables Exist

**Expected Result:** 9 tables

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

**Expected tables:**
- analytics_events
- apartments
- availability
- booking_messages
- bookings
- content
- guests
- messages
- reviews

## Test 2: Verify All Indexes Exist

**Expected Result:** At least 15 indexes

```sql
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename, indexname;
```

**Key indexes to verify:**
- `idx_bookings_no_overlap` (CRITICAL - exclusion constraint)
- `idx_apartments_status`
- `idx_bookings_apartment_id`
- `idx_bookings_guest_id`
- `idx_bookings_dates`
- `idx_bookings_status`
- `idx_availability_apartment_date`
- `idx_reviews_apartment_id`
- `idx_reviews_status`
- `idx_analytics_events_event_type`
- `idx_analytics_events_created_at`

## Test 3: Verify All Functions Exist

**Expected Result:** At least 8 functions

```sql
SELECT 
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_type = 'FUNCTION'
ORDER BY routine_name;
```

**Expected functions:**
- check_availability
- generate_booking_number
- get_admin_stats
- get_available_apartments
- notify_booking_change
- set_booking_number
- update_availability_for_booking
- update_guest_stats
- update_updated_at

## Test 4: Verify All Triggers Exist

**Expected Result:** At least 10 triggers

```sql
SELECT 
  trigger_name,
  event_object_table as table_name,
  action_timing,
  event_manipulation
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;
```

**Expected triggers:**
- `notify_booking_change_trigger` on bookings
- `update_guest_stats_trigger` on bookings
- `set_booking_number_trigger` on bookings
- `update_apartments_updated_at` on apartments
- `update_guests_updated_at` on guests
- `update_bookings_updated_at` on bookings
- `update_availability_updated_at` on availability
- `update_reviews_updated_at` on reviews
- `update_content_updated_at` on content

## Test 5: Verify All Views Exist

**Expected Result:** 3 views

```sql
SELECT 
  table_name as view_name,
  view_definition
FROM information_schema.views 
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Expected views:**
- apartment_stats_view
- availability_view
- booking_details_view

## Test 6: Verify RLS is Enabled

**Expected Result:** All 9 tables should have RLS enabled

```sql
SELECT 
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
```

**All tables should show:** `rowsecurity = true`

## Test 7: Verify RLS Policies Exist

**Expected Result:** At least 20 policies

```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

**Key policies to verify:**
- Public can view active apartments
- Admin can manage apartments
- Guests can view own bookings
- Guests can create bookings
- Admin can manage bookings
- Public can view availability
- Public can view approved reviews
- Public can track analytics

## Test 8: Verify Seed Data - Apartments

**Expected Result:** 4 apartments

```sql
SELECT 
  id,
  name->>'en' as name_en,
  capacity,
  base_price_eur,
  status,
  array_length(amenities, 1) as amenity_count,
  array_length(images, 1) as image_count
FROM apartments 
ORDER BY base_price_eur;
```

**Expected apartments:**
1. Apartman Studio (2 guests, 30 EUR)
2. Apartman Standard (3 guests, 35 EUR)
3. Apartman Family (6 guests, 40 EUR)
4. Apartman Deluxe (4 guests, 45 EUR)

## Test 9: Verify Seed Data - Multi-Language Content

**Expected Result:** At least 48 content entries (12 keys × 4 languages)

```sql
SELECT 
  language,
  COUNT(*) as content_count
FROM content 
GROUP BY language
ORDER BY language;
```

**Expected counts per language:**
- sr: 12 entries
- en: 12 entries
- de: 12 entries
- it: 12 entries

**Verify specific content:**
```sql
SELECT 
  key,
  language,
  value
FROM content 
WHERE key LIKE 'home.hero%'
ORDER BY key, language;
```

## Test 10: Verify Seed Data - Availability

**Expected Result:** ~1460 records (4 apartments × 365 days)

```sql
SELECT 
  apartment_id,
  COUNT(*) as days_available,
  MIN(date) as first_date,
  MAX(date) as last_date
FROM availability 
WHERE is_available = TRUE
GROUP BY apartment_id
ORDER BY apartment_id;
```

**Each apartment should have:** ~365 days of availability

## Test 11: Verify Exclusion Constraint (Critical)

**Test the booking overlap prevention:**

```sql
-- Step 1: Insert a test guest
INSERT INTO guests (id, full_name, email, phone, language)
VALUES (
  '99999999-9999-9999-9999-999999999999',
  'Test Guest',
  'test@example.com',
  '+381 69 123 4567',
  'en'
)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Insert a test booking
INSERT INTO bookings (
  booking_number,
  apartment_id,
  guest_id,
  check_in,
  check_out,
  num_guests,
  status,
  price_per_night,
  total_price,
  source,
  language
)
VALUES (
  'TEST-2024-0001',
  '11111111-1111-1111-1111-111111111111',  -- Apartman Deluxe
  '99999999-9999-9999-9999-999999999999',
  CURRENT_DATE + INTERVAL '10 days',
  CURRENT_DATE + INTERVAL '15 days',
  2,
  'confirmed',
  45.00,
  225.00,
  'website',
  'en'
);

-- Step 3: Try to insert an overlapping booking (SHOULD FAIL)
INSERT INTO bookings (
  booking_number,
  apartment_id,
  guest_id,
  check_in,
  check_out,
  num_guests,
  status,
  price_per_night,
  total_price,
  source,
  language
)
VALUES (
  'TEST-2024-0002',
  '11111111-1111-1111-1111-111111111111',  -- Same apartment
  '99999999-9999-9999-9999-999999999999',
  CURRENT_DATE + INTERVAL '12 days',  -- Overlaps with previous booking
  CURRENT_DATE + INTERVAL '17 days',
  2,
  'confirmed',
  45.00,
  225.00,
  'website',
  'en'
);
```

**Expected Result:** The second INSERT should FAIL with error:
```
ERROR: conflicting key value violates exclusion constraint "idx_bookings_no_overlap"
```

**Cleanup test data:**
```sql
DELETE FROM bookings WHERE booking_number LIKE 'TEST-%';
DELETE FROM guests WHERE id = '99999999-9999-9999-9999-999999999999';
```

## Test 12: Verify Functions Work Correctly

### Test check_availability()

```sql
-- Should return TRUE (apartment is available)
SELECT check_availability(
  '11111111-1111-1111-1111-111111111111',  -- Apartman Deluxe
  CURRENT_DATE + INTERVAL '100 days',
  CURRENT_DATE + INTERVAL '105 days'
);
```

**Expected Result:** `true`

### Test get_available_apartments()

```sql
-- Get available apartments for 2 guests
SELECT 
  apartment_id,
  name->>'en' as name,
  capacity,
  base_price_eur
FROM get_available_apartments(
  CURRENT_DATE + INTERVAL '100 days',
  CURRENT_DATE + INTERVAL '105 days',
  2
);
```

**Expected Result:** All 4 apartments (all have capacity >= 2)

### Test get_admin_stats()

```sql
SELECT get_admin_stats();
```

**Expected Result:** JSON object with statistics:
```json
{
  "total_bookings": 0,
  "confirmed_bookings": 0,
  "pending_bookings": 0,
  "cancelled_bookings": 0,
  "completed_bookings": 0,
  "total_revenue": 0,
  "total_guests": 0,
  "avg_rating": 0,
  "total_reviews": 0,
  "pending_reviews": 0
}
```

## Test 13: Verify Triggers Work Correctly

### Test update_updated_at trigger

```sql
-- Get current updated_at
SELECT id, name->>'en' as name, updated_at 
FROM apartments 
WHERE id = '11111111-1111-1111-1111-111111111111';

-- Update the apartment
UPDATE apartments 
SET capacity = capacity 
WHERE id = '11111111-1111-1111-1111-111111111111';

-- Check updated_at changed
SELECT id, name->>'en' as name, updated_at 
FROM apartments 
WHERE id = '11111111-1111-1111-1111-111111111111';
```

**Expected Result:** `updated_at` should be more recent after the UPDATE

### Test set_booking_number trigger

```sql
-- Insert booking without booking_number
INSERT INTO guests (full_name, email, phone, language)
VALUES ('Trigger Test Guest', 'trigger@test.com', '+381 69 999 9999', 'en')
RETURNING id;

-- Use the returned guest ID in the booking
INSERT INTO bookings (
  apartment_id,
  guest_id,
  check_in,
  check_out,
  num_guests,
  status,
  price_per_night,
  total_price,
  source,
  language
)
VALUES (
  '44444444-4444-4444-4444-444444444444',  -- Studio
  (SELECT id FROM guests WHERE email = 'trigger@test.com'),
  CURRENT_DATE + INTERVAL '200 days',
  CURRENT_DATE + INTERVAL '205 days',
  2,
  'pending',
  30.00,
  150.00,
  'website',
  'en'
)
RETURNING booking_number;
```

**Expected Result:** `booking_number` should be auto-generated in format `BJ-YYYY-NNNN`

**Cleanup:**
```sql
DELETE FROM bookings WHERE guest_id IN (SELECT id FROM guests WHERE email = 'trigger@test.com');
DELETE FROM guests WHERE email = 'trigger@test.com';
```

## Test 14: Verify Views Return Data

### Test availability_view

```sql
SELECT 
  apartment_id,
  apartment_name->>'en' as apartment_name,
  date,
  is_available,
  effective_price
FROM availability_view
WHERE date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
ORDER BY apartment_id, date
LIMIT 20;
```

**Expected Result:** 28 rows (4 apartments × 7 days)

### Test booking_details_view

```sql
SELECT 
  booking_id,
  booking_number,
  status,
  apartment_name->>'en' as apartment,
  guest_name,
  check_in,
  check_out,
  nights
FROM booking_details_view
ORDER BY created_at DESC
LIMIT 10;
```

**Expected Result:** Empty (no bookings yet) or list of bookings if any exist

### Test apartment_stats_view

```sql
SELECT 
  apartment_name->>'en' as apartment,
  status,
  total_bookings,
  total_revenue,
  total_reviews,
  avg_rating,
  available_days_next_30
FROM apartment_stats_view
ORDER BY apartment_name->>'en';
```

**Expected Result:** 4 rows with statistics for each apartment

## Test 15: Verify Real-Time Publication

```sql
-- Check which tables are in the realtime publication
SELECT 
  schemaname,
  tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;
```

**Expected tables in publication:**
- analytics_events
- apartments
- availability
- booking_messages
- bookings

## Summary Checklist

After running all tests, verify:

- [ ] All 9 tables exist
- [ ] At least 15 indexes exist
- [ ] At least 8 functions exist
- [ ] At least 10 triggers exist
- [ ] 3 views exist
- [ ] RLS is enabled on all tables
- [ ] At least 20 RLS policies exist
- [ ] 4 apartments in seed data
- [ ] 48 content entries (12 keys × 4 languages)
- [ ] ~1460 availability records (4 apartments × 365 days)
- [ ] Exclusion constraint prevents overlapping bookings
- [ ] check_availability() function works
- [ ] get_available_apartments() function works
- [ ] get_admin_stats() function works
- [ ] update_updated_at trigger works
- [ ] set_booking_number trigger works
- [ ] availability_view returns data
- [ ] booking_details_view exists
- [ ] apartment_stats_view returns data
- [ ] Real-time publication includes 5 tables

## Troubleshooting

If any test fails:

1. **Check script execution order** - Scripts must be run in sequence (01 → 02 → 03 → 04 → 05)
2. **Check for errors** - Review the output of each script execution for errors
3. **Check extensions** - Ensure `uuid-ossp` and `btree_gist` extensions are enabled
4. **Check permissions** - Ensure you're using the service role key for admin operations
5. **Re-run scripts** - Most scripts are idempotent and can be re-run safely

## Success Criteria

All tests should pass with expected results. The database is ready for production use when:

✅ All tables, indexes, functions, triggers, and views exist  
✅ RLS is enabled with correct policies  
✅ Seed data is present  
✅ Exclusion constraint prevents double-bookings  
✅ All functions return correct results  
✅ All triggers execute correctly  
✅ All views return data  
✅ Real-time is enabled on key tables  

**Database is production-ready! 🎉**
