# Requirements Document

## Introduction

This document specifies requirements for analyzing and fixing all misalignments between the Next.js frontend, backend API routes, and the new Supabase database schema. The database was recently migrated to use JSONB columns for multi-language content (apartments.name, apartments.description, apartments.bed_type, content.value), but the frontend and backend code has not been fully updated to handle this structure correctly. This is causing React error #31 where objects are being rendered directly instead of extracting the appropriate language value.

## Glossary

- **Frontend**: React components and pages in the Next.js application that display data to users
- **Backend**: Next.js API routes in `/app/api/**/*.ts` that query Supabase and return data
- **Database**: Supabase PostgreSQL database with the new schema defined in `01_SCHEMA_COMPLETE.sql`
- **JSONB_Column**: Database column storing multi-language content as JSON objects with language keys (sr, en, de, it)
- **Locale**: Current user language setting (sr, en, de, it)
- **Supabase_Client**: TypeScript client for querying Supabase database
- **Type_Definition**: TypeScript interface or type defining the structure of database records
- **Localization_Helper**: Utility function that extracts the correct language value from JSONB objects
- **Server_Action**: Next.js server-side function that interacts with the database
- **React_Component**: React component that renders database data to the UI

## Requirements

### Requirement 1: Database Schema Analysis

**User Story:** As a developer, I want to identify all JSONB columns in the database schema, so that I know which fields require localization handling.

#### Acceptance Criteria

1. THE System SHALL identify apartments.name as a JSONB_Column containing multi-language content
2. THE System SHALL identify apartments.description as a JSONB_Column containing multi-language content
3. THE System SHALL identify apartments.bed_type as a JSONB_Column containing multi-language content
4. THE System SHALL identify content.value as a JSONB_Column containing multi-language content
5. THE System SHALL document the expected structure of each JSONB_Column as `{sr: string, en: string, de: string, it: string}`

### Requirement 2: API Route Analysis

**User Story:** As a developer, I want to analyze all API routes that query the database, so that I can identify which routes need to transform JSONB data before returning it to the frontend.

#### Acceptance Criteria

1. THE System SHALL identify all TypeScript files in `/app/api/**/*.ts` that query Supabase
2. WHEN an API route queries a table with JSONB_Column fields, THE System SHALL verify the route extracts the correct language value based on the request locale
3. WHEN an API route returns JSONB_Column data without transformation, THE System SHALL flag it as requiring a fix
4. THE System SHALL verify API routes use correct table names matching the new schema (apartments, bookings, guests, availability, reviews, booking_messages, messages, content, analytics_events)
5. THE System SHALL verify API routes use correct column names matching the new schema

### Requirement 3: React Component Analysis

**User Story:** As a developer, I want to identify all React components that render JSONB data directly, so that I can fix React error #31.

#### Acceptance Criteria

1. THE System SHALL identify all React_Component files that receive database data as props
2. WHEN a React_Component attempts to render a JSONB_Column object directly, THE System SHALL flag it as causing React error #31
3. THE System SHALL identify components that display apartment names, descriptions, or bed types
4. THE System SHALL identify components that display content from the content table
5. THE System SHALL verify each flagged component is updated to extract the correct language value before rendering

### Requirement 4: Supabase Query Analysis

**User Story:** As a developer, I want to verify all direct Supabase queries use the correct schema, so that queries don't fail due to incorrect table or column names.

#### Acceptance Criteria

1. WHEN code contains a Supabase_Client query, THE System SHALL verify the table name matches the new schema
2. WHEN code queries the apartments table, THE System SHALL verify it handles JSONB_Column fields (name, description, bed_type)
3. WHEN code queries the content table, THE System SHALL verify it handles the JSONB_Column field (value)
4. THE System SHALL verify queries use correct column names for all tables
5. THE System SHALL flag any queries using old table or column names that don't exist in the new schema

### Requirement 5: TypeScript Type Definition Analysis

**User Story:** As a developer, I want to ensure TypeScript types match the database schema, so that type checking catches schema mismatches at compile time.

#### Acceptance Criteria

1. THE System SHALL identify all Type_Definition interfaces for database tables
2. WHEN a Type_Definition represents a table with JSONB_Column fields, THE System SHALL verify the type correctly represents the multi-language structure
3. THE System SHALL verify Type_Definition for apartments includes name, description, and bed_type as multi-language objects
4. THE System SHALL verify Type_Definition for content includes value as JSONB
5. THE System SHALL flag any Type_Definition that doesn't match the actual database schema

### Requirement 6: Server Action Analysis

**User Story:** As a developer, I want to verify server actions handle JSONB columns correctly, so that database inserts and updates work properly.

#### Acceptance Criteria

1. THE System SHALL identify all Server_Action functions that insert or update database records
2. WHEN a Server_Action inserts data into a table with JSONB_Column fields, THE System SHALL verify it creates properly structured multi-language objects
3. WHEN a Server_Action updates JSONB_Column fields, THE System SHALL verify it maintains the multi-language structure
4. THE System SHALL verify Server_Action functions use correct table and column names
5. THE System SHALL flag any Server_Action that doesn't handle JSONB_Column fields correctly

### Requirement 7: Localization Helper Functions

**User Story:** As a developer, I want utility functions for handling multi-language content, so that I can consistently extract and create localized values throughout the codebase.

#### Acceptance Criteria

1. THE System SHALL provide a Localization_Helper function that extracts a language value from a JSONB_Column object given a Locale
2. WHEN a JSONB_Column object is missing the requested Locale, THE Localization_Helper SHALL return a fallback language value (sr as default)
3. THE System SHALL provide a function that creates a multi-language object from a single value and Locale
4. THE System SHALL provide a function that validates a multi-language object has all required language keys (sr, en, de, it)
5. THE Localization_Helper SHALL handle null or undefined JSONB_Column values gracefully without throwing errors

### Requirement 8: API Route Fixes

**User Story:** As a developer, I want all API routes to return properly localized data, so that the frontend receives data in the correct format.

#### Acceptance Criteria

1. WHEN an API route queries apartments, THE Backend SHALL transform JSONB_Column fields (name, description, bed_type) to localized strings based on the request Locale
2. WHEN an API route queries content, THE Backend SHALL transform the value JSONB_Column to the appropriate localized content
3. WHEN an API route receives a locale parameter or header, THE Backend SHALL use it to determine which language to extract from JSONB_Column fields
4. THE Backend SHALL return consistent data structures where JSONB_Column fields are replaced with localized string values
5. WHEN an API route cannot determine the Locale, THE Backend SHALL default to 'sr' language

### Requirement 9: React Component Fixes

**User Story:** As a user, I want the website to display content in my selected language without errors, so that I can browse apartments and make bookings.

#### Acceptance Criteria

1. WHEN a React_Component receives apartment data, THE Frontend SHALL display the localized name based on the current Locale
2. WHEN a React_Component receives apartment data, THE Frontend SHALL display the localized description based on the current Locale
3. WHEN a React_Component receives apartment data, THE Frontend SHALL display the localized bed_type based on the current Locale
4. WHEN a React_Component receives content data, THE Frontend SHALL display the localized value based on the current Locale
5. THE Frontend SHALL NOT attempt to render JSONB_Column objects directly, preventing React error #31

### Requirement 10: Database Query Fixes

**User Story:** As a developer, I want all database queries to use the correct schema, so that the application functions without database errors.

#### Acceptance Criteria

1. WHEN code queries the database, THE Supabase_Client SHALL use table names from the new schema (apartments, bookings, guests, availability, reviews, booking_messages, messages, content, analytics_events)
2. WHEN code queries the apartments table, THE Supabase_Client SHALL select columns that exist in the new schema
3. WHEN code queries the content table, THE Supabase_Client SHALL use the correct column names (key, language, value)
4. THE Supabase_Client SHALL NOT reference old table or column names that don't exist in the new schema
5. WHEN a query fails due to schema mismatch, THE System SHALL provide a clear error message indicating the incorrect table or column name

### Requirement 11: Type Definition Updates

**User Story:** As a developer, I want TypeScript types that accurately reflect the database schema, so that I get compile-time errors for schema mismatches.

#### Acceptance Criteria

1. THE Type_Definition for apartments SHALL define name as a multi-language object type `{sr: string, en: string, de: string, it: string}`
2. THE Type_Definition for apartments SHALL define description as a multi-language object type
3. THE Type_Definition for apartments SHALL define bed_type as a multi-language object type
4. THE Type_Definition for content SHALL define value as JSONB type
5. THE Type_Definition for all tables SHALL match the column names and types in the new database schema

### Requirement 12: Server Action Fixes

**User Story:** As a developer, I want server actions to correctly insert and update multi-language content, so that data is stored in the proper format.

#### Acceptance Criteria

1. WHEN a Server_Action inserts an apartment, THE Backend SHALL create multi-language objects for name, description, and bed_type fields
2. WHEN a Server_Action updates an apartment, THE Backend SHALL maintain the multi-language structure for JSONB_Column fields
3. WHEN a Server_Action inserts content, THE Backend SHALL store the value as a properly structured JSONB object
4. THE Server_Action SHALL validate multi-language objects have all required language keys before inserting
5. WHEN a Server_Action receives partial language data, THE Backend SHALL merge it with existing data rather than overwriting the entire JSONB_Column

### Requirement 13: Integration Testing

**User Story:** As a developer, I want to verify the entire system works end-to-end, so that I can confirm all alignment issues are resolved.

#### Acceptance Criteria

1. WHEN the application loads at http://localhost:3000, THE Frontend SHALL display without React error #31
2. WHEN a user switches languages, THE Frontend SHALL display all apartment names, descriptions, and bed types in the selected Locale
3. WHEN an API route is called, THE Backend SHALL return data with properly localized JSONB_Column fields
4. WHEN the application queries the database, THE Supabase_Client SHALL successfully retrieve data using correct table and column names
5. THE System SHALL load and display apartment listings without any console errors related to schema mismatches

### Requirement 14: Graceful Degradation

**User Story:** As a user, I want the website to display content even when translations are missing, so that I can still use the site if some content isn't fully translated.

#### Acceptance Criteria

1. WHEN a JSONB_Column object is missing the requested Locale, THE Localization_Helper SHALL return the Serbian (sr) value as fallback
2. WHEN a JSONB_Column object is missing the Serbian fallback, THE Localization_Helper SHALL return the first available language value
3. WHEN a JSONB_Column object is empty or null, THE Localization_Helper SHALL return an empty string rather than throwing an error
4. THE Frontend SHALL display fallback content without showing error messages to users
5. THE System SHALL log missing translations for developer awareness without breaking the user experience
