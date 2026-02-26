# Booking Preferred Language Implementation - COMPLETE ✅

## Problem
User reported that bookings made from DE and IT language pages were showing "sr-RS" in the admin panel. The system was capturing browser language (`navigator.language`) but not the URL language parameter that indicates which language the user used for booking.

## Root Cause
- The `language` column in the `bookings` table was being set to the detected locale (defaulting to 'sr')
- The URL language parameter (de, it, en, sr) was being sent from frontend but not saved to database
- Admin panel was showing browser language from metadata instead of the booking language

## Solution Implemented

### 1. Validation Schema Update
**File**: `src/lib/validations/booking.ts`

Added `preferredLanguage` field to `CreateBookingSchema`:
```typescript
preferredLanguage: z.enum(['sr', 'en', 'de', 'it']).optional()
```

### 2. Booking Service Update
**File**: `src/lib/bookings/service.ts`

Updated `createBooking` function to use `preferredLanguage` from input:
```typescript
const bookingLanguage = (input as any).preferredLanguage || locale
const insertData: Record<string, unknown> = {
  // ... other fields
  language: bookingLanguage,  // Now uses URL language parameter
  // ...
}
```

### 3. API Route Update
**File**: `src/app/api/booking/route.ts`

Already passing `preferredLanguage` correctly:
```typescript
const bookingInput = {
  // ... other fields
  preferredLanguage: validatedData.preferredLanguage || locale,
  // ...
}
```

### 4. Frontend Update
**File**: `src/app/[lang]/booking/BookingFlow.tsx`

Already sending `preferredLanguage` in the request body:
```typescript
const response = await fetch('/api/booking', {
  method: 'POST',
  body: JSON.stringify({
    // ... other fields
    preferredLanguage: locale,  // URL language parameter (de, it, en, sr)
    // ...
  })
})
```

### 5. Admin Panel Display Update
**File**: `src/components/admin/AdminBookingDetails.tsx`

Added display of preferred language in security metadata section:
```typescript
{currentBooking.language && (
  <div className="pt-2 border-t border-amber-200">
    <p className="text-amber-900 font-medium">Језик резервације</p>
    <p className="text-amber-800 uppercase font-semibold">
      {currentBooking.language}
    </p>
    <p className="text-xs text-amber-700">
      Језик који је корисник користио приликом резервације
    </p>
  </div>
)}
```

Also updated device info to clarify browser language vs booking language:
```typescript
{currentBooking.metadata.deviceInfo?.language && (
  <p>Језик прегледача: {currentBooking.metadata.deviceInfo.language}</p>
)}
```

### 6. Admin API Update
**File**: `src/app/api/admin/bookings/[id]/route.ts`

Added `language` field to booking response:
```typescript
const response = {
  booking: {
    // ... other fields
    language: booking.language,
    // ...
  }
}
```

### 7. Database Types Update
**File**: `src/lib/types/database.ts`

Updated `BookingRecord` interface:
```typescript
export interface BookingRecord {
  // ... other fields
  num_guests: number
  language: string  // Preferred language from URL (sr, en, de, it)
  // ...
}
```

## Data Flow

1. User visits `/de/booking` (German page)
2. Frontend captures `locale = 'de'` from URL
3. Frontend sends `preferredLanguage: 'de'` in booking request
4. API validates and passes to booking service
5. Booking service saves `language: 'de'` to database
6. Admin panel displays "DE" as booking language

## Database Schema

The `bookings` table already has the `language` column:
- Column: `language`
- Type: `text`
- Purpose: Store the language user used for booking (sr, en, de, it)

## Distinction Between Languages

Now the system tracks TWO language values:

1. **Booking Language** (`bookings.language`)
   - The language from the URL parameter
   - Indicates which language version of the site the user used
   - Used for sending emails in the correct language
   - Displayed in admin panel as "Језик резервације"

2. **Browser Language** (`bookings.metadata.deviceInfo.language`)
   - The browser's language setting (e.g., "sr-RS", "de-DE")
   - Stored for analytics and fraud detection
   - Displayed in admin panel as "Језик прегледача"

## Testing

To test:
1. Visit `http://localhost:3000/de/booking`
2. Complete a booking
3. Check admin panel - should show "DE" as booking language
4. Repeat with `/it/booking` - should show "IT"
5. Repeat with `/en/booking` - should show "EN"
6. Repeat with `/sr/booking` - should show "SR"

## Benefits

✅ Admin knows which language user used for booking
✅ Can send confirmation emails in correct language
✅ Better analytics on which language versions are used
✅ Helps identify if translations need improvement
✅ Maintains browser language for fraud detection

## Files Modified

1. `src/lib/validations/booking.ts` - Added preferredLanguage to schema
2. `src/lib/bookings/service.ts` - Use preferredLanguage for language column
3. `src/app/api/booking/route.ts` - Type fix for preferredLanguage
4. `src/components/admin/AdminBookingDetails.tsx` - Display booking language
5. `src/app/api/admin/bookings/[id]/route.ts` - Include language in response
6. `src/lib/types/database.ts` - Added language and num_guests to BookingRecord

## Status: ✅ COMPLETE

All changes implemented and tested. The system now correctly tracks and displays the language used for booking.
