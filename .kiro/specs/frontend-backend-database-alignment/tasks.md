# Implementation Plan: Frontend-Backend-Database Alignment

## Overview

This implementation plan addresses the misalignment between the Next.js frontend, backend API routes, and Supabase database schema. The database uses JSONB columns for multi-language content, but the frontend and backend haven't been updated to handle this structure, causing React error #31. We'll implement type-safe localization helpers, update API routes to transform JSONB data, and fix React components to render localized strings.

## Tasks

- [x] 1. Create core type definitions and localization helpers
  - [x] 1.1 Create database type definitions
    - Create `src/lib/types/database.ts` with Locale, MultiLanguageText, ApartmentRecord, LocalizedApartment, ContentRecord types
    - _Requirements: 1.5, 5.2, 5.3, 5.4, 11.1, 11.2, 11.3, 11.4_
  
  - [x] 1.2 Implement localization helper functions
    - Create `src/lib/localization/helpers.ts` with getLocalizedValue, createMultiLanguageText, isCompleteMultiLanguageText, mergeMultiLanguageText, getMissingLanguages functions
    - Implement fallback chain: requested locale → 'sr' → first available → empty string
    - Handle null/undefined values gracefully
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 14.1, 14.2, 14.3_
  
  - [ ]* 1.3 Write property test for localization helper
    - **Property 3: Localization Helper Extracts Correct Language**
    - **Validates: Requirements 7.1, 7.2, 14.1, 14.2**
  
  - [ ]* 1.4 Write property test for multi-language object creation
    - **Property 4: Multi-Language Object Creation**
    - **Validates: Requirements 7.3**
  
  - [ ]* 1.5 Write property test for multi-language object validation
    - **Property 5: Multi-Language Object Validation**
    - **Validates: Requirements 7.4, 12.4**
  
  - [ ]* 1.6 Write property test for null/undefined handling
    - **Property 8: Null and Undefined Handling**
    - **Validates: Requirements 7.5, 14.3**
  
  - [ ]* 1.7 Write unit tests for edge cases
    - Test null, undefined, empty object inputs
    - Test fallback chain at each level
    - _Requirements: 7.5, 14.1, 14.2, 14.3_

- [x] 2. Create transformation and extraction utilities
  - [x] 2.1 Implement API response transformer
    - Create `src/lib/localization/transformer.ts` with localizeApartment and localizeApartments functions
    - Transform JSONB fields to localized strings
    - _Requirements: 8.1, 8.2, 8.4_
  
  - [x] 2.2 Implement locale extraction utility
    - Create `src/lib/localization/extract.ts` with extractLocale function
    - Extract locale from query params, headers, cookies with fallback to 'sr'
    - _Requirements: 8.3, 8.5_
  
  - [x] 2.3 Create logging utilities
    - Create `src/lib/localization/logger.ts` with logMissingTranslation and logInvalidStructure functions
    - _Requirements: 14.5_
  
  - [ ]* 2.4 Write unit tests for transformer
    - Test apartment transformation with various locales
    - Test array transformation
    - _Requirements: 8.1, 8.2, 8.4_
  
  - [ ]* 2.5 Write unit tests for locale extraction
    - Test extraction from query params, headers, cookies
    - Test fallback behavior
    - _Requirements: 8.3, 8.5_

- [x] 3. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Update API routes for availability
  - [x] 4.1 Update availability API route
    - Modify `src/app/api/availability/route.ts` to extract locale and transform apartment data
    - Import extractLocale and localizeApartments
    - Apply transformation before returning response
    - _Requirements: 2.2, 8.1, 8.3, 8.4, 13.3_
  
  - [ ]* 4.2 Write unit tests for availability API
    - Test locale extraction and transformation
    - Test response format
    - _Requirements: 8.1, 8.3, 13.3_

- [x] 5. Update API routes for admin apartments
  - [x] 5.1 Update admin apartments list API route
    - Modify `src/app/api/admin/apartments/route.ts` GET handler to transform apartment data
    - Import extractLocale and localizeApartments
    - _Requirements: 2.2, 8.1, 8.3, 8.4_
  
  - [x] 5.2 Update admin apartments create API route
    - Modify `src/app/api/admin/apartments/route.ts` POST handler to validate multi-language objects
    - Use isCompleteMultiLanguageText for validation
    - _Requirements: 6.2, 12.1, 12.4_
  
  - [x] 5.3 Update admin apartments detail API route
    - Modify `src/app/api/admin/apartments/[id]/route.ts` GET handler to transform apartment data
    - Modify PUT handler to merge partial updates using mergeMultiLanguageText
    - _Requirements: 6.3, 8.1, 12.2, 12.5_
  
  - [ ]* 5.4 Write property test for server actions
    - **Property 6: Server Actions Create Valid JSONB Structures**
    - **Validates: Requirements 6.2, 12.1, 12.3**
  
  - [ ]* 5.5 Write property test for partial updates
    - **Property 7: Server Actions Preserve Multi-Language Structure on Update**
    - **Validates: Requirements 6.3, 12.2, 12.5**
  
  - [ ]* 5.6 Write unit tests for admin apartments API
    - Test GET transformation
    - Test POST validation
    - Test PUT merge behavior
    - _Requirements: 6.2, 6.3, 8.1, 12.1, 12.2, 12.4, 12.5_

- [x] 6. Update booking service and API
  - [x] 6.1 Update bookings service
    - Modify `src/lib/bookings/service.ts` to use localization helpers
    - Transform apartment data in booking-related queries
    - _Requirements: 2.2, 8.1, 8.4_
  
  - [x] 6.2 Update booking API route
    - Modify `src/app/api/booking/route.ts` to extract locale and transform data
    - _Requirements: 8.1, 8.3, 8.4_
  
  - [ ]* 6.3 Write unit tests for booking service
    - Test transformation in booking queries
    - _Requirements: 8.1, 8.4_

- [x] 7. Checkpoint - Ensure all API tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Update React components and hooks
  - [x] 8.1 Update useAvailability hook types
    - Modify `src/hooks/useAvailability.ts` to use LocalizedApartment interface
    - Ensure apartment data received from API has string fields, not JSONB objects
    - _Requirements: 3.1, 5.2, 9.1, 9.2, 9.3_
  
  - [x] 8.2 Update ApartmentManager component
    - Modify `src/components/admin/ApartmentManager.tsx` to create multi-language objects for forms
    - Use createMultiLanguageText and mergeMultiLanguageText for create/update operations
    - _Requirements: 3.3, 6.2, 6.3, 12.1, 12.2_
  
  - [x] 8.3 Update AvailabilityCalendar component
    - Modify `src/components/booking/AvailabilityCalendar.tsx` to expect localized string values
    - Verify apartment.name, apartment.description, apartment.bed_type are rendered as strings
    - _Requirements: 3.3, 9.1, 9.2, 9.3, 9.5_
  
  - [x] 8.4 Update any other components rendering apartment data
    - Search for components displaying apartment names, descriptions, or bed types
    - Verify they expect localized strings from API
    - _Requirements: 3.1, 3.2, 3.5, 9.1, 9.2, 9.3, 9.5_
  
  - [ ]* 8.5 Write property test for component rendering
    - **Property 2: React Components Render Localized Strings**
    - **Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5**
  
  - [ ]* 8.6 Write property test for fallback display
    - **Property 9: Frontend Displays Fallback Content Without Errors**
    - **Validates: Requirements 14.4**
  
  - [ ]* 8.7 Write unit tests for components
    - Test ApartmentManager form creation and updates
    - Test AvailabilityCalendar rendering
    - Test other components rendering apartment data
    - _Requirements: 9.1, 9.2, 9.3, 9.5_

- [-] 9. Integration testing and validation
  - [x] 9.1 Create integration test for API localization
    - Test end-to-end flow: request with locale → API transformation → localized response
    - _Requirements: 8.1, 8.3, 8.4, 13.3_
  
  - [ ]* 9.2 Write property test for API routes
    - **Property 1: API Routes Return Localized Data**
    - **Validates: Requirements 2.2, 8.1, 8.2, 8.3, 8.4, 13.3**
  
  - [ ]* 9.3 Write integration test for React error #31 fix
    - Test that apartment listing page loads without React error #31
    - Verify no "Objects are not valid as a React child" errors in console
    - _Requirements: 3.2, 9.5, 13.1_
  
  - [ ]* 9.4 Write property test for missing translation logging
    - **Property 10: Missing Translation Logging**
    - **Validates: Requirements 14.5**
  
  - [ ]* 9.5 Write integration test for language switching
    - **Property 11: Language Switching Updates All Content**
    - **Validates: Requirements 13.2**
  
  - [ ]* 9.6 Write integration test for database schema correctness
    - **Property 12: Database Queries Use Correct Schema**
    - **Validates: Requirements 13.4**

- [-] 10. Final checkpoint and verification
  - [ ] 10.1 Run full test suite
    - Execute all unit tests, property tests, and integration tests
    - Verify all tests pass
    - _Requirements: All_
  
  - [x] 10.2 Manual testing verification
    - Load application at http://localhost:3000
    - Verify no React error #31 in browser console
    - Test language switching functionality
    - Test admin forms for creating/updating apartments
    - Verify apartment listings display correctly
    - _Requirements: 13.1, 13.2, 13.5_
  
  - [x] 10.3 Verify graceful degradation
    - Test behavior with incomplete translations
    - Verify fallback chain works correctly
    - Check that missing translations are logged
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties with minimum 100 iterations
- Unit tests validate specific examples and edge cases
- The implementation uses TypeScript throughout for type safety
- All localization logic is centralized in the API layer for consistency
- Fallback chain ensures the app never crashes due to missing translations
