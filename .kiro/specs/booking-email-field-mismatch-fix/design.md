# Booking Email Field Mismatch Fix Design

## Overview

This bugfix addresses a critical field name mismatch in the booking creation flow. The bug occurs when the booking API route passes a guest object with a `name` field to the `BookingRequestEmail` template, but the template expects a `full_name` field. This type mismatch causes email rendering to fail, which triggers a cascade of errors resulting in booking creation failure with 406 and 400 status codes.

The fix is minimal and surgical: change line 143 in `src/app/api/booking/route.ts` from `name: result.booking.guestName` to `full_name: result.booking.guestName` to match the interface expected by the email template.

## Glossary

- **Bug_Condition (C)**: The condition that triggers the bug - when a booking is created and the guest object is passed to BookingRequestEmail with field `name` instead of `full_name`
- **Property (P)**: The desired behavior - the guest object should have field `full_name` matching the BookingRequestEmailProps interface
- **Preservation**: All existing booking creation logic, database operations, and email sending behavior must remain unchanged
- **BookingRequestEmail**: The React email template in `src/emails/BookingRequestEmail.tsx` that renders the admin notification email
- **BookingRequestEmailProps**: The TypeScript interface defining the expected shape of props for BookingRequestEmail, specifically requiring `guest.full_name`
- **result.booking.guestName**: The property from the booking creation result that contains the guest's full name

## Bug Details

### Fault Condition

The bug manifests when a booking is created and the system attempts to render the admin notification email. The `POST /api/booking` handler constructs a guest object with a `name` field, but the `BookingRequestEmail` component expects a `full_name` field according to its TypeScript interface.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type { booking: BookingCreationResult, emailTemplate: BookingRequestEmail }
  OUTPUT: boolean
  
  RETURN input.booking exists
         AND emailTemplate is BookingRequestEmail
         AND guestObject.fieldName == 'name'
         AND expectedInterface.fieldName == 'full_name'
         AND guestObject.fieldName != expectedInterface.fieldName
END FUNCTION
```

### Examples

- **Buggy Input**: `guest: { name: "John Doe", email: "john@example.com", phone: "+123456789" }`
  - **Expected**: Email renders successfully with guest name displayed
  - **Actual**: TypeScript error, email rendering fails, booking creation fails with 406/400 errors

- **Buggy Input**: `guest: { name: "Jane Smith", email: "jane@example.com", phone: "" }`
  - **Expected**: Email renders successfully with guest name displayed
  - **Actual**: TypeScript error, email rendering fails, booking creation fails

- **Buggy Input**: `guest: { name: "Test User", email: "test@test.com", phone: "+999" }`
  - **Expected**: Email renders successfully
  - **Actual**: Type mismatch causes rendering failure

- **Edge Case**: Empty guest name `guest: { name: "", email: "user@example.com", phone: "" }`
  - **Expected**: Email renders with empty name field
  - **Actual**: Type mismatch prevents rendering regardless of value

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Database operations for creating guests and bookings must continue to work exactly as before
- The booking creation response structure must remain unchanged
- Email sending error handling (try-catch that doesn't fail the booking) must remain unchanged
- All other fields in the guest object (email, phone) must continue to work as before
- The booking number generation, price calculation, and date handling must remain unchanged
- Localization handling must remain unchanged

**Scope:**
All inputs and operations that do NOT involve the guest object field name in the email template should be completely unaffected by this fix. This includes:
- Database insert operations for guests and bookings
- Booking validation logic
- Apartment availability checks
- Response formatting
- Error handling for non-email errors
- All other API endpoints

## Hypothesized Root Cause

Based on the bug description and code analysis, the root cause is clear:

1. **Field Name Mismatch**: The code at line 143 in `src/app/api/booking/route.ts` uses `name` as the field name when constructing the guest object for the email template, but the `BookingRequestEmailProps` interface in `src/emails/BookingRequestEmail.tsx` explicitly defines the field as `full_name`.

2. **TypeScript Type Error**: This creates a TypeScript compilation error where the object shape `{ name: string, email: string, phone: string }` does not match the expected type `{ full_name: string, email: string, phone: string }`.

3. **Runtime Rendering Failure**: When the React email rendering engine attempts to render the template, it cannot access `guest.full_name` because the object only has `guest.name`, causing the rendering to fail.

4. **Cascade Effect**: The email rendering failure causes the Supabase API to return a 406 error, which then causes the booking creation to fail with a 400 error.

## Correctness Properties

Property 1: Fault Condition - Guest Object Field Name Matches Email Template Interface

_For any_ booking creation request where the admin notification email is sent, the guest object passed to BookingRequestEmail SHALL use the field name `full_name` (not `name`) to match the BookingRequestEmailProps interface, ensuring successful email rendering and booking creation.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**

Property 2: Preservation - All Non-Email Booking Logic Unchanged

_For any_ booking creation request, the fixed code SHALL produce exactly the same database operations, validation logic, response structure, and error handling as the original code, preserving all existing functionality except for the corrected field name in the email template guest object.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7**

## Fix Implementation

### Changes Required

The fix is a single-line change with zero risk of regression.

**File**: `src/app/api/booking/route.ts`

**Function**: `POST` handler (anonymous async function)

**Specific Changes**:

1. **Line 143 - Field Name Correction**:
   - **Current**: `name: result.booking.guestName,`
   - **Fixed**: `full_name: result.booking.guestName,`
   - **Rationale**: Match the field name to the BookingRequestEmailProps interface

**No other changes are required.** The value `result.booking.guestName` is correct and contains the guest's full name. Only the field name in the object literal needs to be changed.

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, verify the bug exists on unfixed code by observing TypeScript errors and runtime failures, then verify the fix works correctly and preserves all existing behavior.

### Exploratory Fault Condition Checking

**Goal**: Confirm the bug exists in the unfixed code by observing TypeScript compilation errors and runtime email rendering failures.

**Test Plan**: 
1. Run TypeScript compiler on unfixed code and observe type error at line 143
2. Attempt to create a booking with unfixed code and observe email rendering failure
3. Verify that the error cascade (406 → 400) occurs as described

**Test Cases**:
1. **TypeScript Compilation Test**: Run `tsc --noEmit` on unfixed code (will show type error at line 143)
2. **Booking Creation Test**: POST to `/api/booking` with valid data on unfixed code (will fail with 400 error)
3. **Email Rendering Test**: Directly test email rendering with `name` field (will fail)
4. **Edge Case Test**: Attempt booking with empty guest name on unfixed code (will fail due to type mismatch, not empty value)

**Expected Counterexamples**:
- TypeScript error: `Type '{ name: string; email: string; phone: string; }' is not assignable to type '{ full_name: string; email: string; phone: string; }'`
- Runtime error: Email rendering fails when accessing `guest.full_name` (undefined)
- API error: 406 from Supabase, then 400 from booking endpoint

### Fix Checking

**Goal**: Verify that for all booking creation requests, the fixed function successfully renders the email and creates the booking.

**Pseudocode:**
```
FOR ALL bookingRequest WHERE isValidBookingRequest(bookingRequest) DO
  result := createBooking_fixed(bookingRequest)
  ASSERT result.status == 201
  ASSERT result.booking.bookingNumber exists
  ASSERT emailWasRendered == true
  ASSERT emailWasSent == true OR emailErrorWasHandledGracefully == true
END FOR
```

### Preservation Checking

**Goal**: Verify that for all aspects of booking creation that do NOT involve the email guest field name, the fixed function produces identical results to the original function.

**Pseudocode:**
```
FOR ALL bookingRequest WHERE isValidBookingRequest(bookingRequest) DO
  // Database operations
  ASSERT guestCreated_fixed(bookingRequest) == guestCreated_original(bookingRequest)
  ASSERT bookingCreated_fixed(bookingRequest) == bookingCreated_original(bookingRequest)
  
  // Response structure
  ASSERT responseFields_fixed(bookingRequest) == responseFields_original(bookingRequest)
  
  // Error handling
  ASSERT errorHandling_fixed(bookingRequest) == errorHandling_original(bookingRequest)
  
  // Other email fields
  ASSERT emailGuestEmail_fixed == emailGuestEmail_original
  ASSERT emailGuestPhone_fixed == emailGuestPhone_original
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across different booking scenarios
- It catches edge cases like empty phone numbers, different date ranges, various apartment IDs
- It provides strong guarantees that behavior is unchanged for all booking inputs

**Test Plan**: 
1. Observe successful booking creation on FIXED code
2. Compare database records created by fixed vs original code (should be identical)
3. Compare API responses from fixed vs original code (should be identical)
4. Verify email error handling still works (email failure doesn't block booking)

**Test Cases**:
1. **Database Preservation**: Verify guest and booking records are identical in structure and content
2. **Response Preservation**: Verify API response has all required fields (bookingNumber, checkIn, checkOut, totalPrice, apartmentName, guestName, guestEmail, guestPhone)
3. **Email Error Handling Preservation**: Simulate email service failure and verify booking still succeeds
4. **Localization Preservation**: Verify localization parameter is still used correctly

### Unit Tests

- Test that guest object has `full_name` field (not `name`) when passed to email template
- Test that email renders successfully with `full_name` field
- Test that booking creation succeeds with corrected field name
- Test edge cases: empty guest name, missing phone number, various date ranges

### Property-Based Tests

- Generate random valid booking requests and verify all succeed with status 201
- Generate random guest data (names, emails, phones) and verify email renders correctly
- Generate random booking scenarios and verify database records are created correctly
- Test that email field names match interface across many random inputs

### Integration Tests

- Test full booking flow: POST request → guest creation → booking creation → email sending → response
- Test that TypeScript compilation succeeds with no type errors
- Test that email rendering succeeds and produces valid HTML
- Test that booking creation succeeds even if email sending fails (graceful degradation)
- Test multiple bookings in sequence to verify no state pollution
