# Content Migration Guide

This document describes how to migrate content from the legacy JSON files to the Supabase database.

## Overview

The content migration script transfers localized content from the legacy backend JSON files to the Supabase `content` table. This enables dynamic content management through the admin panel while preserving all existing translations.

## Source Files

The migration reads from the following legacy JSON files:

| File | Language | Description |
|------|----------|-------------|
| `backend/data/sr.json` | Serbian | Primary/default language |
| `backend/data/en.json` | English | English translations |
| `backend/data/de.json` | German | German translations |
| `backend/data/it.json` | Italian | Italian translations |

## Target Tables

### `content` Table

The main target for migration. Stores localized content as JSONB data.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `lang` | TEXT | Language code (sr, en, de, it) |
| `section` | TEXT | Content section name |
| `data` | JSONB | Content data as JSON |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**Unique constraint**: `(lang, section)` - ensures one entry per language/section combination.

### Sections Migrated

| Section | Description | Example Content |
|---------|-------------|-----------------|
| `home` | Homepage content | title, subtitle, description, aboutText |
| `gallery` | Gallery page | title, description, images array |
| `prices` | Pricing page | title, apartments array, includes |
| `attractions` | Attractions page | title, description, list array |
| `contact` | Contact page | title, phone, email, address |
| `nav` | Navigation labels | home, gallery, prices, attractions, contact |
| `language` | Language switcher | language codes |
| `footer` | Footer content | copyright, links, author |
| `site_settings` | Site configuration | contact info, social links, settings |

## Prerequisites

Before running the migration:

1. **Supabase project must be set up**
   - Run the initial migration: `supabase/migrations/20260213000000_initial_schema.sql`
   - See [DATABASE_MIGRATION.md](./DATABASE_MIGRATION.md) for details

2. **Environment variables must be configured**
   Create/update `.env.local` in the project root:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

3. **Legacy JSON files must exist**
   Ensure `backend/data/` contains all four language files.

## Running the Migration

### Standard Migration

```bash
cd apartmani-jovca-next
npm run db:migrate-content
```

### Expected Output

```
============================================================
Apartmani Jovča - Content Migration Script
============================================================

============================================================
Step 1: Validating Environment
============================================================
  ✓ SUPABASE_URL: https://your-project.supabase.co
  ✓ NEXT_PUBLIC_SUPABASE_ANON_KEY is set
  ✓ SUPABASE_SERVICE_ROLE_KEY is set

============================================================
Step 2: Initializing Supabase Client
============================================================
  ✓ Supabase client initialized

============================================================
Step 3: Reading Legacy JSON Files
============================================================
  ✓ Read sr.json - Found 8 sections
  ✓ Read en.json - Found 8 sections
  ✓ Read de.json - Found 8 sections
  ✓ Read it.json - Found 8 sections
  ℹ Total records to migrate: 32

============================================================
Step 4: Migrating Content to Supabase
============================================================
  ℹ Migrating language: SR
  [1/32] (3%) Migrating section: home
  ...

============================================================
Migration Summary
============================================================
  Total records processed: 33
  ✓ Successfully migrated: 33

✓ All content migrated successfully!

Next steps:
  1. Verify the migration: npm run db:check
  2. Check content in Supabase dashboard
  3. Test the website to ensure content displays correctly
```

## Idempotency

The migration script is **idempotent**, meaning it can be safely run multiple times:

- Uses `upsert` operations with `onConflict: 'lang,section'`
- Existing records are updated with new data
- No duplicate records are created
- Safe to re-run after fixing errors

## Verifying the Migration

### Option 1: Using the verification script

```bash
npm run db:check
```

This will show:
- Database connection status
- Table existence verification
- Content entries grouped by language

### Option 2: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Table Editor** → **content**
3. Verify records exist for all languages:
   - 4 languages × 8 sections = 32 content records
   - Plus 1 site_settings record = 33 total

### Option 3: SQL Query

Run this query in the Supabase SQL Editor:

```sql
-- Count content by language
SELECT lang, COUNT(*) as count
FROM content
GROUP BY lang
ORDER BY lang;

-- View all sections for a language
SELECT section, data
FROM content
WHERE lang = 'sr'
ORDER BY section;

-- Check specific content
SELECT data->>'title' as title, data->>'description' as description
FROM content
WHERE lang = 'en' AND section = 'home';
```

### Option 4: Test the Website

1. Start the development server: `npm run dev`
2. Visit each language version:
   - `http://localhost:3000/sr`
   - `http://localhost:3000/en`
   - `http://localhost:3000/de`
   - `http://localhost:3000/it`
3. Verify content displays correctly on all pages

## Rollback

If you need to rollback the migration:

### Option 1: Delete migrated content (keeps structure)

```sql
-- Delete all migrated content
DELETE FROM content WHERE section IN (
  'home', 'gallery', 'prices', 'attractions', 
  'contact', 'nav', 'language', 'footer', 'site_settings'
);

-- Or delete content for specific language
DELETE FROM content WHERE lang = 'sr';
```

### Option 2: Restore from backup

If you have a database backup:

1. Go to Supabase Dashboard → Database → Backups
2. Select the backup from before the migration
3. Restore the backup

### Option 3: Re-run migration with correct data

Since the migration is idempotent, you can:

1. Fix the source JSON files
2. Re-run: `npm run db:migrate-content`

## Troubleshooting

### Error: "Legacy JSON file not found"

**Cause**: The script cannot find the legacy JSON files.

**Solution**: Ensure the `backend/data/` directory exists relative to `apartmani-jovca-next/`:
```
Jovca Sajt/
├── apartmani-jovca-next/    ← Run migration from here
│   └── scripts/
│       └── migrate-content.js
└── backend/
    └── data/
        ├── sr.json
        ├── en.json
        ├── de.json
        └── it.json
```

### Error: "Missing required environment variables"

**Cause**: `.env.local` file is missing or incomplete.

**Solution**: Create/update `.env.local` with required variables:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Error: "relation "content" does not exist"

**Cause**: The database migration has not been run.

**Solution**: Run the initial schema migration first:
1. Go to Supabase Dashboard → SQL Editor
2. Run the contents of `supabase/migrations/20260213000000_initial_schema.sql`

### Error: "permission denied for table content"

**Cause**: RLS policies are blocking the operation.

**Solution**: Ensure you're using the service role key, or check RLS policies:
```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'content';

-- Temporarily disable RLS (not recommended for production)
ALTER TABLE content DISABLE ROW LEVEL SECURITY;

-- Re-enable after migration
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
```

### Warning: "Attractions table does not exist"

**Cause**: The `attractions` table is optional and may not be created.

**Solution**: This is expected. Attractions are stored in the `content` table under the `attractions` section. No action needed.

## Data Mapping Reference

### Home Section

| JSON Path | Description |
|-----------|-------------|
| `home.title` | Site title |
| `home.subtitle` | Homepage subtitle |
| `home.description` | Meta description |
| `home.aboutText` | About us text |
| `home.reserve` | CTA button text |

### Contact Section

| JSON Path | Description |
|-----------|-------------|
| `contact.phone` | Contact phone number |
| `contact.email` | Contact email address |
| `contact.address` | Physical address |

### Attractions Section

| JSON Path | Description |
|-----------|-------------|
| `attractions.title` | Page title |
| `attractions.description` | Page description |
| `attractions.list[]` | Array of attractions |
| `attractions.list[].name` | Attraction name |
| `attractions.list[].description` | Attraction description with distance |

## Support

For issues or questions:

1. Check the [DATABASE_MIGRATION.md](./DATABASE_MIGRATION.md) for database setup
2. Review the script source: `scripts/migrate-content.js`
3. Check Supabase logs in the dashboard
