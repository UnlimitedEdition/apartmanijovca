# Design Dokument: Kompletna Usklađenost Baze Podataka i Projekta

## Pregled

Ovaj design dokument definiše sveobuhvatno rešenje za postizanje **100% identičnosti** između Supabase baze podataka i TypeScript projekta. Projekat Apartmani Jovča trenutno ima kritičnu neusklađenost gde:

- **8 od 10 tabela** nema TypeScript tipove
- **API rute koriste nepostojeće nazive kolona** (`name` umesto `full_name`, `price_per_night` umesto `base_price_eur`, `type` ne postoji)
- **JSONB kolone se ne transformišu** pre slanja komponentama (komponente dobijaju objekte umesto stringova)
- **Migracije nisu kompletne** ili nisu usklađene sa trenutnim stanjem baze

**Strategija popravke**: Kreirati kompletne TypeScript tipove za SVE tabele, popraviti SVE API rute da koriste ispravne nazive kolona, implementirati transformer funkcije za JSONB podatke, ažurirati komponente da koriste lokalizovane podatke, i osigurati da migracije pokrivaju SVE izmene.

## Glosar

- **JSONB**: PostgreSQL tip podataka za skladištenje JSON objekata sa indeksiranjem i upitima
- **MultiLanguageText**: TypeScript interfejs za JSONB objekte sa multi-language podrškom `{sr, en, de, it}`
- **LocalizedApartment**: TypeScript interfejs za apartmane sa lokalizovanim stringovima (za frontend)
- **ApartmentRecord**: TypeScript interfejs za apartmane sa JSONB objektima (za bazu)
- **Transformer funkcija**: Funkcija koja konvertuje JSONB objekte u lokalizovane stringove
- **RLS (Row Level Security)**: Supabase sigurnosni mehanizam za kontrolu pristupa podacima
- **Migration**: SQL skripta koja definiše strukturu baze podataka

## Detalji Baga

### Root Cause Analysis

Osnovni uzrok problema je **nedostatak sistematskog pristupa sinhronizaciji između baze podataka i TypeScript projekta**. Konkretno:

1. **Nedostajući TypeScript Tipovi**: Kada su tabele kreirane u Supabase bazi, TypeScript tipovi nisu automatski generisani. Projekat ima samo 2 od 10 tipova (`ApartmentRecord` i `ContentRecord`), što znači da TypeScript kompajler ne može da detektuje greške u compile-time.

2. **Pogrešni Nazivi Kolona u API Rutama**: API rute su kreirane sa pretpostavkom da kolone imaju određene nazive (npr. `name`, `price_per_night`, `type`), ali baza koristi druge nazive (`full_name`, `base_price_eur`, nema `type` kolonu). Ovo se desilo jer:
   - Baza je ažurirana bez ažuriranja API ruta
   - Nema automatske validacije između baze i koda
   - TypeScript tipovi nisu bili kompletni pa kompajler nije detektovao greške

3. **Nedostajuća Transformacija JSONB Podataka**: Baza koristi JSONB kolone za multi-language podrš
ku (`name`, `description`, `bed_type`), ali API rute vraćaju sirove JSONB objekte komponentama. Komponente očekuju stringove, pa prikazuju `[object Object]` umesto stvarnih vrednosti. Ovo se desilo jer:
   - Nije implementiran transformer layer između baze i komponenti
   - API rute direktno vraćaju podatke iz baze bez transformacije
   - Nema helper funkcija za ekstrakciju lokalizovanih vrednosti

4. **Neusklađene Migracije**: Migracije ne pokrivaju sve tabele ili nisu usklađene sa trenutnim stanjem baze. Ovo znači da:
   - Nova instanca baze ne bi bila identična produkcijskoj
   - Nema single source of truth za strukturu baze
   - Teško je pratiti izmene u strukturi baze

### Fault Condition

Bug se manifestuje kada:
- **TypeScript projekat pokušava da pristupi tabelama** za koje ne postoje tipovi
- **API rute pokušavaju da selektuju kolone** koje ne postoje u bazi
- **Komponente pokušavaju da renderuju JSONB objekte** direktno bez transformacije
- **Migracije se primenjuju na praznu bazu** i rezultat nije identičan produkcijskoj bazi

**Formalna Specifikacija:**

```
FUNCTION isBugCondition(operation)
  INPUT: operation of type DatabaseOperation
  OUTPUT: boolean
  
  RETURN (operation.type == "SELECT" AND operation.columns CONTAINS nonExistentColumn)
         OR (operation.type == "INSERT" AND operation.columns CONTAINS nonExistentColumn)
         OR (operation.type == "UPDATE" AND operation.columns CONTAINS nonExistentColumn)
         OR (operation.type == "RENDER" AND operation.data IS JsonbObject AND NOT transformed)
         OR (operation.type == "COMPILE" AND operation.table NOT IN definedTypes)
END FUNCTION

WHERE:
  nonExistentColumn IN ['name' (u guests tabeli), 'price_per_night', 'type', 'name_sr', 'name_de', 'name_it']
  definedTypes = ['apartments', 'content']
  JsonbObject = {sr: string, en: string, de: string, it: string}
```

### Primeri

**Primer 1: API ruta koristi nepostojeću kolonu**
```typescript
// src/app/api/availability/route.ts
const { data } = await supabase
  .from('apartments')
  .select('id, name, type, capacity, price_per_night')
  //                    ^^^^              ^^^^^^^^^^^^^^
  //                    type ne postoji   price_per_night ne postoji
```
**Očekivano**: API ruta vraća `null` za `type` i `price_per_night`
**Stvarno**: API ruta vraća `null` vrednosti, komponente ne mogu da prikažu podatke

**Primer 2: Komponenta renderuje JSONB objekat**
```typescript
// src/components/admin/ApartmentManager.tsx
<div>{apartment.name}</div>
//    ^^^^^^^^^^^^^^
//    name je {sr: "...", en: "...", de: "...", it: "..."}
```
**Očekivano**: Prikazuje lokalizovani string (npr. "Apartman 1")
**Stvarno**: Prikazuje `[object Object]`

**Primer 3: API ruta kreira gosta sa pogrešnim nazivom kolone**
```typescript
// src/lib/bookings/service.ts
const { data } = await supabase
  .from('guests')
  .insert({ name, email, phone })
  //        ^^^^
  //        name ne postoji, ispravno je full_name
```
**Očekivano**: Kreira novog gosta u bazi
**Stvarno**: Vraća grešku jer kolona `name` ne postoji

**Primer 4: TypeScript ne detektuje grešku**
```typescript
// Bez TypeScript tipa za guests tabelu
const guest = await supabase.from('guests').select('name').single()
//                                                   ^^^^
//                                                   TypeScript ne zna da ova kolona ne postoji
```
**Očekivano**: TypeScript kompajler prijavljuje grešku
**Stvarno**: Greška se detektuje tek u runtime-u

## Očekivano Ponašanje

### Preservation Requirements

**Nepromenjeno Ponašanje:**
- Sve postojeće API rute MORAJU NASTAVITI DA RADE nakon izmena (sa ispravnim podacima)
- Sve postojeće komponente MORAJU NASTAVITI DA PRIKAZUJU podatke (sa ispravnim formatiranjem)
- Sve postojeće funkcionalnosti (kreiranje rezervacija, upravljanje apartmanima, prikaz statistika) MORAJU NASTAVITI DA RADE
- Svi postojeći podaci u bazi MORAJU OSTATI NETAKNUTI nakon primene migracija
- Sve postojeće RLS politike, funkcije, trigeri, indeksi i constraints MORAJU OSTATI NETAKNUTI

**Scope:**
Sve operacije koje NE uključuju:
- Pristup tabelama bez TypeScript tipova
- Korišćenje nepostojećih naziva kolona
- Renderovanje JSONB objekata bez transformacije

MORAJU NASTAVITI DA RADE IDENTIČNO kao pre izmena.

## Hypothesized Root Cause

Na osnovu analize baga, najverovat
niji uzroci su:

1. **Nedostatak Automatske Generacije Tipova**: Supabase ne generiše automatski TypeScript tipove za sve tabele. Projekat je ručno kreirao tipove samo za 2 tabele, a ostale su zanemarene.

2. **Neusklađena Evolucija Baze i Koda**: Baza je evoluirala (dodavanje novih tabela, promena naziva kolona) bez istovremenog ažuriranja TypeScript tipova i API ruta.

3. **Nedostatak Transformer Layer-a**: Nema sistematskog pristupa transformaciji JSONB podataka iz baze u format pogodan za frontend.

4. **Nepotpune Migracije**: Migracije nisu kreirane za sve tabele ili nisu ažurirane kada je struktura baze promenjena.

## Correctness Properties

Property 1: Fault Condition - TypeScript Tipovi za Sve Tabele

_Za svaku_ tabelu u Supabase bazi, TypeScript projekat MORA imati odgovarajući tip koji TAČNO odgovara strukturi tabele, uključujući sve kolone, tipove podataka, i constraints.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 2.11**

Property 2: Fault Condition - Ispravni Nazivi Kolona u API Rutama

_Za svaku_ API rutu koja pristupa bazi, SELECT, INSERT, UPDATE i DELETE operacije MORAJU koristiti nazive kolona koji TAČNO postoje u bazi.

**Validates: Requirements 2.12, 2.13, 2.14, 2.15**

Property 3: Fault Condition - Transformacija JSONB Podataka

_Za svaki_ API response koji sadrži JSONB kolone, podaci MORAJU biti transformisani u lokalizovane stringove ili odgovarajuće tipove pre slanja komponentama.

**Validates: Requirements 2.16, 2.17, 2.18, 2.19**

Property 4: Fault Condition - Komponente Koriste Lokalizovane Podatke

_Za svaku_ komponentu koja renderuje podatke iz baze, komponenta MORA dobiti lokalizovane stringove umesto JSONB objekata.

**Validates: Requirements 2.20, 2.21, 2.22**

Property 5: Fault Condition - Kompletne Migracije

_Za svaku_ tabelu u bazi, MORA postojati migracija koja kreira tu tabelu sa TAČNOM strukturom, uključujući sve kolone, tipove, constraints, indekse, RLS politike, funkcije i trigere.

**Validates: Requirements 2.23, 2.24, 2.25**

Property 6: Preservation - Postojeća Funkcionalnost

_Za sve_ postojeće API rute, komponente i funkcionalnosti, ponašanje MORA ostati IDENTIČNO nakon primene izmena.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 3.11, 3.12**

Property 7: Preservation - Postojeći Podaci i Struktura Baze

_Za sve_ postojeće podatke, RLS politike, funkcije, trigere, indekse i constraints, oni MORAJU ostati NETAKNUTI nakon primene migracija.

**Validates: Requirements 3.13, 3.14, 3.15, 3.16**


## Arhitektura Rešenja

### Pregled Arhitekture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Components  │  │  Components  │  │  Components  │         │
│  │  (Admin)     │  │  (Booking)   │  │  (Portal)    │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                  │                  │                  │
│         └──────────────────┼──────────────────┘                  │
│                            │                                     │
└────────────────────────────┼─────────────────────────────────────┘
                             │
                             │ Localized Data (strings)
                             │
┌────────────────────────────┼─────────────────────────────────────┐
│                    API LAYER (Next.js)                          │
│                            │                                     │
│  ┌─────────────────────────▼──────────────────────────┐         │
│  │         Transformer Functions Layer                │         │
│  │  - transformApartmentRecord()                      │         │
│  │  - transformBookingRecord()                        │         │
│  │  - transformReviewRecord()                         │         │
│  │  - getLocalizedValue()                             │         │
│  └─────────────────────────┬──────────────────────────┘         │
│                            │                                     │
│  ┌─────────────────────────▼──────────────────────────┐         │
│  │              API Routes                            │         │
│  │  - /api/availability                               │         │
│  │  - /api/booking                                    │         │
│  │  - /api/admin/apartments                           │         │
│  │  - /api/admin/bookings                             │         │
│  └─────────────────────────┬──────────────────────────┘         │
│                            │                                     │
└────────────────────────────┼─────────────────────────────────────┘
                             │
                             │ Database Records (JSONB objects)
                             │
┌────────────────────────────▼─────────────────────────────────────┐
│                    DATABASE LAYER (Supabase)                    │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  TypeScript Types                        │  │
│  │  src/lib/types/database.ts                               │  │
│  │  - GuestRecord, BookingRecord, AvailabilityRecord        │  │
│  │  - ReviewRecord, BookingMessageRecord, MessageRecord     │  │
│  │  - GalleryRecord, AnalyticsEventRecord                   │  │
│  │  - ApartmentRecord (updated), ContentRecord              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  Database Tables                         │  │
│  │  - guests, bookings, availability                        │  │
│  │  - reviews, booking_messages, messages                   │  │
│  │  - gallery, analytics_events                             │  │
│  │  - apartments, content                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  Migrations                              │  │
│  │  supabase/migrations/                                    │  │
│  │  - 001_create_all_tables.sql                             │  │
│  │  - 002_create_rls_policies.sql                           │  │
│  │  - 003_create_functions_and_triggers.sql                 │  │
│  └──────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

### Ključne Komponente

1. **TypeScript Types Layer** (`src/lib/types/database.ts`)
   - Definiše TypeScript tipove za SVE tabele
   - Koristi `Json` tip za JSONB kolone
   - Definiše `MultiLanguageText` interfejs za multi-language polja

2. **Transformer Functions Layer** (`src/lib/transformers/`)
   - Transformiše JSONB objekte u lokalizovane stringove
   - Transformiše JSONB array-eve u TypeScript array-eve
   - Koristi `Accept-Language` header za određivanje jezika

3. **API Routes Layer** (`src/app/api/`)
   - Koristi ispravne nazive kolona
   - Poziva transformer funkcije pre slanja podataka komponentama
   - Validira podatke pre upisa u bazu

4. **Database Layer** (Supabase)
   - Tabele sa JSONB kolonama za multi-language podrš
ku
   - RLS politike za sigurnost
   - Funkcije i trigeri za automatizaciju
   - Migracije za verzionisanje strukture

### Data Flow

**Read Operation (GET):**
```
Component Request
  ↓
API Route
  ↓
Supabase Query (sa ispravnim nazivima kolona)
  ↓
Database Record (sa JSONB objektima)
  ↓
Transformer Function (JSONB → Localized String)
  ↓
Localized Data
  ↓
Component Render
```

**Write Operation (POST/PUT):**
```
Component Submit
  ↓
API Route
  ↓
Validation
  ↓
Transform (Localized String → JSONB)
  ↓
Supabase Insert/Update (sa ispravnim nazivima kolona)
  ↓
Database Record
  ↓
Success Response
  ↓
Component Update
```


## Data Models - TypeScript Tipovi

### 1. GuestRecord

**Fajl**: `src/lib/types/database.ts`

**Struktura Tabele u Bazi**:
```sql
CREATE TABLE guests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  language TEXT DEFAULT 'sr',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**TypeScript Tip**:
```typescript
export interface GuestRecord {
  id: string
  full_name: string  // NE "name"
  email: string
  phone: string | null
  language: Locale
  created_at: string
  updated_at: string
}
```

**Ključne Izmene**:
- Kolona je `full_name`, NE `name`
- `phone` je nullable
- `language` je `Locale` tip ('sr' | 'en' | 'de' | 'it')

### 2. BookingRecord

**Fajl**: `src/lib/types/database.ts`

**Struktura Tabele u Bazi**:
```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_number TEXT NOT NULL UNIQUE,
  apartment_id UUID NOT NULL REFERENCES apartments(id),
  guest_id UUID NOT NULL REFERENCES guests(id),
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  nights INTEGER NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  options JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**TypeScript Tip**:
```typescript
export interface BookingRecord {
  id: string
  booking_number: string
  apartment_id: string
  guest_id: string
  check_in: string  // ISO date string
  check_out: string  // ISO date string
  nights: number
  total_price: number
  status: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'no_show'
  options: Json | null  // JSONB: {crib?: boolean, parking?: boolean, earlyCheckIn?: boolean, lateCheckOut?: boolean, notes?: string}
  created_at: string
  updated_at: string
}
```

**Ključne Izmene**:
- Kolone su `check_in`, `check_out`, `nights`, `booking_number`
- `options` je JSONB objekat (Json tip)
- `status` ima tačno definisane vrednosti

### 3. AvailabilityRecord

**Fajl**: `src/lib/types/database.ts`

**Struktura Tabele u Bazi**:
```sql
CREATE TABLE availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  apartment_id UUID NOT NULL REFERENCES apartments(id),
  date DATE NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  price_override DECIMAL(10,2),
  reason TEXT,
  booking_id UUID REFERENCES bookings(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(apartment_id, date)
);
```

**TypeScript Tip**:
```typescript
export interface AvailabilityRecord {
  id: string
  apartment_id: string
  date: string  // ISO date string
  is_available: boolean
  price_override: number | null
  reason: string | null
  booking_id: string | null
  created_at: string
  updated_at: string
}
```


### 4. ReviewRecord

**Fajl**: `src/lib/types/database.ts`

**Struktura Tabele u Bazi**:
```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id),
  guest_id UUID NOT NULL REFERENCES guests(id),
  apartment_id UUID NOT NULL REFERENCES apartments(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  photos JSONB,
  status TEXT NOT NULL DEFAULT 'pending',
  approved_at TIMESTAMPTZ,
  language TEXT NOT NULL DEFAULT 'sr',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**TypeScript Tip**:
```typescript
export interface ReviewRecord {
  id: string
  booking_id: string
  guest_id: string
  apartment_id: string
  rating: number  // 1-5
  title: string | null
  comment: string | null
  photos: Json | null  // JSONB array: string[]
  status: 'pending' | 'approved' | 'rejected'
  approved_at: string | null
  language: Locale
  created_at: string
  updated_at: string
}
```

### 5. BookingMessageRecord

**Fajl**: `src/lib/types/database.ts`

**Struktura Tabele u Bazi**:
```sql
CREATE TABLE booking_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id),
  sender_type TEXT NOT NULL,
  sender_id UUID,
  content TEXT NOT NULL,
  attachments JSONB,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**TypeScript Tip**:
```typescript
export interface BookingMessageRecord {
  id: string
  booking_id: string
  sender_type: 'guest' | 'admin' | 'system'
  sender_id: string | null
  content: string
  attachments: Json | null  // JSONB array: {url: string, name: string, type: string}[]
  read_at: string | null
  created_at: string
}
```

### 6. MessageRecord

**Fajl**: `src/lib/types/database.ts`

**Struktura Tabele u Bazi**:
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**TypeScript Tip**:
```typescript
export interface MessageRecord {
  id: string
  full_name: string  // NE "name"
  email: string
  phone: string | null
  subject: string
  message: string
  status: 'new' | 'read' | 'replied' | 'archived'
  created_at: string
  updated_at: string
}
```

### 7. GalleryRecord

**Fajl**: `src/lib/types/database.ts`

**Struktura Tabele u Bazi**:
```sql
CREATE TABLE gallery (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url TEXT NOT NULL,
  caption JSONB,
  tags JSONB,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**TypeScript Tip**:
```typescript
export interface GalleryRecord {
  id: string
  url: string
  caption: Json | null  // JSONB: MultiLanguageText
  tags: Json | null  // JSONB array: string[]
  display_order: number
  created_at: string
  updated_at: string
}
```


### 8. AnalyticsEventRecord

**Fajl**: `src/lib/types/database.ts`

**Struktura Tabele u Bazi**:
```sql
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  event_data JSONB,
  session_id TEXT,
  user_id UUID,
  page_url TEXT,
  referrer TEXT,
  device_type TEXT,
  browser TEXT,
  language TEXT,
  country TEXT,
  city TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**TypeScript Tip**:
```typescript
export interface AnalyticsEventRecord {
  id: string
  event_type: string
  event_data: Json | null  // JSONB: flexible object
  session_id: string | null
  user_id: string | null
  page_url: string | null
  referrer: string | null
  device_type: string | null
  browser: string | null
  language: string | null
  country: string | null
  city: string | null
  created_at: string
}
```

### 9. ApartmentRecord (Ažuriran)

**Fajl**: `src/lib/types/database.ts`

**Struktura Tabele u Bazi**:
```sql
CREATE TABLE apartments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name JSONB NOT NULL,
  description JSONB NOT NULL,
  bed_type JSONB NOT NULL,
  capacity INTEGER NOT NULL,
  amenities JSONB NOT NULL,
  base_price_eur DECIMAL(10,2) NOT NULL,
  images JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**TypeScript Tip (Ažuriran)**:
```typescript
export interface ApartmentRecord {
  id: string
  name: Json  // JSONB: MultiLanguageText - PROMENJEN SA MultiLanguageText
  description: Json  // JSONB: MultiLanguageText - PROMENJEN SA MultiLanguageText
  bed_type: Json  // JSONB: MultiLanguageText - PROMENJEN SA MultiLanguageText
  capacity: number
  amenities: Json  // JSONB array: MultiLanguageText[] - PROMENJEN SA string[]
  base_price_eur: number  // NE "price_per_night"
  images: Json  // JSONB array: {url: string, alt: MultiLanguageText}[] - PROMENJEN SA string[]
  status: 'active' | 'inactive' | 'maintenance'
  display_order: number  // DODATO
  created_at: string
  updated_at: string
}
```

**Ključne Izmene**:
- `name`, `description`, `bed_type` su `Json` tip (ne direktno `MultiLanguageText`)
- `amenities` je `Json` (JSONB array), ne `string[]`
- `images` je `Json` (JSONB array), ne `string[]`
- Kolona je `base_price_eur`, NE `price_per_night`
- Dodato `display_order` polje

### 10. ContentRecord (Već Postoji)

**Fajl**: `src/lib/types/database.ts`

**Struktura Tabele u Bazi**:
```sql
CREATE TABLE content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  language TEXT NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**TypeScript Tip (Već Definisan)**:
```typescript
export interface ContentRecord {
  id: string
  key: string
  language: Locale
  value: Record<string, unknown>  // Flexible JSONB
  created_at: string
  updated_at: string
}
```


## Transformer Functions - Implementacija

### Lokacija

**Fajl**: `src/lib/transformers/database.ts` (NOVI FAJL)

### Funkcije

#### 1. transformApartmentRecord

**Svrha**: Transformiše `ApartmentRecord` (sa JSONB objektima) u `LocalizedApartment` (sa lokalizovanim stringovima)

**Signature**:
```typescript
export function transformApartmentRecord(
  record: ApartmentRecord,
  locale: Locale
): LocalizedApartment
```

**Implementacija**:
```typescript
export function transformApartmentRecord(
  record: ApartmentRecord,
  locale: Locale
): LocalizedApartment {
  return {
    id: record.id,
    name: getLocalizedValue(record.name as MultiLanguageText, locale),
    description: getLocalizedValue(record.description as MultiLanguageText, locale),
    bed_type: getLocalizedValue(record.bed_type as MultiLanguageText, locale),
    capacity: record.capacity,
    amenities: transformAmenities(record.amenities as unknown as MultiLanguageText[], locale),
    base_price_eur: record.base_price_eur,
    images: transformImages(record.images as unknown as ImageRecord[]),
    status: record.status,
    created_at: record.created_at,
    updated_at: record.updated_at
  }
}
```

#### 2. transformAmenities

**Svrha**: Transformiše JSONB array amenities u string array

**Signature**:
```typescript
function transformAmenities(
  amenities: MultiLanguageText[],
  locale: Locale
): string[]
```

**Implementacija**:
```typescript
function transformAmenities(
  amenities: MultiLanguageText[],
  locale: Locale
): string[] {
  return amenities.map(amenity => getLocalizedValue(amenity, locale))
}
```

#### 3. transformImages

**Svrha**: Transformiše JSONB array images u string array (URL-ovi)

**Signature**:
```typescript
interface ImageRecord {
  url: string
  alt: MultiLanguageText
}

function transformImages(images: ImageRecord[]): string[]
```

**Implementacija**:
```typescript
function transformImages(images: ImageRecord[]): string[] {
  return images.map(image => image.url)
}
```

#### 4. transformBookingRecord

**Svrha**: Transformiše `BookingRecord` sa related data u frontend-friendly format

**Signature**:
```typescript
export function transformBookingRecord(
  record: BookingRecord & {
    apartment: ApartmentRecord
    guest: GuestRecord
  },
  locale: Locale
): BookingResponse
```

**Implementacija**:
```typescript
export function transformBookingRecord(
  record: BookingRecord & {
    apartment: ApartmentRecord
    guest: GuestRecord
  },
  locale: Locale
): BookingResponse {
  return {
    id: record.id,
    bookingNumber: record.booking_number,
    apartmentId: record.apartment_id,
    apartmentName: getLocalizedValue(record.apartment.name as MultiLanguageText, locale),
    guestId: record.guest_id,
    guestName: record.guest.full_name,
    guestEmail: record.guest.email,
    guestPhone: record.guest.phone,
    checkIn: record.check_in,
    checkOut: record.check_out,
    nights: record.nights,
    totalPrice: record.total_price,
    status: record.status,
    options: record.options as BookingOptions | undefined,
    createdAt: record.created_at,
    updatedAt: record.updated_at
  }
}
```

#### 5. transformReviewRecord

**Svrha**: Transformiše `ReviewRecord` sa related data u frontend-friendly format

**Signature**:
```typescript
export function transformReviewRecord(
  record: ReviewRecord & {
    apartment: ApartmentRecord
    guest: GuestRecord
  },
  locale: Locale
): ReviewResponse
```


**Implementacija**:
```typescript
export function transformReviewRecord(
  record: ReviewRecord & {
    apartment: ApartmentRecord
    guest: GuestRecord
  },
  locale: Locale
): ReviewResponse {
  return {
    id: record.id,
    bookingId: record.booking_id,
    apartmentId: record.apartment_id,
    apartmentName: getLocalizedValue(record.apartment.name as MultiLanguageText, locale),
    guestId: record.guest_id,
    guestName: record.guest.full_name,
    rating: record.rating,
    title: record.title,
    comment: record.comment,
    photos: record.photos as string[] | null,
    status: record.status,
    approvedAt: record.approved_at,
    language: record.language,
    createdAt: record.created_at,
    updatedAt: record.updated_at
  }
}
```

#### 6. reverseTransformApartmentData

**Svrha**: Transformiše frontend podatke (lokalizovani stringovi) u JSONB objekte za upis u bazu

**Signature**:
```typescript
export function reverseTransformApartmentData(
  data: {
    name: Record<Locale, string>
    description: Record<Locale, string>
    bed_type: Record<Locale, string>
    amenities: Record<Locale, string>[]
    images: { url: string; alt: Record<Locale, string> }[]
  }
): {
  name: Json
  description: Json
  bed_type: Json
  amenities: Json
  images: Json
}
```

**Implementacija**:
```typescript
export function reverseTransformApartmentData(
  data: {
    name: Record<Locale, string>
    description: Record<Locale, string>
    bed_type: Record<Locale, string>
    amenities: Record<Locale, string>[]
    images: { url: string; alt: Record<Locale, string> }[]
  }
): {
  name: Json
  description: Json
  bed_type: Json
  amenities: Json
  images: Json
} {
  return {
    name: data.name as Json,
    description: data.description as Json,
    bed_type: data.bed_type as Json,
    amenities: data.amenities as Json,
    images: data.images as Json
  }
}
```


## API Route Fixes - Detaljne Izmene

### 1. src/app/api/availability/route.ts

**Problem**: Koristi nepostojeće kolone `type` i `price_per_night`

**Izmene**:

**Linija ~60-62 (GET metoda)**:
```typescript
// STARO (POGREŠNO):
.select('id, name, type, capacity, price_per_night, bed_type')

// NOVO (ISPRAVNO):
.select('id, name, capacity, base_price_eur, bed_type, status, amenities, images')
```

**Linija ~130-135 (GET metoda - response)**:
```typescript
// STARO (POGREŠNO):
return {
  id: apartment.id,
  name: getLocalizedValue(apartment.name as MultiLanguageText, locale),
  type: getLocalizedValue(apartment.type as MultiLanguageText, locale),
  capacity: apartment.capacity,
  price_per_night: apartment.price_per_night,
  available: isAvailable,
  unavailableDates: [...new Set(unavailableDates)].sort()
}

// NOVO (ISPRAVNO):
return {
  id: apartment.id,
  name: getLocalizedValue(apartment.name as MultiLanguageText, locale),
  capacity: apartment.capacity,
  base_price_eur: apartment.base_price_eur,
  bed_type: getLocalizedValue(apartment.bed_type as MultiLanguageText, locale),
  available: isAvailable,
  unavailableDates: [...new Set(unavailableDates)].sort()
}
```

**Linija ~180-182 (POST metoda)**:
```typescript
// STARO (POGREŠNO):
.select('id, name, type, capacity, price_per_night')

// NOVO (ISPRAVNO):
.select('id, name, capacity, base_price_eur, bed_type, status')
```

**Linija ~200-210 (POST metoda - response)**:
```typescript
// STARO (POGREŠNO):
apartments: [{
  id: apartment.id,
  name: getLocalizedValue(apartment.name as MultiLanguageText, locale),
  type: getLocalizedValue(apartment.type as MultiLanguageText, locale),
  capacity: apartment.capacity,
  price_per_night: apartment.price_per_night,
  available: isAvailable,
  unavailableDates: []
}]

// NOVO (ISPRAVNO):
apartments: [{
  id: apartment.id,
  name: getLocalizedValue(apartment.name as MultiLanguageText, locale),
  capacity: apartment.capacity,
  base_price_eur: apartment.base_price_eur,
  bed_type: getLocalizedValue(apartment.bed_type as MultiLanguageText, locale),
  available: isAvailable,
  unavailableDates: []
}]
```

### 2. src/lib/bookings/service.ts

**Problem**: Koristi nepostojeće kolone `name` (umesto `full_name`), `price_per_night` (umesto `base_price_eur`), `name_sr/name_de/name_it` (umesto `name.sr/name.en/name.de/name.it`)

**Izmene**:

**Linija ~120-122 (createOrGetGuest funkcija)**:
```typescript
// STARO (POGREŠNO):
.select('id, name, phone')

// NOVO (ISPRAVNO):
.select('id, full_name, phone')
```

**Linija ~125-130 (createOrGetGuest funkcija)**:
```typescript
// STARO (POGREŠNO):
if (existingGuest.name !== name || existingGuest.phone !== phone) {
  const { error: updateError } = await supabase
    .from('guests')
    .update({ name, phone })
    .eq('id', existingGuest.id)

// NOVO (ISPRAVNO):
if (existingGuest.full_name !== name || existingGuest.phone !== phone) {
  const { error: updateError } = await supabase
    .from('guests')
    .update({ full_name: name, phone })
    .eq('id', existingGuest.id)
```

**Linija ~138-140 (createOrGetGuest funkcija)**:
```typescript
// STARO (POGREŠNO):
.insert({ name, email, phone })

// NOVO (ISPRAVNO):
.insert({ full_name: name, email, phone })
```

**Linija ~175-177 (createBooking funkcija)**:
```typescript
// STARO (POGREŠNO):
.select('id, name, price_per_night')

// NOVO (ISPRAVNO):
.select('id, name, base_price_eur')
```

**Linija ~195 (createBooking funkcija)**:
```typescript
// STARO (POGREŠNO):
const totalPrice = calculateTotalPrice(
  apartment.price_per_night,
  input.checkIn,
  input.checkOut,
  input.options
)

// NOVO (ISPRAVNO):
const totalPrice = calculateTotalPrice(
  apartment.base_price_eur,
  input.checkIn,
  input.checkOut,
  input.options
)
```

**Linija ~270-272 (getBookingById funkcija)**:
```typescript
// STARO (POGREŠNO):
guests!inner(id, name, email, phone)

// NOVO (ISPRAVNO):
guests!inner(id, full_name, email, phone)
```

**Linija ~285-290 (getBookingById funkcija)**:
```typescript
// STARO (POGREŠNO):
guestName: (data.guests as any).name || (data.guests as any)[0]?.name,

// NOVO (ISPRAVNO):
guestName: (data.guests as any).full_name || (data.guests as any)[0]?.full_name,
```

**Linija ~330-332 (listBookings funkcija)**:
```typescript
// STARO (POGREŠNO):
guests!inner(id, name, email, phone)

// NOVO (ISPRAVNO):
guests!inner(id, full_name, email, phone)
```

**Linija ~370-375 (listBookings funkcija)**:
```typescript
// STARO (POGREŠNO):
guestName: Array.isArray(booking.guests) ? booking.guests[0].name : booking.guests.name,

// NOVO (ISPRAVNO):
guestName: Array.isArray(booking.guests) ? booking.guests[0].full_name : booking.guests.full_name,
```

**Linija ~450-452 (updateBooking funkcija)**:
```typescript
// STARO (POGREŠNO):
const updateData: { name?: string; phone?: string } = {}
if (input.guest.name) updateData.name = input.guest.name

// NOVO (ISPRAVNO):
const updateData: { full_name?: string; phone?: string } = {}
if (input.guest.name) updateData.full_name = input.guest.name
```

**Linija ~470-472 (updateBooking funkcija)**:
```typescript
// STARO (POGREŠNO):
.select('price_per_night')

// NOVO (ISPRAVNO):
.select('base_price_eur')
```

**Linija ~480-485 (updateBooking funkcija)**:
```typescript
// STARO (POGREŠNO):
updateData.total_price = calculateTotalPrice(
  apartment.price_per_night,
  newCheckIn,
  newCheckOut,
  fullOptions
)

// NOVO (ISPRAVNO):
updateData.total_price = calculateTotalPrice(
  apartment.base_price_eur,
  newCheckIn,
  newCheckOut,
  fullOptions
)
```

**Linija ~520-522 (updateBooking funkcija - email trigger)**:
```typescript
// STARO (POGREŠNO):
.select('id, name, name_sr, name_de, name_it')

// NOVO (ISPRAVNO):
.select('id, name')
```

**Linija ~525-527 (updateBooking funkcija - email trigger)**:
```typescript
// STARO (POGREŠNO):
.select('id, name, email, phone, language')

// NOVO (ISPRAVNO):
.select('id, full_name, email, phone, language')
```

**Linija ~540-545 (updateBooking funkcija - email trigger)**:
```typescript
// STARO (POGREŠNO):
apartment: {
  id: apartment?.id || '',
  name: apartment?.name || '',
  nameSr: apartment?.name_sr,
  nameDe: apartment?.name_de,
  nameIt: apartment?.name_it,
}

// NOVO (ISPRAVNO):
apartment: {
  id: apartment?.id || '',
  name: getLocalizedValue(apartment?.name as MultiLanguageText, guest?.language as Locale || 'sr'),
}
```

**Linija ~550-555 (updateBooking funkcija - email trigger)**:
```typescript
// STARO (POGREŠNO):
{
  name: guest?.name || '',
  email: guest?.email || '',
  phone: guest?.phone,
  language: (guest?.language as EmailLanguage) || 'en',
}

// NOVO (ISPRAVNO):
{
  name: guest?.full_name || '',
  email: guest?.email || '',
  phone: guest?.phone,
  language: (guest?.language as EmailLanguage) || 'en',
}
```


### 3. src/hooks/useAvailability.ts

**Problem**: Vraća sirove JSONB objekte bez transformacije

**Izmene**:

**Dodati import na vrhu fajla**:
```typescript
import { transformApartmentRecord } from '@/lib/transformers/database'
import { extractLocale } from '@/lib/localization/extract'
```

**Linija ~90-95 (fetchData funkcija)**:
```typescript
// STARO (POGREŠNO):
const apartments = (apartmentsData || []) as Apartment[]

// NOVO (ISPRAVNO):
// Get locale from browser or default to 'sr'
const locale = extractLocale() || 'sr'

// Transform apartment records to localized format
const apartments = (apartmentsData || []).map(apt => 
  transformApartmentRecord(apt as ApartmentRecord, locale)
)
```

### 4. src/app/api/admin/apartments/[id]/route.ts

**Problem**: Koristi nepostojeću kolonu `price_per_night`

**Izmene**:

**GET metoda - select**:
```typescript
// STARO (POGREŠNO):
.select('id, name, price_per_night, capacity, status')

// NOVO (ISPRAVNO):
.select('id, name, base_price_eur, capacity, status, description, bed_type, amenities, images, display_order')
```

**PUT metoda - update**:
```typescript
// STARO (POGREŠNO):
const updateData: Partial<ApartmentRecord> = {}
if (body.price_per_night !== undefined) {
  updateData.price_per_night = body.price_per_night
}

// NOVO (ISPRAVNO):
const updateData: Partial<ApartmentRecord> = {}
if (body.base_price_eur !== undefined) {
  updateData.base_price_eur = body.base_price_eur
}
```

**Response transformacija**:
```typescript
// DODATI nakon fetch-a:
const locale = extractLocale(request)
const transformedApartment = transformApartmentRecord(apartment, locale)

return NextResponse.json({
  success: true,
  data: transformedApartment
})
```

### 5. src/app/api/portal/profile/route.ts

**Problem**: Koristi nepostojeću kolonu `name` umesto `full_name`

**Izmene**:

**PUT metoda - update**:
```typescript
// STARO (POGREŠNO):
const updateData: Partial<GuestRecord> = {}
if (body.name) {
  updateData.name = body.name
}

// NOVO (ISPRAVNO):
const updateData: Partial<GuestRecord> = {}
if (body.name) {
  updateData.full_name = body.name
}
```

**GET metoda - select**:
```typescript
// STARO (POGREŠNO):
.select('id, name, email, phone, language')

// NOVO (ISPRAVNO):
.select('id, full_name, email, phone, language')
```

**Response mapping**:
```typescript
// STARO (POGREŠNO):
return NextResponse.json({
  success: true,
  data: {
    id: guest.id,
    name: guest.name,
    email: guest.email,
    phone: guest.phone,
    language: guest.language
  }
})

// NOVO (ISPRAVNO):
return NextResponse.json({
  success: true,
  data: {
    id: guest.id,
    name: guest.full_name,
    email: guest.email,
    phone: guest.phone,
    language: guest.language
  }
})
```


## Component Fixes - Detaljne Izmene

### 1. src/components/admin/ApartmentManager.tsx

**Problem**: Pokušava da renderuje JSONB objekte direktno

**Izmene**:

**Dodati import**:
```typescript
import { LocalizedApartment } from '@/lib/types/database'
```

**Promeniti tip props**:
```typescript
// STARO:
interface ApartmentManagerProps {
  apartments: ApartmentRecord[]
}

// NOVO:
interface ApartmentManagerProps {
  apartments: LocalizedApartment[]
}
```

**Renderovanje**:
```typescript
// STARO (POGREŠNO):
<div>{apartment.name}</div>
// Prikazuje [object Object]

// NOVO (ISPRAVNO):
<div>{apartment.name}</div>
// apartment.name je već lokalizovani string iz API-ja
```

**Napomena**: Komponenta ne treba da menja kod za renderovanje jer će API već vraćati lokalizovane stringove. Samo treba promeniti tip podataka.

### 2. src/components/booking/AvailabilityCalendar.tsx

**Problem**: Pokušava da renderuje JSONB objekte direktno

**Izmene**:

**Dodati import**:
```typescript
import { LocalizedApartment } from '@/lib/types/database'
```

**Promeniti tip props**:
```typescript
// STARO:
interface AvailabilityCalendarProps {
  apartments: ApartmentRecord[]
}

// NOVO:
interface AvailabilityCalendarProps {
  apartments: LocalizedApartment[]
}
```

**Renderovanje**:
```typescript
// STARO (POGREŠNO):
<div>{apartment.name}</div>
// Prikazuje [object Object]

// NOVO (ISPRAVNO):
<div>{apartment.name}</div>
// apartment.name je već lokalizovani string iz API-ja
```

### 3. src/components/admin/StatsCards.tsx

**Problem**: Koristi nepostojeće nazive kolona iz bookings tabele

**Izmene**:

**Ako komponenta direktno pristupa podacima iz baze**:
```typescript
// STARO (POGREŠNO):
const { data: bookings } = await supabase
  .from('bookings')
  .select('id, checkin, checkout, price')

// NOVO (ISPRAVNO):
const { data: bookings } = await supabase
  .from('bookings')
  .select('id, check_in, check_out, total_price')
```

**Renderovanje**:
```typescript
// STARO (POGREŠNO):
<div>Check-in: {booking.checkin}</div>
<div>Price: {booking.price}</div>

// NOVO (ISPRAVNO):
<div>Check-in: {booking.check_in}</div>
<div>Price: {booking.total_price}</div>
```

### 4. src/components/portal/BookingDetails.tsx

**Problem**: Koristi nepostojeće nazive kolona

**Izmene**:

**Ako komponenta direktno pristupa podacima iz baze**:
```typescript
// STARO (POGREŠNO):
const { data: booking } = await supabase
  .from('bookings')
  .select(`
    id,
    checkin,
    checkout,
    price,
    guests (name, email)
  `)

// NOVO (ISPRAVNO):
const { data: booking } = await supabase
  .from('bookings')
  .select(`
    id,
    check_in,
    check_out,
    total_price,
    guests (full_name, email)
  `)
```

**Renderovanje**:
```typescript
// STARO (POGREŠNO):
<div>Guest: {booking.guests.name}</div>
<div>Check-in: {booking.checkin}</div>
<div>Price: {booking.price}</div>

// NOVO (ISPRAVNO):
<div>Guest: {booking.guests.full_name}</div>
<div>Check-in: {booking.check_in}</div>
<div>Price: {booking.total_price}</div>
```


## Migration Strategy - Detaljne Izmene

### Pregled

Migracije MORAJU biti kompletne i pokrivati SVE tabele sa TAČNOM strukturom. Strategija:

1. **Provera Postojećih Migracija**: Identifikovati koje migracije već postoje
2. **Kreiranje Novih Migracija**: Kreirati migracije za tabele koje nedostaju
3. **Ažuriranje Postojećih Migracija**: Ažurirati migracije koje nisu usklađene sa bazom
4. **Testiranje Migracija**: Primeniti migracije na praznu bazu i uporediti sa produkcijskom

### Struktura Migracija

**Direktorijum**: `supabase/migrations/`

**Fajlovi**:
1. `20240101000000_create_base_tables.sql` - Kreira osnovne tabele
2. `20240101000001_create_rls_policies.sql` - Kreira RLS politike
3. `20240101000002_create_functions.sql` - Kreira funkcije i trigere
4. `20240101000003_create_indexes.sql` - Kreira indekse
5. `20240101000004_seed_initial_data.sql` - Seed početni podaci (opciono)

### 1. Create Base Tables Migration

**Fajl**: `supabase/migrations/20240101000000_create_base_tables.sql`

**Sadržaj**:
```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create guests table
CREATE TABLE IF NOT EXISTS guests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  language TEXT DEFAULT 'sr' CHECK (language IN ('sr', 'en', 'de', 'it')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create apartments table
CREATE TABLE IF NOT EXISTS apartments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name JSONB NOT NULL,
  description JSONB NOT NULL,
  bed_type JSONB NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  amenities JSONB NOT NULL DEFAULT '[]'::jsonb,
  base_price_eur DECIMAL(10,2) NOT NULL CHECK (base_price_eur > 0),
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_number TEXT NOT NULL UNIQUE,
  apartment_id UUID NOT NULL REFERENCES apartments(id) ON DELETE RESTRICT,
  guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE RESTRICT,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  nights INTEGER NOT NULL CHECK (nights > 0),
  total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show')),
  options JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT check_dates CHECK (check_out > check_in)
);

-- Create availability table
CREATE TABLE IF NOT EXISTS availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  apartment_id UUID NOT NULL REFERENCES apartments(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  price_override DECIMAL(10,2) CHECK (price_override >= 0),
  reason TEXT,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(apartment_id, date)
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  apartment_id UUID NOT NULL REFERENCES apartments(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  photos JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_at TIMESTAMPTZ,
  language TEXT NOT NULL DEFAULT 'sr' CHECK (language IN ('sr', 'en', 'de', 'it')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create booking_messages table
CREATE TABLE IF NOT EXISTS booking_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('guest', 'admin', 'system')),
  sender_id UUID,
  content TEXT NOT NULL,
  attachments JSONB,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create gallery table
CREATE TABLE IF NOT EXISTS gallery (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url TEXT NOT NULL,
  caption JSONB,
  tags JSONB,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create analytics_events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  event_data JSONB,
  session_id TEXT,
  user_id UUID,
  page_url TEXT,
  referrer TEXT,
  device_type TEXT,
  browser TEXT,
  language TEXT,
  country TEXT,
  city TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create content table
CREATE TABLE IF NOT EXISTS content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  language TEXT NOT NULL CHECK (language IN ('sr', 'en', 'de', 'it')),
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```


### 2. Create RLS Policies Migration

**Fajl**: `supabase/migrations/20240101000001_create_rls_policies.sql`

**Sadržaj**:
```sql
-- Enable RLS on all tables
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE apartments ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;

-- Guests policies
CREATE POLICY "Guests can view their own data"
  ON guests FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Guests can update their own data"
  ON guests FOR UPDATE
  USING (auth.uid() = id);

-- Apartments policies (public read)
CREATE POLICY "Anyone can view active apartments"
  ON apartments FOR SELECT
  USING (status = 'active');

CREATE POLICY "Admins can manage apartments"
  ON apartments FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- Bookings policies
CREATE POLICY "Guests can view their own bookings"
  ON bookings FOR SELECT
  USING (guest_id = auth.uid());

CREATE POLICY "Guests can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (guest_id = auth.uid());

CREATE POLICY "Admins can manage all bookings"
  ON bookings FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- Availability policies (public read)
CREATE POLICY "Anyone can view availability"
  ON availability FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage availability"
  ON availability FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- Reviews policies
CREATE POLICY "Anyone can view approved reviews"
  ON reviews FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Guests can create reviews for their bookings"
  ON reviews FOR INSERT
  WITH CHECK (guest_id = auth.uid());

CREATE POLICY "Admins can manage all reviews"
  ON reviews FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- Booking messages policies
CREATE POLICY "Guests can view messages for their bookings"
  ON booking_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = booking_messages.booking_id
      AND bookings.guest_id = auth.uid()
    )
  );

CREATE POLICY "Guests can send messages for their bookings"
  ON booking_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = booking_messages.booking_id
      AND bookings.guest_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all booking messages"
  ON booking_messages FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- Messages policies
CREATE POLICY "Anyone can create messages"
  ON messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can manage all messages"
  ON messages FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- Gallery policies (public read)
CREATE POLICY "Anyone can view gallery"
  ON gallery FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage gallery"
  ON gallery FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- Analytics events policies
CREATE POLICY "Anyone can create analytics events"
  ON analytics_events FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all analytics events"
  ON analytics_events FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

-- Content policies (public read)
CREATE POLICY "Anyone can view content"
  ON content FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage content"
  ON content FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');
```


### 3. Create Functions and Triggers Migration

**Fajl**: `supabase/migrations/20240101000002_create_functions.sql`

**Sadržaj**:
```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_guests_updated_at
  BEFORE UPDATE ON guests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_apartments_updated_at
  BEFORE UPDATE ON apartments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_availability_updated_at
  BEFORE UPDATE ON availability
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gallery_updated_at
  BEFORE UPDATE ON gallery
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_updated_at
  BEFORE UPDATE ON content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to check apartment availability
CREATE OR REPLACE FUNCTION check_availability(
  apartment_id UUID,
  p_check_in DATE,
  p_check_out DATE
)
RETURNS BOOLEAN AS $$
DECLARE
  conflict_count INTEGER;
BEGIN
  -- Check for overlapping bookings
  SELECT COUNT(*)
  INTO conflict_count
  FROM bookings
  WHERE bookings.apartment_id = check_availability.apartment_id
    AND bookings.status NOT IN ('cancelled', 'no_show')
    AND (
      (bookings.check_in <= p_check_in AND bookings.check_out > p_check_in)
      OR (bookings.check_in < p_check_out AND bookings.check_out >= p_check_out)
      OR (bookings.check_in >= p_check_in AND bookings.check_out <= p_check_out)
    );
  
  RETURN conflict_count = 0;
END;
$$ LANGUAGE plpgsql;

-- Function to get available apartments for date range
CREATE OR REPLACE FUNCTION get_available_apartments(
  checkin DATE,
  checkout DATE
)
RETURNS TABLE (
  id UUID,
  name JSONB,
  description JSONB,
  bed_type JSONB,
  capacity INTEGER,
  amenities JSONB,
  base_price_eur DECIMAL(10,2),
  images JSONB,
  status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.name,
    a.description,
    a.bed_type,
    a.capacity,
    a.amenities,
    a.base_price_eur,
    a.images,
    a.status
  FROM apartments a
  WHERE a.status = 'active'
    AND check_availability(a.id, checkin, checkout) = true
  ORDER BY a.display_order, a.name->>'sr';
END;
$$ LANGUAGE plpgsql;

-- Function to calculate booking nights
CREATE OR REPLACE FUNCTION calculate_nights()
RETURNS TRIGGER AS $$
BEGIN
  NEW.nights = NEW.check_out - NEW.check_in;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate nights
CREATE TRIGGER calculate_booking_nights
  BEFORE INSERT OR UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION calculate_nights();

-- Function to generate booking number
CREATE OR REPLACE FUNCTION generate_booking_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.booking_number IS NULL THEN
    NEW.booking_number = 'BJ-' || EXTRACT(YEAR FROM NOW()) || '-' || 
                         UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate booking number
CREATE TRIGGER generate_booking_number_trigger
  BEFORE INSERT ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION generate_booking_number();

-- Function to sync availability with bookings
CREATE OR REPLACE FUNCTION sync_availability_on_booking()
RETURNS TRIGGER AS $$
DECLARE
  current_date DATE;
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- Mark dates as unavailable
    current_date := NEW.check_in;
    WHILE current_date < NEW.check_out LOOP
      INSERT INTO availability (apartment_id, date, is_available, booking_id)
      VALUES (NEW.apartment_id, current_date, false, NEW.id)
      ON CONFLICT (apartment_id, date) 
      DO UPDATE SET is_available = false, booking_id = NEW.id;
      
      current_date := current_date + 1;
    END LOOP;
  END IF;
  
  IF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND NEW.status IN ('cancelled', 'no_show')) THEN
    -- Mark dates as available again
    UPDATE availability
    SET is_available = true, booking_id = NULL
    WHERE booking_id = OLD.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to sync availability
CREATE TRIGGER sync_availability_trigger
  AFTER INSERT OR UPDATE OR DELETE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION sync_availability_on_booking();
```


### 4. Create Indexes Migration

**Fajl**: `supabase/migrations/20240101000003_create_indexes.sql`

**Sadržaj**:
```sql
-- Guests indexes
CREATE INDEX IF NOT EXISTS idx_guests_email ON guests(email);
CREATE INDEX IF NOT EXISTS idx_guests_language ON guests(language);

-- Apartments indexes
CREATE INDEX IF NOT EXISTS idx_apartments_status ON apartments(status);
CREATE INDEX IF NOT EXISTS idx_apartments_display_order ON apartments(display_order);

-- Bookings indexes
CREATE INDEX IF NOT EXISTS idx_bookings_apartment_id ON bookings(apartment_id);
CREATE INDEX IF NOT EXISTS idx_bookings_guest_id ON bookings(guest_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_check_in ON bookings(check_in);
CREATE INDEX IF NOT EXISTS idx_bookings_check_out ON bookings(check_out);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_number ON bookings(booking_number);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(check_in, check_out);

-- Availability indexes
CREATE INDEX IF NOT EXISTS idx_availability_apartment_id ON availability(apartment_id);
CREATE INDEX IF NOT EXISTS idx_availability_date ON availability(date);
CREATE INDEX IF NOT EXISTS idx_availability_booking_id ON availability(booking_id);
CREATE INDEX IF NOT EXISTS idx_availability_is_available ON availability(is_available);

-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_reviews_booking_id ON reviews(booking_id);
CREATE INDEX IF NOT EXISTS idx_reviews_guest_id ON reviews(guest_id);
CREATE INDEX IF NOT EXISTS idx_reviews_apartment_id ON reviews(apartment_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

-- Booking messages indexes
CREATE INDEX IF NOT EXISTS idx_booking_messages_booking_id ON booking_messages(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_messages_sender_type ON booking_messages(sender_type);
CREATE INDEX IF NOT EXISTS idx_booking_messages_read_at ON booking_messages(read_at);

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_email ON messages(email);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Gallery indexes
CREATE INDEX IF NOT EXISTS idx_gallery_display_order ON gallery(display_order);

-- Analytics events indexes
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);

-- Content indexes
CREATE INDEX IF NOT EXISTS idx_content_key ON content(key);
CREATE INDEX IF NOT EXISTS idx_content_language ON content(language);
```

### Testiranje Migracija

**Proces**:

1. **Kreirati Test Bazu**:
```bash
# Kreirati novu Supabase instancu za testiranje
supabase init
supabase start
```

2. **Primeniti Migracije**:
```bash
# Primeniti sve migracije
supabase db reset
```

3. **Uporediti Strukturu**:
```sql
-- Izvući strukturu test baze
pg_dump --schema-only test_db > test_schema.sql

-- Izvući strukturu produkcijske baze
pg_dump --schema-only prod_db > prod_schema.sql

-- Uporediti
diff test_schema.sql prod_schema.sql
```

4. **Validacija**:
- Proveriti da sve tabele postoje
- Proveriti da sve kolone imaju ispravne tipove
- Proveriti da svi constraints postoje
- Proveriti da svi indeksi postoje
- Proveriti da sve RLS politike postoje
- Proveriti da sve funkcije i trigeri postoje


## Testing Strategy

### Validation Approach

Strategija testiranja prati tri faze:

1. **Exploratory Testing**: Testiranje na NEPOPRAVLJENOM kodu da se potvrdi postojanje baga
2. **Fix Verification**: Testiranje nakon popravke da se potvrdi da bug više ne postoji
3. **Preservation Testing**: Testiranje da se potvrdi da postojeća funkcionalnost nije narušena

### Exploratory Fault Condition Checking

**Cilj**: Potvrditi da bugovi postoje PRE implementacije popravke.

**Test Plan**: Napisati testove koji demonstriraju svaki bug iz requirements dokumenta. Pokrenuti testove na NEPOPRAVLJENOM kodu i očekivati da testovi PADNU.

**Test Cases**:

1. **TypeScript Compilation Test**: Pokušati da kompajlujemo projekat i očekivati greške za nepostojeće tipove
   ```typescript
   // Očekivano: TypeScript greška jer GuestRecord ne postoji
   const guest: GuestRecord = { ... }
   ```

2. **API Column Name Test**: Pokušati da selektujemo nepostojeće kolone
   ```typescript
   // Očekivano: Vraća null za type i price_per_night
   const { data } = await supabase
     .from('apartments')
     .select('type, price_per_night')
   ```

3. **JSONB Rendering Test**: Pokušati da renderujemo JSONB objekat
   ```typescript
   // Očekivano: Prikazuje [object Object]
   <div>{apartment.name}</div>
   ```

4. **Guest Name Column Test**: Pokušati da kreiramo gosta sa 'name' kolonom
   ```typescript
   // Očekivano: Greška jer kolona 'name' ne postoji
   await supabase.from('guests').insert({ name: 'John', email: 'john@example.com' })
   ```

**Expected Counterexamples**:
- TypeScript ne kompajluje zbog nedostajućih tipova
- API rute vraćaju null vrednosti za nepostojeće kolone
- Komponente prikazuju [object Object] umesto stringova
- Database operacije vraćaju greške za nepostojeće kolone

### Fix Checking

**Cilj**: Verifikovati da za SVE slučajeve gde bug postoji, popravljen kod proizvodi očekivano ponašanje.

**Pseudocode:**
```
FOR ALL operation WHERE isBugCondition(operation) DO
  result := executeOperation_fixed(operation)
  ASSERT expectedBehavior(result)
END FOR
```

**Test Plan**: Nakon implementacije popravke, pokrenuti iste testove i očekivati da svi PROĐU.

**Test Cases**:

1. **TypeScript Types Test**:
   ```typescript
   // Test: Svi tipovi postoje i kompajluju se
   const guest: GuestRecord = {
     id: '123',
     full_name: 'John Doe',
     email: 'john@example.com',
     phone: null,
     language: 'sr',
     created_at: new Date().toISOString(),
     updated_at: new Date().toISOString()
   }
   // Očekivano: Kompajluje se bez greške
   ```

2. **API Column Names Test**:
   ```typescript
   // Test: API rute koriste ispravne nazive kolona
   const { data } = await supabase
     .from('apartments')
     .select('id, name, base_price_eur, capacity')
   
   expect(data[0].base_price_eur).toBeDefined()
   expect(data[0].base_price_eur).toBeGreaterThan(0)
   ```

3. **JSONB Transformation Test**:
   ```typescript
   // Test: API vraća lokalizovane stringove
   const response = await fetch('/api/availability?checkIn=2024-01-01&checkOut=2024-01-02')
   const { data } = await response.json()
   
   expect(typeof data.apartments[0].name).toBe('string')
   expect(data.apartments[0].name).not.toContain('[object Object]')
   ```

4. **Guest Creation Test**:
   ```typescript
   // Test: Kreiranje gosta sa full_name kolonom
   const { data, error } = await supabase
     .from('guests')
     .insert({ full_name: 'John Doe', email: 'john@example.com' })
   
   expect(error).toBeNull()
   expect(data).toBeDefined()
   ```

### Preservation Checking

**Cilj**: Verifikovati da za SVE slučajeve gde bug NE postoji, popravljen kod proizvodi IDENTIČNO ponašanje kao originalni kod.

**Pseudocode:**
```
FOR ALL operation WHERE NOT isBugCondition(operation) DO
  ASSERT executeOperation_original(operation) = executeOperation_fixed(operation)
END FOR
```

**Testing Approach**: Property-based testing je preporučen za preservation checking jer:
- Automatski generiše mnogo test slučajeva
- Pokriva edge case-ove koje ručni testovi mogu propustiti
- Pruža jake garancije da ponašanje nije promenjeno

**Test Plan**: Napisati property-based testove koji generišu random podatke i verifikuju da postojeća funkcionalnost radi identično.

**Test Cases**:

1. **Booking Creation Preservation**:
   ```typescript
   // Property: Kreiranje rezervacije sa validnim podacima MORA raditi identično
   property('booking creation works for valid data', 
     arbitraryValidBookingData(),
     async (bookingData) => {
       const result = await createBooking(bookingData)
       expect(result.booking).toBeDefined()
       expect(result.error).toBeUndefined()
     }
   )
   ```

2. **Apartment Listing Preservation**:
   ```typescript
   // Property: Listanje apartmana MORA vraćati iste podatke (sa ispravnim formatiranjem)
   property('apartment listing returns all apartments',
     async () => {
       const { data } = await fetch('/api/admin/apartments').then(r => r.json())
       expect(data.length).toBeGreaterThan(0)
       expect(data[0]).toHaveProperty('id')
       expect(data[0]).toHaveProperty('name')
       expect(typeof data[0].name).toBe('string')
     }
   )
   ```

3. **Stats Calculation Preservation**:
   ```typescript
   // Property: Kalkulacija statistika MORA vraćati iste vrednosti
   property('stats calculation is preserved',
     async () => {
       const { data } = await fetch('/api/admin/stats').then(r => r.json())
       expect(data.totalBookings).toBeGreaterThanOrEqual(0)
       expect(data.totalRevenue).toBeGreaterThanOrEqual(0)
     }
   )
   ```

4. **Migration Data Preservation**:
   ```sql
   -- Test: Podaci ostaju netaknuti nakon migracija
   -- Pre migracije: izvući sve podatke
   SELECT * FROM guests ORDER BY id;
   SELECT * FROM bookings ORDER BY id;
   
   -- Primeniti migracije
   -- Nakon migracije: uporediti podatke
   SELECT * FROM guests ORDER BY id;
   SELECT * FROM bookings ORDER BY id;
   
   -- Očekivano: Identični podaci
   ```


### Unit Tests

**Lokacija**: `__tests__/unit/`

**Test Fajlovi**:

1. **database-types.test.ts**: Testiranje TypeScript tipova
   ```typescript
   describe('Database Types', () => {
     it('should have GuestRecord type with correct fields', () => {
       const guest: GuestRecord = {
         id: '123',
         full_name: 'John Doe',
         email: 'john@example.com',
         phone: null,
         language: 'sr',
         created_at: new Date().toISOString(),
         updated_at: new Date().toISOString()
       }
       expect(guest.full_name).toBe('John Doe')
     })
     
     it('should have BookingRecord type with correct fields', () => {
       const booking: BookingRecord = {
         id: '123',
         booking_number: 'BJ-2024-ABCD',
         apartment_id: '456',
         guest_id: '789',
         check_in: '2024-01-01',
         check_out: '2024-01-02',
         nights: 1,
         total_price: 100,
         status: 'pending',
         options: null,
         created_at: new Date().toISOString(),
         updated_at: new Date().toISOString()
       }
       expect(booking.check_in).toBe('2024-01-01')
     })
   })
   ```

2. **transformers.test.ts**: Testiranje transformer funkcija
   ```typescript
   describe('Transformer Functions', () => {
     it('should transform ApartmentRecord to LocalizedApartment', () => {
       const record: ApartmentRecord = {
         id: '123',
         name: { sr: 'Apartman 1', en: 'Apartment 1', de: 'Wohnung 1', it: 'Appartamento 1' },
         description: { sr: 'Opis', en: 'Description', de: 'Beschreibung', it: 'Descrizione' },
         bed_type: { sr: 'Bračni krevet', en: 'Double bed', de: 'Doppelbett', it: 'Letto matrimoniale' },
         capacity: 2,
         amenities: [
           { sr: 'WiFi', en: 'WiFi', de: 'WiFi', it: 'WiFi' }
         ],
         base_price_eur: 50,
         images: [{ url: 'https://example.com/image.jpg', alt: { sr: 'Slika', en: 'Image', de: 'Bild', it: 'Immagine' } }],
         status: 'active',
         display_order: 0,
         created_at: new Date().toISOString(),
         updated_at: new Date().toISOString()
       }
       
       const localized = transformApartmentRecord(record, 'sr')
       
       expect(localized.name).toBe('Apartman 1')
       expect(localized.description).toBe('Opis')
       expect(localized.bed_type).toBe('Bračni krevet')
       expect(localized.amenities).toEqual(['WiFi'])
       expect(localized.images).toEqual(['https://example.com/image.jpg'])
     })
   })
   ```

3. **api-column-names.test.ts**: Testiranje ispravnih naziva kolona u API rutama
   ```typescript
   describe('API Column Names', () => {
     it('should use base_price_eur instead of price_per_night', async () => {
       const { data } = await supabase
         .from('apartments')
         .select('id, base_price_eur')
         .limit(1)
         .single()
       
       expect(data.base_price_eur).toBeDefined()
       expect(typeof data.base_price_eur).toBe('number')
     })
     
     it('should use full_name instead of name in guests', async () => {
       const { data } = await supabase
         .from('guests')
         .select('id, full_name')
         .limit(1)
         .single()
       
       expect(data.full_name).toBeDefined()
       expect(typeof data.full_name).toBe('string')
     })
   })
   ```

### Property-Based Tests

**Lokacija**: `__tests__/property/`

**Test Fajlovi**:

1. **apartment-transformation.property.test.ts**: PBT za transformaciju apartmana
   ```typescript
   import fc from 'fast-check'
   
   describe('Apartment Transformation Properties', () => {
     it('should always return localized strings for any valid apartment record', () => {
       fc.assert(
         fc.property(
           fc.record({
             id: fc.uuid(),
             name: fc.record({ sr: fc.string(), en: fc.string(), de: fc.string(), it: fc.string() }),
             description: fc.record({ sr: fc.string(), en: fc.string(), de: fc.string(), it: fc.string() }),
             bed_type: fc.record({ sr: fc.string(), en: fc.string(), de: fc.string(), it: fc.string() }),
             capacity: fc.integer({ min: 1, max: 10 }),
             amenities: fc.array(fc.record({ sr: fc.string(), en: fc.string(), de: fc.string(), it: fc.string() })),
             base_price_eur: fc.double({ min: 10, max: 500 }),
             images: fc.array(fc.record({ url: fc.webUrl(), alt: fc.record({ sr: fc.string(), en: fc.string(), de: fc.string(), it: fc.string() }) })),
             status: fc.constantFrom('active', 'inactive', 'maintenance'),
             display_order: fc.integer({ min: 0, max: 100 }),
             created_at: fc.date().map(d => d.toISOString()),
             updated_at: fc.date().map(d => d.toISOString())
           }),
           fc.constantFrom('sr', 'en', 'de', 'it'),
           (record, locale) => {
             const localized = transformApartmentRecord(record, locale)
             
             // Property: name is always a string
             expect(typeof localized.name).toBe('string')
             
             // Property: amenities is always an array of strings
             expect(Array.isArray(localized.amenities)).toBe(true)
             localized.amenities.forEach(amenity => {
               expect(typeof amenity).toBe('string')
             })
             
             // Property: images is always an array of strings (URLs)
             expect(Array.isArray(localized.images)).toBe(true)
             localized.images.forEach(image => {
               expect(typeof image).toBe('string')
             })
           }
         )
       )
     })
   })
   ```

2. **booking-preservation.property.test.ts**: PBT za preservation booking funkcionalnosti
   ```typescript
   describe('Booking Preservation Properties', () => {
     it('should preserve booking creation for valid data', () => {
       fc.assert(
         fc.property(
           fc.record({
             apartmentId: fc.uuid(),
             guest: fc.record({
               name: fc.string({ minLength: 1 }),
               email: fc.emailAddress(),
               phone: fc.option(fc.string())
             }),
             checkIn: fc.date({ min: new Date() }).map(d => d.toISOString().split('T')[0]),
             checkOut: fc.date({ min: new Date(Date.now() + 86400000) }).map(d => d.toISOString().split('T')[0]),
             options: fc.option(fc.record({
               crib: fc.boolean(),
               parking: fc.boolean(),
               earlyCheckIn: fc.boolean(),
               lateCheckOut: fc.boolean()
             }))
           }),
           async (bookingData) => {
             const result = await createBooking(bookingData)
             
             // Property: Valid booking data should always succeed
             if (result.error) {
               // Only acceptable errors are availability issues
               expect(result.error).toContain('not available')
             } else {
               expect(result.booking).toBeDefined()
               expect(result.booking.guestName).toBe(bookingData.guest.name)
             }
           }
         )
       )
     })
   })
   ```

### Integration Tests

**Lokacija**: `__tests__/integration/`

**Test Fajlovi**:

1. **full-booking-flow.test.ts**: Test kompletnog booking flow-a
   ```typescript
   describe('Full Booking Flow Integration', () => {
     it('should complete full booking flow with correct data', async () => {
       // 1. Check availability
       const availabilityResponse = await fetch('/api/availability?checkIn=2024-06-01&checkOut=2024-06-02')
       const { data: availability } = await availabilityResponse.json()
       
       expect(availability.apartments.length).toBeGreaterThan(0)
       expect(typeof availability.apartments[0].name).toBe('string')
       expect(availability.apartments[0].base_price_eur).toBeDefined()
       
       // 2. Create booking
       const bookingResponse = await fetch('/api/booking', {
         method: 'POST',
         body: JSON.stringify({
           apartmentId: availability.apartments[0].id,
           guest: {
             name: 'John Doe',
             email: 'john@example.com',
             phone: '+381123456789'
           },
           checkIn: '2024-06-01',
           checkOut: '2024-06-02'
         })
       })
       const { data: booking } = await bookingResponse.json()
       
       expect(booking.id).toBeDefined()
       expect(booking.guestName).toBe('John Doe')
       expect(booking.apartmentName).toBe(availability.apartments[0].name)
       
       // 3. Verify booking in database
       const { data: dbBooking } = await supabase
         .from('bookings')
         .select('*, guests(full_name), apartments(name)')
         .eq('id', booking.id)
         .single()
       
       expect(dbBooking.guests.full_name).toBe('John Doe')
       expect(dbBooking.check_in).toBe('2024-06-01')
       expect(dbBooking.check_out).toBe('2024-06-02')
     })
   })
   ```

2. **admin-panel-integration.test.ts**: Test admin panela sa ispravnim podacima
   ```typescript
   describe('Admin Panel Integration', () => {
     it('should display stats with correct data', async () => {
       const response = await fetch('/api/admin/stats')
       const { data } = await response.json()
       
       expect(data.totalBookings).toBeGreaterThanOrEqual(0)
       expect(data.totalRevenue).toBeGreaterThanOrEqual(0)
       expect(data.occupancyRate).toBeGreaterThanOrEqual(0)
       expect(data.occupancyRate).toBeLessThanOrEqual(100)
     })
     
     it('should list apartments with localized data', async () => {
       const response = await fetch('/api/admin/apartments', {
         headers: { 'Accept-Language': 'sr' }
       })
       const { data } = await response.json()
       
       expect(data.length).toBeGreaterThan(0)
       expect(typeof data[0].name).toBe('string')
       expect(data[0].name).not.toContain('[object Object]')
       expect(data[0].base_price_eur).toBeDefined()
     })
   })
   ```

3. **migration-integrity.test.ts**: Test integriteta migracija
   ```typescript
   describe('Migration Integrity', () => {
     it('should have all required tables', async () => {
       const { data: tables } = await supabase.rpc('get_tables')
       
       const requiredTables = [
         'guests', 'apartments', 'bookings', 'availability',
         'reviews', 'booking_messages', 'messages', 'gallery',
         'analytics_events', 'content'
       ]
       
       requiredTables.forEach(table => {
         expect(tables).toContain(table)
       })
     })
     
     it('should have correct column names in all tables', async () => {
       // Check guests table
       const { data: guestColumns } = await supabase.rpc('get_columns', { table_name: 'guests' })
       expect(guestColumns).toContain('full_name')
       expect(guestColumns).not.toContain('name')
       
       // Check apartments table
       const { data: apartmentColumns } = await supabase.rpc('get_columns', { table_name: 'apartments' })
       expect(apartmentColumns).toContain('base_price_eur')
       expect(apartmentColumns).not.toContain('price_per_night')
       expect(apartmentColumns).not.toContain('type')
       
       // Check bookings table
       const { data: bookingColumns } = await supabase.rpc('get_columns', { table_name: 'bookings' })
       expect(bookingColumns).toContain('check_in')
       expect(bookingColumns).toContain('check_out')
       expect(bookingColumns).toContain('nights')
       expect(bookingColumns).toContain('booking_number')
     })
   })
   ```


## Implementation Plan - Redosled Izvršavanja

### Faza 1: TypeScript Tipovi (Prioritet: VISOK)

**Cilj**: Kreirati TypeScript tipove za SVE tabele

**Zadaci**:
1. Ažurirati `src/lib/types/database.ts` sa svim tipovima
2. Promeniti `ApartmentRecord` da koristi `Json` tip umesto direktnih interfejsa
3. Dodati `GuestRecord`, `BookingRecord`, `AvailabilityRecord`, `ReviewRecord`, `BookingMessageRecord`, `MessageRecord`, `GalleryRecord`, `AnalyticsEventRecord`
4. Kompajlirati projekat i proveriti da nema TypeScript grešaka

**Zavisnosti**: Nema

**Trajanje**: 2-3 sata

### Faza 2: Transformer Functions (Prioritet: VISOK)

**Cilj**: Implementirati transformer funkcije za JSONB podatke

**Zadaci**:
1. Kreirati `src/lib/transformers/database.ts` fajl
2. Implementirati `transformApartmentRecord()`
3. Implementirati `transformBookingRecord()`
4. Implementirati `transformReviewRecord()`
5. Implementirati `reverseTransformApartmentData()`
6. Napisati unit testove za sve transformer funkcije

**Zavisnosti**: Faza 1 (TypeScript tipovi)

**Trajanje**: 3-4 sata

### Faza 3: API Route Fixes (Prioritet: KRITIČAN)

**Cilj**: Popraviti SVE API rute da koriste ispravne nazive kolona i transformer funkcije

**Zadaci**:
1. Popraviti `src/app/api/availability/route.ts`
2. Popraviti `src/lib/bookings/service.ts`
3. Popraviti `src/hooks/useAvailability.ts`
4. Popraviti `src/app/api/admin/apartments/[id]/route.ts`
5. Popraviti `src/app/api/portal/profile/route.ts`
6. Testirati sve API rute

**Zavisnosti**: Faza 1 (TypeScript tipovi), Faza 2 (Transformer funkcije)

**Trajanje**: 4-6 sati

### Faza 4: Component Fixes (Prioritet: SREDNJI)

**Cilj**: Ažurirati komponente da koriste ispravne tipove i lokalizovane podatke

**Zadaci**:
1. Ažurirati `src/components/admin/ApartmentManager.tsx`
2. Ažurirati `src/components/booking/AvailabilityCalendar.tsx`
3. Ažurirati `src/components/admin/StatsCards.tsx`
4. Ažurirati `src/components/portal/BookingDetails.tsx`
5. Testirati sve komponente

**Zavisnosti**: Faza 3 (API route fixes)

**Trajanje**: 2-3 sata

### Faza 5: Migracije (Prioritet: VISOK)

**Cilj**: Kreirati kompletne migracije za SVE tabele

**Zadaci**:
1. Kreirati `20240101000000_create_base_tables.sql`
2. Kreirati `20240101000001_create_rls_policies.sql`
3. Kreirati `20240101000002_create_functions.sql`
4. Kreirati `20240101000003_create_indexes.sql`
5. Testirati migracije na test bazi
6. Uporediti strukturu test baze sa produkcijskom

**Zavisnosti**: Nema (može se raditi paralelno sa Fazom 1-4)

**Trajanje**: 4-5 sati

### Faza 6: Testing (Prioritet: VISOK)

**Cilj**: Napisati i pokrenuti SVE testove

**Zadaci**:
1. Napisati unit testove za TypeScript tipove
2. Napisati unit testove za transformer funkcije
3. Napisati unit testove za API rute
4. Napisati property-based testove
5. Napisati integration testove
6. Pokrenuti sve testove i osigurati da svi prolaze

**Zavisnosti**: Faza 1-5 (sve prethodne faze)

**Trajanje**: 6-8 sati

### Faza 7: Dokumentacija i Validacija (Prioritet: SREDNJI)

**Cilj**: Dokumentovati izmene i validirati da sve radi

**Zadaci**:
1. Ažurirati README.md sa novim tipovima i transformer funkcijama
2. Kreirati migration guide za deployment
3. Validirati da sve API rute vraćaju ispravne podatke
4. Validirati da sve komponente prikazuju ispravne podatke
5. Validirati da migracije rade na produkciji

**Zavisnosti**: Faza 1-6 (sve prethodne faze)

**Trajanje**: 2-3 sata

### Ukupno Trajanje

**Optimistično**: 23 sata (3 radna dana)
**Realistično**: 31 sat (4 radna dana)
**Pesimistično**: 39 sati (5 radnih dana)

### Kritični Put

Faza 1 → Faza 2 → Faza 3 → Faza 4 → Faza 6 → Faza 7

Faza 5 (Migracije) može se raditi paralelno sa Fazom 1-4.


## Rizici i Mitigacije

### Rizik 1: Breaking Changes u Produkciji

**Opis**: Izmene u API rutama mogu pokvariti postojeću funkcionalnost u produkciji.

**Verovatnoća**: Srednja

**Uticaj**: Visok

**Mitigacija**:
- Pisati preservation testove PRE implementacije izmena
- Testirati sve izmene na staging okruženju
- Implementirati feature flags za postepeno uvođenje izmena
- Imati rollback plan

### Rizik 2: Neusklađenost Migracija sa Produkcijskom Bazom

**Opis**: Migracije mogu kreirati strukturu koja nije identična produkcijskoj bazi.

**Verovatnoća**: Srednja

**Uticaj**: Visok

**Mitigacija**:
- Izvući trenutnu strukturu produkcijske baze pre kreiranja migracija
- Testirati migracije na kopiji produkcijske baze
- Uporediti strukturu nakon migracija sa produkcijskom
- Kreirati backup produkcijske baze pre primene migracija

### Rizik 3: Gubitak Podataka Tokom Migracija

**Opis**: Primena migracija može dovesti do gubitka podataka.

**Verovatnoća**: Niska

**Uticaj**: Kritičan

**Mitigacija**:
- Kreirati full backup produkcijske baze pre migracija
- Testirati migracije na kopiji produkcijske baze sa stvarnim podacima
- Koristiti transakcije za sve migracije
- Imati rollback plan

### Rizik 4: Performance Degradacija

**Opis**: Transformer funkcije mogu usporiti API rute.

**Verovatnoća**: Niska

**Uticaj**: Srednji

**Mitigacija**:
- Meriti performance pre i nakon izmena
- Optimizovati transformer funkcije
- Koristiti caching gde je moguće
- Implementirati pagination za velike liste

### Rizik 5: TypeScript Compilation Errors

**Opis**: Izmene u tipovima mogu dovesti do compilation errors u drugim delovima projekta.

**Verovatnoća**: Srednja

**Uticaj**: Srednji

**Mitigacija**:
- Kompajlirati projekat nakon svake izmene
- Koristiti TypeScript strict mode
- Pisati unit testove za tipove
- Koristiti IDE sa TypeScript podrškom

### Rizik 6: Nedostajući Edge Cases

**Opis**: Testovi mogu propustiti edge case-ove koji postoje u produkciji.

**Verovatnoća**: Srednja

**Uticaj**: Srednji

**Mitigacija**:
- Koristiti property-based testing
- Analizirati produkcijske logove za edge case-ove
- Testirati sa stvarnim podacima iz produkcije
- Implementirati monitoring i alerting

## Deployment Plan

### Pre-Deployment Checklist

- [ ] Svi unit testovi prolaze
- [ ] Svi integration testovi prolaze
- [ ] Svi property-based testovi prolaze
- [ ] TypeScript kompajlira bez grešaka
- [ ] Migracije testirane na kopiji produkcijske baze
- [ ] Performance testovi pokazuju prihvatljive rezultate
- [ ] Dokumentacija ažurirana
- [ ] Backup produkcijske baze kreiran
- [ ] Rollback plan pripremljen

### Deployment Steps

1. **Kreirati Backup**:
   ```bash
   # Kreirati full backup produkcijske baze
   pg_dump -h [host] -U [user] -d [database] > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **Primeniti Migracije**:
   ```bash
   # Primeniti migracije na produkcijsku bazu
   supabase db push
   ```

3. **Deploy Backend**:
   ```bash
   # Deploy API rute i transformer funkcije
   git push production main
   ```

4. **Verifikacija**:
   ```bash
   # Pokrenuti smoke testove na produkciji
   npm run test:smoke:production
   ```

5. **Monitoring**:
   - Pratiti error rate u Sentry/LogRocket
   - Pratiti API response times
   - Pratiti database query performance
   - Pratiti user feedback

### Rollback Plan

Ako se detektuju problemi:

1. **Rollback Backend**:
   ```bash
   # Vratiti na prethodnu verziju
   git revert HEAD
   git push production main
   ```

2. **Rollback Migracije** (samo ako je neophodno):
   ```bash
   # Restore backup
   psql -h [host] -U [user] -d [database] < backup_[timestamp].sql
   ```

3. **Verifikacija**:
   - Proveriti da aplikacija radi
   - Proveriti da podaci nisu izgubljeni
   - Analizirati šta je pošlo po zlu

## Zaključak

Ovaj design dokument definiše sveobuhvatno rešenje za postizanje 100% identičnosti između Supabase baze podataka i TypeScript projekta. Implementacija će:

1. **Kreirati TypeScript tipove za SVE tabele** - omogućava compile-time detekciju grešaka
2. **Popraviti SVE API rute** - koristi ispravne nazive kolona i transformer funkcije
3. **Implementirati transformer layer** - transformiše JSONB podatke u lokalizovane stringove
4. **Ažurirati SVE komponente** - koristi lokalizovane podatke umesto JSONB objekata
5. **Kreirati kompletne migracije** - osigurava reproducibilnost strukture baze

Strategija je dizajnirana da minimizuje rizik, osigurava preservation postojeće funkcionalnosti, i omogućava postepeno uvođenje izmena sa mogućnošću rollback-a.

