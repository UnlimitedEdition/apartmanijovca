# Checkbox/Counter System - Manual Test Guide

## Test Status: ✅ DATABASE VERIFIED - READY FOR FRONTEND TESTING

---

## Database Verification (COMPLETED ✅)

### 1. Schema Check
```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'apartments'
  AND column_name IN ('bed_counts', 'selected_amenities', 'selected_rules', 'selected_view');
```

**Result:** ✅ All 4 columns exist with correct types
- `bed_counts`: JSONB with default `'{}'::jsonb`
- `selected_amenities`: TEXT[] with default `ARRAY[]::text[]`
- `selected_rules`: TEXT[] with default `ARRAY[]::text[]`
- `selected_view`: TEXT with default `NULL`

### 2. Data Insert Test
```sql
UPDATE apartments
SET 
  bed_counts = '{"double_bed": 1, "single_bed": 2}'::jsonb,
  selected_amenities = ARRAY['wifi', 'ac', 'parking', 'kitchen'],
  selected_rules = ARRAY['no_smoking', 'quiet_hours_22'],
  selected_view = 'lake_view'
WHERE id = '11111111-1111-1111-1111-111111111111';
```

**Result:** ✅ Data inserted successfully

### 3. Data Retrieval Test
```sql
SELECT bed_counts, selected_amenities, selected_rules, selected_view
FROM apartments
WHERE id = '11111111-1111-1111-1111-111111111111';
```

**Result:** ✅ Data retrieved correctly
```json
{
  "bed_counts": {"double_bed": 1, "single_bed": 2},
  "selected_amenities": ["wifi", "ac", "parking", "kitchen"],
  "selected_rules": ["no_smoking", "quiet_hours_22"],
  "selected_view": "lake_view"
}
```

---

## Frontend Testing (NEXT STEP)

### Test 1: Load Existing Apartment
1. Open admin panel: `http://localhost:3000/admin`
2. Click "Apartmani" tab
3. Click "Izmeni" on "Apartman Deluxe"
4. Go to Tab 2 (Opis)

**Expected Result:**
- ✅ Bed counters show: 1× Double Bed, 2× Single Beds
- ✅ Amenities checked: WiFi, AC, Parking, Kitchen
- ✅ Rules checked: No Smoking, Quiet Hours 22:00-08:00
- ✅ View selected: Lake View (radio button)

### Test 2: Create New Apartment with Options
1. Click "Dodaj novi apartman"
2. Fill Tab 1 (Basic Info):
   - Name (SR): "Apartman Test"
   - Capacity: 4
   - Base Price: 50
3. Go to Tab 2 (Opis)
4. Set beds:
   - Click + on "1 queen size krevet" → 1
   - Click + on "1 krevet za jednu osobu" → 2
5. Check amenities:
   - WiFi
   - AC
   - TV
   - Parking
6. Check rules:
   - No Smoking
   - No Pets
7. Select view:
   - Lake View (should be FIRST option!)
8. Click "Sačuvaj"

**Expected Result:**
- ✅ Apartment created successfully
- ✅ Success message appears
- ✅ Returns to apartment list

### Test 3: Verify Saved Data
1. Click "Izmeni" on "Apartman Test"
2. Go to Tab 2 (Opis)

**Expected Result:**
- ✅ Bed counters show: 1× Queen Bed, 2× Single Beds
- ✅ Amenities checked: WiFi, AC, TV, Parking
- ✅ Rules checked: No Smoking, No Pets
- ✅ View selected: Lake View

### Test 4: Update Existing Options
1. In Tab 2, modify:
   - Change queen bed to 0 (click - button)
   - Add 1 double bed (click + button)
   - Uncheck "No Pets"
   - Check "Children Welcome"
   - Change view to "Mountain View"
2. Click "Sačuvaj"

**Expected Result:**
- ✅ Changes saved successfully
- ✅ Reload shows updated values

### Test 5: API Response Check
Open browser console and check network tab:

**GET /api/admin/apartments**
```json
{
  "apartments": [
    {
      "id": "...",
      "name": "Apartman Test",
      "bed_counts": {"double_bed": 1, "single_bed": 2},
      "selected_amenities": ["wifi", "ac", "tv", "parking"],
      "selected_rules": ["no_smoking", "children_welcome"],
      "selected_view": "mountain_view"
    }
  ]
}
```

**Expected Result:**
- ✅ Response includes all 4 new fields
- ✅ Data matches what was saved

---

## Edge Cases to Test

### Test 6: Empty Options
1. Create apartment with NO options selected
2. Save

**Expected Result:**
- ✅ Saves successfully
- ✅ `bed_counts: {}`
- ✅ `selected_amenities: []`
- ✅ `selected_rules: []`
- ✅ `selected_view: null`

### Test 7: Maximum Options
1. Create apartment with ALL options selected
2. Save

**Expected Result:**
- ✅ Saves successfully
- ✅ All amenities in array
- ✅ All rules in array
- ✅ One view selected

### Test 8: Bed Counter Limits
1. Try to set bed count to negative (click - when at 0)

**Expected Result:**
- ✅ Counter stays at 0 (doesn't go negative)

### Test 9: View Radio Button Behavior
1. Select "Lake View"
2. Select "Sea View"

**Expected Result:**
- ✅ Only "Sea View" is selected (radio button behavior)
- ✅ "Lake View" is automatically deselected

---

## Translation Verification

### Test 10: Check All Languages
For each predefined option, verify translations exist:

**Beds (6 options):**
- ✅ SR, EN, DE, IT translations present

**Amenities (30+ options):**
- ✅ SR, EN, DE, IT translations present

**Rules (13 options):**
- ✅ SR, EN, DE, IT translations present

**Views (7 options):**
- ✅ SR, EN, DE, IT translations present
- ✅ "Lake View" is FIRST option

---

## Performance Testing

### Test 11: Load Time
1. Open apartment with many options selected
2. Measure load time

**Expected Result:**
- ✅ Loads in < 500ms
- ✅ No lag when rendering checkboxes

### Test 12: Save Time
1. Select 20+ amenities
2. Click "Sačuvaj"
3. Measure save time

**Expected Result:**
- ✅ Saves in < 1 second
- ✅ No timeout errors

---

## Rollback Plan (If Issues Found)

If critical issues are discovered:

1. **Revert Migration:**
   ```sql
   ALTER TABLE apartments DROP COLUMN bed_counts;
   ALTER TABLE apartments DROP COLUMN selected_amenities;
   ALTER TABLE apartments DROP COLUMN selected_rules;
   ALTER TABLE apartments DROP COLUMN selected_view;
   ```

2. **Revert API Changes:**
   - Remove new fields from POST/PUT handlers
   - Remove from destructuring in route.ts files

3. **Revert TypeScript Types:**
   - Remove new fields from `ApartmentRecord`
   - Remove new fields from `LocalizedApartment`

4. **Revert Transformer:**
   - Remove new fields from `transformApartmentRecord()`

---

## Success Criteria

All tests must pass:
- ✅ Database stores data correctly
- ✅ API accepts and returns new fields
- ✅ Frontend displays options correctly
- ✅ Counters work (+ and - buttons)
- ✅ Checkboxes work (amenities and rules)
- ✅ Radio buttons work (view selection)
- ✅ Data persists after save
- ✅ Data loads correctly on edit
- ✅ All translations present
- ✅ "Lake View" is FIRST option
- ✅ No TypeScript errors
- ✅ No runtime errors

---

## Current Status

**Database:** ✅ VERIFIED - All columns working
**API Routes:** ✅ UPDATED - Accepting new fields
**TypeScript Types:** ✅ UPDATED - No errors
**Transformer:** ✅ UPDATED - Including new fields
**Frontend:** ✅ COMPLETE - UI ready for testing

**READY FOR MANUAL TESTING IN BROWSER**
