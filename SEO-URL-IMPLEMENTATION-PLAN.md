# SEO-Friendly URL Implementation Plan

## Problem
Trenutno koristiš UUID-e u URL-ovima što je loše za SEO:
- ❌ `/sr/apartments?apartment=22222222-2222-2222-2222-222222222222`
- ❌ `/sr/booking?apartment=22222222-2222-2222-2222-222222222222`

## Rešenje - Slug-based URLs
Dodati `slug` kolonu u `apartments` tabelu i koristiti je u URL-ovima:
- ✅ `/sr/apartments/standard-apartman`
- ✅ `/sr/booking?apartment=standard-apartman`

## Implementacija

### 1. Database Migration ✅ DONE
**File:** `supabase/migrations/20260222000003_add_apartment_slug.sql`

```sql
ALTER TABLE apartments ADD COLUMN slug TEXT UNIQUE;
CREATE INDEX idx_apartments_slug ON apartments(slug);

-- Auto-generate slugs from name_sr
UPDATE apartments SET slug = LOWER(REGEXP_REPLACE(...));
```

**Rezultat:**
- `Apartman Standard` → `apartman-standard`
- `Apartman Deluxe` → `apartman-deluxe`
- `Apartman Premium` → `apartman-premium`

### 2. TypeScript Types ✅ DONE
**Files:**
- `src/lib/types/database.ts` - Added `slug: string` to `ApartmentRecord` and `LocalizedApartment`
- `src/lib/transformers/database.ts` - Added `slug` to transformer

### 3. API Routes - TODO
Treba ažurirati API rute da prihvataju slug umesto UUID:

#### a) `/api/apartments` - GET by slug
```typescript
// OLD: ?id=uuid
// NEW: ?slug=standard-apartman
```

#### b) `/api/availability` - Check by slug
```typescript
// OLD: ?apartmentId=uuid
// NEW: ?apartmentSlug=standard-apartman
```

#### c) `/api/booking` - Book by slug
```typescript
// OLD: { apartmentId: uuid }
// NEW: { apartmentSlug: 'standard-apartman' }
// Backend će lookup UUID iz slug-a
```

### 4. Frontend Pages - TODO

#### a) Apartments List Page
**File:** `src/app/[lang]/apartments/page.tsx`
```tsx
// OLD: <Link href={`/booking?apartment=${apt.id}`}>
// NEW: <Link href={`/booking?apartment=${apt.slug}`}>
```

#### b) Booking Page
**File:** `src/app/[lang]/booking/page.tsx`
```tsx
// OLD: const apartmentId = searchParams.get('apartment')
// NEW: const apartmentSlug = searchParams.get('apartment')
//      Fetch apartment by slug instead of ID
```

#### c) Booking Flow Component
**File:** `src/app/[lang]/booking/BookingFlow.tsx`
```tsx
// OLD: supabase.from('apartments').eq('id', apartmentId)
// NEW: supabase.from('apartments').eq('slug', apartmentSlug)
```

### 5. Dynamic Routes (Optional - Best for SEO)
Kreirati dinamičke rute za apartmane:

**New file:** `src/app/[lang]/apartments/[slug]/page.tsx`
```tsx
// URL: /sr/apartments/standard-apartman
// Shows apartment details + booking button
```

**Benefits:**
- Bolji SEO (svaki apartman ima svoju stranicu)
- Lepši URL-ovi
- Lakše deljenje linkova

### 6. Admin Panel - TODO
Dodati slug field u ApartmentManager:

**File:** `src/components/admin/ApartmentManager.tsx`
```tsx
<Input
  label="URL Slug (SEO)"
  value={apartment.slug}
  onChange={(e) => setApartment({...apartment, slug: e.target.value})}
  placeholder="standard-apartman"
/>
```

Auto-generate slug from name_sr:
```typescript
const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
}
```

## SEO Benefits

### Before (UUID):
```
URL: /sr/apartments?apartment=22222222-2222-2222-2222-222222222222
Google sees: Random string, no meaning
```

### After (Slug):
```
URL: /sr/apartments/standard-apartman
Google sees: "standard apartman" - relevant keywords!
```

### Even Better (Dynamic Route):
```
URL: /sr/apartments/standard-apartman
Title: Apartman Standard - Apartmani Jovča
Meta: Udoban standard apartman u centru grada...
```

## Migration Strategy

### Phase 1: Add Slug Support (Backward Compatible)
1. ✅ Add slug column to database
2. ✅ Update TypeScript types
3. TODO: Update API routes to accept BOTH id AND slug
4. TODO: Update frontend to use slug in NEW links
5. OLD links with UUID still work (backward compatible)

### Phase 2: Full Migration
1. TODO: Update all existing links to use slug
2. TODO: Add redirects from UUID to slug URLs
3. TODO: Remove UUID support from public URLs (keep for admin)

### Phase 3: Dynamic Routes (Optional)
1. TODO: Create `/apartments/[slug]/page.tsx`
2. TODO: Add structured data (JSON-LD) for SEO
3. TODO: Add Open Graph tags for social sharing

## Dostupnost Tab Problem

**Current Issue:** 1400 upisa za celu godinu je previše

**Solution Options:**

### Option 1: Lazy Loading
Učitavaj dostupnost samo za vidljivi mesec:
```typescript
// Load only current month + next month
const startDate = new Date()
const endDate = new Date()
endDate.setMonth(endDate.getMonth() + 2)
```

### Option 2: On-Demand Generation
Ne čuvaj sve datume u bazi, generiši ih on-the-fly:
```typescript
// Check availability by querying bookings table
// No need for 1400 availability records
SELECT * FROM bookings 
WHERE apartment_id = ? 
AND check_in <= ? 
AND check_out >= ?
```

### Option 3: Remove Availability Tab
Dostupnost se već vidi u Booking Flow kalendaru.
Admin panel ne treba poseban tab za dostupnost.

**Recommendation:** Option 3 - Ukloni Availability tab iz admin panela.

## Next Steps

1. Run migration: `supabase migration up`
2. Update API routes to accept slug
3. Update frontend to use slug in URLs
4. Test booking flow with slug
5. (Optional) Create dynamic routes for apartments
6. Remove or optimize Availability tab

## Status
- ✅ Database migration created
- ✅ TypeScript types updated
- ✅ Transformer updated
- ⏳ API routes - TODO
- ⏳ Frontend pages - TODO
- ⏳ Admin panel - TODO
- ⏳ Dynamic routes - TODO (optional)
