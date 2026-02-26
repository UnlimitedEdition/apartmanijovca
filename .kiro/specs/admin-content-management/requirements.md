# Requirements Document

## Introduction

This document specifies requirements for fixing and enhancing the Admin Panel Content Management System. The system currently has a ContentEditor component that displays content sections (Početna stranica, O nama, Cene, Kontakt, Futer) with multi-language support (SR, EN, DE, IT), but content is not loading correctly from the database and changes cannot be saved properly. This specification ensures the admin panel can reliably load, edit, and persist multi-language content to the Supabase PostgreSQL database.

## Glossary

- **Admin_Panel**: The administrative interface for managing website content
- **Content_Editor**: The React component that provides the content editing interface
- **Content_Table**: The Supabase PostgreSQL table named `content` that stores all content data
- **Multi_Language_Field**: A JSONB field containing translations in format `{ sr: "text", en: "text", de: "text", it: "text" }`
- **Section**: A logical grouping of content (e.g., Početna stranica, O nama, Cene, Kontakt, Futer)
- **Language_Coverage_Indicator**: UI element showing which languages have content filled in for a section
- **Draft_State**: Content that has been saved but not published to the public website
- **Published_State**: Content that is live and visible on the public website
- **Content_API**: The API endpoints at `/api/admin/content` for content operations
- **Supabase_Client**: The database client for interacting with Supabase PostgreSQL

## Requirements

### Requirement 1: Load Content from Database

**User Story:** As an administrator, I want the admin panel to load all existing content from the database when I open the Content Editor, so that I can see the current state of all content sections.

#### Acceptance Criteria

1. WHEN the Content_Editor component mounts, THE Content_API SHALL fetch all content records from the Content_Table
2. WHEN content is successfully fetched, THE Content_Editor SHALL display all sections with their current values
3. WHEN content is successfully fetched, THE Content_Editor SHALL populate all Multi_Language_Fields with their stored values for all four languages (SR, EN, DE, IT)
4. IF the Content_Table is empty, THEN THE Content_Editor SHALL display empty fields with placeholder text
5. IF the database fetch fails, THEN THE Content_Editor SHALL display an error message and provide a retry button
6. WHEN content is loading, THE Content_Editor SHALL display a loading indicator
7. THE Content_API SHALL return content within 2 seconds under normal network conditions

### Requirement 2: Display Multi-Language Content

**User Story:** As an administrator, I want to see content for all four languages (SR, EN, DE, IT) in the editor, so that I can manage translations for each language.

#### Acceptance Criteria

1. THE Content_Editor SHALL display input fields for all four languages (SR, EN, DE, IT) for each Multi_Language_Field
2. WHEN a Multi_Language_Field is loaded, THE Content_Editor SHALL correctly parse the JSONB structure and display each language value in its corresponding input field
3. THE Content_Editor SHALL label each language input field clearly with the language code (SR, EN, DE, IT)
4. WHEN a language value is missing from a Multi_Language_Field, THE Content_Editor SHALL display an empty input field for that language
5. THE Content_Editor SHALL maintain the correct language-to-value mapping when displaying content

### Requirement 3: Update Language Coverage Indicators

**User Story:** As an administrator, I want to see which languages have content filled in for each section, so that I can identify missing translations.

#### Acceptance Criteria

1. THE Content_Editor SHALL display a Language_Coverage_Indicator for each section
2. WHEN a Multi_Language_Field has content for a language, THE Language_Coverage_Indicator SHALL mark that language as complete
3. WHEN a Multi_Language_Field is empty or contains only whitespace for a language, THE Language_Coverage_Indicator SHALL mark that language as incomplete
4. THE Language_Coverage_Indicator SHALL update in real-time as the administrator types in language fields
5. THE Language_Coverage_Indicator SHALL visually distinguish between complete languages (e.g., green checkmark) and incomplete languages (e.g., gray indicator)

### Requirement 4: Edit Content in Admin Panel

**User Story:** As an administrator, I want to edit content directly in the admin panel, so that I can update website content without technical knowledge.

#### Acceptance Criteria

1. THE Content_Editor SHALL provide editable input fields for all content fields in all sections
2. WHEN an administrator types in an input field, THE Content_Editor SHALL update the local state immediately
3. THE Content_Editor SHALL support text input fields for short content (e.g., titles, button text)
4. THE Content_Editor SHALL support textarea fields for long content (e.g., descriptions, welcome text)
5. THE Content_Editor SHALL preserve line breaks and formatting in textarea fields
6. THE Content_Editor SHALL allow editing of all Multi_Language_Fields independently for each language
7. THE Content_Editor SHALL not lose unsaved changes when switching between language tabs or sections

### Requirement 5: Save Content as Draft

**User Story:** As an administrator, I want to save my content changes as a draft, so that I can work on content over time without publishing incomplete changes.

#### Acceptance Criteria

1. WHEN the administrator clicks the "Sačuvaj nacrt" button, THE Content_API SHALL save all current content to the Content_Table with Draft_State
2. WHEN saving a draft, THE Content_API SHALL preserve all Multi_Language_Fields in JSONB format
3. WHEN a draft is saved successfully, THE Content_Editor SHALL display a success message
4. IF saving a draft fails, THEN THE Content_Editor SHALL display an error message and retain the unsaved changes
5. THE Content_API SHALL complete draft save operations within 3 seconds under normal network conditions
6. WHEN a draft is saved, THE Content_Editor SHALL not publish the content to the public website
7. THE Content_API SHALL validate that all Multi_Language_Fields are properly formatted as JSONB before saving

### Requirement 6: Publish Content

**User Story:** As an administrator, I want to publish my content changes, so that the updated content appears on the public website.

#### Acceptance Criteria

1. WHEN the administrator clicks the "Objavi" button, THE Content_API SHALL save all current content to the Content_Table with Published_State
2. WHEN content is published, THE Content_API SHALL update the publication timestamp
3. WHEN content is published successfully, THE Content_Editor SHALL display a success message
4. IF publishing fails, THEN THE Content_Editor SHALL display an error message and retain the unsaved changes
5. THE Content_API SHALL complete publish operations within 3 seconds under normal network conditions
6. WHEN content is published, THE public website SHALL reflect the changes immediately or within cache refresh time
7. THE Content_API SHALL validate that all required fields are filled before allowing publication

### Requirement 7: Reset Content to Last Saved State

**User Story:** As an administrator, I want to reset my changes to the last saved state, so that I can discard unwanted edits.

#### Acceptance Criteria

1. WHEN the administrator clicks the "Resetuj" button, THE Content_Editor SHALL discard all unsaved changes
2. WHEN content is reset, THE Content_Editor SHALL reload the last saved content from the Content_Table
3. WHEN content is reset, THE Content_Editor SHALL restore all Multi_Language_Fields to their last saved values
4. WHEN the administrator clicks "Resetuj", THE Content_Editor SHALL display a confirmation dialog before resetting
5. IF the administrator confirms the reset, THEN THE Content_Editor SHALL reload content from the database
6. IF the administrator cancels the reset, THEN THE Content_Editor SHALL retain the current unsaved changes

### Requirement 8: Import Content from JSON

**User Story:** As an administrator, I want to import content from a JSON file, so that I can bulk-update content or restore from a backup.

#### Acceptance Criteria

1. WHEN the administrator clicks the "Uvezi iz JSON-a" button, THE Content_Editor SHALL open a file selection dialog
2. WHEN a JSON file is selected, THE Content_Editor SHALL parse the JSON file
3. IF the JSON file is valid and matches the expected schema, THEN THE Content_Editor SHALL populate all fields with the imported data
4. IF the JSON file is invalid or malformed, THEN THE Content_Editor SHALL display an error message with details
5. WHEN content is imported, THE Content_Editor SHALL validate that all Multi_Language_Fields contain the four required languages (SR, EN, DE, IT)
6. WHEN content is imported, THE Content_Editor SHALL mark the content as unsaved until the administrator saves or publishes
7. THE Content_Editor SHALL support JSON files up to 5MB in size

### Requirement 9: Manage Početna Stranica Section

**User Story:** As an administrator, I want to manage the home page content, so that I can update the main landing page of the website.

#### Acceptance Criteria

1. THE Content_Editor SHALL provide fields for Glavni naslov (Main Title) as a Multi_Language_Field
2. THE Content_Editor SHALL provide fields for Podnaslov (Subtitle) as a Multi_Language_Field
3. THE Content_Editor SHALL provide fields for Opis (Description) as a Multi_Language_Field
4. THE Content_Editor SHALL provide fields for Tekst dobrodošlice (Welcome Text) as a Multi_Language_Field
5. THE Content_Editor SHALL provide fields for Tekst dugmeta (Button Text) as a Multi_Language_Field
6. WHEN the administrator saves or publishes, THE Content_API SHALL persist all Početna stranica fields to the Content_Table
7. WHEN the Početna stranica section is loaded, THE Content_Editor SHALL display all five fields with their current values

### Requirement 10: Manage O nama Section

**User Story:** As an administrator, I want to manage the About Us content, so that I can update company information, team details, and history.

#### Acceptance Criteria

1. THE Content_Editor SHALL provide fields for company information as Multi_Language_Fields
2. THE Content_Editor SHALL provide fields for team information as Multi_Language_Fields
3. THE Content_Editor SHALL provide fields for company history as Multi_Language_Fields
4. WHEN the administrator saves or publishes, THE Content_API SHALL persist all O nama fields to the Content_Table
5. WHEN the O nama section is loaded, THE Content_Editor SHALL display all fields with their current values

### Requirement 11: Manage Cene Section

**User Story:** As an administrator, I want to manage pricing information, so that I can update prices and pricing descriptions.

#### Acceptance Criteria

1. THE Content_Editor SHALL provide fields for pricing information as Multi_Language_Fields
2. THE Content_Editor SHALL provide fields for pricing descriptions as Multi_Language_Fields
3. WHEN the administrator saves or publishes, THE Content_API SHALL persist all Cene fields to the Content_Table
4. WHEN the Cene section is loaded, THE Content_Editor SHALL display all fields with their current values

### Requirement 12: Manage Kontakt Section

**User Story:** As an administrator, I want to manage contact information, so that I can update contact details and form text.

#### Acceptance Criteria

1. THE Content_Editor SHALL provide fields for contact details as Multi_Language_Fields
2. THE Content_Editor SHALL provide fields for contact form text as Multi_Language_Fields
3. WHEN the administrator saves or publishes, THE Content_API SHALL persist all Kontakt fields to the Content_Table
4. WHEN the Kontakt section is loaded, THE Content_Editor SHALL display all fields with their current values

### Requirement 13: Manage Futer Section

**User Story:** As an administrator, I want to manage footer content, so that I can update footer links, copyright text, and social media information.

#### Acceptance Criteria

1. THE Content_Editor SHALL provide fields for footer links as Multi_Language_Fields
2. THE Content_Editor SHALL provide fields for copyright text as a Multi_Language_Field
3. THE Content_Editor SHALL provide fields for social media information as Multi_Language_Fields
4. WHEN the administrator saves or publishes, THE Content_API SHALL persist all Futer fields to the Content_Table
5. WHEN the Futer section is loaded, THE Content_Editor SHALL display all fields with their current values

### Requirement 14: Handle Database Connection Errors

**User Story:** As an administrator, I want to see clear error messages when database operations fail, so that I can understand what went wrong and take appropriate action.

#### Acceptance Criteria

1. IF the Supabase_Client cannot connect to the database, THEN THE Content_API SHALL return a connection error with status code 503
2. IF a database query times out, THEN THE Content_API SHALL return a timeout error with status code 504
3. IF the Content_Table does not exist, THEN THE Content_API SHALL return a schema error with status code 500
4. WHEN a database error occurs, THE Content_Editor SHALL display the error message to the administrator
5. WHEN a database error occurs, THE Content_Editor SHALL provide actionable guidance (e.g., "Check your internet connection" or "Contact support")
6. THE Content_API SHALL log all database errors with timestamps and error details for debugging

### Requirement 15: Validate Content Before Saving

**User Story:** As an administrator, I want the system to validate my content before saving, so that I don't accidentally save invalid or incomplete data.

#### Acceptance Criteria

1. WHEN the administrator attempts to save or publish, THE Content_Editor SHALL validate that all Multi_Language_Fields are properly structured
2. WHEN the administrator attempts to publish, THE Content_Editor SHALL validate that all required fields have content in at least one language
3. IF validation fails, THEN THE Content_Editor SHALL display validation errors with specific field names
4. IF validation fails, THEN THE Content_Editor SHALL prevent the save or publish operation
5. THE Content_Editor SHALL highlight fields with validation errors in the UI
6. WHEN validation succeeds, THE Content_Editor SHALL proceed with the save or publish operation

### Requirement 16: Preserve Content Integrity

**User Story:** As an administrator, I want my content to be saved exactly as I entered it, so that formatting, special characters, and line breaks are preserved.

#### Acceptance Criteria

1. WHEN content contains special characters (e.g., quotes, apostrophes, accented characters), THE Content_API SHALL store them correctly in the Content_Table
2. WHEN content contains line breaks, THE Content_API SHALL preserve them in the Content_Table
3. WHEN content is loaded from the Content_Table, THE Content_Editor SHALL display special characters and line breaks exactly as they were saved
4. THE Content_API SHALL use UTF-8 encoding for all content operations
5. THE Content_API SHALL escape content properly to prevent SQL injection or XSS vulnerabilities
6. FOR ALL valid content, saving then loading SHALL produce identical content (round-trip property)

### Requirement 17: Handle Concurrent Edits

**User Story:** As an administrator, I want to be notified if content has been modified by another administrator, so that I don't accidentally overwrite their changes.

#### Acceptance Criteria

1. WHEN the administrator attempts to save or publish, THE Content_API SHALL check if the content has been modified since it was loaded
2. IF the content has been modified by another administrator, THEN THE Content_API SHALL return a conflict error
3. WHEN a conflict occurs, THE Content_Editor SHALL display a warning message to the administrator
4. WHEN a conflict occurs, THE Content_Editor SHALL offer options to reload the latest content or force save the current changes
5. THE Content_API SHALL use optimistic locking or version timestamps to detect concurrent modifications

### Requirement 18: Provide Content Export

**User Story:** As an administrator, I want to export current content to a JSON file, so that I can create backups or transfer content between environments.

#### Acceptance Criteria

1. THE Content_Editor SHALL provide an export button
2. WHEN the administrator clicks the export button, THE Content_Editor SHALL generate a JSON file containing all current content
3. WHEN content is exported, THE Content_Editor SHALL include all sections and all Multi_Language_Fields
4. WHEN content is exported, THE Content_Editor SHALL format the JSON file with proper indentation for readability
5. WHEN content is exported, THE Content_Editor SHALL trigger a file download with a descriptive filename (e.g., `content-export-2024-01-15.json`)
6. THE exported JSON file SHALL be compatible with the import functionality (round-trip property)

### Requirement 19: Optimize Performance for Large Content

**User Story:** As an administrator, I want the content editor to remain responsive even with large amounts of content, so that I can work efficiently.

#### Acceptance Criteria

1. THE Content_Editor SHALL render all sections and fields within 1 second after content is loaded
2. WHEN the administrator types in an input field, THE Content_Editor SHALL update the UI within 100ms
3. THE Content_Editor SHALL use debouncing for Language_Coverage_Indicator updates to avoid excessive re-renders
4. THE Content_API SHALL use database indexes on frequently queried fields to optimize query performance
5. THE Content_API SHALL return paginated results if the Content_Table contains more than 100 records

### Requirement 20: Maintain Audit Trail

**User Story:** As an administrator, I want to see who made changes to content and when, so that I can track content modifications for accountability.

#### Acceptance Criteria

1. WHEN content is saved or published, THE Content_API SHALL record the administrator's user ID
2. WHEN content is saved or published, THE Content_API SHALL record the timestamp of the operation
3. WHEN content is saved or published, THE Content_API SHALL record whether the operation was a draft save or publish
4. THE Content_Editor SHALL display the last modified timestamp and user for each section
5. THE Content_API SHALL maintain a history of content changes in the Content_Table or a separate audit table
