# Apartmani Jovča

A modern, multi-language website for Apartmani Jovča built with Next.js 14, Supabase, and Tailwind CSS.

## Features

- 🌍 **Multi-language Support**: English, Serbian, German, and Italian
- 🎨 **Modern UI**: Built with Tailwind CSS and shadcn/ui components
- 🗄️ **Database Integration**: Supabase for backend and authentication
- 📱 **Responsive Design**: Mobile-first approach
- 🧪 **Testing**: Jest and React Testing Library setup
- 🎯 **TypeScript**: Full type safety throughout the application

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: Supabase
- **Internationalization**: next-i18next
- **Forms**: React Hook Form + Zod
- **State Management**: TanStack Query
- **Theming**: next-themes
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Configure your environment variables in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   NEXT_PUBLIC_DEFAULT_LANGUAGE=en
   NEXTAUTH_SECRET=your-secret-key
   NEXTAUTH_URL=http://localhost:3000
   ```

### Development

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Testing

Run the test suite:

```bash
npm test
```

### Linting

Run ESLint:

```bash
npm run lint
```

## Project Structure

```
src/
├── app/
│   ├── [lang]/               # Language-specific routes
│   │   ├── components/       # Reusable components
│   │   │   ├── ui/          # UI components (shadcn/ui)
│   │   │   ├── layout/      # Layout components
│   │   │   └── shared/      # Shared components
│   │   ├── lib/             # Utilities and configurations
│   │   │   ├── supabase/    # Supabase client and types
│   │   │   └── utils/       # Utility functions
│   │   └── __tests__/       # Test files
│   ├── layout.tsx           # Root layout
│   └── globals.css          # Global styles
public/
├── locales/                 # Translation files
│   ├── en/
│   ├── sr/
│   ├── de/
│   └── it/
```

## Database Schema

The project uses Supabase PostgreSQL database with the following tables:

### Tables Overview

- **`guests`** - Guest information (⚠️ uses `full_name` column, NOT `name`)
- **`apartments`** - Apartment listings (⚠️ uses `base_price_eur` column, NOT `price_per_night`)
- **`bookings`** - Booking records (⚠️ uses `check_in`, `check_out`, `nights` columns with underscores)
- **`availability`** - Apartment availability calendar
- **`reviews`** - Guest reviews and ratings
- **`booking_messages`** - Messages related to bookings
- **`messages`** - Contact form messages
- **`gallery`** - Image gallery
- **`analytics_events`** - Analytics tracking
- **`content`** - CMS content management

### Critical Column Names

**⚠️ Important**: The following column names are used in the database:

| Table | Column | ❌ NOT | ✅ Correct |
|-------|--------|--------|-----------|
| `guests` | `full_name` | ❌ `name` | ✅ `full_name` |
| `apartments` | `base_price_eur` | ❌ `price_per_night` | ✅ `base_price_eur` |
| `apartments` | N/A | ❌ `type` | ✅ (column doesn't exist) |
| `bookings` | `check_in` | ❌ `checkin` | ✅ `check_in` |
| `bookings` | `check_out` | ❌ `checkout` | ✅ `check_out` |
| `bookings` | `nights` | ❌ N/A | ✅ `nights` |
| `bookings` | `booking_number` | ❌ N/A | ✅ `booking_number` |

### JSONB Columns

The `apartments` table uses JSONB columns for multi-language support:

| Column | Type | Structure |
|--------|------|-----------|
| `name` | JSONB | `{sr: string, en: string, de: string, it: string}` |
| `description` | JSONB | `{sr: string, en: string, de: string, it: string}` |
| `bed_type` | JSONB | `{sr: string, en: string, de: string, it: string}` |
| `amenities` | JSONB[] | `[{sr: string, en: string, de: string, it: string}, ...]` |
| `images` | JSONB[] | `[{url: string, alt: {sr: string, en: string, de: string, it: string}}, ...]` |

### Data Transformation

API routes use transformer functions (`src/lib/transformers/database.ts`) to convert JSONB objects into localized strings based on the `Accept-Language` header:

**Transformer Functions**:
- `transformApartmentRecord()` - Converts `ApartmentRecord` (JSONB) → `LocalizedApartment` (strings)
- `transformBookingRecord()` - Converts `BookingRecord` with related data
- `transformReviewRecord()` - Converts `ReviewRecord` with related data
- `reverseTransformApartmentData()` - Converts frontend data → JSONB for database

**Example**:
```typescript
// Database record (JSONB)
{
  name: {sr: "Apartman 1", en: "Apartment 1", de: "Wohnung 1", it: "Appartamento 1"},
  base_price_eur: 50
}

// After transformation (localized for Serbian)
{
  name: "Apartman 1",  // ✅ String, not object
  base_price_eur: 50
}
```

### TypeScript Types

All database tables have corresponding TypeScript types in `src/lib/types/database.ts`:

- `GuestRecord` - Guest table type
- `ApartmentRecord` - Apartment table type (with JSONB fields as `Json` type)
- `BookingRecord` - Booking table type
- `AvailabilityRecord` - Availability table type
- `ReviewRecord` - Review table type
- `BookingMessageRecord` - Booking message table type
- `MessageRecord` - Message table type
- `GalleryRecord` - Gallery table type
- `AnalyticsEventRecord` - Analytics event table type
- `ContentRecord` - Content table type
- `LocalizedApartment` - Frontend-friendly apartment type (with localized strings)

### Migrations

SQL migrations are located in `supabase/migrations/`:

- `01_SCHEMA_COMPLETE.sql` - Complete database schema
- `02_RLS_POLICIES_COMPLETE.sql` - Row Level Security policies
- `03_FUNCTIONS_COMPLETE.sql` - Database functions and triggers
- `04_REALTIME_COMPLETE.sql` - Realtime configuration
- `05_SEED_DATA_COMPLETE.sql` - Initial seed data

**Applying Migrations**:
```bash
# Using Supabase CLI
supabase db push

# Or manually
psql -h your-db-host -U postgres -d postgres -f supabase/migrations/01_SCHEMA_COMPLETE.sql
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode

## Deployment

The application is configured for deployment on Vercel with automatic deployments from the main branch.

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Write tests for new features
4. Ensure all tests pass
5. Submit a pull request

## License

This project is private and proprietary.
