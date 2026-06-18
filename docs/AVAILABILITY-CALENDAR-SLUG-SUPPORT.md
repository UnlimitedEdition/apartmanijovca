# Availability Calendar - Slug Support Fix ✅

## Status: COMPLETED
**Date:** February 23, 2026

## Problem
AvailabilityCalendar komponenta nije podržavala `slug` parametar - tražila je apartman samo po `id`. Kada korisnik klikne "Verfügbarkeit prüfen" sa URL-om `?apartment=apartman-veliki`, apartman nije bio automatski izabran.

## Root Cause

### AvailabilityCalendar.tsx (Linija 316)
```typescript
// STARO - Samo ID
const apartment = data.apartments.find(apt => apt.id === initialApartmentId)
```

**Problem:**
- `initialApartmentId` = "apartman-veliki" (slug)
- `apt.id` = "550e8400-e29b-41d4-a716-446655440000" (UUID)
- `"apartman-veliki" === "550e8400-..."` → `false` ❌
- Apartman nije pronađen

## Solution Implemented

### 1. Dual Lookup (ID or Slug)
```typescript
// NOVO - Podržava i ID i slug ✅
const apartment = data.apartments.find(apt => 
  apt.id === initialApartmentId || apt.slug === initialApartmentId
)
```

**Kako radi:**
```javascript
// Scenario 1: Slug parametar
initialApartmentId = "apartman-veliki"
apt.id = "550e8400-..." → false
apt.slug = "apartman-veliki" → true ✅

// Scenario 2: UUID parametar (legacy)
initialApartmentId = "550e8400-..."
apt.id = "550e8400-..." → true ✅
apt.slug = "apartman-veliki" → false
```

### 2. Always Use ID for Selection
```typescript
if (apartment) {
  setSelectedApartment(apartment.id) // ✅ Uvek koristi ID interno
  if (onApartmentSelect) {
    onApartmentSelect(apartment)
  }
}
```

**Zašto ID?**
- Interna logika komponente koristi ID za tracking
- Availability API očekuje ID
- Konzistentnost sa ostatkom aplikacije

## Data Flow

### Complete Flow with Slug
```
1. User clicks "Verfügbarkeit prüfen" on apartment detail page
   ↓
2. URL: /de/booking?apartment=apartman-veliki
   ↓
3. BookingFlow.tsx detektuje slug i učitava apartman
   ↓
4. setInitialApartmentId("apartman-veliki")
   ↓
5. AvailabilityCalendar prima initialApartmentId="apartman-veliki"
   ↓
6. useEffect traži apartman:
   - apt.id === "apartman-veliki" → false
   - apt.slug === "apartman-veliki" → true ✅
   ↓
7. setSelectedApartment(apartment.id) // Koristi ID interno
   ↓
8. onApartmentSelect(apartment) // Prosleđuje ceo objekat
   ↓
9. ✅ Apartman automatski izabran u kalendaru!
```

## Type Safety

### Apartment Type
```typescript
// src/hooks/useAvailability.ts
export type Apartment = LocalizedApartment

// LocalizedApartment interface (from database.ts)
interface LocalizedApartment {
  id: string        // UUID
  slug: string      // URL-friendly slug
  name: string      // Localized
  // ... other fields
}
```

**Oba polja su dostupna:**
- ✅ `apartment.id` - UUID za interne operacije
- ✅ `apartment.slug` - Slug za URL-ove i pretragu

## Benefits

✅ **Slug Support** - Radi sa SEO-friendly URL-ovima
✅ **Backward Compatible** - Stari UUID linkovi i dalje rade
✅ **Automatic Selection** - Apartman se automatski bira iz URL-a
✅ **Type Safe** - TypeScript validacija za oba polja
✅ **Consistent** - Interno uvek koristi ID za tracking

## Testing

### Test Case 1: Slug Parameter
```bash
# URL
http://localhost:3000/de/booking?apartment=apartman-veliki

# Expected Result
✅ Apartman "Apartman Veliki" automatski izabran u kalendaru
✅ Prikazan u dropdown-u kao selected
✅ Availability data učitana za taj apartman
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
http://localhost:3000/de/booking?apartment=nepostojeci-slug

# Expected Result
❌ Apartman nije pronađen
✅ Kalendar prikazan bez selekcije
✅ Korisnik može ručno da izabere
```

### Test Case 4: No Parameter
```bash
# URL
http://localhost:3000/de/booking

# Expected Result
✅ Kalendar prikazan bez selekcije
✅ Korisnik bira apartman iz dropdown-a
```

## Integration Points

### 1. BookingFlow.tsx
```typescript
// Detektuje slug/ID i učitava apartman
const isUUID = /^[0-9a-f]{8}-...$/i.test(apartmentParam)
if (isUUID) {
  query.eq('id', apartmentParam)
} else {
  query.eq('slug', apartmentParam)
}
```

### 2. AvailabilityCalendar.tsx
```typescript
// Prima slug/ID i pronalazi apartman
const apartment = data.apartments.find(apt => 
  apt.id === initialApartmentId || apt.slug === initialApartmentId
)
```

### 3. ApartmentDetailView.tsx
```typescript
// Generiše link sa slug-om
<Link href={`/${locale}/booking?apartment=${apartment.slug || apartment.id}`}>
```

## Files Modified

1. **src/components/booking/AvailabilityCalendar.tsx**
   - Updated `useEffect` to search by both ID and slug
   - Added comment explaining dual lookup
   - Always uses ID for internal selection state

## Technical Details

- **Lookup Logic:** `apt.id === param || apt.slug === param`
- **Selection State:** Always uses `apartment.id` (UUID)
- **Callback:** Passes full `apartment` object with both fields
- **Performance:** O(n) linear search through apartments array (acceptable for small datasets)

## Edge Cases Handled

✅ **Slug exists** - Uses slug for lookup
✅ **Slug is null** - Falls back to ID (via `apartment.slug || apartment.id`)
✅ **Duplicate slugs** - First match wins (slugs should be unique in DB)
✅ **Case sensitivity** - Exact match required (slugs are lowercase)

## Migration Notes

### No Breaking Changes
- Existing code using ID continues to work
- New code can use slug
- Both formats supported simultaneously

### Database Requirements
- `apartments.slug` column must exist
- Slug should be unique (enforced by DB constraint)
- Slug should be URL-safe (lowercase, hyphens)

---

**Implementation Complete:** AvailabilityCalendar sada podržava i slug i UUID parametre za automatsku selekciju apartmana.
