# Apartment Management Enhancement Plan

## Šta sam kreirao ✅

### 1. Database Enhancement
**File:** `supabase/migrations/20260222000004_enhance_apartments_schema.sql`

Dodao 20+ novih kolona za profesionalan prikaz:
- `size_sqm` - Veličina u m²
- `floor` - Sprat
- `view_type` - Tip pogleda (more, planina, grad)
- `bathroom_count` - Broj kupatila
- `balcony` - Ima balkon/terasu
- `kitchen_type` - Tip kuhinje
- `features` - Dodatne karakteristike
- `house_rules` - Pravila kuće
- `check_in_time` / `check_out_time` - Vreme prijave/odjave
- `min_stay_nights` / `max_stay_nights` - Min/max boravak
- `cancellation_policy` - Politika otkazivanja
- `gallery` - Galerija slika sa opisima
- `video_url` - YouTube/Vimeo video
- `virtual_tour_url` - 360° virtuelna tura
- `meta_title` / `meta_description` / `meta_keywords` - SEO
- `seasonal_pricing` - Sezonske cene
- `weekend_price_eur` - Vikend cena
- `weekly_discount_percent` - Popust za 7+ noći
- `monthly_discount_percent` - Popust za 30+ noći

### 2. Public Apartment Page (Template)
**Files:**
- `src/app/[lang]/apartments/[slug]/page.tsx` - Server component
- `src/app/[lang]/apartments/[slug]/ApartmentDetailView.tsx` - Client component

**Features:**
- ✅ Hero sekcija sa galerijom slika (grid layout kao Airbnb)
- ✅ Breadcrumb navigacija
- ✅ Osnovne informacije (kapacitet, kreveti, kupatilo, veličina)
- ✅ Detaljan opis apartmana
- ✅ Lista sadržaja sa ikonama
- ✅ Pravila kuće
- ✅ Sticky booking kartica sa cenom
- ✅ Full-screen galerija modal
- ✅ SEO optimizovano (meta tags, Open Graph)
- ✅ Responsive dizajn
- ✅ Professional UI (inspirisano Airbnb/Booking.com)

**URL Format:**
```
/sr/apartments/standard-apartman
/en/apartments/standard-apartment
/de/apartments/standard-wohnung
/it/apartments/appartamento-standard
```

## Šta treba uraditi 📋

### 3. Enhanced Admin Panel - ApartmentManager

Trenutni admin panel je osnovan. Treba ga proširiti sa:

#### Tab 1: Osnovne informacije
- Naziv (4 jezika)
- Slug (auto-generate iz naziva)
- Tip kreveta
- Kapacitet
- Veličina (m²)
- Sprat
- Broj kupatila
- Balkon (da/ne)
- Status (aktivan/neaktivan/održavanje)

#### Tab 2: Opis i sadržaji
- Detaljan opis (4 jezika, rich text editor)
- Tip kuhinje (4 jezika)
- Tip pogleda (4 jezika)
- Lista sadržaja (checkbox lista):
  - WiFi
  - Parking
  - Klima
  - Grejanje
  - TV
  - Kuhinja
  - Veš mašina
  - Pegla
  - Fen
  - Posteljina
  - Peškiri
  - Sapuni
  - Šampon
  - Balkon/Terasa
  - Pogled na more
  - Lift
  - Kućni ljubimci dozvoljeni

#### Tab 3: Galerija
- Upload slika (drag & drop)
- Reorder slika (drag & drop)
- Dodaj opis za svaku sliku (4 jezika)
- Postavi glavnu sliku
- Video URL (YouTube/Vimeo)
- Virtual tour URL (360°)

#### Tab 4: Cene i pravila
- Osnovna cena (EUR)
- Vikend cena (EUR)
- Sezonske cene (dodaj više perioda)
- Popust za 7+ noći (%)
- Popust za 30+ noći (%)
- Check-in vreme
- Check-out vreme
- Minimalan boravak (noći)
- Maksimalan boravak (noći)
- Pravila kuće (4 jezika, rich text)
- Politika otkazivanja (4 jezika, rich text)

#### Tab 5: SEO
- Meta naslov (4 jezika)
- Meta opis (4 jezika)
- Meta ključne reči (4 jezika)
- Preview kako će izgledati na Google-u

### 4. Image Upload System

Trenutno koristiš URL-ove za slike. Treba dodati:

#### Option A: Supabase Storage
```typescript
// Upload to Supabase Storage bucket
const { data, error } = await supabase.storage
  .from('apartments')
  .upload(`${apartmentId}/${fileName}`, file)

// Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('apartments')
  .getPublicUrl(filePath)
```

#### Option B: Cloudinary (Recommended)
- Automatska optimizacija slika
- Responsive images
- CDN delivery
- Image transformations

### 5. Rich Text Editor

Za opise i pravila kuće, dodati rich text editor:

**Options:**
- TipTap (modern, extensible)
- Quill (simple, lightweight)
- Slate (powerful, complex)

**Features:**
- Bold, italic, underline
- Headings (H2, H3)
- Lists (bullet, numbered)
- Links
- Line breaks

### 6. Validation

Dodati validaciju za sve polja:
- Naziv: obavezan, min 3 karaktera
- Slug: obavezan, unique, samo lowercase i crtice
- Kapacitet: min 1, max 10
- Cena: min 10 EUR
- Slike: min 3, max 20
- Opis: min 50 karaktera

### 7. Preview Mode

Dodati "Preview" dugme u admin panelu:
- Otvara javnu stranicu apartmana u novom tabu
- Prikazuje kako će izgledati za korisnike
- Radi i za draft apartmane (status: inactive)

## Implementation Priority

### Phase 1: Critical (Uradi prvo)
1. ✅ Database migration (done)
2. ✅ Public apartment page (done)
3. TODO: Enhanced admin form (tabs)
4. TODO: Image upload system
5. TODO: Slug auto-generation

### Phase 2: Important
1. TODO: Rich text editor for descriptions
2. TODO: Amenities checkbox list
3. TODO: Gallery management (reorder, captions)
4. TODO: Validation

### Phase 3: Nice to have
1. TODO: SEO preview
2. TODO: Seasonal pricing UI
3. TODO: Virtual tour integration
4. TODO: Video embed

## Example: Professional Admin Form Structure

```tsx
<Tabs>
  <TabsList>
    <TabsTrigger value="basic">Osnovne info</TabsTrigger>
    <TabsTrigger value="description">Opis</TabsTrigger>
    <TabsTrigger value="gallery">Galerija</TabsTrigger>
    <TabsTrigger value="pricing">Cene</TabsTrigger>
    <TabsTrigger value="seo">SEO</TabsTrigger>
  </TabsList>

  <TabsContent value="basic">
    {/* Multi-language name inputs */}
    {/* Slug (auto-generated) */}
    {/* Bed type, capacity, size, floor, bathrooms */}
    {/* Balcony checkbox */}
    {/* Status select */}
  </TabsContent>

  <TabsContent value="description">
    {/* Rich text editor for description (4 languages) */}
    {/* Kitchen type (4 languages) */}
    {/* View type (4 languages) */}
    {/* Amenities checklist */}
  </TabsContent>

  <TabsContent value="gallery">
    {/* Drag & drop image upload */}
    {/* Image grid with reorder */}
    {/* Caption inputs (4 languages) */}
    {/* Video URL input */}
    {/* Virtual tour URL input */}
  </TabsContent>

  <TabsContent value="pricing">
    {/* Base price */}
    {/* Weekend price */}
    {/* Discounts (weekly, monthly) */}
    {/* Check-in/out times */}
    {/* Min/max stay */}
    {/* House rules (rich text, 4 languages) */}
    {/* Cancellation policy (rich text, 4 languages) */}
  </TabsContent>

  <TabsContent value="seo">
    {/* Meta title (4 languages) */}
    {/* Meta description (4 languages) */}
    {/* Meta keywords (4 languages) */}
    {/* Google preview */}
  </TabsContent>
</Tabs>

<div className="flex gap-3">
  <Button variant="outline" onClick={handlePreview}>
    Pregled
  </Button>
  <Button onClick={handleSave}>
    Sačuvaj
  </Button>
</div>
```

## Next Steps

1. Run migrations:
   ```bash
   supabase migration up
   ```

2. Test public apartment page:
   ```
   http://localhost:3000/sr/apartments/standard-apartman
   ```

3. Start enhancing admin panel:
   - Add tabs to ApartmentManager
   - Add all new fields
   - Add image upload
   - Add validation

4. Update apartments list page to link to new detail pages

## Status
- ✅ Database schema enhanced
- ✅ Public apartment page created (professional template)
- ⏳ Admin panel enhancement - TODO
- ⏳ Image upload system - TODO
- ⏳ Rich text editor - TODO
