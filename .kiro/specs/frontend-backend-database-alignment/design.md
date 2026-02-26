# Design Document: Frontend-Backend-Database Alignment

## Overview

This design addresses the critical misalignment between the Next.js frontend, backend API routes, and the Supabase database schema following the migration to JSONB columns for multi-language content. The database now stores apartment names, descriptions, bed types, and CMS content as JSONB objects with language keys (sr, en, de, it), but the frontend and backend code has not been updated to handle this structure, causing React error #31 where objects are being rendered directly instead of extracting the appropriate language value.

The solution involves:
1. Creating type-safe localization helper functions
2. Updating all TypeScript type definitions to match the database schema
3. Transforming JSONB data in API routes before returning to the frontend
4. Updating React components to use localized string values
5. Implementing graceful fallback mechanisms for missing translations

This design ensures zero breaking changes to the user experience while establishing a robust foundation for multi-language content management.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Pages      │  │  Components  │  │    Hooks     │      │
│  │              │  │              │  │              │      │
│  │ - Apartments │  │ - ApartmentCard│ - useLocale  │      │
│  │ - Booking    │  │ - ContentBlock│ - useAvailability│    │
│  │ - Admin      │  │ - AdminForms │  │              │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                  │              │
│         └─────────────────┴──────────────────┘              │
│                           │                                 │
└───────────────────────────┼─────────────────────────────────┘
                            │
                            │ HTTP Requests (with locale)
                            │
┌───────────────────────────┼─────────────────────────────────┐
│                     Backend Layer                            │
│                           │                                 │
│  ┌────────────────────────▼──────────────────────────┐      │
│  │           API Routes (/app/api/**)                │      │
│  │                                                    │      │
│  │  - /api/availability                              │      │
│  │  - /api/admin/apartments                          │      │
│  │  - /api/booking                                   │      │
│  │  - /api/portal                                    │      │
│  └────────────────────┬───────────────────────────────┘      │
│                       │                                     │
│  ┌────────────────────▼───────────────────────────────┐    │
│  │      Localization Middleware Layer                 │    │
│  │                                                     │    │
│  │  - extractLocale(request)                          │    │
│  │  - transformResponse(data, locale)                 │    │
│  └────────────────────┬───────────────────────────────┘    │
│                       │                                     │
│  ┌────────────────────▼───────────────────────────────┐    │
│  │         Service Layer (lib/*)                      │    │
│  │                                                     │    │
│  │  - bookings/service.ts                             │    │
│  │  - localization/helpers.ts  ← NEW                  │    │
│  │  - types/database.ts        ← UPDATED              │    │
│  └────────────────────┬───────────────────────────────┘    │
│                       │                                     │
└───────────────────────┼─────────────────────────────────────┘
                        │
                        │ Supabase Client Queries
                        │
┌───────────────────────┼─────────────────────────────────────┐
│                  Database Layer                              │
│                       │                                     │
│  ┌────────────────────▼───────────────────────────────┐    │
│  │           Supabase PostgreSQL                      │    │
│  │                                                     │    │
│  │  apartments                                        │    │
│  │    - name: JSONB {sr, en, de, it}                 │    │
│  │    - description: JSONB {sr, en, de, it}          │    │
│  │    - bed_type: JSONB {sr, en, de, it}             │    │
│  │                                                     │    │
│  │  content                                           │    │
│  │    - key: TEXT                                     │    │
│  │    - language: TEXT                                │    │
│  │    - value: JSONB                                  │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Request Flow**: User interacts with frontend → Request sent with locale (from URL, cookie, or header) → API route receives request
2. **Locale Extraction**: API route extracts locale from request (default: 'sr')
3. **Database Query**: API route queries Supabase with standard query (JSONB fields returned as-is)
4. **Transformation**: Response transformer applies localization helpers to extract language-specific values
5. **Response**: API returns data with JSONB fields replaced by localized strings
6. **Rendering**: Frontend components receive and render localized string values (no objects)

### Key Design Decisions

1. **Transformation at API Layer**: We transform JSONB to localized strings at the API layer rather than in the database or frontend. This provides:
   - Single source of truth for localization logic
   - Type safety through the entire stack
   - Easier testing and debugging
   - Consistent data structure for frontend

2. **Graceful Fallback Chain**: Missing translations follow this fallback order:
   - Requested locale → 'sr' (Serbian default) → First available language → Empty string
   - This ensures the app never crashes due to missing translations

3. **Type-Safe Helpers**: All localization helpers are strongly typed to catch errors at compile time

4. **Backward Compatibility**: The design maintains backward compatibility by:
   - Keeping existing API endpoints unchanged
   - Adding transformation layer without breaking existing queries
   - Supporting both old and new data formats during migration

## Components and Interfaces

### Core Type Definitions

```typescript
// src/lib/types/database.ts

/**
 * Supported languages in the application
 */
export type Locale = 'sr' | 'en' | 'de' | 'it'

/**
 * Multi-language content structure stored in JSONB columns
 */
export interface MultiLanguageText {
  sr: string
  en: string
  de: string
  it: string
}

/**
 * Database apartment record with JSONB fields
 */
export interface ApartmentRecord {
  id: string
  name: MultiLanguageText
  description: MultiLanguageText
  bed_type: MultiLanguageText
  capacity: number
  amenities: string[]
  base_price_eur: number
  images: string[]
  status: 'active' | 'inactive' | 'maintenance'
  created_at: string
  updated_at: string
}

/**
 * Localized apartment for API responses and frontend use
 */
export interface LocalizedApartment {
  id: string
  name: string  // Localized
  description: string  // Localized
  bed_type: string  // Localized
  capacity: number
  amenities: string[]
  base_price_eur: number
  images: string[]
  status: 'active' | 'inactive' | 'maintenance'
  created_at: string
  updated_at: string
}

/**
 * Database content record
 */
export interface ContentRecord {
  id: string
  key: string
  language: Locale
  value: Record<string, unknown>  // Flexible JSONB
  created_at: string
  updated_at: string
}

/**
 * Partial multi-language text for updates
 */
export type PartialMultiLanguageText = Partial<MultiLanguageText>
```

### Localization Helper Functions

```typescript
// src/lib/localization/helpers.ts

import type { Locale, MultiLanguageText, PartialMultiLanguageText } from '../types/database'

/**
 * Extract localized value from multi-language JSONB object
 * 
 * Fallback chain: requested locale → 'sr' → first available → empty string
 * 
 * @param value - Multi-language object or null/undefined
 * @param locale - Requested locale
 * @returns Localized string value
 */
export function getLocalizedValue(
  value: MultiLanguageText | null | undefined,
  locale: Locale
): string {
  // Handle null/undefined
  if (!value || typeof value !== 'object') {
    return ''
  }

  // Try requested locale
  if (value[locale]) {
    return value[locale]
  }

  // Fallback to Serbian
  if (value.sr) {
    console.warn(`Missing translation for locale '${locale}', falling back to 'sr'`)
    return value.sr
  }

  // Fallback to first available language
  const availableLanguages = Object.keys(value) as Locale[]
  if (availableLanguages.length > 0) {
    const firstLang = availableLanguages[0]
    console.warn(`Missing 'sr' fallback, using '${firstLang}'`)
    return value[firstLang]
  }

  // Last resort: empty string
  console.error('Multi-language object has no translations')
  return ''
}

/**
 * Create multi-language object from single value
 * 
 * @param value - Text value
 * @param locale - Language of the value
 * @returns Multi-language object with value set for specified locale
 */
export function createMultiLanguageText(
  value: string,
  locale: Locale
): PartialMultiLanguageText {
  return {
    [locale]: value
  }
}

/**
 * Validate multi-language object has all required language keys
 * 
 * @param value - Multi-language object to validate
 * @returns True if all languages present, false otherwise
 */
export function isCompleteMultiLanguageText(
  value: unknown
): value is MultiLanguageText {
  if (!value || typeof value !== 'object') {
    return false
  }

  const requiredLanguages: Locale[] = ['sr', 'en', 'de', 'it']
  const obj = value as Record<string, unknown>

  return requiredLanguages.every(lang => 
    typeof obj[lang] === 'string' && obj[lang].length > 0
  )
}

/**
 * Merge partial multi-language update with existing data
 * 
 * @param existing - Current multi-language object
 * @param update - Partial update
 * @returns Merged multi-language object
 */
export function mergeMultiLanguageText(
  existing: MultiLanguageText,
  update: PartialMultiLanguageText
): MultiLanguageText {
  return {
    ...existing,
    ...update
  }
}

/**
 * Get missing languages from multi-language object
 * 
 * @param value - Multi-language object
 * @returns Array of missing language codes
 */
export function getMissingLanguages(
  value: PartialMultiLanguageText
): Locale[] {
  const requiredLanguages: Locale[] = ['sr', 'en', 'de', 'it']
  return requiredLanguages.filter(lang => !value[lang])
}
```

### API Response Transformer

```typescript
// src/lib/localization/transformer.ts

import type { Locale, ApartmentRecord, LocalizedApartment } from '../types/database'
import { getLocalizedValue } from './helpers'

/**
 * Transform apartment record to localized format
 * 
 * @param apartment - Database apartment record with JSONB fields
 * @param locale - Target locale
 * @returns Localized apartment with string fields
 */
export function localizeApartment(
  apartment: ApartmentRecord,
  locale: Locale
): LocalizedApartment {
  return {
    id: apartment.id,
    name: getLocalizedValue(apartment.name, locale),
    description: getLocalizedValue(apartment.description, locale),
    bed_type: getLocalizedValue(apartment.bed_type, locale),
    capacity: apartment.capacity,
    amenities: apartment.amenities,
    base_price_eur: apartment.base_price_eur,
    images: apartment.images,
    status: apartment.status,
    created_at: apartment.created_at,
    updated_at: apartment.updated_at
  }
}

/**
 * Transform array of apartments to localized format
 * 
 * @param apartments - Array of database apartment records
 * @param locale - Target locale
 * @returns Array of localized apartments
 */
export function localizeApartments(
  apartments: ApartmentRecord[],
  locale: Locale
): LocalizedApartment[] {
  return apartments.map(apt => localizeApartment(apt, locale))
}
```

### Locale Extraction Utility

```typescript
// src/lib/localization/extract.ts

import type { NextRequest } from 'next/server'
import type { Locale } from '../types/database'

const VALID_LOCALES: Locale[] = ['sr', 'en', 'de', 'it']
const DEFAULT_LOCALE: Locale = 'sr'

/**
 * Extract locale from Next.js request
 * 
 * Priority: query param → header → cookie → default
 * 
 * @param request - Next.js request object
 * @returns Valid locale
 */
export function extractLocale(request: NextRequest): Locale {
  // Try query parameter
  const queryLocale = request.nextUrl.searchParams.get('locale') || 
                      request.nextUrl.searchParams.get('lang')
  if (queryLocale && isValidLocale(queryLocale)) {
    return queryLocale
  }

  // Try Accept-Language header
  const acceptLanguage = request.headers.get('accept-language')
  if (acceptLanguage) {
    const locale = parseAcceptLanguage(acceptLanguage)
    if (locale) {
      return locale
    }
  }

  // Try cookie
  const cookieLocale = request.cookies.get('locale')?.value
  if (cookieLocale && isValidLocale(cookieLocale)) {
    return cookieLocale
  }

  // Default
  return DEFAULT_LOCALE
}

/**
 * Check if string is valid locale
 */
function isValidLocale(value: string): value is Locale {
  return VALID_LOCALES.includes(value as Locale)
}

/**
 * Parse Accept-Language header
 */
function parseAcceptLanguage(header: string): Locale | null {
  const languages = header.split(',').map(lang => {
    const [code] = lang.trim().split(';')
    return code.split('-')[0].toLowerCase()
  })

  for (const lang of languages) {
    if (isValidLocale(lang)) {
      return lang
    }
  }

  return null
}
```

## Data Models

### Database Schema (Existing)

The database schema is already defined in `supabase/migrations/01_SCHEMA_COMPLETE.sql`. Key JSONB columns:

```sql
-- apartments table
CREATE TABLE apartments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name JSONB NOT NULL,           -- {sr: "...", en: "...", de: "...", it: "..."}
  description JSONB NOT NULL,    -- {sr: "...", en: "...", de: "...", it: "..."}
  bed_type JSONB NOT NULL,       -- {sr: "...", en: "...", de: "...", it: "..."}
  -- ... other columns
);

-- content table
CREATE TABLE content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL,
  language TEXT NOT NULL CHECK (language IN ('sr', 'en', 'de', 'it')),
  value JSONB NOT NULL,          -- Flexible structure
  -- ... other columns
  UNIQUE(key, language)
);
```

### TypeScript Type Hierarchy

```
MultiLanguageText (base type for JSONB columns)
    ↓
ApartmentRecord (database representation)
    ↓
LocalizedApartment (API response / frontend use)
```

### Migration Strategy

Since the database already has JSONB columns, we need to handle both scenarios:

1. **New Records**: Use helper functions to create properly structured JSONB
2. **Existing Records**: May have old string format or incomplete translations
3. **Transition Period**: Support both formats with fallback logic


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, I identified the following testable properties. During reflection, I consolidated redundant properties:

- Properties 8.1, 8.2, 8.3, 8.4 (API route localization) were combined into Property 1 (comprehensive API localization)
- Properties 9.1, 9.2, 9.3, 9.4 (component rendering) were combined into Property 2 (comprehensive component localization)
- Properties 12.1, 12.3 (insertion validation) were combined into Property 6 (comprehensive insertion validation)
- Properties 7.1 and 14.1 (localization helper with fallback) were combined into Property 3 (comprehensive helper behavior)

This reduces redundancy while maintaining complete coverage of all testable requirements.

### Property 1: API Routes Return Localized Data

*For any* API route that queries tables with JSONB columns (apartments, content), when called with a specific locale, the response SHALL contain localized string values (not JSONB objects) for all multi-language fields, extracted according to the requested locale.

**Validates: Requirements 2.2, 8.1, 8.2, 8.3, 8.4, 13.3**

### Property 2: React Components Render Localized Strings

*For any* React component that receives database data containing multi-language fields, the component SHALL render localized string values based on the current locale, and SHALL NOT attempt to render JSONB objects directly.

**Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5**

### Property 3: Localization Helper Extracts Correct Language

*For any* multi-language JSONB object and any valid locale, the localization helper SHALL return the value for the requested locale if present, otherwise fall back to 'sr', otherwise fall back to the first available language, otherwise return an empty string.

**Validates: Requirements 7.1, 7.2, 14.1, 14.2**

### Property 4: Multi-Language Object Creation

*For any* string value and any valid locale, the function that creates multi-language objects SHALL produce an object with the value set for the specified locale key.

**Validates: Requirements 7.3**

### Property 5: Multi-Language Object Validation

*For any* object, the validation function SHALL return true if and only if the object contains non-empty string values for all four required language keys (sr, en, de, it).

**Validates: Requirements 7.4, 12.4**

### Property 6: Server Actions Create Valid JSONB Structures

*For any* server action that inserts records into tables with JSONB columns (apartments, content), the inserted data SHALL have properly structured multi-language objects that pass validation.

**Validates: Requirements 6.2, 12.1, 12.3**

### Property 7: Server Actions Preserve Multi-Language Structure on Update

*For any* server action that updates JSONB column fields, the update SHALL maintain the multi-language structure, and when receiving partial language data, SHALL merge it with existing data rather than overwriting.

**Validates: Requirements 6.3, 12.2, 12.5**

### Property 8: Null and Undefined Handling

*For any* localization helper function, when passed null or undefined JSONB values, the function SHALL return an empty string without throwing errors.

**Validates: Requirements 7.5, 14.3**

### Property 9: Frontend Displays Fallback Content Without Errors

*For any* React component rendering multi-language content, when translations are missing for the requested locale, the component SHALL display fallback content without showing error messages to users.

**Validates: Requirements 14.4**

### Property 10: Missing Translation Logging

*For any* localization operation where the requested locale is missing, the system SHALL log the missing translation for developer awareness without breaking the user experience.

**Validates: Requirements 14.5**

### Property 11: Language Switching Updates All Content

*For any* user action that switches the application language, all displayed apartment names, descriptions, bed types, and CMS content SHALL update to reflect the newly selected locale.

**Validates: Requirements 13.2**

### Property 12: Database Queries Use Correct Schema

*For any* database query, the query SHALL use table and column names that exist in the current schema, and when a query fails due to schema mismatch, SHALL provide a clear error message.

**Validates: Requirements 13.4**

## Error Handling

### Error Categories

1. **Missing Translation Errors**
   - Scenario: Requested locale not present in JSONB object
   - Handling: Fallback chain (requested → sr → first available → empty string)
   - Logging: Warning level with locale and field information
   - User Impact: None (graceful fallback)

2. **Invalid JSONB Structure Errors**
   - Scenario: JSONB column contains invalid data structure
   - Handling: Return empty string, log error with details
   - Logging: Error level with field path and actual structure
   - User Impact: Missing content (better than crash)

3. **Null/Undefined Value Errors**
   - Scenario: JSONB column is null or undefined
   - Handling: Return empty string without throwing
   - Logging: Debug level (expected in some cases)
   - User Impact: None

4. **Database Query Errors**
   - Scenario: Query uses incorrect table/column names
   - Handling: Catch error, log with query details, return user-friendly message
   - Logging: Error level with full query and error message
   - User Impact: Error message displayed, operation fails gracefully

5. **Type Validation Errors**
   - Scenario: Attempting to insert invalid multi-language object
   - Handling: Reject operation, return validation error details
   - Logging: Warning level with validation failures
   - User Impact: Form validation error, clear message about missing languages

### Error Response Format

```typescript
interface ErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
}

// Example error responses
{
  success: false,
  error: {
    code: 'MISSING_TRANSLATION',
    message: 'Translation missing for locale "de"',
    details: {
      field: 'apartments.name',
      locale: 'de',
      fallback: 'sr'
    }
  }
}

{
  success: false,
  error: {
    code: 'INVALID_MULTI_LANGUAGE_OBJECT',
    message: 'Multi-language object missing required languages',
    details: {
      missing: ['de', 'it'],
      provided: ['sr', 'en']
    }
  }
}
```

### Logging Strategy

```typescript
// src/lib/localization/logger.ts

export function logMissingTranslation(
  field: string,
  requestedLocale: Locale,
  fallbackLocale: Locale
): void {
  console.warn('[Localization]', {
    type: 'MISSING_TRANSLATION',
    field,
    requestedLocale,
    fallbackLocale,
    timestamp: new Date().toISOString()
  })
}

export function logInvalidStructure(
  field: string,
  value: unknown
): void {
  console.error('[Localization]', {
    type: 'INVALID_STRUCTURE',
    field,
    value,
    timestamp: new Date().toISOString()
  })
}
```

## Testing Strategy

### Dual Testing Approach

This feature requires both unit tests and property-based tests to ensure comprehensive coverage:

- **Unit Tests**: Verify specific examples, edge cases, and error conditions
- **Property Tests**: Verify universal properties across all inputs using randomized testing

Together, these approaches provide complete validation: unit tests catch concrete bugs in specific scenarios, while property tests verify general correctness across the entire input space.

### Property-Based Testing

We will use **fast-check** (JavaScript/TypeScript property-based testing library) to implement property tests. Each property test will:
- Run minimum 100 iterations with randomized inputs
- Reference its corresponding design property via comment tag
- Generate realistic test data (valid locales, JSONB structures, etc.)

**Configuration Example**:
```typescript
import fc from 'fast-check'

// Generators for property tests
const localeArbitrary = fc.constantFrom('sr', 'en', 'de', 'it')

const multiLanguageTextArbitrary = fc.record({
  sr: fc.string(),
  en: fc.string(),
  de: fc.string(),
  it: fc.string()
})

const partialMultiLanguageTextArbitrary = fc.record({
  sr: fc.option(fc.string()),
  en: fc.option(fc.string()),
  de: fc.option(fc.string()),
  it: fc.option(fc.string())
}, { requiredKeys: [] })
```

### Test Organization

```
src/lib/__tests__/
├── localization/
│   ├── helpers.test.ts           # Unit tests for helper functions
│   ├── helpers.property.test.ts  # Property tests for helpers
│   ├── transformer.test.ts       # Unit tests for transformers
│   └── extract.test.ts           # Unit tests for locale extraction
├── api/
│   ├── availability.test.ts      # Unit tests for availability API
│   └── apartments.test.ts        # Unit tests for apartments API
└── components/
    ├── ApartmentCard.test.tsx    # Unit tests for component rendering
    └── ContentBlock.test.tsx     # Unit tests for content rendering
```

### Property Test Examples

#### Property 1: API Routes Return Localized Data
```typescript
/**
 * Feature: frontend-backend-database-alignment
 * Property 1: API Routes Return Localized Data
 */
describe('Property 1: API Routes Return Localized Data', () => {
  it('should return localized strings for all JSONB fields', () => {
    fc.assert(
      fc.asyncProperty(
        localeArbitrary,
        fc.array(apartmentRecordArbitrary),
        async (locale, apartments) => {
          // Setup: Insert apartments into test database
          // Action: Call API with locale
          // Assert: Response contains strings, not objects
        }
      ),
      { numRuns: 100 }
    )
  })
})
```

#### Property 3: Localization Helper Extracts Correct Language
```typescript
/**
 * Feature: frontend-backend-database-alignment
 * Property 3: Localization Helper Extracts Correct Language
 */
describe('Property 3: Localization Helper', () => {
  it('should extract correct language with fallback chain', () => {
    fc.assert(
      fc.property(
        multiLanguageTextArbitrary,
        localeArbitrary,
        (mlText, locale) => {
          const result = getLocalizedValue(mlText, locale)
          
          // Should return requested locale if present
          if (mlText[locale]) {
            expect(result).toBe(mlText[locale])
          }
          // Otherwise should fallback to 'sr'
          else if (mlText.sr) {
            expect(result).toBe(mlText.sr)
          }
          // Otherwise first available
          else {
            const firstAvailable = Object.values(mlText)[0]
            expect(result).toBe(firstAvailable || '')
          }
        }
      ),
      { numRuns: 100 }
    )
  })
})
```

#### Property 7: Server Actions Preserve Multi-Language Structure
```typescript
/**
 * Feature: frontend-backend-database-alignment
 * Property 7: Server Actions Preserve Multi-Language Structure on Update
 */
describe('Property 7: Partial Update Preservation', () => {
  it('should merge partial updates without overwriting', () => {
    fc.assert(
      fc.property(
        multiLanguageTextArbitrary,
        partialMultiLanguageTextArbitrary,
        (existing, update) => {
          const merged = mergeMultiLanguageText(existing, update)
          
          // All original languages should be preserved
          for (const lang of ['sr', 'en', 'de', 'it'] as Locale[]) {
            if (update[lang] !== undefined) {
              expect(merged[lang]).toBe(update[lang])
            } else {
              expect(merged[lang]).toBe(existing[lang])
            }
          }
        }
      ),
      { numRuns: 100 }
    )
  })
})
```

### Unit Test Examples

#### Edge Case: Null/Undefined Handling
```typescript
describe('getLocalizedValue - Edge Cases', () => {
  it('should return empty string for null', () => {
    expect(getLocalizedValue(null, 'en')).toBe('')
  })

  it('should return empty string for undefined', () => {
    expect(getLocalizedValue(undefined, 'en')).toBe('')
  })

  it('should return empty string for empty object', () => {
    expect(getLocalizedValue({} as MultiLanguageText, 'en')).toBe('')
  })
})
```

#### Integration Test: No React Error #31
```typescript
describe('Integration: Apartment Listing', () => {
  it('should load without React error #31', async () => {
    // Suppress console errors
    const consoleError = jest.spyOn(console, 'error').mockImplementation()
    
    render(<ApartmentListingPage />)
    
    await waitFor(() => {
      expect(screen.getByText(/apartment/i)).toBeInTheDocument()
    })
    
    // Verify no React error #31 (objects as React children)
    expect(consoleError).not.toHaveBeenCalledWith(
      expect.stringContaining('Objects are not valid as a React child')
    )
    
    consoleError.mockRestore()
  })
})
```

### Test Coverage Goals

- **Localization Helpers**: 100% line coverage (critical path)
- **API Routes**: 90% line coverage (focus on transformation logic)
- **React Components**: 85% line coverage (focus on rendering logic)
- **Property Tests**: Minimum 100 iterations per property
- **Integration Tests**: Cover all critical user flows

### Testing Checklist

- [ ] All 12 correctness properties have corresponding property tests
- [ ] Each property test runs minimum 100 iterations
- [ ] All property tests include proper tags referencing design properties
- [ ] Edge cases (null, undefined, empty) have unit tests
- [ ] Integration test verifies no React error #31
- [ ] API routes have tests for locale extraction
- [ ] Components have tests for all JSONB fields (name, description, bed_type)
- [ ] Error handling paths are tested
- [ ] Fallback chain is tested at each level
- [ ] Logging behavior is verified

## Implementation Plan

### Phase 1: Foundation (Core Types and Helpers)

**Files to Create**:
1. `src/lib/types/database.ts` - Type definitions
2. `src/lib/localization/helpers.ts` - Core helper functions
3. `src/lib/localization/transformer.ts` - Response transformers
4. `src/lib/localization/extract.ts` - Locale extraction
5. `src/lib/localization/logger.ts` - Logging utilities

**Files to Update**:
- None (new functionality)

**Testing**:
- Unit tests for all helper functions
- Property tests for Properties 3, 4, 5, 8

### Phase 2: API Route Updates

**Files to Update**:
1. `src/app/api/availability/route.ts` - Add locale extraction and transformation
2. `src/app/api/admin/apartments/route.ts` - Add transformation for GET
3. `src/app/api/admin/apartments/[id]/route.ts` - Add transformation for GET, validation for POST/PUT
4. `src/app/api/booking/route.ts` - Add transformation
5. `src/lib/bookings/service.ts` - Update to use localization helpers

**Pattern for Each API Route**:
```typescript
import { extractLocale } from '@/lib/localization/extract'
import { localizeApartments } from '@/lib/localization/transformer'

export async function GET(request: NextRequest) {
  // Extract locale
  const locale = extractLocale(request)
  
  // Query database (returns JSONB as-is)
  const { data: apartments } = await supabase
    .from('apartments')
    .select('*')
  
  // Transform response
  const localized = localizeApartments(apartments, locale)
  
  return NextResponse.json({ apartments: localized })
}
```

**Testing**:
- Unit tests for each updated API route
- Property test for Property 1 (API localization)
- Integration test for Property 12 (correct schema usage)

### Phase 3: React Component Updates

**Files to Update**:
1. `src/hooks/useAvailability.ts` - Update Apartment interface
2. `src/components/admin/ApartmentManager.tsx` - Use localization helpers for forms
3. `src/components/booking/AvailabilityCalendar.tsx` - Expect localized strings
4. Any component rendering apartment data

**Pattern for Components**:
```typescript
// Before: apartment.name might be JSONB object
<h2>{apartment.name}</h2>  // ❌ Causes React error #31

// After: apartment.name is localized string from API
<h2>{apartment.name}</h2>  // ✅ Works correctly
```

**For Admin Forms** (creating/updating):
```typescript
import { createMultiLanguageText, mergeMultiLanguageText } from '@/lib/localization/helpers'

// Creating new apartment
const newApartment = {
  name: {
    sr: formData.name_sr,
    en: formData.name_en,
    de: formData.name_de,
    it: formData.name_it
  },
  // ... other fields
}

// Updating existing apartment (partial update)
const update = mergeMultiLanguageText(
  existingApartment.name,
  { [locale]: formData.name }
)
```

**Testing**:
- Unit tests for each updated component
- Property tests for Properties 2, 9 (component rendering)
- Integration test for Property 11 (language switching)

### Phase 4: Server Action Updates

**Files to Update**:
1. Any server actions that insert/update apartments
2. Any server actions that insert/update content

**Pattern for Server Actions**:
```typescript
import { isCompleteMultiLanguageText, mergeMultiLanguageText } from '@/lib/localization/helpers'

// Insert validation
export async function createApartment(data: ApartmentInput) {
  // Validate multi-language fields
  if (!isCompleteMultiLanguageText(data.name)) {
    return { error: 'Name must include all languages' }
  }
  
  // Insert
  const { data: apartment } = await supabase
    .from('apartments')
    .insert(data)
    .select()
    .single()
  
  return { apartment }
}

// Update with merge
export async function updateApartment(id: string, update: Partial<ApartmentInput>) {
  // Get existing
  const { data: existing } = await supabase
    .from('apartments')
    .select('*')
    .eq('id', id)
    .single()
  
  // Merge multi-language fields
  const merged = {
    ...existing,
    name: update.name ? mergeMultiLanguageText(existing.name, update.name) : existing.name
  }
  
  // Update
  const { data: apartment } = await supabase
    .from('apartments')
    .update(merged)
    .eq('id', id)
    .select()
    .single()
  
  return { apartment }
}
```

**Testing**:
- Unit tests for server actions
- Property tests for Properties 6, 7 (insertion and update)

### Phase 5: Integration and Validation

**Tasks**:
1. Run full test suite
2. Manual testing of all user flows
3. Verify no React error #31 in browser console
4. Test language switching
5. Test admin forms for creating/updating apartments
6. Verify fallback behavior with incomplete translations

**Testing**:
- Integration test for Property 1 (end-to-end API flow)
- Integration test for Property 11 (language switching)
- Manual verification of all requirements

### Migration Considerations

Since the database already has JSONB columns, we need to handle existing data:

1. **Data Audit**: Check existing apartments for data format
   ```sql
   -- Check if name is already JSONB with language keys
   SELECT id, name, 
          jsonb_typeof(name) as name_type,
          name ? 'sr' as has_sr,
          name ? 'en' as has_en
   FROM apartments;
   ```

2. **Data Migration Script** (if needed):
   ```typescript
   // scripts/migrate-apartment-data.ts
   // Convert old string format to JSONB if necessary
   ```

3. **Backward Compatibility**: Helpers should handle both formats during transition

### Rollout Strategy

1. **Development**: Implement and test all changes
2. **Staging**: Deploy to staging, verify with real data
3. **Production**: 
   - Deploy during low-traffic period
   - Monitor error logs for missing translations
   - Have rollback plan ready
4. **Post-Deployment**: Monitor for 24 hours, fix any issues

