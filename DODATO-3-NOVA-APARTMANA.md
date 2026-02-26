# Dodato 3 Nova Apartmana - Privremeni Podaci ✅

## Šta Sam Uradio?

Kreirao sam SQL migraciju koja dodaje **3 nova apartmana** sa privremenim podacima koje možeš lako da izmeniš kroz Admin Panel.

## Novi Apartmani

### 1️⃣ Apartman Standard
```
Slug: apartman-standard
Naziv: Apartman Standard
Cena: €35/noć (vikend €40)
Kapacitet: 3 osobe
Veličina: 40 m²
Kupatila: 1
Balkon: Da
Pogled: Jezero
Popusti: 10% (7+ noći), 15% (30+ noći)
```

### 2️⃣ Apartman Family
```
Slug: apartman-family
Naziv: Apartman Family
Cena: €50/noć (vikend €60)
Kapacitet: 6 osoba
Veličina: 65 m²
Kupatila: 2
Balkon: Da
Pogled: Jezero
Popusti: 15% (7+ noći), 20% (30+ noći)
```

### 3️⃣ Apartman Studio
```
Slug: apartman-studio
Naziv: Apartman Studio
Cena: €30/noć (vikend €35)
Kapacitet: 2 osobe
Veličina: 30 m²
Kupatila: 1
Balkon: Da
Pogled: Planine
Popusti: 10% (7+ noći), 15% (30+ noći)
```

## Kako Primeniti?

### Metod 1: Supabase Dashboard (Preporučeno)
1. Idi na: https://supabase.com/dashboard
2. Otvori projekat "apartmani-jovca"
3. Klikni na **"SQL Editor"** u levom meniju
4. Klikni **"New query"**
5. Kopiraj ceo sadržaj fajla: `supabase/migrations/20260223000001_add_sample_apartments.sql`
6. Zalepi u editor
7. Klikni **"Run"** (ili Ctrl+Enter)
8. Trebalo bi da vidiš: "Success. No rows returned"

### Metod 2: Supabase CLI
```bash
# Ako imaš Supabase CLI instaliran
supabase db push
```

### Metod 3: Direktno u Postgres
```bash
# Ako imaš direktan pristup bazi
psql -h your-db-host -U postgres -d postgres -f supabase/migrations/20260223000001_add_sample_apartments.sql
```

## Kako Proveriti Da Li Je Uspelo?

### 1. Provera u Supabase Dashboard
```sql
-- Kopiraj ovo u SQL Editor
SELECT 
  slug,
  name->>'sr' as naziv,
  base_price_eur as cena,
  capacity as kapacitet,
  status
FROM apartments
ORDER BY display_order;
```

Trebalo bi da vidiš **4 apartmana** (1 postojeći + 3 nova).

### 2. Provera na Sajtu
1. Idi na: `http://localhost:3000`
2. Skroluj do sekcije "Izaberite svoj savršen pogled"
3. Trebalo bi da vidiš **4 kartice apartmana**

### 3. Provera u Admin Panelu
1. Idi na: `http://localhost:3000/admin`
2. Klikni na tab "Apartmani"
3. Trebalo bi da vidiš **4 apartmana** u listi

## Šta Dalje?

### 📝 Izmeni Podatke
1. Otvori Admin Panel: `http://localhost:3000/admin`
2. Klikni "Apartmani" → "Izmeni" pored apartmana
3. Promeni:
   - Nazive (na sva 4 jezika)
   - Opise (na sva 4 jezika)
   - Cene
   - Kapacitete
   - Sadržaje
   - Pravila
   - GPS koordinate

### 🖼️ Dodaj Prave Slike
Trenutno su placeholder slike sa Unsplash-a. Zameni ih sa pravim slikama:

1. Upload slike na:
   - Supabase Storage (preporučeno)
   - Cloudinary
   - ImgBB
   - Ili bilo koji image hosting

2. U Admin Panelu, dodaj URL-ove slika u polje "Images"

Format:
```json
[
  "https://tvoj-url/slika1.jpg",
  "https://tvoj-url/slika2.jpg",
  "https://tvoj-url/slika3.jpg"
]
```

### 📍 Postavi GPS Koordinate
1. U Admin Panelu, idi na Tab 6 "Lokacija"
2. Klikni na mapi gde se nalazi apartman
3. Ili unesi ručno:
   - Latitude: 42.4511 (primer)
   - Longitude: 18.5311 (primer)

### 🔍 Optimizuj SEO
1. U Admin Panelu, idi na Tab 7 "SEO"
2. Dodaj:
   - Meta naslov (za Google)
   - Meta opis (za Google)
   - Ključne reči

## Struktura Podataka

Svaki apartman ima:

### Osnovni Podaci
- ✅ Naziv (4 jezika)
- ✅ Opis (4 jezika)
- ✅ Tip kreveta (4 jezika)
- ✅ Kapacitet
- ✅ Status (active)
- ✅ SEO Slug

### Detalji
- ✅ Veličina (m²)
- ✅ Broj kupatila
- ✅ Balkon
- ✅ Pogled

### Cene
- ✅ Osnovna cena
- ✅ Vikend cena
- ✅ Nedeljni popust
- ✅ Mesečni popust

### Pravila
- ✅ Vreme prijave (14:00)
- ✅ Vreme odjave (10:00)
- ✅ Min. boravak (1-3 noći)
- ✅ Max. boravak (0 = neograničeno)
- ✅ Pušenje nije dozvoljeno
- ✅ Noćni mir od 22h

### Sadržaji
- ✅ WiFi
- ✅ Parking
- ✅ Klima
- ✅ TV
- ✅ Kuhinja

### Lokacija
- ✅ Grad (Herceg Novi)
- ✅ Država (Crna Gora)
- ✅ GPS koordinate (privremene)

### Slike
- ✅ 2 placeholder slike (zameni sa pravim)

## Važne Napomene

### ⚠️ Ovo Su Privremeni Podaci
- Nazivi su generički
- Opisi su kratki
- Slike su placeholder-i sa Unsplash-a
- GPS koordinate su približne

### ✅ Sve Možeš Lako Da Izmeniš
- Kroz Admin Panel
- Bez potrebe za SQL-om
- Promene se odmah vide na sajtu

### 🔄 Migracija Je Idempotentna
- Možeš je pokrenuti više puta
- Koristi `ON CONFLICT DO UPDATE`
- Neće kreirati duplikate

## Fajlovi

### Kreirao Sam:
1. `supabase/migrations/20260223000001_add_sample_apartments.sql` - SQL migracija
2. `KAKO-MENJATI-PODATKE-APARTMANA.md` - Detaljan vodič
3. `supabase/migrations/VERIFY_APARTMENTS.sql` - SQL za proveru
4. `DODATO-3-NOVA-APARTMANA.md` - Ovaj dokument

## Sledeći Koraci

1. ✅ Primeni migraciju
2. ✅ Proveri da li se prikazuju apartmani
3. 📝 Izmeni podatke kroz Admin Panel
4. 🖼️ Dodaj prave slike
5. 📍 Postavi tačne GPS koordinate
6. 🌍 Proveri sve jezike
7. 🧪 Testiraj booking flow

## Pomoć

Ako nešto ne radi:
1. Proveri konzolu u browseru (F12)
2. Proveri Supabase logs
3. Pokreni `VERIFY_APARTMENTS.sql` u SQL Editor-u
4. Restartuj dev server: `npm run dev`

---

**Sada imaš 4 apartmana sa privremenim podacima koje možeš lako da izmeniš!** 🎉
