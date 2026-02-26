# Implementation Plan: Admin Content Management System

## Overview

This implementation plan addresses critical bugs and missing features in the Admin Panel Content Management System. The system enables administrators to manage multi-language website content across five sections with support for four languages (SR, EN, DE, IT).

The implementation is organized into three phases:
- Phase 1: Critical fixes (double encoding, published field, key structure, validation)
- Phase 2: Core features (export, concurrent edit detection, import, error handling)
- Phase 3: Enhancements (audit trail, performance, testing)

## Tasks

### Phase 1: Critical Fixes

- [x] 1. Fix database schema and data integrity issues
  - [x] 1.1 Create database migration to add published field
    - Add `published BOOLEAN DEFAULT true` column to content table
    - Create index `idx_content_published` for performance
    - Verify all existing rows have `published = true`
    - _Requirements: 5.6, 6.1, 6.2_
  
  - [x] 1.2 Create database migration to fix double-encoded values
    - Update all rows where value is double-encoded (starts with `"\"`)
    - Use `value #>> '{}'` to extract string and re-encode as single JSONB
    - Verify no data loss after migration
    - _Requirements: 1.2, 1.3, 2.2, 16.1, 16.2, 16.3, 16.6_
  
  - [ ]* 1.3 Write property test for content round-trip preservation
    - **Property 1: Content round-trip preservation**
    - **Validates: Requirements 1.2, 1.3, 2.2, 2.5, 4.5, 16.1, 16.2, 16.3, 16.6**
    - Test that saving content and loading it back produces identical values
    - Include special characters, line breaks, and multi-language text

- [x] 2. Fix API double encoding bug
  - [x] 2.1 Remove JSON.stringify from API save operations
    - Fix line 107 in src/app/api/admin/content/route.ts
    - Fix line 169 in src/app/api/admin/content/route.ts
    - Change `JSON.stringify(fieldValue)` to just `fieldValue`
    - Supabase client handles JSONB encoding automatically
    - _Requirements: 5.2, 16.1, 16.2_
  
  - [x] 2.2 Update API to handle both legacy and new value formats
    - Add backward compatibility for double-encoded values during read
    - Detect if value is string (single-encoded) or needs parsing (double-encoded)
    - Ensure ContentEditor always receives plain strings
    - _Requirements: 1.2, 2.2_
  
  - [x] 2.3 Update API to use published field in save/publish operations
    - Set `published: false` for draft saves
    - Set `published: true` for publish operations
    - Update `updated_at` timestamp on all operations
    - _Requirements: 5.1, 6.1, 6.2_

- [x] 3. Fix section key structure mismatch
  - [x] 3.1 Update ContentEditor component to use correct key structure
    - Change `home.title` to `home.hero.title`
    - Change `home.subtitle` to `home.hero.subtitle`
    - Add `home.hero.description`, `home.hero.welcome`, `home.hero.reserve`
    - Update section definitions to match database structure
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
  
  - [x] 3.2 Verify all section field mappings are correct
    - Check about, prices, contact, footer sections
    - Ensure field keys match database content.key format
    - _Requirements: 10.1-10.5, 11.1-11.4, 12.1-12.4, 13.1-13.5_

- [x] 4. Add validation logic to ContentEditor and API
  - [x] 4.1 Implement client-side structure validation
    - Validate data is an object with string values
    - Display specific error messages for invalid structure
    - _Requirements: 15.1, 15.3, 15.4, 15.5_
  
  - [x] 4.2 Implement client-side required field validation for publish
    - Define required fields per section
    - Check all required fields have non-empty content
    - Prevent publish if validation fails
    - _Requirements: 6.7, 15.2, 15.4_
  
  - [ ]* 4.3 Write property test for required field validation
    - **Property 8: Required field validation for publish**
    - **Validates: Requirements 6.7, 15.2, 15.4**
    - Test that publish fails when required fields are empty
  
  - [x] 4.4 Implement server-side input validation
    - Validate section, lang, and data parameters
    - Validate language codes (sr, en, de, it)
    - Validate section names (home, about, prices, contact, footer)
    - Return 400 error for invalid input
    - _Requirements: 15.1, 15.3_
  
  - [x] 4.5 Implement content sanitization
    - Trim whitespace from values
    - Normalize line breaks to \n
    - Remove null bytes
    - Limit content length to 10,000 characters
    - _Requirements: 16.1, 16.4_
  
  - [ ]* 4.6 Write property test for structure validation
    - **Property 14: Structure validation**
    - **Validates: Requirements 15.1, 15.3**
    - Test that invalid data structures are rejected

- [x] 5. Checkpoint - Verify critical fixes
  - Run database migrations and verify data integrity
  - Test save/publish operations with special characters
  - Verify no double encoding occurs
  - Ensure all tests pass, ask the user if questions arise

### Phase 2: Core Features

- [x] 6. Implement export functionality
  - [x] 6.1 Add export button to ContentEditor UI
    - Add button next to Import button in action buttons section
    - Use Download icon from lucide-react
    - _Requirements: 18.1_
  
  - [x] 6.2 Implement handleExport function
    - Serialize current content state to JSON format
    - Include version, exportedAt timestamp, and all sections
    - Format JSON with proper indentation (2 spaces)
    - _Requirements: 18.2, 18.3, 18.4_
  
  - [x] 6.3 Trigger file download with descriptive filename
    - Generate filename: `content-export-YYYY-MM-DD.json`
    - Use Blob and URL.createObjectURL for download
    - _Requirements: 18.5_
  
  - [ ]* 6.4 Write property test for export completeness
    - **Property 12: Export completeness**
    - **Validates: Requirements 18.2, 18.3**
    - Test that export includes all sections, fields, and languages
  
  - [ ]* 6.5 Write property test for export-import round-trip
    - **Property 11: Export-import round-trip**
    - **Validates: Requirements 18.6**
    - Test that exporting and importing restores exact same state

- [x] 7. Implement concurrent edit detection
  - [x] 7.1 Add lastFetchedAt timestamp to ContentEditor state
    - Store timestamp when content is fetched
    - Store per section and language combination
    - _Requirements: 17.1_
  
  - [x] 7.2 Check for concurrent modifications before save/publish
    - Fetch current updated_at from database
    - Compare with stored lastFetchedAt timestamp
    - If different, show conflict warning
    - _Requirements: 17.1, 17.2_
  
  - [x] 7.3 Add conflict resolution UI
    - Display warning message when conflict detected
    - Offer "Reload Latest" and "Force Save" buttons
    - Reload content if user chooses to reload
    - Proceed with save if user chooses to force save
    - _Requirements: 17.3, 17.4_
  
  - [ ]* 7.4 Write property test for concurrent modification detection
    - **Property 17: Concurrent modification detection**
    - **Validates: Requirements 17.1, 17.2**
    - Test that API detects when content has been modified

- [x] 8. Fix and enhance import functionality
  - [x] 8.1 Update import button to use file input instead of API call
    - Remove call to `/api/admin/setup`
    - Add hidden file input element
    - Trigger file input on button click
    - _Requirements: 8.1_
  
  - [x] 8.2 Implement file validation
    - Check file size (max 5MB)
    - Check file extension (.json)
    - Parse JSON and catch syntax errors
    - _Requirements: 8.2, 8.4, 8.7_
  
  - [x] 8.3 Implement schema validation for imported JSON
    - Validate version and sections fields exist
    - Validate section names are valid
    - Validate language codes are valid (sr, en, de, it)
    - Display specific error messages for validation failures
    - _Requirements: 8.4, 8.5_
  
  - [x] 8.4 Populate ContentEditor state from imported JSON
    - Transform imported data to ContentEditor state format
    - Mark content as unsaved (hasChanges = true)
    - Display success message
    - _Requirements: 8.3, 8.6_
  
  - [ ]* 8.5 Write property test for import validation
    - **Property 10: Import populates all fields**
    - **Validates: Requirements 8.3, 8.5, 8.6**
    - Test that valid JSON import populates all fields correctly

- [x] 9. Enhance error handling with retry logic
  - [x] 9.1 Add retry state and exponential backoff to ContentEditor
    - Add retryCount state variable
    - Implement exponential backoff (2s, 4s, 8s)
    - Reset retry count on successful fetch
    - _Requirements: 14.5_
  
  - [x] 9.2 Implement auto-retry for network errors
    - Detect network/connection errors
    - Auto-retry up to 3 times for network errors
    - Display retry attempt number to user
    - _Requirements: 14.1, 14.5_
  
  - [x] 9.3 Add retry button to error display
    - Show "Retry" button in error message card
    - Allow manual retry on button click
    - _Requirements: 14.5_
  
  - [x] 9.4 Improve error messages with actionable guidance
    - Connection errors: "Check your internet connection"
    - Timeout errors: "Request timed out, please try again"
    - Schema errors: "Database schema issue, contact support"
    - _Requirements: 14.4, 14.5_
  
  - [ ]* 9.5 Write property test for error display
    - **Property 18: Error display**
    - **Validates: Requirements 14.4**
    - Test that errors are displayed to administrator

- [x] 10. Checkpoint - Verify core features
  - Test export functionality with all sections
  - Test concurrent edit detection with multiple users
  - Test import with valid and invalid JSON files
  - Test error handling and retry logic
  - Ensure all tests pass, ask the user if questions arise

- [x] 10.5 Populate legal content (Privacy Policy and Terms of Service)
  - [x] 10.5.1 Extract legal texts from project files
    - Extract from messages/legal-sr.json (Serbian)
    - Extract from messages/legal-en.json (English)
    - Extract from messages/sr.json and messages/en.json
    - _Requirements: All legal content must be editable_
  
  - [x] 10.5.2 Create database population script
    - Create scripts/populate-legal-db.mjs
    - Support all 4 languages (SR, EN, DE, IT)
    - Use EN as fallback for DE and IT
    - _Requirements: Multi-language support_
  
  - [x] 10.5.3 Populate database with legal content
    - Insert 128 rows (32 keys × 4 languages)
    - Privacy Policy: 17 keys per language
    - Terms of Service: 15 keys per language
    - All rows published=true
    - _Requirements: Content must be in database_
  
  - [x] 10.5.4 Verify legal content in admin panel
    - Privacy section has all fields
    - Terms section has all fields
    - All languages have content
    - Content is editable through admin panel
    - _Requirements: Admin panel must show legal content_

### Phase 3: Enhancements

- [ ] 11. Add audit trail functionality
  - [ ] 11.1 Create audit_log table in database
    - Add columns: id, content_key, language, user_id, operation, timestamp
    - Add index on timestamp and user_id
    - _Requirements: 20.1, 20.2, 20.3_
  
  - [ ] 11.2 Update API to record audit entries on save/publish
    - Record user_id from session
    - Record operation type (draft_save or publish)
    - Record timestamp
    - _Requirements: 20.1, 20.2, 20.3_
  
  - [ ] 11.3 Add last modified display to ContentEditor
    - Fetch and display last modified timestamp per section
    - Display user who made the last modification
    - _Requirements: 20.4_
  
  - [ ]* 11.4 Write property test for audit trail completeness
    - **Property 21: Audit trail completeness**
    - **Validates: Requirements 20.1, 20.2, 20.3**
    - Test that all operations are recorded in audit log

- [ ] 12. Implement performance optimizations
  - [ ] 12.1 Add debouncing to language coverage updates
    - Use 300ms debounce delay
    - Prevent excessive re-renders during typing
    - _Requirements: 19.3_
  
  - [ ] 12.2 Add memoization for expensive computations
    - Memoize currentSectionData calculation
    - Memoize languageCoverage calculation
    - Use React.useMemo hook
    - _Requirements: 19.1, 19.2_
  
  - [ ] 12.3 Optimize API queries with specific column selection
    - Select only needed columns (key, language, value, updated_at)
    - Avoid SELECT * queries
    - _Requirements: 19.4_
  
  - [ ] 12.4 Implement batch upsert for save operations
    - Combine multiple upserts into single batch operation
    - Reduce number of database round-trips
    - _Requirements: 5.5, 6.5_
  
  - [ ] 12.5 Add pagination support to API
    - Return paginated results for queries with >100 records
    - Add page and limit query parameters
    - _Requirements: 19.5_
  
  - [ ]* 12.6 Write property test for pagination
    - **Property 20: Pagination for large datasets**
    - **Validates: Requirements 19.5**
    - Test that large result sets are paginated

- [ ] 13. Add comprehensive testing
  - [ ]* 13.1 Write property tests for multi-language handling
    - **Property 2: Multi-language field structure completeness**
    - **Validates: Requirements 2.1, 2.3**
    - **Property 5: Input state synchronization**
    - **Validates: Requirements 4.2**
    - **Property 25: Language independence**
    - **Validates: Requirements 4.6**
  
  - [ ]* 13.2 Write property tests for state management
    - **Property 4: State preservation across navigation**
    - **Validates: Requirements 4.7**
    - **Property 9: Reset restores last saved state**
    - **Validates: Requirements 7.1, 7.2, 7.3**
  
  - [ ]* 13.3 Write property tests for draft/publish workflow
    - **Property 6: Draft save preserves structure**
    - **Validates: Requirements 5.1, 5.2, 5.6, 5.7**
    - **Property 7: Publish operation sets published state**
    - **Validates: Requirements 6.1, 6.2**
  
  - [ ]* 13.4 Write property tests for security
    - **Property 16: SQL injection prevention**
    - **Validates: Requirements 16.5**
  
  - [ ]* 13.5 Write property tests for UI state
    - **Property 22: Loading state display**
    - **Validates: Requirements 1.6**
    - **Property 23: Section coverage indicator presence**
    - **Validates: Requirements 3.1**
  
  - [ ]* 13.6 Write unit tests for ContentEditor component
    - Test loading spinner display
    - Test error message display
    - Test save button enable/disable
    - Test section navigation
    - Test language tab switching
  
  - [ ]* 13.7 Write unit tests for API routes
    - Test GET endpoint with various query parameters
    - Test POST endpoint with valid/invalid data
    - Test error responses (400, 409, 500, 503, 504)
  
  - [ ]* 13.8 Write integration tests for full workflows
    - Test complete save workflow (edit → save → reload → verify)
    - Test complete publish workflow (edit → publish → verify)
    - Test reset workflow (edit → reset → verify)
    - Test import/export workflow (export → import → verify)

- [ ] 14. Final checkpoint and documentation
  - Review all implemented features against requirements
  - Verify all critical bugs are fixed
  - Run full test suite and ensure all tests pass
  - Update any inline documentation or comments
  - Ensure all tests pass, ask the user if questions arise

## Notes

- Tasks marked with `*` are optional testing tasks and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- Integration tests validate end-to-end user workflows
- Phase 1 must be completed before Phase 2 to ensure data integrity
- Database migrations should be run in a transaction with rollback capability
