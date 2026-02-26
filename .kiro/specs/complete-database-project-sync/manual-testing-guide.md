# Manual Testing Guide - API Routes Validation

## Overview
This document provides a comprehensive guide for manually testing all API routes to ensure they use correct column names and return properly transformed data.

## Prerequisites
- Development server running: `npm run dev`
- Supabase project configured with correct environment variables
- Test data in database (apartments, guests, bookings)
- API testing tool (Postman, Thunder Client, or curl)

## Critical Validations
For each API route, verify:
1. ✅ Uses correct column names (`full_name` not `name`, `base_price_eur` not `price_per_night`)
2. ✅ Returns localized strings for JSONB fields (not objects like `[object Object]`)
3. ✅ Returns proper data types (arrays, numbers, strings)
4. ✅ No null values for required fields

---

## 1. Availability API Routes

### 1.1 GET /api/availability
**Purpose**: Check apartment availability for a date range

**Test Request**:
```bash
curl "http://localhost:3000/api/availability?checkIn=2024-06-01&checkOut=2024-06-05" \
  -H "Accept-Language: sr"
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "apartments": [
      {
        "id": "uuid",
        "name": "Apartman 1",  // ✅ String, not object
        "capacity": 4,
        "base_price_eur": 50,  // ✅ base_price_eur, not price_per_night
        "bed_type": "Bračni krevet",  // ✅ Localized string
        "available": true,
        "unavailableDates": []
      }
    ]
  }
}
```

**Validations**:
- [ ] `name` is a string (e.g., "Apartman 1"), not `{"sr": "...", "en": "..."}`
- [ ] `base_price_eur` field exists (not `price_per_night`)
- [ ] `bed_type` is a localized string
- [ ] No `type` field (this column doesn't exist)

### 1.2 POST /api/availability
**Purpose**: Check specific apartment availability

**Test Request**:
```bash
curl -X POST "http://localhost:3000/api/availability" \
  -H "Content-Type: application/json" \
  -H "Accept-Language: en" \
  -d '{
    "apartmentId": "your-apartment-uuid",
    "checkIn": "2024-06-01",
    "checkOut": "2024-06-05"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "apartments": [
      {
        "id": "uuid",
        "name": "Apartment 1",  // ✅ English localization
        "capacity": 4,
        "base_price_eur": 50,
        "bed_type": "Double bed",
        "available": true,
        "unavailableDates": []
      }
    ]
  }
}
```

**Validations**:
- [ ] Same as 1.1
- [ ] Language changes based on `Accept-Language` header

---

## 2. Booking API Routes

### 2.1 GET /api/booking
**Purpose**: List all bookings for a guest

**Test Request**:
```bash
curl "http://localhost:3000/api/booking?email=test@example.com" \
  -H "Accept-Language: sr"
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "id": "uuid",
        "bookingNumber": "BK-20240601-001",
        "apartmentName": "Apartman 1",  // ✅ Localized
        "guestName": "Marko Marković",  // ✅ From full_name column
        "checkIn": "2024-06-01",
        "checkOut": "2024-06-05",
        "nights": 4,
        "totalPrice": 200,
        "status": "confirmed"
      }
    ]
  }
}
```

**Validations**:
- [ ] `guestName` is populated (from `guests.full_name`, not `guests.name`)
- [ ] `apartmentName` is a localized string
- [ ] `checkIn`, `checkOut`, `nights` fields exist (not `checkin`, `checkout`)

### 2.2 POST /api/booking
**Purpose**: Create a new booking

**Test Request**:
```bash
curl -X POST "http://localhost:3000/api/booking" \
  -H "Content-Type: application/json" \
  -H "Accept-Language: sr" \
  -d '{
    "apartmentId": "your-apartment-uuid",
    "guest": {
      "name": "Test Korisnik",
      "email": "test@example.com",
      "phone": "+381601234567"
    },
    "checkIn": "2024-07-01",
    "checkOut": "2024-07-05",
    "options": {
      "crib": false,
      "parking": true
    }
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "booking": {
      "id": "uuid",
      "bookingNumber": "BK-20240701-002",
      "apartmentName": "Apartman 1",
      "guestName": "Test Korisnik",  // ✅ Saved to full_name
      "checkIn": "2024-07-01",
      "checkOut": "2024-07-05",
      "nights": 4,
      "totalPrice": 200,
      "status": "pending"
    }
  }
}
```

**Validations**:
- [ ] Guest created with `full_name` column (verify in database)
- [ ] Booking uses correct column names
- [ ] `apartmentName` is localized

### 2.3 GET /api/booking/[id]
**Purpose**: Get single booking details

**Test Request**:
```bash
curl "http://localhost:3000/api/booking/your-booking-uuid" \
  -H "Accept-Language: de"
```

**Validations**:
- [ ] Same as 2.1
- [ ] German localization works

### 2.4 PUT /api/booking/[id]
**Purpose**: Update booking

**Test Request**:
```bash
curl -X PUT "http://localhost:3000/api/booking/your-booking-uuid" \
  -H "Content-Type: application/json" \
  -d '{
    "checkIn": "2024-07-02",
    "checkOut": "2024-07-06",
    "guest": {
      "name": "Updated Name",
      "phone": "+381601234568"
    }
  }'
```

**Validations**:
- [ ] Guest updated with `full_name` column (verify in database)
- [ ] Price recalculated using `base_price_eur`

---

## 3. Admin Apartments API Routes

### 3.1 GET /api/admin/apartments
**Purpose**: List all apartments

**Test Request**:
```bash
curl "http://localhost:3000/api/admin/apartments" \
  -H "Accept-Language: it"
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "apartments": [
      {
        "id": "uuid",
        "name": "Appartamento 1",  // ✅ Italian
        "description": "Descrizione...",  // ✅ Italian
        "bed_type": "Letto matrimoniale",  // ✅ Italian
        "capacity": 4,
        "amenities": ["Wi-Fi", "Aria condizionata"],  // ✅ Array of strings
        "base_price_eur": 50,  // ✅ Correct column
        "images": ["url1", "url2"],  // ✅ Array of URLs
        "status": "active"
      }
    ]
  }
}
```

**Validations**:
- [ ] `name`, `description`, `bed_type` are localized strings
- [ ] `amenities` is an array of strings (not JSONB objects)
- [ ] `images` is an array of URLs (not JSONB objects)
- [ ] `base_price_eur` field exists
- [ ] No `price_per_night` or `type` fields

### 3.2 GET /api/admin/apartments/[id]
**Purpose**: Get single apartment

**Test Request**:
```bash
curl "http://localhost:3000/api/admin/apartments/your-apartment-uuid" \
  -H "Accept-Language: sr"
```

**Validations**:
- [ ] Same as 3.1
- [ ] Single apartment returned with all fields

### 3.3 POST /api/admin/apartments
**Purpose**: Create new apartment

**Test Request**:
```bash
curl -X POST "http://localhost:3000/api/admin/apartments" \
  -H "Content-Type: application/json" \
  -d '{
    "name": {"sr": "Test Apartman", "en": "Test Apartment", "de": "Test Wohnung", "it": "Test Appartamento"},
    "description": {"sr": "Opis", "en": "Description", "de": "Beschreibung", "it": "Descrizione"},
    "bed_type": {"sr": "Bračni krevet", "en": "Double bed", "de": "Doppelbett", "it": "Letto matrimoniale"},
    "capacity": 2,
    "amenities": [
      {"sr": "Wi-Fi", "en": "Wi-Fi", "de": "Wi-Fi", "it": "Wi-Fi"}
    ],
    "base_price_eur": 40,
    "images": [
      {"url": "https://example.com/image.jpg", "alt": {"sr": "Slika", "en": "Image", "de": "Bild", "it": "Immagine"}}
    ],
    "status": "active"
  }'
```

**Validations**:
- [ ] Apartment created with JSONB columns
- [ ] `base_price_eur` saved correctly
- [ ] Verify in database that JSONB structure is correct

### 3.4 PUT /api/admin/apartments/[id]
**Purpose**: Update apartment

**Test Request**:
```bash
curl -X PUT "http://localhost:3000/api/admin/apartments/your-apartment-uuid" \
  -H "Content-Type: application/json" \
  -d '{
    "base_price_eur": 55,
    "status": "maintenance"
  }'
```

**Validations**:
- [ ] `base_price_eur` updated (not `price_per_night`)
- [ ] Other fields preserved

---

## 4. Admin Bookings API Routes

### 4.1 GET /api/admin/bookings
**Purpose**: List all bookings with filters

**Test Request**:
```bash
curl "http://localhost:3000/api/admin/bookings?status=confirmed&limit=10"
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "id": "uuid",
        "bookingNumber": "BK-20240601-001",
        "apartmentName": "Apartman 1",  // ✅ Localized
        "guestName": "Marko Marković",  // ✅ From full_name
        "guestEmail": "marko@example.com",
        "checkIn": "2024-06-01",
        "checkOut": "2024-06-05",
        "nights": 4,
        "totalPrice": 200,
        "status": "confirmed"
      }
    ],
    "total": 1
  }
}
```

**Validations**:
- [ ] `guestName` from `guests.full_name`
- [ ] `apartmentName` is localized
- [ ] Correct column names used

### 4.2 GET /api/admin/bookings/[id]
**Purpose**: Get single booking with full details

**Test Request**:
```bash
curl "http://localhost:3000/api/admin/bookings/your-booking-uuid"
```

**Validations**:
- [ ] Same as 4.1
- [ ] Full booking details returned

---

## 5. Admin Availability API Routes

### 5.1 GET /api/admin/availability
**Purpose**: Get availability records

**Test Request**:
```bash
curl "http://localhost:3000/api/admin/availability?apartmentId=your-apartment-uuid&startDate=2024-06-01&endDate=2024-06-30"
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "availability": [
      {
        "id": "uuid",
        "apartmentId": "uuid",
        "date": "2024-06-01",
        "isAvailable": true,
        "priceOverride": null,
        "reason": null,
        "bookingId": null
      }
    ]
  }
}
```

**Validations**:
- [ ] Correct column names (`isAvailable`, `priceOverride`, `bookingId`)
- [ ] Date format is ISO string

### 5.2 POST /api/admin/availability
**Purpose**: Create/update availability

**Test Request**:
```bash
curl -X POST "http://localhost:3000/api/admin/availability" \
  -H "Content-Type: application/json" \
  -d '{
    "apartmentId": "your-apartment-uuid",
    "date": "2024-08-01",
    "isAvailable": false,
    "reason": "Maintenance"
  }'
```

**Validations**:
- [ ] Availability record created
- [ ] Correct column names used

---

## 6. Portal API Routes

### 6.1 GET /api/portal/profile
**Purpose**: Get guest profile

**Test Request**:
```bash
curl "http://localhost:3000/api/portal/profile?email=test@example.com"
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "guest": {
      "id": "uuid",
      "fullName": "Test Korisnik",  // ✅ From full_name column
      "email": "test@example.com",
      "phone": "+381601234567",
      "language": "sr"
    }
  }
}
```

**Validations**:
- [ ] `fullName` field populated from `guests.full_name`
- [ ] No `name` field in response

### 6.2 PUT /api/portal/profile
**Purpose**: Update guest profile

**Test Request**:
```bash
curl -X PUT "http://localhost:3000/api/portal/profile" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "fullName": "Updated Name",
    "phone": "+381601234569"
  }'
```

**Validations**:
- [ ] Guest updated with `full_name` column (verify in database)
- [ ] Response returns updated data

---

## 7. Database Verification

After testing API routes, verify in Supabase database:

### 7.1 Check guests table
```sql
SELECT id, full_name, email, phone FROM guests LIMIT 5;
```
**Verify**:
- [ ] Column is `full_name`, not `name`
- [ ] Data populated correctly

### 7.2 Check apartments table
```sql
SELECT id, name, base_price_eur, amenities, images FROM apartments LIMIT 5;
```
**Verify**:
- [ ] Column is `base_price_eur`, not `price_per_night`
- [ ] `name` is JSONB object: `{"sr": "...", "en": "...", "de": "...", "it": "..."}`
- [ ] `amenities` is JSONB array
- [ ] `images` is JSONB array
- [ ] No `type` column

### 7.3 Check bookings table
```sql
SELECT id, booking_number, check_in, check_out, nights FROM bookings LIMIT 5;
```
**Verify**:
- [ ] Columns are `check_in`, `check_out`, `nights` (with underscores)
- [ ] `booking_number` exists

---

## Summary Checklist

### Critical Column Names
- [ ] `guests.full_name` (not `name`)
- [ ] `apartments.base_price_eur` (not `price_per_night`)
- [ ] `bookings.check_in`, `check_out`, `nights` (with underscores)
- [ ] `bookings.booking_number` exists
- [ ] No `apartments.type` column

### JSONB Transformations
- [ ] `apartment.name` returns localized string (not object)
- [ ] `apartment.description` returns localized string
- [ ] `apartment.bed_type` returns localized string
- [ ] `apartment.amenities` returns string array
- [ ] `apartment.images` returns URL array

### Localization
- [ ] `Accept-Language: sr` returns Serbian
- [ ] `Accept-Language: en` returns English
- [ ] `Accept-Language: de` returns German
- [ ] `Accept-Language: it` returns Italian
- [ ] Default language is Serbian

### Data Integrity
- [ ] No null values for required fields
- [ ] Proper data types (numbers, strings, arrays)
- [ ] Related data properly joined (guest names, apartment names)

---

## Notes

**Cannot Test Without Running Server**:
Since the development server is not running, these tests must be performed manually by:
1. Starting the development server: `npm run dev`
2. Using an API testing tool (Postman, Thunder Client, curl)
3. Following each test case above
4. Checking off validations as they pass

**If Any Test Fails**:
1. Check the API route implementation
2. Verify transformer functions are being used
3. Check database column names
4. Review error logs
5. Fix the issue and re-test

**Estimated Testing Time**: 2-3 hours for complete validation
