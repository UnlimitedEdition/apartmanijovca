# Requirements Document: Complete Supabase Database Schema & SQL Scripts

## Introduction

This document defines the requirements for creating a complete, production-ready Supabase PostgreSQL database schema for the Apartmani Jovča booking platform. The database must support multi-language content, real-time booking calendar with no double-bookings, guest portal with authentication, admin panel with full management, custom analytics tracking, and Row Level Security (RLS) for data protection.

The deliverable consists of 6 executable SQL scripts that can be run in sequence to create a fully functional database from scratch.

## Glossary

- **Database_System**: The Supabase PostgreSQL database instance
- **Booking_Engine**: The system component that manages booking requests and availability
- **RLS_Policy**: Row Level Security policy that enforces database-level authorization
- **Real_Time_Subscription**: Supabase WebSocket-based subscription for live data updates
- **Admin_User**: User with email mtosic0450@gmail.com who has full access to all data
- **Guest_User**: Authenticated user who can only access their own booking data
- **Public_User**: Unauthenticated user with read-only access to public data
- **JSONB_Column**: PostgreSQL JSON binary column type for storing multi-language content
- **Daterange_Type**: PostgreSQL range type for representing date intervals
- **Overlap_Constraint**: Database constraint preventing overlapping date ranges
- **Migration_Script**: SQL file that can be executed to modify database schema
- **Seed_Data**: Initial data inserted into database for testing and production use
- **Database_Function**: PostgreSQL stored procedure or function
- **Database_Trigger**: Automatic database action executed in response to events
- **Availability_Calendar**: System for tracking which dates are available for booking
- **Multi_Language_Content**: Content stored in multiple languages (Serbian, English, German, Italian)

## Requirements

### Requirement 1: Core Database Tables

**User Story:** As a developer, I want 9 core database tables created, so that the system can store all necessary data for the booking platform.

#### Acceptance Criteria

1. THE Database_System SHALL create an apartments table with JSONB columns for multi-language content
2. THE Database_System SHALL create a guests table with foreign key to Supabase auth.users
3. THE Database_System SHALL create a bookings table with daterange columns for check-in and check-out
4. THE Database_System SHALL create an availability table with per-date availability tracking
5. THE Database_System SHALL create a reviews table with approval workflow status field
6. THE Database_System SHALL create a messages table for contact form submissions
7. THE Database_System SHALL create a booking_messages table for guest-admin communication
8. THE Database_System SHALL create a content table for multi-language CMS with key-value structure
9. THE Database_System SHALL create an analytics_events table for custom tracking with JSONB event data
10. WHEN any table is created, THE Database_System SHALL include created_at and updated_at timestamp columns
11. WHEN any table is created, THE Database_System SHALL use UUID as primary key type

### Requirement 2: Multi-Language Content Support

**User Story:** As a content manager, I want multi-language support for 4 languages, so that guests can view content in Serbian, English, German, or Italian.

#### Acceptance Criteria

1. THE Database_System SHALL store apartment names in JSONB format with keys for sr, en, de, it
2. THE Database_System SHALL store apartment descriptions in JSONB format with keys for sr, en, de, it
3. THE Database_System SHALL store content table values in JSONB format for flexible content types
4. THE content table SHALL have a unique constraint on (key, language) combination
5. WHEN multi-language content is queried, THE Database_System SHALL return valid JSON objects

### Requirement 3: Booking Overlap Prevention

**User Story:** As a booking manager, I want the database to prevent double-bookings, so that no two confirmed bookings can overlap for the same apartment.

#### Acceptance Criteria

1. THE Database_System SHALL create a unique index on bookings table using apartment_id and daterange(check_in, check_out)
2. THE unique index SHALL only apply to bookings with status 'confirmed' or 'pending'
3. WHEN a booking with overlapping dates is inserted, THE Database_System SHALL reject the transaction with a constraint violation error
4. THE bookings table SHALL have a generated column 'nights' calculated as (check_out - check_in)
5. THE Database_System SHALL use PostgreSQL daterange type with inclusive bounds '[]'

### Requirement 4: Database Indexes for Performance

**User Story:** As a developer, I want indexes on frequently queried columns, so that database queries execute within acceptable performance limits.

#### Acceptance Criteria

1. THE Database_System SHALL create indexes on all foreign key columns
2. THE Database_System SHALL create an index on bookings(check_in, check_out) for date range queries
3. THE Database_System SHALL create an index on bookings(status) for filtering by booking status
4. THE Database_System SHALL create an index on availability(apartment_id, date) for calendar queries
5. THE Database_System SHALL create an index on reviews(apartment_id) for fetching apartment reviews
6. THE Database_System SHALL create an index on reviews(status) for filtering approved reviews
7. THE Database_System SHALL create an index on analytics_events(event_type) for analytics queries
8. THE Database_System SHALL create an index on analytics_events(created_at DESC) for time-series queries

### Requirement 5: Row Level Security Policies

**User Story:** As a security engineer, I want Row Level Security policies enforced at the database level, so that users can only access data they are authorized to see.

#### Acceptance Criteria

1. THE Database_System SHALL enable RLS on all tables except auth.users
2. WHEN a Public_User queries apartments, THE Database_System SHALL return only apartments with status 'active'
3. WHEN an Admin_User queries any table, THE Database_System SHALL return all rows without restriction
4. WHEN a Guest_User queries bookings, THE Database_System SHALL return only bookings where guest_id matches auth.uid()
5. WHEN a Public_User queries reviews, THE Database_System SHALL return only reviews with status 'approved'
6. WHEN a Guest_User inserts a booking, THE Database_System SHALL allow the insert if guest_id matches auth.uid()
7. WHEN a Public_User inserts analytics_events, THE Database_System SHALL allow the insert without authentication
8. THE RLS_Policy for Admin_User SHALL check if auth.jwt() ->> 'email' equals 'mtosic0450@gmail.com'

### Requirement 6: Availability Check Function

**User Story:** As a booking system, I want a database function to check availability, so that I can quickly determine if an apartment is available for given dates.

#### Acceptance Criteria

1. THE Database_System SHALL create a function check_availability(apartment_id UUID, check_in DATE, check_out DATE) that returns BOOLEAN
2. WHEN check_availability is called, THE function SHALL return FALSE if any confirmed or pending booking overlaps the date range
3. WHEN check_availability is called, THE function SHALL return TRUE if no bookings overlap the date range
4. THE function SHALL use PostgreSQL daterange overlap operator (&&) for efficient date comparison
5. THE function SHALL be defined as LANGUAGE SQL for performance

### Requirement 7: Available Apartments Query Function

**User Story:** As a booking system, I want a function to get available apartments for dates, so that I can show guests which apartments they can book.

#### Acceptance Criteria

1. THE Database_System SHALL create a function get_available_apartments(check_in DATE, check_out DATE, num_guests INT)
2. WHEN get_available_apartments is called, THE function SHALL return a table with columns (apartment_id, name, price)
3. THE function SHALL filter apartments where status equals 'active'
4. THE function SHALL filter apartments where capacity is greater than or equal to num_guests
5. THE function SHALL call check_availability for each apartment to verify availability
6. THE function SHALL return only apartments that pass all filters

### Requirement 8: Admin Statistics Function

**User Story:** As an admin, I want a function to get dashboard statistics, so that I can see key metrics at a glance.

#### Acceptance Criteria

1. THE Database_System SHALL create a function get_admin_stats() that returns a JSON object
2. THE function SHALL calculate total_bookings count from bookings table
3. THE function SHALL calculate confirmed_bookings count where status equals 'confirmed'
4. THE function SHALL calculate pending_bookings count where status equals 'pending'
5. THE function SHALL calculate total_revenue sum from bookings where status equals 'confirmed'
6. THE function SHALL calculate total_guests count from guests table
7. THE function SHALL return all statistics as a single JSONB object

### Requirement 9: Booking Change Notification Trigger

**User Story:** As a real-time system, I want triggers to notify on booking changes, so that connected clients receive live updates.

#### Acceptance Criteria

1. THE Database_System SHALL create a trigger function notify_booking_change() that calls pg_notify
2. WHEN a booking is inserted, THE Database_System SHALL execute notify_booking_change trigger
3. WHEN a booking is updated, THE Database_System SHALL execute notify_booking_change trigger
4. WHEN a booking is deleted, THE Database_System SHALL execute notify_booking_change trigger
5. THE trigger function SHALL send notification to channel 'booking_changes' with booking_id as payload
6. THE trigger function SHALL return NEW for INSERT/UPDATE and OLD for DELETE

### Requirement 10: Guest Statistics Update Trigger

**User Story:** As a system, I want guest statistics automatically updated, so that total_bookings and total_nights are always accurate.

#### Acceptance Criteria

1. THE Database_System SHALL create a trigger function update_guest_stats()
2. WHEN a booking status changes to 'confirmed', THE trigger SHALL increment guest total_bookings by 1
3. WHEN a booking status changes to 'confirmed', THE trigger SHALL increment guest total_nights by booking nights
4. WHEN a booking status changes from 'confirmed' to 'cancelled', THE trigger SHALL decrement guest statistics
5. THE trigger function SHALL use UPDATE statement on guests table where id equals booking guest_id

### Requirement 11: Real-Time Subscriptions Configuration

**User Story:** As a developer, I want real-time subscriptions enabled on key tables, so that the frontend can receive live updates via WebSocket.

#### Acceptance Criteria

1. THE Database_System SHALL enable real-time on bookings table via Supabase realtime publication
2. THE Database_System SHALL enable real-time on apartments table via Supabase realtime publication
3. THE Database_System SHALL enable real-time on availability table via Supabase realtime publication
4. THE Database_System SHALL enable real-time on analytics_events table via Supabase realtime publication
5. THE Database_System SHALL enable real-time on booking_messages table via Supabase realtime publication
6. WHEN real-time is enabled, THE Database_System SHALL allow clients to subscribe to postgres_changes events

### Requirement 12: Availability View for Queries

**User Story:** As a developer, I want a database view for availability queries, so that I can easily fetch calendar data with apartment details.

#### Acceptance Criteria

1. THE Database_System SHALL create a view availability_view that joins availability and apartments tables
2. THE view SHALL include columns: apartment_id, apartment_name, date, is_available, price_override, base_price
3. THE view SHALL calculate effective_price as COALESCE(price_override, base_price_eur)
4. THE view SHALL only include apartments with status 'active'
5. WHEN availability_view is queried, THE Database_System SHALL return denormalized data for efficient calendar rendering

### Requirement 13: Seed Data for 4 Apartments

**User Story:** As a developer, I want seed data for 4 apartments, so that the system has initial data for testing and production use.

#### Acceptance Criteria

1. THE Database_System SHALL insert 4 apartment records with multi-language names and descriptions
2. THE seed data SHALL include apartments named: "Apartman Deluxe", "Apartman Standard", "Apartman Family", "Apartman Studio"
3. WHEN seed data is inserted, THE Database_System SHALL set base_price_eur to realistic values (30-45 EUR)
4. THE seed data SHALL include capacity values ranging from 2 to 6 guests
5. THE seed data SHALL include amenities arrays with values like ["wifi", "parking", "lake_view", "kitchen"]
6. THE seed data SHALL include status 'active' for all apartments
7. THE seed data SHALL include multi-language content for Serbian (sr), English (en), German (de), and Italian (it)

### Requirement 14: Seed Data for Multi-Language Content

**User Story:** As a content manager, I want seed data for CMS content, so that the website has initial multi-language content.

#### Acceptance Criteria

1. THE Database_System SHALL insert content records for homepage hero section in all 4 languages
2. THE Database_System SHALL insert content records for key website sections (gallery, prices, attractions, contact)
3. WHEN content seed data is inserted, THE Database_System SHALL use consistent key naming convention (section.subsection.field)
4. THE content seed data SHALL include at least 20 content entries per language
5. THE content seed data SHALL store text values as JSONB for flexibility

### Requirement 15: Fresh Start Drop Script

**User Story:** As a developer, I want a script to drop all database objects, so that I can start fresh during development.

#### Acceptance Criteria

1. THE Database_System SHALL provide a script 00_DROP_ALL_FRESH_START.sql
2. WHEN the drop script is executed, THE Database_System SHALL drop all tables in correct dependency order
3. WHEN the drop script is executed, THE Database_System SHALL drop all functions
4. WHEN the drop script is executed, THE Database_System SHALL drop all views
5. WHEN the drop script is executed, THE Database_System SHALL drop all triggers
6. THE drop script SHALL use CASCADE option to handle dependencies
7. THE drop script SHALL use IF EXISTS to prevent errors if objects don't exist

### Requirement 16: Complete Schema Creation Script

**User Story:** As a developer, I want a script to create all tables, so that I can set up the database schema in one execution.

#### Acceptance Criteria

1. THE Database_System SHALL provide a script 01_SCHEMA_COMPLETE.sql
2. WHEN the schema script is executed, THE Database_System SHALL create all 9 core tables
3. WHEN the schema script is executed, THE Database_System SHALL create all indexes
4. WHEN the schema script is executed, THE Database_System SHALL create all constraints
5. THE schema script SHALL create tables in correct dependency order (apartments before bookings)
6. THE schema script SHALL enable uuid-ossp extension for UUID generation
7. WHEN the schema script completes, THE Database_System SHALL have a fully functional schema without errors

### Requirement 17: Complete RLS Policies Script

**User Story:** As a security engineer, I want a script to create all RLS policies, so that data access is properly secured.

#### Acceptance Criteria

1. THE Database_System SHALL provide a script 02_RLS_POLICIES_COMPLETE.sql
2. WHEN the RLS script is executed, THE Database_System SHALL enable RLS on all tables
3. WHEN the RLS script is executed, THE Database_System SHALL create policies for Public_User access
4. WHEN the RLS script is executed, THE Database_System SHALL create policies for Guest_User access
5. WHEN the RLS script is executed, THE Database_System SHALL create policies for Admin_User access
6. THE RLS script SHALL create separate policies for SELECT, INSERT, UPDATE, DELETE operations
7. WHEN the RLS script completes, THE Database_System SHALL enforce all security policies

### Requirement 18: Complete Functions Script

**User Story:** As a developer, I want a script to create all database functions, so that business logic is implemented at the database level.

#### Acceptance Criteria

1. THE Database_System SHALL provide a script 03_FUNCTIONS_COMPLETE.sql
2. WHEN the functions script is executed, THE Database_System SHALL create check_availability function
3. WHEN the functions script is executed, THE Database_System SHALL create get_available_apartments function
4. WHEN the functions script is executed, THE Database_System SHALL create get_admin_stats function
5. WHEN the functions script is executed, THE Database_System SHALL create notify_booking_change trigger function
6. WHEN the functions script is executed, THE Database_System SHALL create update_guest_stats trigger function
7. WHEN the functions script is executed, THE Database_System SHALL attach triggers to appropriate tables
8. WHEN the functions script completes, THE Database_System SHALL have all functions executable without errors

### Requirement 19: Complete Real-Time Configuration Script

**User Story:** As a developer, I want a script to enable real-time subscriptions, so that the frontend can receive live updates.

#### Acceptance Criteria

1. THE Database_System SHALL provide a script 04_REALTIME_COMPLETE.sql
2. WHEN the real-time script is executed, THE Database_System SHALL enable real-time on bookings table
3. WHEN the real-time script is executed, THE Database_System SHALL enable real-time on apartments table
4. WHEN the real-time script is executed, THE Database_System SHALL enable real-time on availability table
5. WHEN the real-time script is executed, THE Database_System SHALL enable real-time on analytics_events table
6. WHEN the real-time script is executed, THE Database_System SHALL enable real-time on booking_messages table
7. WHEN the real-time script is executed, THE Database_System SHALL create availability_view
8. WHEN the real-time script completes, THE Database_System SHALL allow WebSocket subscriptions to all enabled tables

### Requirement 20: Complete Seed Data Script

**User Story:** As a developer, I want a script to insert seed data, so that the database has initial data for testing and production.

#### Acceptance Criteria

1. THE Database_System SHALL provide a script 05_SEED_DATA_COMPLETE.sql
2. WHEN the seed script is executed, THE Database_System SHALL insert 4 apartment records
3. WHEN the seed script is executed, THE Database_System SHALL insert multi-language content records
4. WHEN the seed script is executed, THE Database_System SHALL insert sample availability records for next 365 days
5. THE seed script SHALL use INSERT ... ON CONFLICT DO NOTHING for idempotency
6. WHEN the seed script completes, THE Database_System SHALL have functional data for all 4 apartments

### Requirement 21: Script Execution Order Documentation

**User Story:** As a developer, I want clear documentation on script execution order, so that I can set up the database correctly.

#### Acceptance Criteria

1. WHEN scripts are provided, THE documentation SHALL specify execution order: 00 → 01 → 02 → 03 → 04 → 05
2. THE documentation SHALL explain that 00_DROP_ALL_FRESH_START.sql is optional for fresh starts
3. THE documentation SHALL explain that scripts 01-05 must be run in sequence
4. THE documentation SHALL specify that all scripts are idempotent where possible
5. THE documentation SHALL include example commands for executing scripts via Supabase CLI

### Requirement 22: ACID Compliance for Booking Transactions

**User Story:** As a booking system, I want ACID-compliant transactions, so that booking operations are reliable and consistent.

#### Acceptance Criteria

1. WHEN a booking is created, THE Database_System SHALL execute the operation within a transaction
2. WHEN a booking is created, THE Database_System SHALL update availability table atomically
3. IF a booking creation fails, THE Database_System SHALL rollback all changes
4. THE Database_System SHALL use PostgreSQL transaction isolation level READ COMMITTED
5. WHEN concurrent bookings are attempted, THE Database_System SHALL serialize access to prevent race conditions

### Requirement 23: Database Schema Validation

**User Story:** As a developer, I want schema validation, so that I can verify the database is correctly configured.

#### Acceptance Criteria

1. WHEN all scripts are executed, THE Database_System SHALL have exactly 9 tables
2. WHEN all scripts are executed, THE Database_System SHALL have at least 15 indexes
3. WHEN all scripts are executed, THE Database_System SHALL have at least 5 database functions
4. WHEN all scripts are executed, THE Database_System SHALL have at least 2 triggers
5. WHEN all scripts are executed, THE Database_System SHALL have at least 1 view
6. WHEN all scripts are executed, THE Database_System SHALL have RLS enabled on all tables

### Requirement 24: Parser and Serializer for JSONB Content

**User Story:** As a developer, I want reliable JSONB parsing and serialization, so that multi-language content is correctly stored and retrieved.

#### Acceptance Criteria

1. THE Database_System SHALL validate JSONB format when inserting multi-language content
2. WHEN invalid JSON is inserted, THE Database_System SHALL reject the transaction with a format error
3. THE Database_System SHALL provide JSONB operators for querying nested content (->>, ->, #>)
4. WHEN JSONB content is queried, THE Database_System SHALL return valid JSON that can be parsed by clients
5. FOR ALL valid JSONB content, inserting then retrieving then parsing SHALL produce equivalent data (round-trip property)

### Requirement 25: Performance Benchmarks

**User Story:** As a performance engineer, I want the database to meet performance benchmarks, so that the system responds quickly under load.

#### Acceptance Criteria

1. WHEN check_availability is called, THE Database_System SHALL return result within 50ms for single apartment
2. WHEN get_available_apartments is called, THE Database_System SHALL return results within 200ms for 4 apartments
3. WHEN availability_view is queried for 30 days, THE Database_System SHALL return results within 100ms
4. WHEN bookings table has 1000 records, THE Database_System SHALL maintain query performance within specified limits
5. THE Database_System SHALL use EXPLAIN ANALYZE to verify that queries use indexes efficiently

## Summary

This requirements document defines 25 requirements with 150+ acceptance criteria for creating a complete, production-ready Supabase PostgreSQL database schema for Apartmani Jovča. The database supports multi-language content, real-time booking calendar with overlap prevention, guest portal authentication, admin panel, custom analytics, and Row Level Security. The deliverable consists of 6 executable SQL scripts that create a fully functional database from scratch.
