# Bugfix Requirements Document

## Introduction

The admin panel is experiencing multiple critical failures that prevent data from displaying correctly. Users encounter 500 Internal Server Errors when accessing the bookings and content APIs, and the admin dashboard fails to render properly with a React error about invalid element types. These issues prevent administrators from managing bookings, editing content, and viewing apartment data, effectively making the admin panel unusable.

The root causes have been identified as:
1. Parameter mismatch between ContentEditor component and the content API (uses 'section' but API expects 'key')
2. Missing or incorrect import in the bookings API route
3. Potential component export/import issues causing React rendering failures

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN the ContentEditor component fetches content using `/api/admin/content?section=home` THEN the system returns 500 Internal Server Error because the API expects 'key' parameter instead of 'section'

1.2 WHEN the ContentEditor component attempts to save content with `{ section: 'home', lang: 'en', data: {...} }` THEN the system returns 500 Internal Server Error because the API expects 'key' and 'language' parameters

1.3 WHEN the bookings API route at `/api/admin/bookings` is called THEN the system returns 500 Internal Server Error due to an issue with the getLocalizedValue function or database query

1.4 WHEN the admin dashboard loads and attempts to render admin components THEN the system throws React error "Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: undefined"

1.5 WHEN the ContentEditor fetches content by section THEN the system does not return properly organized data by dot-notation keys (e.g., 'home.hero.title', 'home.hero.subtitle')

1.6 WHEN the BookingList component displays bookings THEN the apartment names are not properly localized to the default 'sr' locale

### Expected Behavior (Correct)

2.1 WHEN the ContentEditor component fetches content for a section (e.g., 'home') THEN the system SHALL return all content items with keys matching the pattern 'home.*' (e.g., 'home.hero.title', 'home.hero.subtitle') grouped by language

2.2 WHEN the ContentEditor component saves content for a section and language THEN the system SHALL correctly map the section-based data to individual key-value pairs in the database using dot notation (e.g., 'home.hero.title')

2.3 WHEN the bookings API route at `/api/admin/bookings` is called THEN the system SHALL return a list of bookings with properly localized apartment names using the 'sr' locale

2.4 WHEN the admin dashboard loads THEN the system SHALL successfully render all admin components (StatsCards, AnalyticsView, GalleryManager, BookingList, ApartmentManager, ContentEditor) without React errors

2.5 WHEN the ContentEditor displays fields for a section THEN the system SHALL correctly map dot-notation database keys to the appropriate section fields (e.g., 'home.hero.title' maps to the 'title' field in the 'home' section)

2.6 WHEN the content API receives a POST request with section-based data THEN the system SHALL transform each field into a separate database row with the appropriate dot-notation key

### Unchanged Behavior (Regression Prevention)

3.1 WHEN the content API is called with a specific 'key' parameter (e.g., `/api/admin/content?key=home.hero.title`) THEN the system SHALL CONTINUE TO return content for that specific key

3.2 WHEN the content API receives a POST request with 'key' and 'language' parameters directly THEN the system SHALL CONTINUE TO create or update that specific content entry

3.3 WHEN the bookings API is called with valid filter parameters (status, apartment_id, date ranges) THEN the system SHALL CONTINUE TO apply those filters correctly

3.4 WHEN the admin dashboard tabs are switched THEN the system SHALL CONTINUE TO display the appropriate component for each tab

3.5 WHEN the content API DELETE endpoint is called with 'key' and 'language' parameters THEN the system SHALL CONTINUE TO delete the specified content entry

3.6 WHEN the bookings API returns data THEN the system SHALL CONTINUE TO include pagination metadata (total, page, limit, totalPages)

3.7 WHEN StatsCards, AnalyticsView, or GalleryManager components are used independently THEN the system SHALL CONTINUE TO function correctly with their existing props and behavior
