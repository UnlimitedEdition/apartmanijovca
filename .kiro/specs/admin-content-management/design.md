# Design Document: Admin Content Management System

## Overview

This design specifies the architecture and implementation details for fixing and enhancing the Admin Panel Content Management System. The system enables administrators to manage multi-language website content across five sections (Početna stranica, O nama, Cene, Kontakt, Futer) with support for four languages (SR, EN, DE, IT).

The design addresses the current issues where content is not loading correctly from the database and changes cannot be saved properly. It provides a robust solution for content loading, editing, validation, draft/publish workflow, and persistence to the Supabase PostgreSQL database.

### Key Design Goals

1. Reliable content loading from database with proper error handling
2. Correct parsing and display of multi-language JSONB fields
3. Robust save and publish operations with validation
4. Draft/publish workflow with state management
5. Real-time language coverage indicators
6. Content integrity preservation (special characters, line breaks)
7. Concurrent edit detection and conflict resolution
8. Import/export functionality for content backup
9. Performance optimization for responsive UI
10. Audit trail for accountability

## Current Implementation Analysis

### Existing Files

1. **ContentEditor Component** (`src/components/admin/ContentEditor.tsx`)
   - ✅ Section navigation (5 sections)
   - ✅ Language tabs (4 languages)
   - ✅ Field inputs (text and textarea)
   - ✅ Language coverage indicators
   - ✅ Save draft, Publish, Reset, Import buttons
   - ✅ Loading and error states
   - ⚠️ Import button calls `/api/admin/setup` (not implemented)
   - ⚠️ No export functionality
   - ⚠️ No validation before save/publish
   - ⚠️ No concurrent edit detection

2. **Content API** (`src/app/api/admin/content/route.ts`)
   - ✅ GET endpoint with section-based queries
   - ✅ POST endpoint for save/publish
   - ✅ PUT and DELETE endpoints
   - ⚠️ **CRITICAL BUG**: Uses `JSON.stringify()` causing double encoding
   - ⚠️ No `published` field support (field doesn't exist in DB yet)
   - ⚠️ No validation logic
   - ⚠️ No concurrent edit detection

### Key Issues to Fix

1. **Double Encoding Bug**
   - API line 107: `const jsonbValue = JSON.stringify(fieldValue)` ❌
   - Should be: `const jsonbValue = fieldValue` ✅
   - Same issue on line 169

2. **Missing Published Field**
   - Database doesn't have `published` column
   - API accepts `published` parameter but doesn't use it
   - Need migration to add column

3. **Missing Features**
   - No export functionality
   - No validation before save/publish
   - No concurrent edit detection
   - Import button points to non-existent `/api/admin/setup`

4. **Section Key Mismatch**
   - Database has: `home.hero.title`, `home.hero.subtitle`
   - Component expects: `home.title`, `home.subtitle`
   - Need to align key structure

### Implementation Priority

**Phase 1: Critical Fixes (Must Have)**
1. Fix double encoding bug in API
2. Add `published` field to database
3. Fix section key structure mismatch
4. Add validation logic

**Phase 2: Core Features (Should Have)**
5. Add export functionality
6. Implement concurrent edit detection
7. Fix import functionality
8. Add proper error handling

**Phase 3: Enhancements (Nice to Have)**
9. Add audit trail
10. Add performance optimizations
11. Add comprehensive testing

## Architecture

### System Components

The system follows a three-tier architecture:

1. **Presentation Layer**: React components (ContentEditor)
2. **API Layer**: Next.js API routes (`/api/admin/content`)
3. **Data Layer**: Supabase PostgreSQL database

```
┌─────────────────────────────────────────┐
│         ContentEditor Component         │
│  - Section navigation                   │
│  - Language tabs                        │
│  - Form fields                          │
│  - Language coverage indicators         │
│  - Action buttons (Save/Publish/Reset)  │
└─────────────────┬───────────────────────┘
                  │
                  │ HTTP (fetch)
                  │
┌─────────────────▼───────────────────────┐
│      API Routes (/api/admin/content)    │
│  - GET: Fetch content by section        │
│  - POST: Save/publish content           │
│  - Validation logic                     │
│  - Error handling                       │
└─────────────────┬───────────────────────┘
                  │
                  │ Supabase Client
                  │
┌─────────────────▼───────────────────────┐
│      Supabase PostgreSQL Database       │
│  - content table                        │
│  - Indexes for performance              │
│  - Constraints for data integrity       │
└─────────────────────────────────────────┘
```

### Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **UI Components**: Radix UI, Tailwind CSS, Lucide icons
- **State Management**: React hooks (useState, useEffect, useCallback)
- **API**: Next.js API routes
- **Database**: Supabase PostgreSQL
- **Testing**: Jest, React Testing Library, fast-check (property-based testing)

## Components and Interfaces

### Database Schema

#### Content Table

The `content` table **ALREADY EXISTS** in the database with the following structure:

```sql
-- EXISTING TABLE (no migration needed)
CREATE TABLE content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Content identification
  key TEXT NOT NULL,
  language TEXT NOT NULL CHECK (language IN ('sr', 'en', 'de', 'it')),
  value JSONB NOT NULL,
  
  -- Audit fields
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure one value per key per language
  UNIQUE(key, language)
);

-- EXISTING INDEXES (already created)
CREATE UNIQUE INDEX content_pkey ON content USING btree (id);
CREATE UNIQUE INDEX content_key_language_key ON content USING btree (key, language);
CREATE INDEX idx_content_key_language ON content USING btree (key, language);
CREATE INDEX content_key_idx ON content USING btree (key);
```

**Current Data Status:**
- 16 rows exist with keys: `home.hero.title`, `home.hero.subtitle`, `contact.email`, `contact.phone`
- All 4 languages (sr, en, de, it) are present for each key
- **CRITICAL ISSUE**: Values are double-encoded as JSON strings within JSONB
  - Current format: `"\"Dobrodošli u Apartmane Jovča\""` (string within string)
  - Desired format: `"Dobrodošli u Apartmane Jovča"` (plain string)

**Missing Field:**
- `published` BOOLEAN field does NOT exist (needs to be added for draft/publish workflow)

**Key Structure**: Content keys follow the pattern `{section}.{subsection}.{field}` or `{section}.{field}`:

**Currently in Database:**
- `home.hero.title` - Home page main title
- `home.hero.subtitle` - Home page subtitle  
- `contact.email` - Contact email
- `contact.phone` - Contact phone

**Component Expects (MISMATCH):**
- `home.title` - Should be `home.hero.title`
- `home.subtitle` - Should be `home.hero.subtitle`
- `home.description` - Needs to be added as `home.hero.description`
- `home.welcome` - Needs to be added as `home.hero.welcome`
- `home.reserve` - Needs to be added as `home.hero.reserve`

**Resolution Strategy:**
Two options:
1. **Update Database Keys** (Breaking change - requires data migration)
   - Change `home.hero.title` → `home.title`
   - Change `home.hero.subtitle` → `home.subtitle`
   
2. **Update Component** (Non-breaking - recommended)
   - Change component to use `home.hero.title` instead of `home.title`
   - Add `hero` subsection to home section definition
   - Keeps existing data intact

**Recommended: Option 2** - Update component to match database structure.

**Planned Keys (to be added):**
- `home.hero.description` - Home page description
- `home.hero.welcome` - Home page welcome text
- `home.hero.reserve` - Home page button text
- `about.title` - About page title
- `about.aboutTitle` - About section title
- `about.aboutText` - About section text
- `prices.title` - Prices page title
- `prices.description` - Prices description
- `prices.includes` - What's included text
- `contact.title` - Contact page title
- `contact.description` - Contact description
- `contact.address` - Contact address
- `footer.copyright` - Footer copyright text
- `footer.tagline` - Footer tagline

**Value Structure**: The `value` column stores JSONB data. 

**CURRENT PROBLEM (Double Encoding):**
```json
"\"Dobrodošli u Apartmane Jovča\""
```
This is a JSON string containing another JSON string (double-encoded).

**DESIRED FORMAT (Single Encoding):**
```json
"Dobrodošli u Apartmane Jovča"
```
This is a plain JSON string (single-encoded).

**Migration Strategy:**
1. Fix existing data by removing double encoding
2. Update API to prevent double encoding on save
3. Update API to handle both formats on read (for backward compatibility during transition)

### API Endpoints

#### GET /api/admin/content

Fetches content for a specific section or key.

**Query Parameters**:
- `section` (optional): Section ID (e.g., "home", "about", "prices", "contact", "footer")
- `key` (optional): Specific content key (e.g., "home.title")
- `language` or `lang` (optional): Language code (e.g., "sr", "en", "de", "it")

**Response Format** (section-based):
```typescript
{
  content: Array<{
    lang: string;
    data: Record<string, string>;
  }>;
}
```

**Example Response**:
```json
{
  "content": [
    {
      "lang": "sr",
      "data": {
        "title": "Dobrodošli",
        "subtitle": "Luksuzni apartmani",
        "description": "Uživajte u komforu..."
      }
    },
    {
      "lang": "en",
      "data": {
        "title": "Welcome",
        "subtitle": "Luxury apartments",
        "description": "Enjoy the comfort..."
      }
    }
  ]
}
```

**Error Responses**:
- `500`: Database connection error, query error, or schema error
- `503`: Database connection timeout
- `504`: Query timeout

#### POST /api/admin/content

Creates or updates content for a section and language.

**Request Body** (section-based):
```typescript
{
  section: string;      // Section ID
  lang: string;         // Language code
  data: Record<string, string>;  // Field key-value pairs
  published?: boolean;  // Optional: true for publish, false/undefined for draft
}
```

**Example Request**:
```json
{
  "section": "home",
  "lang": "sr",
  "data": {
    "title": "Dobrodošli",
    "subtitle": "Luksuzni apartmani"
  },
  "published": true
}
```

**Response Format**:
```typescript
{
  success: boolean;
  results: Array<ContentRecord>;
}
```

**Error Responses**:
- `400`: Missing required fields or invalid data format
- `409`: Concurrent modification conflict
- `500`: Database error or validation error

### ContentEditor Component

#### State Structure

```typescript
interface ContentEditorState {
  // Current selections
  selectedSection: string;
  selectedLanguage: Language;
  
  // Content data organized by language and section
  content: Record<Language, Record<string, ContentData>>;
  
  // UI state
  loading: boolean;
  saving: boolean;
  error: string | null;
  success: string | null;
  hasChanges: boolean;
  
  // For concurrent edit detection
  lastFetchedAt: Date | null;
}

type Language = 'en' | 'de' | 'it' | 'sr';

interface ContentData {
  [fieldKey: string]: string;
}
```

#### Component Hierarchy

```
ContentEditor
├── ErrorMessage (conditional)
├── SuccessMessage (conditional)
├── SectionNavigation
│   └── SectionButton (×5 sections)
├── ContentEditorPanel
│   ├── SectionHeader
│   │   ├── SectionTitle
│   │   └── LanguageSelector
│   │       └── LanguageButton (×4 languages)
│   ├── LoadingSpinner (conditional)
│   └── FieldList
│       └── FieldInput (text or textarea)
├── ActionButtons
│   ├── SaveDraftButton
│   ├── PublishButton
│   ├── ResetButton
│   └── ImportButton
└── LanguageCoverageCard
    └── LanguageBadge (×4 languages)
```

#### Key Functions

**fetchContent()**
- Fetches content for the selected section from the API
- Organizes content by language
- Updates state with fetched content
- Sets `lastFetchedAt` timestamp for concurrent edit detection
- Handles loading and error states

**handleFieldChange(key, value)**
- Updates local state when user types in a field
- Sets `hasChanges` to true
- Debounced for performance

**handleSave()**
- Validates content structure
- Sends POST request with `published: false`
- Displays success/error messages
- Resets `hasChanges` flag on success

**handlePublish()**
- Validates required fields are filled
- Checks for concurrent modifications
- Sends POST request with `published: true` for all languages
- Displays success/error messages
- Resets `hasChanges` flag on success

**handleReset()**
- Shows confirmation dialog
- Refetches content from database
- Discards unsaved changes

**handleImport(file)**
- Reads JSON file
- Validates JSON structure
- Populates content state
- Marks content as unsaved

**handleExport()**
- Serializes current content to JSON
- Triggers file download

**updateLanguageCoverage()**
- Checks each language for non-empty content
- Updates coverage indicators
- Debounced to avoid excessive re-renders

## Data Models

### Content Record

```typescript
interface ContentRecord {
  id: string;           // UUID
  key: string;          // e.g., "home.title"
  language: string;     // "sr" | "en" | "de" | "it"
  value: string;        // Plain text content
  created_at: string;   // ISO timestamp
  updated_at: string;   // ISO timestamp
}
```

### Section Definition

```typescript
interface ContentSection {
  id: string;           // Section identifier
  name: string;         // Display name
  fields: ContentField[];
}

interface ContentField {
  key: string;          // Field key (without section prefix)
  label: string;        // Display label
  type: 'text' | 'textarea';
}
```

### Language Definition

```typescript
interface LanguageInfo {
  code: Language;       // "sr" | "en" | "de" | "it"
  label: string;        // "Serbian", "English", etc.
  flag: string;         // Emoji flag
}
```

### Import/Export Format

```typescript
interface ContentExport {
  version: string;      // Export format version
  exportedAt: string;   // ISO timestamp
  sections: {
    [sectionId: string]: {
      [language: string]: {
        [fieldKey: string]: string;
      };
    };
  };
}
```

**Example**:
```json
{
  "version": "1.0",
  "exportedAt": "2024-01-15T10:30:00Z",
  "sections": {
    "home": {
      "sr": {
        "title": "Dobrodošli",
        "subtitle": "Luksuzni apartmani"
      },
      "en": {
        "title": "Welcome",
        "subtitle": "Luxury apartments"
      }
    }
  }
}
```

### Migration Strategy

**CRITICAL ISSUE**: Current database has double-encoded JSON values that must be fixed.

#### Migration 1: Add Published Field

```sql
-- Add published column (defaults to true for existing content)
ALTER TABLE content ADD COLUMN published BOOLEAN DEFAULT true;

-- Create index for performance
CREATE INDEX idx_content_published ON content(published) WHERE published = true;

-- Verify migration
SELECT COUNT(*) as total_rows, 
       COUNT(*) FILTER (WHERE published = true) as published_rows
FROM content;
```

#### Migration 2: Fix Double-Encoded Values

```sql
-- Fix double-encoded JSON strings
-- Current: "\"text\"" → Desired: "text"
UPDATE content
SET value = (value #>> '{}')::jsonb,
    updated_at = NOW()
WHERE jsonb_typeof(value) = 'string' 
  AND value::text LIKE '"\"%';

-- Verify fix
SELECT 
    key,
    language,
    jsonb_typeof(value) as value_type,
    value::text as sample
FROM content
LIMIT 5;
```

**Explanation:**
- `value #>> '{}'` extracts the string value from JSONB
- `::jsonb` converts it back to JSONB (now single-encoded)
- `LIKE '"\"%'` matches double-encoded strings (starts with `"\"`)

#### Migration Verification

After migrations, verify:
1. All rows have `published = true`
2. All values are single-encoded strings
3. No data loss occurred

```sql
-- Check all content is properly formatted
SELECT 
    key,
    language,
    published,
    LENGTH(value::text) as value_length,
    LEFT(value::text, 50) as value_preview
FROM content
ORDER BY key, language;
```

## Multi-Language Field Handling

### Current Implementation Issues

The current implementation has issues with JSONB value handling:
1. Values are double-encoded (JSON string within JSONB)
2. Parsing logic is inconsistent
3. Special characters may not be preserved correctly

### Improved Implementation

#### Database Storage

Store plain text directly in JSONB without additional JSON encoding:

```typescript
// Before (incorrect - double encoding)
const jsonbValue = JSON.stringify(fieldValue);  // "\"text\"" 

// After (correct - single encoding)
const jsonbValue = fieldValue;  // "text"
```

#### API Layer - Saving Content

**CRITICAL**: Must prevent double-encoding when saving.

```typescript
// POST /api/admin/content
for (const [fieldKey, fieldValue] of Object.entries(data)) {
  const fullKey = `${section}.${fieldKey}`;
  
  // Store value as plain JSONB string (NOT JSON.stringify)
  // PostgreSQL JSONB column will handle the encoding
  await supabaseAdmin
    .from('content')
    .upsert({
      key: fullKey,
      language: lang,
      value: fieldValue,  // Direct storage - Supabase client handles JSONB encoding
      published: published || false,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'key,language'
    });
}
```

**Why this works:**
- Supabase client automatically converts JavaScript string to JSONB
- No need for `JSON.stringify()` - that causes double encoding
- PostgreSQL stores it as: `"text"` (single-encoded)

#### API Layer - Fetching Content

**CRITICAL**: Must handle both double-encoded (legacy) and single-encoded (new) values.

```typescript
// GET /api/admin/content
const { data, error } = await supabaseAdmin
  .from('content')
  .select('*')
  .like('key', `${section}.%`)
  .order('language', { ascending: true });

// Group by language and strip section prefix
const groupedByLanguage: Record<string, Record<string, string>> = {};

data.forEach(item => {
  if (!groupedByLanguage[item.language]) {
    groupedByLanguage[item.language] = {};
  }
  
  const fieldKey = item.key.substring(section.length + 1);
  
  // Handle both double-encoded and single-encoded values
  let textValue: string;
  
  if (typeof item.value === 'string') {
    // Already a string (single-encoded) - use directly
    textValue = item.value;
  } else {
    // Might be double-encoded or other format
    try {
      // Try to parse as JSON
      const parsed = JSON.parse(item.value);
      textValue = typeof parsed === 'string' ? parsed : String(parsed);
    } catch {
      // If parsing fails, convert to string
      textValue = String(item.value);
    }
  }
  
  groupedByLanguage[item.language][fieldKey] = textValue;
});
```

**Backward Compatibility:**
- Handles legacy double-encoded values: `"\"text\""` → `"text"`
- Handles new single-encoded values: `"text"` → `"text"`
- Ensures ContentEditor always receives plain strings

#### Component Layer - Display

```typescript
// ContentEditor component
<Input
  value={currentData[field.key] as string || ''}
  onChange={(e) => handleFieldChange(field.key, e.target.value)}
/>
```

### Character Encoding

All content operations use UTF-8 encoding:
- Database connection configured with UTF-8
- API responses use `Content-Type: application/json; charset=utf-8`
- React components handle UTF-8 natively

Special characters preserved:
- Accented characters: č, ć, š, ž, đ (Serbian)
- Quotes: ", ', „, "
- Line breaks: \n
- Emoji: 🇷🇸, 🇬🇧, etc.

## Draft/Publish Workflow

### State Management

The system supports two content states:
1. **Draft**: Content saved but not published (for work-in-progress)
2. **Published**: Content live on the public website

### Implementation Approach

The current database schema doesn't have a `published` field. We'll add it:

**Migration Required:**
```sql
-- Add published column (defaults to true for existing content)
ALTER TABLE content ADD COLUMN published BOOLEAN DEFAULT true;

-- Create index for performance
CREATE INDEX idx_content_published ON content(published) WHERE published = true;

-- Update existing content to published state
UPDATE content SET published = true WHERE published IS NULL;
```

**Why default to `true`?**
- Existing content in database is already live on the website
- Setting to `true` prevents breaking the public website
- New content will explicitly set `published = false` for drafts

### Workflow

```
┌─────────────┐
│   Editing   │
│  (unsaved)  │
└──────┬──────┘
       │
       │ Click "Sačuvaj nacrt"
       ▼
┌─────────────┐
│    Draft    │
│ (published: │
│   false)    │
└──────┬──────┘
       │
       │ Click "Objavi"
       ▼
┌─────────────┐
│  Published  │
│ (published: │
│    true)    │
└─────────────┘
```

### Save Draft Operation

```typescript
async function saveDraft(section: string, lang: string, data: Record<string, string>) {
  for (const [fieldKey, fieldValue] of Object.entries(data)) {
    await supabaseAdmin
      .from('content')
      .upsert({
        key: `${section}.${fieldKey}`,
        language: lang,
        value: fieldValue,
        published: false,  // Draft state
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'key,language'
      });
  }
}
```

### Publish Operation

```typescript
async function publishContent(section: string, lang: string, data: Record<string, string>) {
  // Validate required fields first
  validateRequiredFields(section, data);
  
  for (const [fieldKey, fieldValue] of Object.entries(data)) {
    await supabaseAdmin
      .from('content')
      .upsert({
        key: `${section}.${fieldKey}`,
        language: lang,
        value: fieldValue,
        published: true,  // Published state
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'key,language'
      });
  }
}
```

### Public Website Content Fetching

The public website should only fetch published content:

```typescript
const { data } = await supabase
  .from('content')
  .select('*')
  .eq('published', true)
  .eq('language', currentLanguage);
```

## Validation Logic

### Client-Side Validation

Performed in the ContentEditor component before API calls:

#### Structure Validation
```typescript
function validateContentStructure(data: Record<string, string>): ValidationResult {
  const errors: string[] = [];
  
  // Check that data is an object
  if (typeof data !== 'object' || data === null) {
    errors.push('Content data must be an object');
  }
  
  // Check that all values are strings
  for (const [key, value] of Object.entries(data)) {
    if (typeof value !== 'string') {
      errors.push(`Field "${key}" must be a string`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
```

#### Required Fields Validation (for publish)
```typescript
function validateRequiredFields(section: string, data: Record<string, string>): ValidationResult {
  const errors: string[] = [];
  const requiredFields = getRequiredFieldsForSection(section);
  
  for (const field of requiredFields) {
    const value = data[field];
    if (!value || value.trim() === '') {
      errors.push(`Field "${field}" is required for publishing`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

function getRequiredFieldsForSection(section: string): string[] {
  const requiredFieldsMap: Record<string, string[]> = {
    home: ['title', 'subtitle', 'description'],
    about: ['title', 'aboutTitle', 'aboutText'],
    prices: ['title', 'description'],
    contact: ['title', 'address', 'phone', 'email'],
    footer: ['copyright']
  };
  
  return requiredFieldsMap[section] || [];
}
```

#### Multi-Language Validation (for publish)
```typescript
function validateLanguageCoverage(
  section: string,
  allLanguages: Record<Language, Record<string, string>>
): ValidationResult {
  const errors: string[] = [];
  const requiredFields = getRequiredFieldsForSection(section);
  
  // Check that at least one language has all required fields
  let hasCompleteLanguage = false;
  
  for (const [lang, data] of Object.entries(allLanguages)) {
    const missingFields = requiredFields.filter(
      field => !data[field] || data[field].trim() === ''
    );
    
    if (missingFields.length === 0) {
      hasCompleteLanguage = true;
      break;
    }
  }
  
  if (!hasCompleteLanguage) {
    errors.push(
      `At least one language must have all required fields: ${requiredFields.join(', ')}`
    );
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
```

### Server-Side Validation

Performed in the API route before database operations:

#### Input Validation
```typescript
function validateApiInput(body: any): ValidationResult {
  const errors: string[] = [];
  
  // Check required fields
  if (!body.section || typeof body.section !== 'string') {
    errors.push('Section is required and must be a string');
  }
  
  if (!body.lang || typeof body.lang !== 'string') {
    errors.push('Language is required and must be a string');
  }
  
  if (!body.data || typeof body.data !== 'object') {
    errors.push('Data is required and must be an object');
  }
  
  // Validate language code
  const validLanguages = ['sr', 'en', 'de', 'it'];
  if (body.lang && !validLanguages.includes(body.lang)) {
    errors.push(`Language must be one of: ${validLanguages.join(', ')}`);
  }
  
  // Validate section
  const validSections = ['home', 'about', 'prices', 'contact', 'footer'];
  if (body.section && !validSections.includes(body.section)) {
    errors.push(`Section must be one of: ${validSections.join(', ')}`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
```

#### Content Sanitization
```typescript
function sanitizeContent(value: string): string {
  // Trim whitespace
  let sanitized = value.trim();
  
  // Normalize line breaks
  sanitized = sanitized.replace(/\r\n/g, '\n');
  
  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');
  
  // Limit length (e.g., 10,000 characters)
  if (sanitized.length > 10000) {
    sanitized = sanitized.substring(0, 10000);
  }
  
  return sanitized;
}
```

### Validation Error Display

```typescript
// In ContentEditor component
if (!validationResult.valid) {
  setError(
    <div>
      <p>Validation failed:</p>
      <ul>
        {validationResult.errors.map((err, i) => (
          <li key={i}>{err}</li>
        ))}
      </ul>
    </div>
  );
  return;
}
```


## Error Handling

### Error Categories

1. **Network Errors**: Connection failures, timeouts
2. **Database Errors**: Query failures, constraint violations
3. **Validation Errors**: Invalid input, missing required fields
4. **Concurrent Edit Errors**: Conflicting modifications
5. **File Errors**: Invalid JSON import, file size limits

### Error Handling Strategy

#### API Layer Error Handling

```typescript
// GET /api/admin/content
export async function GET(request: NextRequest) {
  try {
    // ... fetch logic
    
    const { data, error } = await supabaseAdmin
      .from('content')
      .select('*')
      .like('key', `${section}.%`);
    
    if (error) {
      // Log error for debugging
      console.error('Database query error:', error);
      
      // Return appropriate error response
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Content table not found. Please run database migrations.' },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to fetch content', details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ content: data });
    
  } catch (error) {
    console.error('Unexpected error in GET /api/admin/content:', error);
    
    // Network/connection errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return NextResponse.json(
        { error: 'Database connection failed. Please check your internet connection.' },
        { status: 503 }
      );
    }
    
    // Generic error
    return NextResponse.json(
      { error: 'An unexpected error occurred', details: error.message },
      { status: 500 }
    );
  }
}
```

```typescript
// POST /api/admin/content
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = validateApiInput(body);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }
    
    const { section, lang, data, published } = body;
    
    // Sanitize content
    const sanitizedData: Record<string, string> = {};
    for (const [key, value] of Object.entries(data)) {
      sanitizedData[key] = sanitizeContent(value as string);
    }
    
    // Save to database
    const results = [];
    for (const [fieldKey, fieldValue] of Object.entries(sanitizedData)) {
      const fullKey = `${section}.${fieldKey}`;
      
      const { data: result, error } = await supabaseAdmin
        .from('content')
        .upsert({
          key: fullKey,
          language: lang,
          value: fieldValue,
          published: published || false,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'key,language'
        })
        .select()
        .single();
      
      if (error) {
        console.error(`Error saving ${fullKey}:`, error);
        
        // Handle unique constraint violations
        if (error.code === '23505') {
          return NextResponse.json(
            { error: 'Content already exists', details: error.message },
            { status: 409 }
          );
        }
        
        throw error;
      }
      
      results.push(result);
    }
    
    return NextResponse.json({ success: true, results }, { status: 200 });
    
  } catch (error) {
    console.error('Error in POST /api/admin/content:', error);
    
    // JSON parse errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to save content', details: error.message },
      { status: 500 }
    );
  }
}
```

#### Component Layer Error Handling

```typescript
// ContentEditor component
const [error, setError] = useState<string | null>(null);
const [retryCount, setRetryCount] = useState(0);

const fetchContent = useCallback(async () => {
  try {
    setLoading(true);
    setError(null);
    
    const response = await fetch(`/api/admin/content?section=${selectedSection}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }
    
    const data = await response.json();
    // ... process data
    
    setRetryCount(0);  // Reset retry count on success
    
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    setError(errorMessage);
    
    // Auto-retry for network errors (max 3 attempts)
    if (errorMessage.includes('connection') && retryCount < 3) {
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        fetchContent();
      }, 2000 * (retryCount + 1));  // Exponential backoff
    }
  } finally {
    setLoading(false);
  }
}, [selectedSection, retryCount]);
```

#### Error Display Component

```typescript
// Error message with retry button
{error && (
  <Card className="border-destructive">
    <CardContent className="pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <div>
            <p className="font-semibold">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchContent()}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    </CardContent>
  </Card>
)}
```

### Concurrent Edit Detection

To prevent administrators from overwriting each other's changes:

```typescript
// Add version tracking to state
const [contentVersion, setContentVersion] = useState<Record<string, string>>({});

// Store version when fetching
const fetchContent = async () => {
  const response = await fetch(`/api/admin/content?section=${selectedSection}`);
  const data = await response.json();
  
  // Store updated_at timestamps as versions
  const versions: Record<string, string> = {};
  data.content.forEach(item => {
    versions[`${item.lang}.${selectedSection}`] = item.updated_at;
  });
  setContentVersion(versions);
};

// Check version before saving
const handleSave = async () => {
  // First, check if content has been modified
  const checkResponse = await fetch(`/api/admin/content?section=${selectedSection}`);
  const checkData = await checkResponse.json();
  
  const currentVersion = checkData.content.find(
    item => item.lang === selectedLanguage
  )?.updated_at;
  
  const storedVersion = contentVersion[`${selectedLanguage}.${selectedSection}`];
  
  if (currentVersion && storedVersion && currentVersion !== storedVersion) {
    // Conflict detected
    const shouldOverwrite = confirm(
      'This content has been modified by another user. Do you want to overwrite their changes?'
    );
    
    if (!shouldOverwrite) {
      // Reload content
      fetchContent();
      return;
    }
  }
  
  // Proceed with save
  // ...
};
```

### Import/Export Error Handling

```typescript
// Import validation
const handleImport = async (file: File) => {
  try {
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File size exceeds 5MB limit');
    }
    
    // Check file type
    if (!file.name.endsWith('.json')) {
      throw new Error('File must be a JSON file');
    }
    
    // Read file
    const text = await file.text();
    
    // Parse JSON
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      throw new Error('Invalid JSON format');
    }
    
    // Validate structure
    if (!parsed.version || !parsed.sections) {
      throw new Error('Invalid content export format');
    }
    
    // Validate sections
    const validSections = ['home', 'about', 'prices', 'contact', 'footer'];
    for (const section of Object.keys(parsed.sections)) {
      if (!validSections.includes(section)) {
        throw new Error(`Invalid section: ${section}`);
      }
    }
    
    // Validate languages
    const validLanguages = ['sr', 'en', 'de', 'it'];
    for (const section of Object.values(parsed.sections)) {
      for (const lang of Object.keys(section)) {
        if (!validLanguages.includes(lang)) {
          throw new Error(`Invalid language: ${lang}`);
        }
      }
    }
    
    // Import content
    setContent(transformImportedContent(parsed));
    setHasChanges(true);
    setSuccess('Content imported successfully');
    
  } catch (err) {
    setError(`Import failed: ${err.message}`);
  }
};
```

## Testing Strategy

### Testing Approach

The system will use a dual testing approach:

1. **Unit Tests**: Verify specific examples, edge cases, and error conditions
2. **Property-Based Tests**: Verify universal properties across all inputs

Both testing approaches are complementary and necessary for comprehensive coverage. Unit tests catch concrete bugs and validate specific scenarios, while property-based tests verify general correctness across a wide range of inputs.

### Property-Based Testing Configuration

We will use **fast-check** (already in package.json) for property-based testing in TypeScript/JavaScript.

Configuration:
- Minimum 100 iterations per property test
- Each property test references its design document property
- Tag format: `Feature: admin-content-management, Property {number}: {property_text}`

### Test Organization

```
src/
├── components/
│   └── admin/
│       ├── ContentEditor.tsx
│       └── __tests__/
│           ├── ContentEditor.test.tsx          # Unit tests
│           └── ContentEditor.properties.test.tsx  # Property tests
├── app/
│   └── api/
│       └── admin/
│           └── content/
│               ├── route.ts
│               └── __tests__/
│                   ├── route.test.ts           # Unit tests
│                   └── route.properties.test.ts   # Property tests
└── lib/
    └── validation/
        ├── content-validation.ts
        └── __tests__/
            ├── content-validation.test.ts      # Unit tests
            └── content-validation.properties.test.ts  # Property tests
```

### Unit Test Examples

#### Component Unit Tests
```typescript
// ContentEditor.test.tsx
describe('ContentEditor', () => {
  it('displays loading spinner while fetching content', () => {
    render(<ContentEditor />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
  
  it('displays error message when fetch fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    render(<ContentEditor />);
    await waitFor(() => {
      expect(screen.getByText(/Network error/i)).toBeInTheDocument();
    });
  });
  
  it('enables save button when content changes', async () => {
    render(<ContentEditor />);
    const input = screen.getByLabelText('Glavni naslov');
    fireEvent.change(input, { target: { value: 'New title' } });
    expect(screen.getByText('Sačuvaj nacrt')).not.toBeDisabled();
  });
});
```

#### API Unit Tests
```typescript
// route.test.ts
describe('GET /api/admin/content', () => {
  it('returns 400 when section is missing', async () => {
    const response = await GET(new Request('http://localhost/api/admin/content'));
    expect(response.status).toBe(400);
  });
  
  it('returns content grouped by language', async () => {
    const response = await GET(
      new Request('http://localhost/api/admin/content?section=home')
    );
    const data = await response.json();
    expect(data.content).toHaveLength(4);  // 4 languages
  });
});
```

### Property-Based Test Examples

Property-based tests will be written after the Correctness Properties section is completed, based on the properties defined there.

Example structure:
```typescript
// ContentEditor.properties.test.tsx
import fc from 'fast-check';

describe('ContentEditor Properties', () => {
  it('Property 1: Content round-trip preservation', () => {
    // Feature: admin-content-management, Property 1: ...
    fc.assert(
      fc.property(
        fc.record({
          title: fc.string(),
          subtitle: fc.string(),
          description: fc.string()
        }),
        (content) => {
          // Save content, then load it back
          // Verify it's identical
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Integration Tests

Integration tests will verify the full flow from component to API to database:

```typescript
describe('Content Management Integration', () => {
  it('saves and retrieves content correctly', async () => {
    // 1. Render component
    render(<ContentEditor />);
    
    // 2. Wait for content to load
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // 3. Edit content
    const titleInput = screen.getByLabelText('Glavni naslov');
    fireEvent.change(titleInput, { target: { value: 'Test Title' } });
    
    // 4. Save
    fireEvent.click(screen.getByText('Sačuvaj nacrt'));
    
    // 5. Wait for success message
    await waitFor(() => {
      expect(screen.getByText(/uspešno sačuvan/i)).toBeInTheDocument();
    });
    
    // 6. Reload page
    rerender(<ContentEditor />);
    
    // 7. Verify content persisted
    await waitFor(() => {
      expect(screen.getByLabelText('Glavni naslov')).toHaveValue('Test Title');
    });
  });
});
```

### Test Coverage Goals

- Unit test coverage: >80% for critical paths
- Property test coverage: All correctness properties implemented
- Integration test coverage: All user workflows (load, edit, save, publish, reset, import, export)

## Performance Optimizations

### Database Optimizations

#### Indexes
```sql
-- Already exists
CREATE INDEX idx_content_key_language ON content(key, language);

-- Additional index for published content queries
CREATE INDEX idx_content_published ON content(published) WHERE published = true;

-- Composite index for section queries
CREATE INDEX idx_content_section_language ON content(
  (split_part(key, '.', 1)),  -- Extract section from key
  language
);
```

#### Query Optimization
```typescript
// Use specific column selection instead of SELECT *
const { data } = await supabaseAdmin
  .from('content')
  .select('key, language, value, updated_at')  // Only needed columns
  .like('key', `${section}.%`)
  .order('language', { ascending: true });
```

#### Connection Pooling
Supabase client automatically handles connection pooling. Ensure proper client reuse:

```typescript
// Create client once, reuse across requests
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Don't create new client on every request
```

### Component Optimizations

#### Debouncing

Debounce expensive operations like language coverage updates:

```typescript
import { useMemo, useCallback } from 'react';
import { debounce } from 'lodash';  // or implement custom debounce

const updateLanguageCoverage = useMemo(
  () => debounce(() => {
    // Calculate language coverage
    const coverage = calculateCoverage(content);
    setLanguageCoverage(coverage);
  }, 300),  // 300ms delay
  [content]
);

useEffect(() => {
  updateLanguageCoverage();
}, [content, updateLanguageCoverage]);
```

#### Memoization

Memoize expensive computations:

```typescript
const currentSectionData = useMemo(() => {
  return content[selectedLanguage][selectedSection] || {};
}, [content, selectedLanguage, selectedSection]);

const languageCoverage = useMemo(() => {
  return LANGUAGES.map(lang => ({
    ...lang,
    hasContent: hasContentForLanguage(content[lang.code][selectedSection])
  }));
}, [content, selectedSection]);
```

#### Lazy Loading

Load sections on demand instead of all at once:

```typescript
const [loadedSections, setLoadedSections] = useState<Set<string>>(new Set(['home']));

const loadSection = useCallback(async (section: string) => {
  if (loadedSections.has(section)) return;
  
  const response = await fetch(`/api/admin/content?section=${section}`);
  const data = await response.json();
  
  // Merge with existing content
  setContent(prev => ({
    ...prev,
    ...organizeContent(data.content)
  }));
  
  setLoadedSections(prev => new Set([...prev, section]));
}, [loadedSections]);
```

#### Virtual Scrolling

For large content lists (if needed in the future), use virtual scrolling:

```typescript
import { FixedSizeList } from 'react-window';

// Only render visible items
<FixedSizeList
  height={600}
  itemCount={fields.length}
  itemSize={80}
>
  {({ index, style }) => (
    <div style={style}>
      <FieldInput field={fields[index]} />
    </div>
  )}
</FixedSizeList>
```

### API Optimizations

#### Response Compression

Enable gzip compression in Next.js config:

```javascript
// next.config.mjs
export default {
  compress: true,  // Enable gzip compression
};
```

#### Caching Headers

Set appropriate cache headers for content:

```typescript
// For published content (public website)
export async function GET(request: NextRequest) {
  const response = NextResponse.json(data);
  
  // Cache published content for 5 minutes
  response.headers.set(
    'Cache-Control',
    'public, s-maxage=300, stale-while-revalidate=600'
  );
  
  return response;
}

// For admin content (no caching)
export async function GET(request: NextRequest) {
  const response = NextResponse.json(data);
  
  // Don't cache admin content
  response.headers.set(
    'Cache-Control',
    'no-store, no-cache, must-revalidate'
  );
  
  return response;
}
```

#### Batch Operations

Batch multiple database operations:

```typescript
// Instead of multiple individual upserts
for (const [key, value] of Object.entries(data)) {
  await supabaseAdmin.from('content').upsert({ key, value });
}

// Use single batch upsert
const records = Object.entries(data).map(([key, value]) => ({
  key: `${section}.${key}`,
  language: lang,
  value,
  updated_at: new Date().toISOString()
}));

await supabaseAdmin
  .from('content')
  .upsert(records, { onConflict: 'key,language' });
```

### Frontend Optimizations

#### Code Splitting

Split ContentEditor into smaller chunks:

```typescript
// Lazy load heavy components
const ImportDialog = lazy(() => import('./ImportDialog'));
const ExportDialog = lazy(() => import('./ExportDialog'));

// Use Suspense for loading states
<Suspense fallback={<LoadingSpinner />}>
  {showImport && <ImportDialog />}
</Suspense>
```

#### Bundle Size Optimization

```javascript
// next.config.mjs
export default {
  webpack: (config) => {
    // Analyze bundle size
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        default: false,
        vendors: false,
        // Vendor chunk
        vendor: {
          name: 'vendor',
          chunks: 'all',
          test: /node_modules/,
          priority: 20
        },
        // Common chunk
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          priority: 10,
          reuseExistingChunk: true,
          enforce: true
        }
      }
    };
    return config;
  }
};
```

### Performance Monitoring

Add performance monitoring to track slow operations:

```typescript
// Measure fetch time
const startTime = performance.now();
const response = await fetch(`/api/admin/content?section=${selectedSection}`);
const endTime = performance.now();

if (endTime - startTime > 2000) {
  console.warn(`Slow content fetch: ${endTime - startTime}ms`);
}
```

### Performance Targets

- Initial page load: < 2 seconds
- Content fetch: < 2 seconds
- Save operation: < 3 seconds
- Publish operation: < 3 seconds
- UI responsiveness: < 100ms for user interactions
- Language coverage update: < 300ms (debounced)


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Content Round-Trip Preservation

*For any* valid content (including special characters, line breaks, and multi-language text), saving it to the database and then loading it back SHALL produce identical content with all formatting and characters preserved.

**Validates: Requirements 1.2, 1.3, 2.2, 2.5, 4.5, 16.1, 16.2, 16.3, 16.6**

### Property 2: Multi-Language Field Structure Completeness

*For any* multi-language field in the Content Editor, the UI SHALL display exactly four input fields (one for each language: SR, EN, DE, IT), each clearly labeled with its corresponding language code.

**Validates: Requirements 2.1, 2.3**

### Property 3: Language Coverage Accuracy

*For any* section and language combination, the language coverage indicator SHALL mark the language as complete if and only if all fields for that language contain non-whitespace content.

**Validates: Requirements 3.2, 3.3**

### Property 4: State Preservation Across Navigation

*For any* unsaved content changes, switching between language tabs or sections SHALL preserve all unsaved changes without data loss.

**Validates: Requirements 4.7**

### Property 5: Input State Synchronization

*For any* change to an input field, the component's local state SHALL update immediately to reflect the new value.

**Validates: Requirements 4.2**

### Property 6: Draft Save Preserves Structure

*For any* content saved as draft, all multi-language fields SHALL be persisted to the database with the published flag set to false, and the structure SHALL be preserved in the correct format.

**Validates: Requirements 5.1, 5.2, 5.6, 5.7**

### Property 7: Publish Operation Sets Published State

*For any* content published through the publish operation, all fields SHALL be persisted to the database with the published flag set to true and the updated_at timestamp SHALL be set to the current time.

**Validates: Requirements 6.1, 6.2**

### Property 8: Required Field Validation for Publish

*For any* publish attempt, if any required field for the section is empty or contains only whitespace, the validation SHALL fail and prevent the publish operation.

**Validates: Requirements 6.7, 15.2, 15.4**

### Property 9: Reset Restores Last Saved State

*For any* content with unsaved changes, performing a reset operation SHALL discard all unsaved changes and restore the content to match the last saved state in the database.

**Validates: Requirements 7.1, 7.2, 7.3**

### Property 10: Import Populates All Fields

*For any* valid JSON import file that matches the expected schema, importing SHALL populate all fields in the Content Editor with the values from the file and mark the content as unsaved.

**Validates: Requirements 8.3, 8.5, 8.6**

### Property 11: Export-Import Round-Trip

*For any* current content state in the Content Editor, exporting to JSON and then importing that JSON file SHALL restore the exact same content state.

**Validates: Requirements 18.6**

### Property 12: Export Completeness

*For any* content export operation, the generated JSON SHALL include all sections, all fields within each section, and all four languages for each field.

**Validates: Requirements 18.2, 18.3**

### Property 13: Export JSON Validity

*For any* content export operation, the generated output SHALL be valid JSON that can be parsed without errors and SHALL be formatted with proper indentation.

**Validates: Requirements 18.4**

### Property 14: Structure Validation

*For any* save or publish attempt, if the content data structure is invalid (not an object, or contains non-string values), the validation SHALL fail and display specific error messages.

**Validates: Requirements 15.1, 15.3**

### Property 15: Validation Success Allows Operation

*For any* save or publish attempt where all validation checks pass, the operation SHALL proceed and complete successfully.

**Validates: Requirements 15.6**

### Property 16: SQL Injection Prevention

*For any* content containing SQL-like syntax or special database characters, the API SHALL properly escape or parameterize the content to prevent SQL injection attacks.

**Validates: Requirements 16.5**

### Property 17: Concurrent Modification Detection

*For any* save or publish attempt, if the content in the database has been modified since it was loaded (based on updated_at timestamp comparison), the API SHALL detect the conflict and return a conflict error.

**Validates: Requirements 17.1, 17.2**

### Property 18: Error Display

*For any* error that occurs during content operations (fetch, save, publish, import), the Content Editor SHALL display an error message to the administrator.

**Validates: Requirements 14.4**

### Property 19: Error Logging

*For any* database error that occurs in the API, the error SHALL be logged with a timestamp and error details.

**Validates: Requirements 14.6**

### Property 20: Pagination for Large Datasets

*For any* content query that would return more than 100 records, the API SHALL return paginated results instead of all records at once.

**Validates: Requirements 19.5**

### Property 21: Audit Trail Completeness

*For any* save or publish operation, the API SHALL record the administrator's user ID, the operation timestamp, and whether the operation was a draft save or publish.

**Validates: Requirements 20.1, 20.2, 20.3**

### Property 22: Loading State Display

*For any* content fetch operation that is in progress, the Content Editor SHALL display a loading indicator.

**Validates: Requirements 1.6**

### Property 23: Section Coverage Indicator Presence

*For any* section displayed in the Content Editor, a language coverage indicator SHALL be present showing the completion status for all four languages.

**Validates: Requirements 3.1**

### Property 24: Editable Fields for All Sections

*For any* section and field combination defined in the section configuration, the Content Editor SHALL provide an editable input field (text or textarea based on field type).

**Validates: Requirements 4.1**

### Property 25: Language Independence

*For any* multi-language field, editing the content in one language SHALL not affect the content in any other language.

**Validates: Requirements 4.6**

### Property 26: JSON Parse Handling

*For any* JSON file selected for import, the Content Editor SHALL attempt to parse it, and if parsing fails, SHALL display an error message indicating the JSON is malformed.

**Validates: Requirements 8.2**

