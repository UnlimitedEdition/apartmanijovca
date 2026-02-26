# Supabase Database Migrations - Apartmani Jovča

This directory contains 6 complete SQL migration scripts for the Apartmani Jovča booking platform database.

## Script Execution Order

The scripts must be executed in the following order:

1. **00_DROP_ALL_FRESH_START.sql** (Optional - for fresh starts only)
2. **01_SCHEMA_COMPLETE.sql** (Required - creates all tables)
3. **02_RLS_POLICIES_COMPLETE.sql** (Required - enables Row Level Security)
4. **03_FUNCTIONS_COMPLETE.sql** (Required - creates functions and triggers)
5. **04_REALTIME_COMPLETE.sql** (Required - enables real-time and creates views)
6. **05_SEED_DATA_COMPLETE.sql** (Required - inserts initial data)

## Script Descriptions

### 00_DROP_ALL_FRESH_START.sql
**Purpose:** Drop all database objects for a fresh start during development.

**WARNING:** This script will delete ALL data from the database. Use with caution!

**When to use:**
- Starting fresh during development
- Resetting the database to a clean state
- Before running the full migration sequence

**What it does:**
- Drops all views
- Drops all triggers
- Drops all functions
- Drops all tables in reverse dependency order

### 01_SCHEMA_COMPLETE.sql
**Purpose:** Create the complete database schema with all 9 core tables.

**What it creates:**
- Extensions: `uuid-ossp`, `btree_gist`
- Tables: `apartments`, `guests`, `bookings`, `availability`, `reviews`, `booking_messages`, `messages`, `content`, `analytics_events`
- All indexes for performance optimization
- All constraints including the critical exclusion constraint for booking overlap prevention
- Table and column comments for documentation

**Key features:**
- UUID primary keys on all tables
- JSONB columns for multi-language content
- Generated column for `bookings.nights`
- Exclusion constraint preventing double-bookings using PostgreSQL daterange

### 02_RLS_POLICIES_COMPLETE.sql
**Purpose:** Enable Row Level Security and create all security policies.

**What it creates:**
- RLS enabled on all 9 tables
- Public access policies (view active apartments, approved reviews, etc.)
- Guest access policies (view/manage own bookings, reviews, messages)
- Admin access policies (full access for mtosic0450@gmail.com)

**Security levels:**
- **Public users:** Can view active apartments, approved reviews, content, and insert analytics
- **Guest users:** Can view/manage their own bookings, reviews, and messages
- **Admin user:** Full access to all tables and operations

### 03_FUNCTIONS_COMPLETE.sql
**Purpose:** Create all database functions and triggers.

**What it creates:**
- **Functions:**
  - `check_availability()` - Check if apartment is available for date range
  - `get_available_apartments()` - Get list of available apartments
  - `get_admin_stats()` - Calculate dashboard statistics
  - `generate_booking_number()` - Generate unique booking numbers (BJ-YYYY-NNNN)
  - `update_availability_for_booking()` - Update availability when booking changes

- **Trigger Functions:**
  - `notify_booking_change()` - Send real-time notifications on booking changes
  - `update_guest_stats()` - Update guest statistics when booking status changes
  - `set_booking_number()` - Automatically generate booking number on insert
  - `update_updated_at()` - Automatically update updated_at timestamp

- **Triggers:**
  - Booking change notifications (INSERT, UPDATE, DELETE)
  - Guest statistics updates (INSERT, UPDATE)
  - Automatic booking number generation (INSERT)
  - Automatic updated_at timestamps (UPDATE on all tables)

### 04_REALTIME_COMPLETE.sql
**Purpose:** Enable real-time subscriptions and create denormalized views.

**What it creates:**
- Real-time enabled on: `bookings`, `apartments`, `availability`, `booking_messages`, `analytics_events`
- **Views:**
  - `availability_view` - Denormalized calendar view with 365 days of availability
  - `booking_details_view` - Complete booking information with guest and apartment details
  - `apartment_stats_view` - Aggregate statistics per apartment

**Real-time features:**
- WebSocket subscriptions for live updates
- Automatic notifications on data changes
- Efficient calendar queries via views

### 05_SEED_DATA_COMPLETE.sql
**Purpose:** Insert initial seed data for testing and production.

**What it inserts:**
- **4 Apartments:**
  - Apartman Deluxe (4 guests, 45 EUR, lake view)
  - Apartman Standard (3 guests, 35 EUR)
  - Apartman Family (6 guests, 40 EUR, 2 bedrooms)
  - Apartman Studio (2 guests, 30 EUR)

- **Multi-language content:**
  - Homepage hero section (title, subtitle, CTA)
  - Gallery section (title, description)
  - Prices section (title, description)
  - Attractions section (title, description)
  - Contact section (title, description, phone, email)
  - All content in 4 languages: Serbian (sr), English (en), German (de), Italian (it)

- **Availability records:**
  - 365 days of availability for all active apartments
  - All dates initially set to available

**Idempotency:**
- Uses `ON CONFLICT DO NOTHING` to prevent duplicate data
- Safe to run multiple times

## Execution Methods

### Method 1: Supabase CLI (Recommended)

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations in order
supabase db push
```

### Method 2: Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste each script in order
4. Execute each script one by one

### Method 3: psql Command Line

```bash
# Connect to your Supabase database
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Execute scripts in order
\i 00_DROP_ALL_FRESH_START.sql  # Optional
\i 01_SCHEMA_COMPLETE.sql
\i 02_RLS_POLICIES_COMPLETE.sql
\i 03_FUNCTIONS_COMPLETE.sql
\i 04_REALTIME_COMPLETE.sql
\i 05_SEED_DATA_COMPLETE.sql
```

### Method 4: Node.js Script

```javascript
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const scripts = [
  '00_DROP_ALL_FRESH_START.sql',  // Optional
  '01_SCHEMA_COMPLETE.sql',
  '02_RLS_POLICIES_COMPLETE.sql',
  '03_FUNCTIONS_COMPLETE.sql',
  '04_REALTIME_COMPLETE.sql',
  '05_SEED_DATA_COMPLETE.sql'
]

for (const script of scripts) {
  const sql = fs.readFileSync(`./supabase/migrations/${script}`, 'utf8')
  const { error } = await supabase.rpc('exec_sql', { sql })
  if (error) {
    console.error(`Error executing ${script}:`, error)
    break
  }
  console.log(`✓ Executed ${script}`)
}
```

## Idempotency

Most scripts are designed to be idempotent where possible:

- **00_DROP_ALL_FRESH_START.sql:** Uses `IF EXISTS` clauses
- **01_SCHEMA_COMPLETE.sql:** Uses `CREATE EXTENSION IF NOT EXISTS`
- **02_RLS_POLICIES_COMPLETE.sql:** Policies can be recreated (drop and recreate if needed)
- **03_FUNCTIONS_COMPLETE.sql:** Uses `CREATE OR REPLACE FUNCTION` and `DROP TRIGGER IF EXISTS`
- **04_REALTIME_COMPLETE.sql:** Uses `CREATE OR REPLACE VIEW`
- **05_SEED_DATA_COMPLETE.sql:** Uses `ON CONFLICT DO NOTHING`

## Verification

After running all scripts, verify the database is correctly configured:

### Check Tables
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```
Expected: 9 tables (apartments, guests, bookings, availability, reviews, booking_messages, messages, content, analytics_events)

### Check Indexes
```sql
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename, indexname;
```
Expected: At least 15 indexes

### Check Functions
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_type = 'FUNCTION'
ORDER BY routine_name;
```
Expected: At least 8 functions

### Check Triggers
```sql
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;
```
Expected: At least 10 triggers

### Check Views
```sql
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public'
ORDER BY table_name;
```
Expected: 3 views (availability_view, booking_details_view, apartment_stats_view)

### Check RLS
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
```
Expected: All tables should have `rowsecurity = true`

### Check Seed Data
```sql
-- Check apartments
SELECT id, name->>'en' as name, capacity, base_price_eur 
FROM apartments 
ORDER BY base_price_eur;

-- Check content
SELECT key, language, value 
FROM content 
WHERE key LIKE 'home.hero%'
ORDER BY key, language;

-- Check availability
SELECT apartment_id, COUNT(*) as days_available 
FROM availability 
WHERE is_available = TRUE
GROUP BY apartment_id;
```
Expected: 4 apartments, multi-language content, 365 days of availability per apartment

## Database Features

### Zero Double-Bookings
The database uses a PostgreSQL exclusion constraint with `daterange` type to prevent overlapping bookings at the database level. This guarantees zero double-bookings even under concurrent load.

```sql
-- The critical constraint
CREATE UNIQUE INDEX idx_bookings_no_overlap 
  ON bookings USING GIST (
    apartment_id WITH =,
    daterange(check_in, check_out, '[]') WITH &&
  )
  WHERE status IN ('confirmed', 'pending');
```

### Multi-Language Support
All user-facing content is stored in JSONB format with keys for 4 languages:
- Serbian (sr)
- English (en)
- German (de)
- Italian (it)

### Real-Time Updates
WebSocket subscriptions are enabled on key tables for live updates:
- Booking changes notify connected clients instantly
- Calendar updates in real-time
- Admin dashboard statistics update live

### Row Level Security
Database-level security ensures:
- Public users only see active apartments and approved reviews
- Guests only see their own bookings and messages
- Admin has full access to all data

## Troubleshooting

### Error: Extension "uuid-ossp" does not exist
**Solution:** Enable the extension manually in Supabase dashboard under Database > Extensions

### Error: Extension "btree_gist" does not exist
**Solution:** Enable the extension manually in Supabase dashboard under Database > Extensions

### Error: Permission denied for schema public
**Solution:** Ensure you're using the service role key, not the anon key

### Error: Relation "auth.users" does not exist
**Solution:** This is a Supabase managed table. Ensure you're connected to a Supabase project, not a plain PostgreSQL database

### Error: Constraint violation on booking insert
**Solution:** This is expected behavior! The exclusion constraint is working correctly to prevent double-bookings. Check availability before inserting.

## Support

For issues or questions:
- Email: mtosic0450@gmail.com
- Project: Apartmani Jovča - Bovansko Lake, Serbia

## License

Proprietary - All rights reserved
