# Homepage Data Source Analysis - COMPLETE ✅

## Summary
Analiza početne stranice pokazuje da **NEMA HARDKODOVANIH PODATAKA**. Svi podaci dolaze iz baze ili translation fajlova.

## Featured Apartments Section

### Šta se prikazuje:
```
Izaberite svoj savršen pogled
Svaki apartman je jedinstveno dizajniran za udobnost i opuštanje.
Pogledaj sve apartmane

[Apartment Cards]
- Izdvajamo (badge)
- Slika apartmana
- Naziv apartmana
- Opis apartmana
- €45 / po noćenju
- 👥 4
- 🛏️ Bračni krevet
- Proveri dostupnost
```

### Odakle dolaze podaci:

#### 1. Naslovi i tekstovi ✅
**Izvor**: Translation fajlovi (`messages/sr.json`)
```json
"featured": {
  "title": "Izaberite svoj savršen pogled",
  "subtitle": "Svaki apartman je jedinstveno dizajniran za udobnost i opuštanje.",
  "viewAll": "Pogledaj sve apartmane",
  "checkAvailability": "Proveri dostupnost",
  "badge": "Izdvajamo"
}
```

#### 2. Apartmani ✅
**Izvor**: Supabase baza (`apartments` tabela)
```typescript
const { data: apartmentsData } = await supabase
  .from('apartments')
  .select('*')
  .limit(4)  // Prikazuje prva 4 apartmana
```

**Transformacija**:
```typescript
apartments = apartments.map(apt => ({
  ...apt,
  name: getLocalizedValue(apt.name, locale),           // Iz baze (JSONB)
  description: getLocalizedValue(apt.description, locale), // Iz baze (JSONB)
  bed_type: getLocalizedValue(apt.bed_type, locale)    // Iz baze (JSONB)
}))
```

#### 3. Podaci apartmana ✅
Sve iz baze:
- **Slika**: `apt.images[0]` - prva slika iz `images` JSONB array-a
- **Naziv**: `apt.name` - lokalizovano iz JSONB polja
- **Opis**: `apt.description` - lokalizovano iz JSONB polja
- **Cena**: `apt.base_price_eur` - iz baze
- **Kapacitet**: `apt.capacity` - iz baze
- **Tip kreveta**: `apt.bed_type` - lokalizovano iz JSONB polja
- **Slug**: `apt.slug` - iz baze (za URL)

#### 4. Dugme za rezervaciju ✅
```tsx
<Link href={`/${params.lang}/booking?apartment=${apt.slug || apt.id}`}>
  <Button>{t('featured.checkAvailability')}</Button>
</Link>
```
- URL parametar: `apt.slug` (ili `apt.id` kao fallback)
- Tekst dugmeta: iz translation fajla

## Nedavne izmene

### 1. Popravljeno `apt.type` → `apt.bed_type` ✅
**Bilo**: `{apt.type}` (ne postoji u bazi)
**Sada**: `{apt.bed_type}` (postoji u bazi)

### 2. Popravljeno booking URL ✅
**Bilo**: `apartment=${apt.id}`
**Sada**: `apartment=${apt.slug || apt.id}` (koristi SEO-friendly slug)

### 3. Slike iz baze ✅
**Bilo**: Hardkodovane Unsplash URL-ove na osnovu tipa
**Sada**: `apt.images[0]` iz baze

## Provera: Da li je nešto MOCK?

### ❌ NIJE MOCK:
- ✅ Naslovi i tekstovi - iz translation fajlova
- ✅ Apartmani - iz Supabase baze
- ✅ Slike - iz baze (`images` polje)
- ✅ Cene - iz baze (`base_price_eur`)
- ✅ Kapacitet - iz baze (`capacity`)
- ✅ Tip kreveta - iz baze (`bed_type`)
- ✅ Opisi - iz baze (`description`)
- ✅ Nazivi - iz baze (`name`)

### ✅ JEDINO ŠTO JE "STATIČNO":
- Translation tekstovi (naslovi, dugmad) - ali to je normalno, to su UI labele
- Fallback slika ako nema slika u bazi - ali to je normalno, to je fallback

## Kako dodati novi apartman?

1. Idi u Admin Panel
2. Klikni "Apartmani" → "Dodaj novi"
3. Popuni sve podatke (naziv, opis, cena, kapacitet, tip kreveta, slike)
4. Sačuvaj
5. **Automatski se pojavljuje na početnoj stranici!** (prva 4 apartmana)

## Kako promeniti tekstove?

1. Otvori `messages/sr.json` (ili drugi jezik)
2. Promeni tekstove u `featured` sekciji
3. Sačuvaj
4. **Automatski se ažurira na stranici!**

## Database Query

```sql
-- Ovo se izvršava na početnoj stranici
SELECT * FROM apartments LIMIT 4;
```

Prikazuje prva 4 apartmana iz baze (po redosledu unosa ili `display_order` ako postoji).

## Status: NEMA MOCK PODATAKA ✅

Svi podaci dolaze iz:
1. **Supabase baza** - apartmani, cene, slike, opisi
2. **Translation fajlovi** - UI labele i tekstovi

Nema hardkodovanih apartmana, cena ili opisa!
