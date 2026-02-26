# Booking Flow - Slug Parameter Support ✅

## Status: COMPLETED
**Date:** February 23, 2026

## Problem
URL parametar `?apartment=apartman-veliki` (slug) nije radio - BookingFlow je očekivao UUID (ID) i nije mogao da učita apartman. Korisnik je morao ponovo da bira apartman umesto da bude automatski izabran.

## Root Cause
```typescript
// STARO - Samo ID
supabase
  .from('apartments')
  .select('*')
  .eq('id', apartmentId)  // ❌ Ne radi sa slug-om
  .single()
```

URL: `?apartment=apartman-veliki` → Nije pronađen jer je slug, ne ID

## Solution Implemented

### 1. Smart Parameter Detection
Dodato automatsko prepoznavanje da li je parametar UUID (ID) ili slug:

```typescript
const apartmentParam = searchParams.get('apartment')

// Detect if parameter is UUID or slug
const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(apartmentParam)

const query = supabase
  .from('apartments')
  .select('*')
  .single()

// Query by ID or slug depending on parameter format
if (isUUID) {
  query.eq('id', apartmentParam)  // UUID format
} else {
  query.eq('slug', apartmentParam)  // Slug format
}
```

### 2. UUID Regex Pattern
```regex
^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$
```

**Matches:**
- ✅ `550e8400-e29b-41d4-a716-446655440000` (UUID v4)
- ✅ `123e4567-e89b-12d3-a456-426614174000` (UUID v1)

**Does NOT match:**
- ❌ `apartman-veliki` (slug)
- ❌ `apartman-standard` (slug)
- ❌ `apartman-deluxe` (slug)

### 3. Updated Booking Links
Svi linkovi sada koriste `slug` umesto `id`:

#### Apartments Page
```tsx
// STARO
<Link href={`/${params.lang}/booking?apartment=${apartment.id}`}>

// NOVO ✅
<Link href={`/${params.lang}/booking?apartment=${apartment.slug}`}>
```

#### Apartment Detail View
```tsx
// Već koristi slug ✅
<Link href={`/${locale}/booking?apartment=${apartment.slug}`}>
```

#### Home Page
```tsx
// Ima fallback na ID ako slug ne postoji ✅
<Link href={`/${params.lang}/booking?apartment=${apt.slug || apt.id}`}>
```

## How It Works

### Scenario 1: Slug Parameter (Recommended)
```
URL: /de/booking?apartment=apartman-veliki
↓
isUUID = false (nije UUID format)
↓
Query: .eq('slug', 'apartman-veliki')
↓
✅ Apartman pronađen i automatski izabran
```

### Scenario 2: UUID Parameter (Legacy Support)
```
URL: /de/booking?apartment=550e8400-e29b-41d4-a716-446655440000
↓
isUUID = true (UUID format)
↓
Query: .eq('id', '550e8400-e29b-41d4-a716-446655440000')
↓
✅ Apartman pronađen i automatski izabran
```

### Scenario 3: No Parameter
```
URL: /de/booking
↓
apartmentParam = null
↓
❌ Korisnik mora da izabere apartman ručno
```

## Benefits

✅ **SEO-Friendly URLs** - Slug je čitljiv i SEO optimizovan
✅ **Backward Compatible** - Stari UUID linkovi i dalje rade
✅ **User-Friendly** - Slug je lakši za pamćenje i deljenje
✅ **Automatic Selection** - Apartman se automatski bira iz URL-a
✅ **No Manual Selection** - Korisnik ne mora ponovo da bira

## Testing

### Test Case 1: Slug Parameter
```bash
# URL
http://localhost:3000/de/booking?apartment=apartman-veliki

# Expected Result
✅ Apartman "Apartman Veliki" automatski izabran
✅ Prikazan u Step 1 summary
✅ Korisnik može odmah da ide na Step 2
```

### Test Case 2: UUID Parameter (Legacy)
```bash
# URL
http://localhost:3000/de/booking?apartment=550e8400-e29b-41d4-a716-446655440000

# Expected Result
✅ Apartman sa tim ID-om automatski izabran
✅ Backward compatibility očuvana
```

### Test Case 3: Invalid Parameter
```bash
# URL
http://localhost:3000/de/booking?apartment=nepostojeci-apartman

# Expected Result
❌ Apartman nije pronađen
✅ Korisnik može da izabere ručno iz kalendara
```

### Test Case 4: No Parameter
```bash
# URL
http://localhost:3000/de/booking

# Expected Result
✅ Prikazan prazan kalendar
✅ Korisnik bira apartman ručno
```

## URL Examples

### All Booking Links Now Use Slug

#### From Apartments List
```
/de/apartments → Click "Buchen" → /de/booking?apartment=apartman-standard
/en/apartments → Click "Book Now" → /en/booking?apartment=apartman-standard
/it/apartments → Click "Prenota" → /it/booking?apartment=apartman-standard
```

#### From Apartment Detail
```
/de/apartments/apartman-veliki → Click "Verfügbarkeit prüfen" → /de/booking?apartment=apartman-veliki
/en/apartments/apartman-veliki → Click "Check Availability" → /en/booking?apartment=apartman-veliki
```

#### From Home Page Featured
```
/de → Click "Verfügbarkeit prüfen" → /de/booking?apartment=apartman-deluxe
/en → Click "Check Availability" → /en/booking?apartment=apartman-deluxe
```

## Files Modified

1. **src/app/[lang]/booking/BookingFlow.tsx**
   - Added UUID detection regex
   - Added conditional query (ID vs slug)
   - Maintained backward compatibility with UUID

2. **src/app/[lang]/apartments/page.tsx**
   - Changed booking link from `apartment.id` to `apartment.slug`

## Technical Details

- **UUID Regex:** `/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i`
- **Case Insensitive:** `i` flag allows uppercase/lowercase UUID
- **Exact Match:** `^` and `$` ensure full string match
- **Fallback:** If slug is null, home page uses ID as fallback

## Migration Notes

### Existing Bookmarks/Links
- Old UUID links: ✅ Still work (backward compatible)
- New slug links: ✅ Work and are preferred
- Mixed usage: ✅ Both formats supported

### Database Requirements
- `apartments.slug` column must exist
- Slug must be unique per apartment
- Slug should be URL-safe (lowercase, hyphens)

## Performance

- **No Performance Impact** - Single query with conditional field
- **Same Query Speed** - Index on both `id` and `slug` columns
- **No Extra Requests** - One query regardless of parameter type

---

**Implementation Complete:** Booking flow sada podržava i slug i UUID parametre, sa automatskim prepoznavanjem formata.
