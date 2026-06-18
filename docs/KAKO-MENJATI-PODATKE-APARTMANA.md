# Kako Menjati Podatke Apartmana - Vodič 📝

## Brzi Pregled

Svi podaci o apartmanima se nalaze u **Supabase bazi** i mogu se menjati kroz **Admin Panel**.

## Gde Menjati Podatke?

### 🎯 GLAVNI NAČIN: Admin Panel (Preporučeno)

1. Idi na: `http://localhost:3000/admin`
2. Uloguj se sa: `mtosic0450@gmail.com`
3. Klikni na tab **"Apartmani"**
4. Klikni **"Izmeni"** pored apartmana koji želiš da menjaš
5. Promeni podatke
6. Klikni **"Sačuvaj"**
7. **Automatski se ažurira na sajtu!** ✅

### 📊 Šta Možeš Da Menjaš Kroz Admin Panel?

#### Tab 1: Osnovni Podaci
- **Naziv** (na 4 jezika: SR, EN, DE, IT)
- **Opis** (na 4 jezika)
- **Tip kreveta** (na 4 jezika)
- **Kapacitet** (broj gostiju)
- **Status** (aktivan/neaktivan)
- **SEO Slug** (za URL, npr. "apartman-deluxe")

#### Tab 2: Detalji
- **Veličina** (m²)
- **Sprat**
- **Broj kupatila**
- **Balkon** (da/ne)
- **Pogled** (jezero, planine, more, grad)

#### Tab 3: Sadržaji (Amenities)
- ☑️ WiFi
- ☑️ Parking
- ☑️ Klima
- ☑️ TV
- ☑️ Kuhinja
- ☑️ Veš mašina
- ☑️ Fen
- ☑️ Pegla
- ☑️ Grejanje

#### Tab 4: Cene
- **Osnovna cena** (EUR/noć)
- **Vikend cena** (EUR/noć)
- **Nedeljni popust** (%)
- **Mesečni popust** (%)

#### Tab 5: Pravila
- **Vreme prijave** (npr. "14:00")
- **Vreme odjave** (npr. "10:00")
- **Min. boravak** (broj noći)
- **Max. boravak** (0 = neograničeno)
- ☑️ Pušenje nije dozvoljeno
- ☑️ Kućni ljubimci dozvoljeni
- ☑️ Noćni mir od 22h

#### Tab 6: Lokacija
- **Adresa**
- **Grad**
- **Država**
- **Poštanski broj**
- **GPS koordinate** (klikni na mapi ili unesi ručno)

#### Tab 7: SEO
- **Meta naslov** (za Google)
- **Meta opis** (za Google)
- **Ključne reči** (za Google)

## Trenutno Dodati Apartmani

Upravo sam dodao 3 nova apartmana sa privremenim podacima:

### 1. Apartman Standard
- **Slug**: `apartman-standard`
- **Cena**: €35/noć
- **Kapacitet**: 3 osobe
- **Veličina**: 40 m²
- **Opis**: Komforan apartman sa svim potrebnim sadržajima

### 2. Apartman Family
- **Slug**: `apartman-family`
- **Cena**: €50/noć
- **Kapacitet**: 6 osoba
- **Veličina**: 65 m²
- **Opis**: Prostran apartman sa 2 spavaće sobe

### 3. Apartman Studio
- **Slug**: `apartman-studio`
- **Cena**: €30/noć
- **Kapacitet**: 2 osobe
- **Veličina**: 30 m²
- **Opis**: Kompaktan studio za parove

## Kako Primeniti Migraciju?

### Opcija 1: Kroz Supabase Dashboard (Najlakše)
1. Idi na: https://supabase.com/dashboard
2. Otvori svoj projekat
3. Idi na **SQL Editor**
4. Kopiraj sadržaj fajla `supabase/migrations/20260223000001_add_sample_apartments.sql`
5. Zalepi u SQL Editor
6. Klikni **"Run"**
7. ✅ Gotovo!

### Opcija 2: Kroz Supabase CLI
```bash
supabase db push
```

## Kako Proveriti Da Li Je Uspelo?

1. Idi na početnu stranicu: `http://localhost:3000`
2. Skroluj do sekcije **"Izaberite svoj savršen pogled"**
3. Trebalo bi da vidiš **4 apartmana**:
   - Apartman Veliki (ili Deluxe) - postojeći
   - Apartman Standard - novi
   - Apartman Family - novi
   - Apartman Studio - novi

## Kako Dodati Slike?

### Privremeno (za testiranje):
Slike su trenutno placeholder URL-ovi sa Unsplash-a.

### Trajno (za produkciju):
1. Idi u Admin Panel → Apartmani → Izmeni
2. U Tab 8 "Galerija" (ako postoji) ili direktno u bazi
3. Dodaj URL-ove pravih slika apartmana
4. Format: `["https://tvoja-slika-1.jpg", "https://tvoja-slika-2.jpg"]`

**NAPOMENA**: Za upload slika, možeš koristiti:
- Supabase Storage (preporučeno)
- Cloudinary
- ImgBB
- Ili bilo koji drugi image hosting

## Kako Promeniti Redosled Apartmana?

U Admin Panelu, promeni polje **"Display Order"**:
- 1 = prvi apartman
- 2 = drugi apartman
- 3 = treći apartman
- itd.

Apartmani se sortiraju po ovom broju na početnoj stranici.

## Kako Sakriti Apartman?

U Admin Panelu, promeni **"Status"** na:
- **"active"** = prikazuje se na sajtu ✅
- **"inactive"** = sakriveno ❌
- **"maintenance"** = u održavanju 🔧

## Gde Se Podaci Prikazuju?

### 1. Početna Stranica (`/`)
- Prikazuje **prva 4 apartmana** (po `display_order`)
- Naziv, opis, cena, kapacitet, tip kreveta
- Slika (prva iz `images` array-a)

### 2. Stranica Apartmani (`/apartments`)
- Prikazuje **SVE aktivne apartmane**
- Sortira po ceni (od najjeftinije)

### 3. Stranica Detalja (`/apartments/{slug}`)
- Prikazuje **SVE podatke** o apartmanu
- Galerija slika
- Mapa lokacije
- Svi sadržaji i pravila

### 4. Booking Stranica (`/booking`)
- Koristi podatke za izračun cene
- Proverava dostupnost
- Primenjuje popuste

## Važne Napomene

### ⚠️ Lokalizacija
Svi tekstualni podaci (naziv, opis, tip kreveta) moraju biti na **4 jezika**:
- **sr** - Srpski (obavezno!)
- **en** - Engleski
- **de** - Nemački
- **it** - Italijanski

Format u bazi:
```json
{
  "sr": "Apartman Deluxe",
  "en": "Deluxe Apartment",
  "de": "Deluxe Apartment",
  "it": "Appartamento Deluxe"
}
```

### ⚠️ Slug
- Mora biti **jedinstven**
- Koristi se u URL-u
- Format: `apartman-naziv` (lowercase, bez razmaka)
- Primer: `apartman-deluxe`, `apartman-studio`

### ⚠️ Cene
- Uvek u **EUR**
- Mogu biti **0** (znači ista kao osnovna cena)
- Popusti u **procentima** (0-100)

### ⚠️ GPS Koordinate
- Koriste se za prikaz na mapi
- Format: `latitude` (42.4511), `longitude` (18.5311)
- Možeš ih pronaći na Google Maps ili kliknuti na mapi u Admin Panelu

## Šta Ako Nešto Ne Radi?

1. **Proveri konzolu** u browseru (F12)
2. **Proveri Supabase logs** u Dashboard-u
3. **Proveri da li je migracija uspela** u SQL Editor-u
4. **Restartuj dev server**: `npm run dev`

## Kontakt Za Pomoć

Ako nešto ne radi ili imaš pitanja:
- Email: mtosic0450@gmail.com
- Proveri dokumentaciju u `README.md`

---

## Brzi Checklist ✅

- [ ] Primeni migraciju (`supabase db push` ili SQL Editor)
- [ ] Proveri da li se prikazuju apartmani na početnoj
- [ ] Otvori Admin Panel i izmeni podatke
- [ ] Dodaj prave slike (zameni placeholder-e)
- [ ] Postavi GPS koordinate na mapi
- [ ] Proveri sve 4 jezika
- [ ] Testuj booking flow
- [ ] Proveri da li se prikazuje mapa na detaljima

**Sve je sada u bazi i može se menjati kroz Admin Panel!** 🎉
