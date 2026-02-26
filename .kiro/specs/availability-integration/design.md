# Availability Integration - Design

## Architecture

### Data Flow
```
User Request → API → Check availability table → Check bookings table → Merge results → Return
```

### Priority Rules
1. If `availability.is_available = false` → Date is UNAVAILABLE (highest priority)
2. If `availability.price_override` exists → Use override price
3. If booking exists for date → Date is UNAVAILABLE
4. Otherwise → Date is AVAILABLE with base price

## API Changes

### 1. Availability API (`src/app/api/availability/route.ts`)

**Current:**
```typescript
// Only checks bookings table
const { data: bookings } = await supabase
  .from('bookings')
  .select('apartment_id, check_in, check_out, status')
```

**New:**
```typescript
// Check BOTH availability and bookings
const { data: availabilityRecords } = await supabase
  .from('availability')
  .select('*')
  .eq('apartment_id', apartmentId)
  .gte('date', checkIn)
  .lte('date', checkOut)

const { data: bookings } = await supabase
  .from('bookings')
  .select('apartment_id, check_in, check_out, status')
  .gte('check_out', checkIn)
  .lte('check_in', checkOut)
  .neq('status', 'cancelled')

// Merge: availability overrides bookings
```

### 2. useAvailability Hook

Add availability table query alongside bookings query.

## Admin Panel Components

### AvailabilityManager Component
```typescript
interface AvailabilityManagerProps {
  apartmentId: string
}

Features:
- Calendar view (month/year navigation)
- Click date to toggle availability
- Set reason (maintenance/blocked)
- Set price override
- Visual indicators:
  - Green: Available
  - Red: Booked
  - Orange: Maintenance
  - Gray: Blocked
  - Blue: Price override
```

### API Endpoints

**POST /api/admin/availability**
```typescript
{
  apartment_id: string
  date: string
  is_available: boolean
  reason?: 'maintenance' | 'blocked'
  price_override?: number
}
```

**DELETE /api/admin/availability**
```typescript
{
  apartment_id: string
  date: string
}
```

**GET /api/admin/availability?apartment_id=X&start_date=Y&end_date=Z**
Returns all availability records for date range.

## Database Queries

### Check Availability (Combined)
```sql
-- Get availability overrides
SELECT * FROM availability
WHERE apartment_id = $1
  AND date >= $2
  AND date <= $3;

-- Get bookings
SELECT * FROM bookings
WHERE apartment_id = $1
  AND check_out >= $2
  AND check_in <= $3
  AND status != 'cancelled';

-- Merge in application logic
```

### Set Availability
```sql
INSERT INTO availability (apartment_id, date, is_available, reason, price_override)
VALUES ($1, $2, $3, $4, $5)
ON CONFLICT (apartment_id, date)
DO UPDATE SET
  is_available = EXCLUDED.is_available,
  reason = EXCLUDED.reason,
  price_override = EXCLUDED.price_override,
  updated_at = NOW();
```

## UI/UX Design

### Admin Calendar View
```
┌─────────────────────────────────────┐
│  Apartment: Deluxe Suite           │
│  Month: March 2026                  │
├─────────────────────────────────────┤
│  Mo Tu We Th Fr Sa Su               │
│   1  2  3  4  5  6  7               │
│  🟢 🟢 🔴 🔴 🔴 🟢 🟢              │
│   8  9 10 11 12 13 14               │
│  🟠 🟠 🟢 🟢 🟢 🟢 🟢              │
│                                     │
│  Legend:                            │
│  🟢 Available                       │
│  🔴 Booked                          │
│  🟠 Maintenance                     │
│  ⚫ Blocked                         │
│  🔵 Price Override                  │
└─────────────────────────────────────┘
```

### Date Click Modal
```
┌─────────────────────────────────────┐
│  March 8, 2026                      │
├─────────────────────────────────────┤
│  Status: ○ Available ● Blocked      │
│  Reason: [Maintenance ▼]            │
│  Price Override: [€ 120    ]        │
│                                     │
│  [Cancel]  [Save]                   │
└─────────────────────────────────────┘
```

## Implementation Order

1. Create admin API endpoints for availability CRUD
2. Update availability API to check both tables
3. Update useAvailability hook
4. Create AvailabilityManager component
5. Add to admin dashboard
6. Test integration
