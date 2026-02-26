# Database Migration Guide

This guide explains how to set up and migrate the database for the **Apartmani Jovca** project using Supabase.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Method 1: Using Supabase Dashboard (SQL Editor)](#method-1-using-supabase-dashboard-sql-editor)
3. [Method 2: Using Supabase CLI](#method-2-using-supabase-cli)
4. [Seeding the Database](#seeding-the-database)
5. [Verifying the Migration](#verifying-the-migration)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, make sure you have:

- Access to the Supabase project: [https://aeyctgzddvxhpxymcetf.supabase.co](https://aeyctgzddvxhpxymcetf.supabase.co)
- Supabase project credentials (URL and anon/service role keys)
- For CLI method: Node.js 18+ and Supabase CLI installed

### Getting Your Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** > **API**
4. Copy the following:
   - **Project URL** (e.g., `https://aeyctgzddvxhpxymcetf.supabase.co`)
   - **anon public key** (for client-side operations)
   - **service_role key** (for admin operations - keep this secret!)

---

## Method 1: Using Supabase Dashboard (SQL Editor)

This is the easiest method for beginners. You run SQL directly in the Supabase dashboard.

### Step 1: Open SQL Editor

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project (**Apartmani Jovca**)
3. In the left sidebar, click **SQL Editor**
4. Click **New Query** to create a new SQL query

### Step 2: Run the Migration

1. Open the migration file: [`supabase/migrations/20260213000000_initial_schema.sql`](../supabase/migrations/20260213000000_initial_schema.sql)
2. Copy the entire contents of the file
3. Paste it into the SQL Editor
4. Click **Run** (or press `Ctrl + Enter` / `Cmd + Enter`)

### Step 3: Verify Success

You should see a success message with no errors. If successful, the following tables will be created:
- `content` - For localized website content
- `apartments` - Apartment listings
- `guests` - Guest information
- `bookings` - Booking records
- `availability` - Apartment availability calendar
- `reviews` - Guest reviews
- `messages` - Contact form messages

---

## Method 2: Using Supabase CLI

This method is recommended for developers who prefer command-line tools and version control.

### Step 1: Install Supabase CLI

```bash
# Using npm
npm install -g supabase

# Using Homebrew (macOS)
brew install supabase/tap/supabase

# Using Scoop (Windows)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### Step 2: Login to Supabase

```bash
supabase login
```

This will open a browser window for authentication.

### Step 3: Link Your Project

```bash
# Navigate to the project directory
cd apartmani-jovca-next

# Link to your Supabase project
supabase link --project-ref aeyctgzddvxhpxymcetf
```

You'll be prompted for your database password. You can find this in:
- Supabase Dashboard > Settings > Database > Database Password

### Step 4: Run Migrations

```bash
# Push migrations to the remote database
supabase db push

# Or run a specific migration file
supabase db execute --file supabase/migrations/20260213000000_initial_schema.sql
```

### Step 5: Check Migration Status

```bash
# List all migrations and their status
supabase db list
```

---

## Seeding the Database

After running the main migration, you can populate the database with initial data.

### Using SQL Editor (Dashboard)

1. Open **SQL Editor** in Supabase Dashboard
2. Create a **New Query**
3. Copy the contents of [`supabase/seed.sql`](../supabase/seed.sql)
4. Paste and click **Run**

### Using CLI

```bash
supabase db execute --file supabase/seed.sql
```

### What the Seed Data Includes

The seed file contains:

- **3 Apartments** (Apartman Jezero, Apartman Sova, Apartman Porodica)
- **Site Settings** (contact info, social links, check-in/out times)
- **Localized Content** in Serbian (sr), English (en), German (de), and Italian (it)
- **5 Attractions** near Bovan Lake (Jezero Bovan, Manastir Ravanica, Banja Ribarska, Soko Grad, Planina Ozren)

---

## Verifying the Migration

### Method 1: Using Dashboard Table Editor

1. Go to **Table Editor** in Supabase Dashboard
2. You should see all the tables listed in the sidebar
3. Click on each table to verify columns and data

### Method 2: Using SQL Queries

Run these queries in the SQL Editor:

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Count records in each table
SELECT 'apartments' as table_name, COUNT(*) as count FROM apartments
UNION ALL SELECT 'content', COUNT(*) FROM content
UNION ALL SELECT 'guests', COUNT(*) FROM guests
UNION ALL SELECT 'bookings', COUNT(*) FROM bookings
UNION ALL SELECT 'reviews', COUNT(*) FROM reviews;

-- View apartments
SELECT id, name, type, capacity, price_per_night FROM apartments;

-- View content sections
SELECT lang, section FROM content ORDER BY lang, section;

-- Test the availability function
SELECT * FROM get_available_apartments('2026-06-01', '2026-06-07');
```

### Method 3: Using the Helper Script

Run the migration verification script:

```bash
cd apartmani-jovca-next
node scripts/migrate.js
```

See the output for connection status and table verification.

---

## Troubleshooting

### Common Issues

#### 1. "relation already exists" Error

This means the table already exists. You can either:
- Skip this migration (tables are already created)
- Drop the table first: `DROP TABLE IF EXISTS table_name CASCADE;` (be careful - this deletes data!)

#### 2. "permission denied" or RLS Errors

Row Level Security (RLS) is enabled. Make sure you're:
- Using the service role key for admin operations
- Properly authenticated for user operations

#### 3. CLI Link Fails

- Verify your project ref is correct: `aeyctgzddvxhpxymcetf`
- Check your database password
- Ensure you have access to the project

#### 4. Seed Data Conflicts

If you see "duplicate key value conflicts":
- The data already exists (which is fine)
- Use `ON CONFLICT DO NOTHING` (already included in seed.sql)
- Or clear the table first: `TRUNCATE table_name RESTART IDENTITY CASCADE;`

### Getting Help

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- Check the project's GitHub issues

---

## Environment Variables

After migration, add these to your `.env.local` file:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://aeyctgzddvxhpxymcetf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Site
NEXT_PUBLIC_SITE_URL=https://apartmani-jovca.vercel.app
```

**Important**: Never commit the service role key to version control!

---

## Database Schema Overview

```
+-------------+     +-------------+     +-------------+
|  apartments |<--->|  bookings   |<--->|   guests    |
+-------------+     +-------------+     +-------------+
       |                   |
       v                   v
+-------------+     +-------------+
| availability|     |   reviews   |
+-------------+     +-------------+

+-------------+     +-------------+
|   content   |     |  messages   |
+-------------+     +-------------+
```

### Key Relationships

- `bookings.apartment_id` -> `apartments.id`
- `bookings.guest_id` -> `guests.id`
- `reviews.apartment_id` -> `apartments.id`
- `reviews.guest_id` -> `guests.id`
- `availability.apartment_id` -> `apartments.id`

### Useful Functions

- `check_availability(apartment_id, checkin, checkout)` - Check if an apartment is available
- `get_available_apartments(checkin, checkout)` - Get all available apartments for dates

---

## Next Steps

After successful migration:

1. Set up authentication (Supabase Auth)
2. Configure email templates
3. Set up storage buckets for images
4. Deploy Edge Functions for notifications
5. Test the booking flow

Good luck! If you encounter any issues, refer to the troubleshooting section above.