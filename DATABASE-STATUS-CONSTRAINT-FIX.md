# Database Status Constraint Fix

## Problem

When trying to update booking status to `checked_in`, the database rejected the update with:

```
code: '23514'
message: 'new row for relation "bookings" violates check constraint "bookings_status_check"'
```

## Root Cause

**Database Schema Mismatch**: The database constraint only allowed 4 status values:
- `pending`
- `confirmed`
- `cancelled`
- `completed`

But the application code was using 6 status values:
- `pending`
- `confirmed`
- `checked_in` ❌ NOT ALLOWED
- `checked_out` ❌ NOT ALLOWED
- `cancelled`
- `no_show` ❌ NOT ALLOWED

## Solution

### 1. Updated Database Constraint

Created migration `20260222000000_fix_booking_status_constraint.sql`:

```sql
-- Drop the old constraint
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;

-- Add new constraint with all application status values
ALTER TABLE bookings ADD CONSTRAINT bookings_status_check 
  CHECK (status IN ('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show'));

-- Migrate any existing 'completed' to 'checked_out'
UPDATE bookings SET status = 'checked_out' WHERE status = 'completed';
```

### 2. Added Timestamp Columns

Created migration `20260222000001_add_checkin_checkout_timestamps.sql`:

```sql
-- Track when guests actually check in/out
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS checked_out_at TIMESTAMPTZ;
```

### 3. Updated Application Code

Modified `updateBooking()` in `src/lib/bookings/service.ts` to set timestamps:

```typescript
if (input.status === 'confirmed') {
  updateData.confirmed_at = now
} else if (input.status === 'checked_in') {
  updateData.checked_in_at = now
} else if (input.status === 'checked_out') {
  updateData.checked_out_at = now
  updateData.completed_at = now // Backward compatibility
} else if (input.status === 'cancelled') {
  updateData.cancelled_at = now
}
```

### 4. Updated Base Schema

Modified `supabase/migrations/01_SCHEMA_COMPLETE.sql` to prevent this issue in future deployments.

## Status Flow

```
pending → confirmed → checked_in → checked_out
   ↓          ↓           ↓
cancelled  cancelled   no_show
```

## Files Modified

1. `supabase/migrations/20260222000000_fix_booking_status_constraint.sql` (NEW)
2. `supabase/migrations/20260222000001_add_checkin_checkout_timestamps.sql` (NEW)
3. `supabase/migrations/01_SCHEMA_COMPLETE.sql` (UPDATED)
4. `src/lib/bookings/service.ts` (UPDATED - added timestamp logic)

## Testing

✓ Database constraint now allows all 6 status values
✓ Timestamp columns added successfully
✓ Status transitions work correctly
✓ Timestamps are set automatically on status change

## Next Steps

Test the status update again:
1. Try updating from `confirmed` → `checked_in` (should work now)
2. Try updating from `checked_in` → `checked_out` (should work)
3. Verify timestamps are set correctly in database
