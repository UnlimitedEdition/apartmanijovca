# MCP Upis Apartmana - USPEŠNO ✅

## Šta Sam Uradio?

Koristio sam Supabase MCP tool da direktno upišem 3 nova apartmana u bazu podataka.

## Dodati Apartmani

### 1. Apartman Standard
- **Slug**: `apartman-standard`
- **Naziv**: Apartman Standard (SR), Standard Apartment (EN)
- **Cena**: €35/noć
- **Kapacitet**: 3 osobe
- **Veličina**: 40 m²
- **Grad**: Herceg Novi
- **Redosled**: 2

### 2. Apartman Family
- **Slug**: `apartman-family`
- **Naziv**: Apartman Family (SR), Family Apartment (EN)
- **Cena**: €50/noć
- **Kapacitet**: 6 osoba
- **Veličina**: 65 m²
- **Grad**: Herceg Novi
- **Redosled**: 3

### 3. Apartman Studio
- **Slug**: `apartman-studio`
- **Naziv**: Apartman Studio (SR), Studio Apartment (EN)
- **Cena**: €30/noć
- **Kapacitet**: 2 osobe
- **Veličina**: 30 m²
- **Grad**: Herceg Novi
- **Redosled**: 4

## Trenutno Stanje Baze

```
| Redosled | Slug              | Naziv              | Cena  | Kapacitet | Veličina | Grad         |
|----------|-------------------|--------------------|-------|-----------|----------|--------------|
| 1        | apartman-veliki   | Apartman Deluxe    | €45   | 4         | 45 m²    | null         |
| 2        | apartman-standard | Apartman Standard  | €35   | 3         | 40 m²    | Herceg Novi  |
| 3        | apartman-family   | Apartman Family    | €50   | 6         | 65 m²    | Herceg Novi  |
| 4        | apartman-studio   | Apartman Studio    | €30   | 2         | 30 m²    | Herceg Novi  |
```

## Šta Apartmani Imaju?

Svaki apartman ima:
- ✅ Naziv (4 jezika: SR, EN, DE, IT)
- ✅ Opis (4 jezika)
- ✅ Tip kreveta (4 jezika)
- ✅ Kapacitet
- ✅ Cenu
- ✅ Veličinu (m²)
- ✅ Broj kupatila
- ✅ Balkon (da)
- ✅ Pogled (jezero ili planine)
- ✅ Sadržaje (WiFi, Parking, AC, TV, Kuhinja)
- ✅ Pravila (pušenje nije dozvoljeno, noćni mir)
- ✅ Vreme prijave/odjave (14:00 / 10:00)
- ✅ Popuste (nedeljni i mesečni)
- ✅ 2 placeholder slike
- ✅ GPS koordinate (približne)

## Kako Proveriti?

### 1. Na Sajtu
Idi na: `http://localhost:3000`

Trebalo bi da vidiš **4 apartmana** u sekciji "Izaberite svoj savršen pogled".

### 2. U Admin Panelu
Idi na: `http://localhost:3000/admin` → Tab "Apartmani"

Trebalo bi da vidiš **4 apartmana** u listi.

### 3. U Supabase Dashboard
Idi na: https://supabase.com/dashboard → SQL Editor

Pokreni:
```sql
SELECT slug, name->>'sr' as naziv, base_price_eur, capacity 
FROM apartments 
ORDER BY display_order;
```

## Šta Dalje?

### 📝 Izmeni Podatke
Svi podaci mogu se menjati kroz Admin Panel:
1. Idi na `/admin`
2. Klikni "Apartmani" → "Izmeni"
3. Promeni šta god želiš
4. Sačuvaj

### 🖼️ Dodaj Prave Slike
Trenutno su placeholder slike sa Unsplash-a. Zameni ih:
1. Upload slike na Supabase Storage ili drugi hosting
2. U Admin Panelu, dodaj URL-ove slika

### 📍 Postavi Tačne GPS Koordinate
1. U Admin Panelu, Tab 6 "Lokacija"
2. Klikni na mapi ili unesi ručno

### 🌍 Proveri Prevode
Proveri da li su svi prevodi ispravni na sva 4 jezika (SR, EN, DE, IT).

## Napomene

### ⚠️ Apartman Deluxe (apartman-veliki)
- Nema grad postavljen (`null`)
- Možeš ga dodati kroz Admin Panel ili SQL:
  ```sql
  UPDATE apartments 
  SET city = 'Herceg Novi', country = 'Crna Gora' 
  WHERE slug = 'apartman-veliki';
  ```

### ✅ Migracija Fajl
SQL migracija je i dalje dostupna u:
`supabase/migrations/20260223000001_add_sample_apartments.sql`

Možeš je koristiti za backup ili za ponovno kreiranje podataka.

## MCP Komande Korišćene

1. **apply_migration** - Dodavanje apartmana
2. **execute_sql** - Provera i ažuriranje podataka

## Status: USPEŠNO ✅

Sva 3 nova apartmana su uspešno dodata u bazu kroz MCP tool!

Sada imaš **4 apartmana** sa privremenim podacima koje možeš lako da izmeniš kroz Admin Panel.
