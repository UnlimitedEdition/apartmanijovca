# Component Testing Guide - Frontend Validation

## Overview
This document provides a comprehensive guide for manually testing all React components to ensure they display localized data correctly and don't show `[object Object]` for JSONB fields.

## Prerequisites
- Development server running: `npm run dev`
- Browser open at `http://localhost:3000`
- Test data in database (apartments, bookings, guests)
- Admin credentials for admin panel access

## Critical Validations
For each component, verify:
1. ✅ Text displays as strings, not `[object Object]`
2. ✅ Localized content shows in correct language
3. ✅ Arrays display properly (amenities, images)
4. ✅ No console errors related to data transformation
5. ✅ All data fields populated correctly

---

## 1. Public Pages

### 1.1 Home Page (`src/app/[lang]/page.tsx`)
**URL**: `http://localhost:3000/sr` (or `/en`, `/de`, `/it`)

**Components to Test**:
- Hero section
- Apartment listings
- Features section

**Validations**:
- [ ] Page loads without errors
- [ ] Language switcher works (sr/en/de/it)
- [ ] Content displays in selected language
- [ ] No `[object Object]` anywhere on page

### 1.2 Booking Page
**URL**: `http://localhost:3000/sr/booking`

**Components to Test**:
- `AvailabilityCalendar` component
- Apartment selection
- Date picker

**Validations**:
- [ ] Apartment names display as text (e.g., "Apartman 1"), not objects
- [ ] Prices display correctly (base_price_eur)
- [ ] Bed types display as localized text
- [ ] Amenities display as list of strings
- [ ] Calendar shows availability correctly
- [ ] No console errors

**Specific Checks**:
```javascript
// Open browser console and check:
// 1. Network tab -> Check API response for /api/availability
// 2. Verify response has:
{
  "apartments": [{
    "name": "Apartman 1",  // ✅ String, not {"sr": "...", "en": "..."}
    "base_price_eur": 50,  // ✅ Not price_per_night
    "bed_type": "Bračni krevet"  // ✅ Localized string
  }]
}
```

### 1.3 Booking Confirmation Page
**URL**: Complete a booking and check confirmation

**Validations**:
- [ ] Apartment name displays correctly
- [ ] Guest name displays correctly
- [ ] Dates display correctly (check_in, check_out)
- [ ] Total price calculated correctly
- [ ] Booking number generated

---

## 2. Admin Panel Components

### 2.1 Admin Dashboard (`src/app/admin/AdminDashboard.tsx`)
**URL**: `http://localhost:3000/admin`

**Components to Test**:
- `StatsCards` component
- Recent bookings list
- Quick actions

**Validations**:
- [ ] Stats cards display numbers correctly
- [ ] Recent bookings show guest names (from full_name)
- [ ] Apartment names display as text
- [ ] No `[object Object]` in any stat
- [ ] Dates formatted correctly

**Specific Checks**:
```javascript
// In browser console, check:
// 1. Network tab -> /api/admin/stats
// 2. Verify response structure
// 3. Check that component receives transformed data
```

### 2.2 Apartment Manager (`src/components/admin/ApartmentManager.tsx`)
**URL**: `http://localhost:3000/admin` (Apartments tab)

**Critical Component**: This was one of the main bug locations!

**Validations**:
- [ ] **CRITICAL**: Apartment names display as text, NOT `[object Object]`
- [ ] Descriptions display as text
- [ ] Bed types display as text
- [ ] Amenities display as list of strings
- [ ] Images display as thumbnails (URLs work)
- [ ] Prices show as numbers (base_price_eur)
- [ ] Edit form loads correctly
- [ ] Can create new apartment
- [ ] Can update existing apartment
- [ ] Can delete apartment

**Test Scenarios**:

**Scenario 1: View Apartment List**
1. Navigate to Admin → Apartments
2. Check each apartment card
3. Verify:
   - [ ] Name is readable text (e.g., "Apartman 1")
   - [ ] Description is readable text
   - [ ] Price shows as "50 EUR" (not null or undefined)
   - [ ] Capacity shows as number
   - [ ] Status shows correctly

**Scenario 2: Edit Apartment**
1. Click "Edit" on an apartment
2. Verify form fields:
   - [ ] Name fields (SR, EN, DE, IT) populated with strings
   - [ ] Description fields populated with strings
   - [ ] Bed type fields populated with strings
   - [ ] Amenities show as editable list
   - [ ] Images show as list of URLs
   - [ ] Price field shows number
3. Make a change (e.g., update price)
4. Save
5. Verify:
   - [ ] Success message appears
   - [ ] List updates with new data
   - [ ] No errors in console

**Scenario 3: Create New Apartment**
1. Click "Add New Apartment"
2. Fill in all fields:
   - Name (all languages)
   - Description (all languages)
   - Bed type (all languages)
   - Capacity
   - Base price EUR
   - Amenities (add a few)
   - Images (add URLs)
3. Save
4. Verify:
   - [ ] Apartment created successfully
   - [ ] Appears in list with correct data
   - [ ] All fields display correctly
   - [ ] Database has correct JSONB structure

**Console Checks**:
```javascript
// Open browser console
// 1. Check Network tab for /api/admin/apartments
// 2. Verify response:
{
  "apartments": [{
    "id": "...",
    "name": "Apartman 1",  // ✅ Transformed to string
    "description": "Opis apartmana...",  // ✅ String
    "bed_type": "Bračni krevet",  // ✅ String
    "amenities": ["Wi-Fi", "Klima"],  // ✅ Array of strings
    "images": ["url1", "url2"],  // ✅ Array of URLs
    "base_price_eur": 50  // ✅ Number
  }]
}

// 3. Check for errors:
// - No "Cannot read property 'sr' of undefined"
// - No "Object.toString() called on [object Object]"
```

### 2.3 Availability Manager (`src/components/admin/AvailabilityManager.tsx`)
**URL**: `http://localhost:3000/admin` (Availability tab)

**Validations**:
- [ ] Apartment names in dropdown display as text
- [ ] Calendar loads correctly
- [ ] Can select dates
- [ ] Can mark dates as unavailable
- [ ] Can set price overrides
- [ ] Apartment selector shows localized names

**Test Scenarios**:

**Scenario 1: View Availability Calendar**
1. Navigate to Admin → Availability
2. Select an apartment from dropdown
3. Verify:
   - [ ] Apartment name in dropdown is text (not object)
   - [ ] Calendar displays for selected apartment
   - [ ] Available/unavailable dates show correctly
   - [ ] Price overrides display if set

**Scenario 2: Block Dates**
1. Select an apartment
2. Select date range
3. Mark as unavailable
4. Add reason (e.g., "Maintenance")
5. Save
6. Verify:
   - [ ] Dates marked as unavailable
   - [ ] Reason saved correctly
   - [ ] Calendar updates

### 2.4 Booking Manager
**URL**: `http://localhost:3000/admin` (Bookings tab)

**Validations**:
- [ ] Guest names display correctly (from full_name)
- [ ] Apartment names display as text
- [ ] Dates display correctly (check_in, check_out)
- [ ] Booking numbers display
- [ ] Status badges show correctly
- [ ] Can filter bookings
- [ ] Can view booking details
- [ ] Can update booking status

**Test Scenarios**:

**Scenario 1: View Bookings List**
1. Navigate to Admin → Bookings
2. Check each booking row
3. Verify:
   - [ ] Guest name is readable (e.g., "Marko Marković")
   - [ ] Apartment name is readable
   - [ ] Check-in/check-out dates formatted correctly
   - [ ] Total price displays
   - [ ] Status badge shows correct color/text

**Scenario 2: View Booking Details**
1. Click on a booking
2. Verify details modal/page:
   - [ ] All guest information displays
   - [ ] Apartment information displays
   - [ ] Dates and nights calculated correctly
   - [ ] Options (crib, parking) display if selected
   - [ ] Total price correct

**Scenario 3: Update Booking**
1. Open booking details
2. Change status (e.g., pending → confirmed)
3. Save
4. Verify:
   - [ ] Status updated
   - [ ] Email sent (check logs)
   - [ ] List refreshes

### 2.5 Content Editor (`src/components/admin/ContentEditor.tsx`)
**URL**: `http://localhost:3000/admin` (Content tab)

**Validations**:
- [ ] Content sections load
- [ ] Can edit content in all languages
- [ ] Changes save correctly
- [ ] Preview shows localized content

### 2.6 Stats Cards (`src/components/admin/StatsCards.tsx`)
**URL**: Visible on Admin Dashboard

**Critical Component**: This was mentioned in bug report!

**Validations**:
- [ ] Total bookings count displays
- [ ] Revenue displays correctly
- [ ] Occupancy rate displays
- [ ] Pending bookings count displays
- [ ] No `[object Object]` in any stat
- [ ] Numbers formatted correctly (currency, percentages)

**Console Checks**:
```javascript
// Check Network tab for /api/admin/stats
// Verify response has correct structure
// Check that component receives numbers, not objects
```

---

## 3. Portal Components

### 3.1 Booking Details (`src/components/portal/BookingDetails.tsx`)
**URL**: `http://localhost:3000/portal` (after login)

**Critical Component**: This was mentioned in bug report!

**Validations**:
- [ ] Guest name displays correctly
- [ ] Apartment name displays as text (not object)
- [ ] Booking details all visible
- [ ] Dates formatted correctly
- [ ] Can view booking history
- [ ] Can update profile

**Test Scenarios**:

**Scenario 1: View My Bookings**
1. Login to portal with test email
2. View bookings list
3. Verify:
   - [ ] Apartment names are text
   - [ ] Dates display correctly
   - [ ] Status shows correctly
   - [ ] Can click to view details

**Scenario 2: View Booking Details**
1. Click on a booking
2. Verify:
   - [ ] All information displays correctly
   - [ ] Apartment name is text
   - [ ] Guest information correct
   - [ ] Options display if selected

**Scenario 3: Update Profile**
1. Go to profile section
2. Verify:
   - [ ] Name field shows full_name
   - [ ] Email, phone display
   - [ ] Can update information
3. Update name
4. Save
5. Verify:
   - [ ] Database updated with full_name column
   - [ ] UI reflects change

---

## 4. Shared Components

### 4.1 Availability Calendar (`src/components/booking/AvailabilityCalendar.tsx`)
**Critical Component**: This was mentioned in bug report!

**Used In**:
- Public booking page
- Admin availability manager

**Validations**:
- [ ] Apartment names display as text
- [ ] Calendar renders correctly
- [ ] Available dates selectable
- [ ] Unavailable dates disabled
- [ ] Price displays for each date
- [ ] Tooltips show correct information

**Test Scenarios**:

**Scenario 1: Select Dates**
1. Open booking page
2. Select check-in date
3. Select check-out date
4. Verify:
   - [ ] Date range highlighted
   - [ ] Total nights calculated
   - [ ] Total price calculated
   - [ ] Apartment name displays correctly

**Scenario 2: View Unavailable Dates**
1. Navigate calendar to dates with bookings
2. Verify:
   - [ ] Booked dates disabled
   - [ ] Tooltip shows reason if available
   - [ ] Can't select unavailable dates

### 4.2 Sticky Mobile CTA (`src/components/StickyMobileCTA.tsx`)
**Validations**:
- [ ] Displays on mobile viewport
- [ ] Shows correct apartment name
- [ ] Shows correct price
- [ ] Click action works

---

## 5. Browser Console Checks

### 5.1 No Errors
Open browser console (F12) and check:
- [ ] No red errors in Console tab
- [ ] No warnings about undefined properties
- [ ] No "Cannot read property 'sr' of undefined"
- [ ] No "Object.toString() called on [object Object]"

### 5.2 Network Tab
Check API responses:
- [ ] All API calls return 200 status
- [ ] Response data has correct structure
- [ ] Localized strings (not objects) in responses
- [ ] No null values for required fields

### 5.3 React DevTools
If React DevTools installed:
- [ ] Check component props
- [ ] Verify data passed to components is transformed
- [ ] Check for unnecessary re-renders

---

## 6. Language Switching Tests

### 6.1 Test All Languages
For each language (sr, en, de, it):

**Serbian (sr)**:
1. Navigate to `http://localhost:3000/sr`
2. Verify:
   - [ ] Apartment names in Serbian
   - [ ] Descriptions in Serbian
   - [ ] UI text in Serbian
   - [ ] Bed types in Serbian

**English (en)**:
1. Navigate to `http://localhost:3000/en`
2. Verify:
   - [ ] All content in English
   - [ ] Apartment data localized to English

**German (de)**:
1. Navigate to `http://localhost:3000/de`
2. Verify:
   - [ ] All content in German
   - [ ] Apartment data localized to German

**Italian (it)**:
1. Navigate to `http://localhost:3000/it`
2. Verify:
   - [ ] All content in Italian
   - [ ] Apartment data localized to Italian

### 6.2 Language Persistence
- [ ] Selected language persists on page navigation
- [ ] Language preference saved in localStorage/cookies
- [ ] API calls include correct Accept-Language header

---

## 7. Responsive Design Tests

### 7.1 Desktop (1920x1080)
- [ ] All components display correctly
- [ ] No layout issues
- [ ] Text readable

### 7.2 Tablet (768x1024)
- [ ] Components adapt to tablet size
- [ ] Navigation works
- [ ] Forms usable

### 7.3 Mobile (375x667)
- [ ] Mobile-optimized layout
- [ ] Sticky CTA appears
- [ ] Touch interactions work
- [ ] Text not truncated

---

## 8. Performance Checks

### 8.1 Page Load Times
- [ ] Home page loads < 3 seconds
- [ ] Admin panel loads < 5 seconds
- [ ] Booking page loads < 3 seconds

### 8.2 API Response Times
- [ ] /api/availability responds < 1 second
- [ ] /api/admin/apartments responds < 1 second
- [ ] /api/admin/bookings responds < 2 seconds

### 8.3 No Memory Leaks
- [ ] Navigate between pages multiple times
- [ ] Check browser memory usage doesn't grow excessively
- [ ] No console warnings about memory

---

## Summary Checklist

### Critical Issues to Verify Fixed
- [ ] ✅ `ApartmentManager` shows apartment names as text (NOT `[object Object]`)
- [ ] ✅ `AvailabilityCalendar` shows apartment names as text
- [ ] ✅ `StatsCards` shows all stats as numbers/text (NOT objects)
- [ ] ✅ `BookingDetails` shows all information correctly
- [ ] ✅ All guest names from `full_name` column
- [ ] ✅ All prices from `base_price_eur` column
- [ ] ✅ All dates use `check_in`, `check_out`, `nights` format

### Data Display
- [ ] All JSONB fields transformed to localized strings
- [ ] All arrays (amenities, images) display correctly
- [ ] All numbers formatted properly
- [ ] All dates formatted properly

### Functionality
- [ ] Can create/edit/delete apartments
- [ ] Can create/edit bookings
- [ ] Can manage availability
- [ ] Can switch languages
- [ ] All forms submit successfully

### No Errors
- [ ] No console errors
- [ ] No network errors
- [ ] No React warnings
- [ ] No TypeScript errors

---

## Notes

**Cannot Test Without Running Server**:
These tests require:
1. Development server running: `npm run dev`
2. Browser open at `http://localhost:3000`
3. Manual interaction with UI
4. Visual verification of data display

**If Any Component Fails**:
1. Check if transformer functions are being called
2. Verify API response structure
3. Check component props in React DevTools
4. Review console errors
5. Fix the issue and re-test

**Estimated Testing Time**: 2-3 hours for complete validation

**Priority Components** (test these first):
1. ✅ ApartmentManager (highest priority - main bug location)
2. ✅ AvailabilityCalendar (high priority - mentioned in bug)
3. ✅ StatsCards (high priority - mentioned in bug)
4. ✅ BookingDetails (high priority - mentioned in bug)
5. Other components (medium priority)
