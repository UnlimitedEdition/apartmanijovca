# Implementation Plan: Complete Supabase Database Schema & SQL Scripts

## Overview

This implementation plan creates 6 complete SQL scripts for the Supabase PostgreSQL database schema for Apartmani Jovča. All SQL DDL is already defined in the design document and needs to be extracted into separate executable script files. The focus is on creating well-organized, documented SQL files that can be executed in sequence to build the complete database from scratch.

## Tasks

- [x] 1. Create script 00_DROP_ALL_FRESH_START.sql
  - Extract DROP statements from design document
  - Create SQL file with proper header comments
  - Include CASCADE and IF EXISTS clauses for idempotency
  - Add warning comment about data deletion
  - Order DROP statements in reverse dependency order (views → triggers → functions → tables)
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7_

- [x] 2. Create script 01_SCHEMA_COMPLETE.sql
  - [x] 2.1 Create schema script with extensions and apartments table
    - Add header comments with script description
    - Enable uuid-ossp and btree_gist extensions
    - Create apartments table with all columns, constraints, and indexes
    - Add table and column comments for documentation
    - _Requirements: 1.1, 1.10, 1.11, 2.1, 2.2, 16.6_

  - [x] 2.2 Create guests and bookings tables
    - Create guests table with auth_user_id foreign key
    - Create bookings table with all columns and generated nights column
    - Add critical exclusion constraint for overlap prevention using GIST index
    - Create all indexes for bookings table (apartment_id, guest_id, dates, status, booking_number)
    - Add table and column comments
    - _Requirements: 1.2, 1.3, 3.1, 3.2, 3.3, 3.4, 3.5, 4.2, 4.3_

  - [x] 2.3 Create availability, reviews, and booking_messages tables
    - Create availability table with unique constraint on (apartment_id, date)
    - Create reviews table with approval workflow status field
    - Create booking_messages table for guest-admin communication
    - Create all required indexes
    - Add table and column comments
    - _Requirements: 1.4, 1.5, 1.7, 4.4, 4.5, 4.6_

  - [x] 2.4 Create messages, content, and analytics_events tables
    - Create messages table for contact form submissions
    - Create content table with unique constraint on (key, language)
    - Create analytics_events table with JSONB event_data column
    - Create all required indexes
    - Add table and column comments
    - _Requirements: 1.6, 1.8, 1.9, 2.3, 2.4, 4.7, 4.8_

- [x] 3. Create script 02_RLS_POLICIES_COMPLETE.sql
  - [x] 3.1 Enable RLS and create policies for apartments and guests tables
    - Add header comments with script description
    - Enable RLS on apartments table
    - Create public policy for viewing active apartments
    - Create admin policy for managing apartments
    - Enable RLS on guests table
    - Create guest policies for viewing and updating own profile
    - Create admin policy for managing guests
    - _Requirements: 5.1, 5.2, 5.3, 17.2, 17.3, 17.4_

  - [x] 3.2 Create RLS policies for bookings and availability tables
    - Enable RLS on bookings table
    - Create guest policies for viewing own bookings and creating bookings
    - Create admin policy for managing bookings
    - Enable RLS on availability table
    - Create public policy for viewing availability
    - Create admin policy for managing availability
    - _Requirements: 5.4, 5.6, 17.2, 17.3, 17.4_

  - [x] 3.3 Create RLS policies for reviews, messages, and remaining tables
    - Enable RLS on reviews table
    - Create public policy for viewing approved reviews
    - Create guest policies for viewing own reviews and creating reviews
    - Create admin policy for managing reviews
    - Enable RLS on booking_messages, messages, content, analytics_events tables
    - Create appropriate policies for each table (public insert for analytics, admin full access)
    - _Requirements: 5.5, 5.7, 5.8, 17.2, 17.3, 17.4, 17.5, 17.6_

- [x] 4. Create script 03_FUNCTIONS_COMPLETE.sql
  - [x] 4.1 Create availability check functions
    - Add header comments with script description
    - Create check_availability(apartment_id, check_in, check_out) function
    - Use SQL language with daterange overlap operator (&&)
    - Add function comment explaining behavior
    - Create get_available_apartments(check_in, check_out, num_guests) function
    - Filter by status='active', capacity>=num_guests, and call check_availability
    - Add function comment
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 18.2, 18.3_

  - [x] 4.2 Create admin stats and utility functions
    - Create get_admin_stats() function returning JSONB
    - Calculate all required statistics (total_bookings, confirmed_bookings, pending_bookings, cancelled_bookings, total_revenue, total_guests, avg_rating)
    - Add function comment
    - Create generate_booking_number() function for BJ-YYYY-NNNN format
    - Create update_availability_for_booking() function for availability updates
    - Add function comments
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 18.4_

  - [x] 4.3 Create trigger functions and attach triggers
    - Create notify_booking_change() trigger function using pg_notify
    - Attach trigger to bookings table for INSERT, UPDATE, DELETE
    - Create update_guest_stats() trigger function
    - Handle status changes to/from 'confirmed' with increment/decrement logic
    - Attach trigger to bookings table for INSERT and UPDATE
    - Create set_booking_number() trigger function
    - Create update_updated_at() trigger function
    - Attach update_updated_at triggers to all tables with updated_at column
    - Add function comments
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 10.1, 10.2, 10.3, 10.4, 10.5, 18.5, 18.6, 18.7_

- [x] 5. Create script 04_REALTIME_COMPLETE.sql
  - [x] 5.1 Enable real-time subscriptions and create views
    - Add header comments with script description
    - Add ALTER PUBLICATION statements for bookings, apartments, availability, booking_messages, analytics_events tables
    - Add note about Supabase dashboard configuration
    - Create availability_view with apartment details and 365-day date series
    - Join availability and apartments tables
    - Calculate effective_price using COALESCE(price_override, base_price_eur)
    - Filter to only active apartments
    - Add view comment
    - Create booking_details_view (if defined in design)
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 12.1, 12.2, 12.3, 12.4, 12.5, 19.2, 19.3, 19.4, 19.5, 19.6, 19.7_

- [x] 6. Create script 05_SEED_DATA_COMPLETE.sql
  - [x] 6.1 Insert seed data for 4 apartments
    - Add header comments with script description
    - Insert Apartman Deluxe (6 guests, 45 EUR, UUID: 11111111-1111-1111-1111-111111111111)
    - Insert Apartman Standard (4 guests, 40 EUR, UUID: 22222222-2222-2222-2222-222222222222)
    - Insert Apartman Family (5 guests, 42 EUR, UUID: 33333333-3333-3333-3333-333333333333)
    - Insert Apartman Studio (2 guests, 30 EUR, UUID: 44444444-4444-4444-4444-444444444444)
    - Include multi-language names and descriptions for all 4 languages (sr, en, de, it)
    - Include amenities arrays with realistic values
    - Include images arrays with placeholder URLs
    - Use ON CONFLICT (id) DO NOTHING for idempotency
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7, 20.2, 20.5_

  - [x] 6.2 Insert seed data for multi-language content
    - Insert content for home.hero.title in all 4 languages
    - Insert content for home.hero.subtitle in all 4 languages
    - Insert content for home.hero.cta in all 4 languages
    - Insert content for gallery.title and gallery.description in all 4 languages
    - Insert content for prices.title and prices.description in all 4 languages
    - Insert content for attractions.title and attractions.description in all 4 languages
    - Insert content for contact section (title, description, phone, email) in all 4 languages
    - Use ON CONFLICT (key, language) DO NOTHING for idempotency
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 20.3_

  - [x] 6.3 Generate initial availability records
    - Insert availability records for all active apartments
    - Generate records for next 365 days using generate_series
    - Set is_available to TRUE for all dates
    - Use ON CONFLICT (apartment_id, date) DO NOTHING for idempotency
    - _Requirements: 20.4, 20.5_

- [x] 7. Create execution documentation
  - Create README.md or add to existing documentation
  - Document script execution order: 00 (optional) → 01 → 02 → 03 → 04 → 05
  - Explain that 00_DROP_ALL_FRESH_START.sql is for fresh starts only
  - Document that scripts 01-05 must be run in sequence
  - Include example commands for Supabase CLI execution
  - Include example commands for psql execution
  - Document idempotency guarantees
  - _Requirements: 21.1, 21.2, 21.3, 21.4, 21.5_

- [x] 8. Validate SQL syntax and test scripts
  - [x] 8.1 Validate SQL syntax for all 6 scripts
    - Use PostgreSQL syntax checker or psql --dry-run if available
    - Verify all SQL statements are valid PostgreSQL 15+ syntax
    - Check for missing semicolons, unmatched parentheses, typos
    - Verify all table and column names match design document
    - _Requirements: 16.7, 18.8, 19.8_

  - [x] 8.2 Test script execution in correct order
    - Execute 00_DROP_ALL_FRESH_START.sql (should complete without errors)
    - Execute 01_SCHEMA_COMPLETE.sql (should create all 9 tables)
    - Execute 02_RLS_POLICIES_COMPLETE.sql (should enable RLS on all tables)
    - Execute 03_FUNCTIONS_COMPLETE.sql (should create all 5 functions and triggers)
    - Execute 04_REALTIME_COMPLETE.sql (should create views)
    - Execute 05_SEED_DATA_COMPLETE.sql (should insert seed data)
    - Verify no errors during execution
    - _Requirements: 16.7, 17.7, 18.8, 19.8, 20.6, 23.1, 23.2, 23.3, 23.4, 23.5, 23.6_

  - [x] 8.3 Verify database schema after execution
    - Query information_schema.tables to verify 9 tables exist
    - Query pg_indexes to verify all indexes exist (at least 15)
    - Query pg_proc to verify all functions exist (at least 5)
    - Query pg_trigger to verify all triggers exist (at least 2)
    - Query pg_views to verify views exist (at least 1)
    - Verify RLS is enabled on all tables
    - Query seed data to verify 4 apartments and content records exist
    - _Requirements: 23.1, 23.2, 23.3, 23.4, 23.5, 23.6_

- [x] 9. Checkpoint - Ensure all scripts are created and tested
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- All SQL DDL is already complete in the design document - tasks focus on extracting and organizing into separate script files
- Each script should have clear header comments explaining its purpose
- Scripts should be idempotent where possible (using IF EXISTS, ON CONFLICT, etc.)
- The critical exclusion constraint on bookings table prevents double-bookings at the database level
- RLS policies enforce security at the database level, not just application level
- Real-time subscriptions enable WebSocket updates for connected clients
- Seed data includes 4 apartments with multi-language content for immediate testing
- All scripts must be executed in order: 00 (optional) → 01 → 02 → 03 → 04 → 05
- Testing should verify schema structure, not just successful execution
