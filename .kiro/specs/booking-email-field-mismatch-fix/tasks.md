# Implementation Plan

- [ ] 1. Write bug condition exploration test
  - **Property 1: Fault Condition** - Guest Object Field Name Mismatch
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: Scope the property to concrete failing case - any booking creation with guest object using `name` field instead of `full_name`
  - Test that booking creation with guest object `{ name: string, email: string, phone: string }` fails due to type mismatch with BookingRequestEmailProps interface
  - Test that TypeScript compilation shows type error at line 143 in `src/app/api/booking/route.ts`
  - Test that email rendering fails when guest object has `name` field instead of `full_name`
  - The test assertions should verify: TypeScript type error exists, email rendering fails, booking creation returns 400/406 error
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples found: TypeScript error message, email rendering failure, API error responses
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - All Non-Email Booking Logic Unchanged
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for successful booking creation scenarios (if any exist in test environment)
  - Write property-based tests capturing observed behavior patterns:
    - Database operations: guest creation, booking creation
    - Response structure: bookingNumber, checkIn, checkOut, totalPrice, apartmentName, guestName, guestEmail, guestPhone
    - Email error handling: booking succeeds even if email fails
    - Localization: locale parameter is used correctly
    - Optional phone handling: empty string when phone not provided
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code (may need to mock email rendering to isolate preservation behaviors)
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [ ] 3. Fix for booking email field mismatch

  - [ ] 3.1 Implement the fix
    - Change line 143 in `src/app/api/booking/route.ts` from `name: result.booking.guestName,` to `full_name: result.booking.guestName,`
    - Verify TypeScript compilation succeeds with no type errors
    - _Bug_Condition: isBugCondition(input) where guestObject.fieldName == 'name' AND expectedInterface.fieldName == 'full_name'_
    - _Expected_Behavior: Guest object SHALL use field name `full_name` to match BookingRequestEmailProps interface_
    - _Preservation: All database operations, validation logic, response structure, error handling, and non-email fields remain unchanged_
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

  - [ ] 3.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Guest Object Field Name Matches Email Template Interface
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - Verify: TypeScript compilation succeeds, email rendering succeeds, booking creation returns 201
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ] 3.3 Verify preservation tests still pass
    - **Property 2: Preservation** - All Non-Email Booking Logic Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix: database operations, response structure, error handling, localization, optional fields
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [ ] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
