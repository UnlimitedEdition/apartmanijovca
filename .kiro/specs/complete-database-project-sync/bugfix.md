# Bugfix Requirements Document: Kompletna Usklađenost Baze Podataka i Projekta

## Uvod

Projekat Apartmani Jovča (Next.js + Supabase) ima **kritičnu neusklađenost** između Supabase baze podataka i TypeScript projekta. Trenutno stanje:

- **Baza podataka**: 10 tabela sa precizno definisanom strukturom (JSONB kolone, multi-language polja, constraints)
- **TypeScript tipovi**: Samo 2 tabele pokrivene (`apartments` i `content`), 8 tabela nedostaje
- **API rute**: Koriste **nepostojeće nazive kolona** (`name_sr`, `price_per_night`, `type`)
- **Komponente**: Pokušavaju da renderuju JSONB objekte direktno bez transformacije

**Uticaj baga**: Aplikacija ne može da radi jer API rute vraćaju `null` vrednosti, komponente ne mogu da prikažu podatke, TypeScript ne detektuje greške u compile-time.

**Cilj**: Postići **100% identičnost** između baze podataka, TypeScript tipova, API ruta i komponenti. SVAKA izmena MORA biti podržana migracijama.

## Analiza Baga

### Trenutno Ponašanje (Defekt)

#### 1. TypeScript Tipovi - Nedostajuće Definicije

1.1 KADA projekat koristi tabelu `guests` TADA TypeScript tip za `guests` NE POSTOJI i kompajler ne detektuje greške

1.2 KADA projekat koristi tabelu `bookings` TADA TypeScript tip za `bookings` NE POSTOJI i kompajler ne detektuje greške

1.3 KADA projekat koristi tabelu `availability` TADA TypeScript tip za `availability` NE POSTOJI i kompajler ne detektuje greške

1.4 KADA projekat koristi tabelu `reviews` TADA TypeScript tip za `reviews` NE POSTOJI i kompajler ne detektuje greške

1.5 KADA projekat koristi tabelu `booking_messages` TADA TypeScript tip za `booking_messages` NE POSTOJI i kompajler ne detektuje greške

1.6 KADA projekat koristi tabelu `messages` TADA TypeScript tip za `messages` NE POSTOJI i kompajler ne detektuje greške

1.7 KADA projekat koristi tabelu `gallery` TADA TypeScript tip za `gallery` NE POSTOJI i kompajler ne detektuje greške

1.8 KADA projekat koristi tabelu `analytics_events` TADA TypeScript tip za `analytics_events` NE POSTOJI i kompajler ne detektuje greške

#### 2. TypeScript Tipovi - Pogrešni Tipovi za Postojeće Tabele

1.9 KADA `ApartmentRecord` definiše `amenities: string[]` TADA to NE ODGOVARA bazi gde je `amenities: jsonb[]`

1.10 KADA `ApartmentRecord` definiše `images: string[]` TADA to NE ODGOVARA bazi gde je `images: jsonb[]`

1.11 KADA `ApartmentRecord` ne definiše `display_order` TADA nedostaje kolona koja postoji u bazi

#### 3. API Rute - Pogrešni Nazivi Kolona (apartments)

1.12 KADA API ruta `src/app/api/availability/route.ts` koristi `.select('id, name, type, capacity, price_per_night, bed_type')` TADA kolone `type` i `price_per_night` NE POSTOJE u bazi (ispravno: `base_price_eur`)

1.13 KADA API ruta `src/app/api/availability/route.ts` koristi `.select('id, name, type, capacity, price_per_night')` TADA kolone `type` i `price_per_night` NE POSTOJE u bazi

1.14 KADA API ruta `src/lib/bookings/service.ts` koristi `.select('id, name, price_per_night')` TADA kolona `price_per_night` NE POSTOJI u bazi (ispravno: `base_price_eur`)

1.15 KADA API ruta `src/lib/bookings/service.ts` koristi `.select('id, name, name_sr, name_de, name_it')` TADA kolone `name_sr`, `name_de`, `name_it` NE POSTOJE u bazi (ispravno: `name` je JSONB objekat sa `{sr, en, de, it}`)

1.16 KADA API ruta `src/hooks/useAvailability.ts` koristi `.select('*')` na `apartments` TADA vraća JSONB objekte koje komponente ne mogu da renderuju direktno

1.17 KADA API ruta `src/app/api/admin/apartments/[id]/route.ts` koristi `.select('id, name, price_per_night')` TADA kolona `price_per_night` NE POSTOJI u bazi

#### 4. API Rute - Pogrešni Nazivi Kolona (guests)

1.18 KADA API ruta `src/lib/bookings/service.ts` koristi `.select('id, name, phone')` TADA kolona `name` NE POSTOJI u bazi (ispravno: `full_name`)

1.19 KADA API ruta `src/lib/bookings/service.ts` koristi `.update({ name, phone })` TADA kolona `name` NE POSTOJI u bazi (ispravno: `full_name`)

1.20 KADA API ruta `src/lib/bookings/service.ts` koristi `.insert({ name, email, phone })` TADA kolona `name` NE POSTOJI u bazi (ispravno: `full_name`)

1.21 KADA API ruta `src/lib/bookings/service.ts` koristi `.select('id, name, email, phone, language')` TADA kolona `name` NE POSTOJI u bazi (ispravno: `full_name`)

1.22 KADA API ruta `src/app/api/portal/profile/route.ts` koristi `.update(updateData)` sa `name` TADA kolona `name` NE POSTOJI u bazi (ispravno: `full_name`)

#### 5. API Rute - Nedostajuća Transformacija JSONB Podataka

1.23 KADA API ruta vraća `apartments` podatke sa JSONB kolonama (`name`, `description`, `bed_type`) TADA komponente dobijaju objekte `{sr: "...", en: "...", de: "...", it: "..."}` umesto lokalizovanih stringova

1.24 KADA API ruta vraća `apartments` podatke sa `amenities: jsonb[]` TADA komponente dobijaju JSONB array umesto `string[]`

1.25 KADA API ruta vraća `apartments` podatke sa `images: jsonb[]` TADA komponente dobijaju JSONB array umesto `string[]`

#### 6. Komponente - Pokušaj Renderovanja JSONB Objekata

1.26 KADA komponenta `src/components/admin/ApartmentManager.tsx` pokušava da renderuje `apartment.name` TADA dobija objekat `{sr: "...", en: "..."}` umesto stringa i prikazuje `[object Object]`

1.27 KADA komponenta `src/components/booking/AvailabilityCalendar.tsx` pokušava da renderuje `apartment.name` TADA dobija objekat umesto stringa

1.28 KADA komponenta `src/components/admin/StatsCards.tsx` pokušava da prikaže podatke iz `bookings` TADA koristi nepostojeće kolone

#### 7. Migracije - Nedostajuće ili Neusklađene

1.29 KADA se pregleda direktorijum `supabase/migrations/` TADA ne postoje migracije koje kreiraju sve potrebne tabele sa tačnom strukturom

1.30 KADA se uporede migracije sa trenutnim stanjem baze TADA postoje razlike (npr. kolone koje postoje u bazi ali nisu u migracijama)

### Očekivano Ponašanje (Ispravno)

#### 1. TypeScript Tipovi - Kompletne Definicije

2.1 KADA projekat koristi tabelu `guests` TADA TypeScript tip `GuestRecord` MORA postojati sa SVIM kolonama iz baze

2.2 KADA projekat koristi tabelu `bookings` TADA TypeScript tip `BookingRecord` MORA postojati sa SVIM kolonama iz baze

2.3 KADA projekat koristi tabelu `availability` TADA TypeScript tip `AvailabilityRecord` MORA postojati sa SVIM kolonama iz baze

2.4 KADA projekat koristi tabelu `reviews` TADA TypeScript tip `ReviewRecord` MORA postojati sa SVIM kolonama iz baze

2.5 KADA projekat koristi tabelu `booking_messages` TADA TypeScript tip `BookingMessageRecord` MORA postojati sa SVIM kolonama iz baze

2.6 KADA projekat koristi tabelu `messages` TADA TypeScript tip `MessageRecord` MORA postojati sa SVIM kolonama iz baze

2.7 KADA projekat koristi tabelu `gallery` TADA TypeScript tip `GalleryRecord` MORA postojati sa SVIM kolonama iz baze

2.8 KADA projekat koristi tabelu `analytics_events` TADA TypeScript tip `AnalyticsEventRecord` MORA postojati sa SVIM kolonama iz baze

#### 2. TypeScript Tipovi - Ispravni Tipovi

2.9 KADA `ApartmentRecord` definiše `amenities` TADA tip MORA biti `Json[]` (Supabase tip za JSONB array)

2.10 KADA `ApartmentRecord` definiše `images` TADA tip MORA biti `Json[]` (Supabase tip za JSONB array)

2.11 KADA `ApartmentRecord` se definiše TADA MORA uključiti SVE kolone iz baze uključujući `display_order`

#### 3. API Rute - Ispravni Nazivi Kolona

2.12 KADA API ruta `src/app/api/availability/route.ts` selektuje podatke iz `apartments` TADA MORA koristiti `.select('id, name, capacity, base_price_eur, bed_type, status, amenities, images')`

2.13 KADA API ruta `src/lib/bookings/service.ts` selektuje podatke iz `apartments` TADA MORA koristiti `base_price_eur` umesto `price_per_night`

2.14 KADA API ruta `src/lib/bookings/service.ts` selektuje podatke iz `guests` TADA MORA koristiti `full_name` umesto `name`

2.15 KADA API ruta `src/lib/bookings/service.ts` kreira ili ažurira `guests` TADA MORA koristiti `full_name` umesto `name`

#### 4. API Rute - Transformacija JSONB Podataka

2.16 KADA API ruta vraća `apartments` podatke TADA MORA transformisati JSONB kolone (`name`, `description`, `bed_type`) u lokalizovane stringove prema `Accept-Language` header-u

2.17 KADA API ruta vraća `apartments` podatke TADA MORA transformisati `amenities: jsonb[]` u `string[]`

2.18 KADA API ruta vraća `apartments` podatke TADA MORA transformisati `images: jsonb[]` u `string[]`

2.19 KADA API ruta prima podatke za kreiranje/ažuriranje `apartments` TADA MORA transformisati lokalizovane stringove u JSONB objekte

#### 5. Komponente - Korišćenje Lokalizovanih Podataka

2.20 KADA komponenta `src/components/admin/ApartmentManager.tsx` renderuje `apartment.name` TADA MORA dobiti lokalizovani string (npr. "Apartman 1") umesto JSONB objekta

2.21 KADA komponenta `src/components/booking/AvailabilityCalendar.tsx` renderuje `apartment.name` TADA MORA dobiti lokalizovani string

2.22 KADA komponenta `src/components/admin/StatsCards.tsx` prikazuje podatke iz `bookings` TADA MORA koristiti ispravne nazive kolona

#### 6. Migracije - Kompletna Pokrivenost

2.23 KADA se pregleda direktorijum `supabase/migrations/` TADA MORA postojati migracija koja kreira SVE tabele sa tačnom strukturom

2.24 KADA se uporede migracije sa trenutnim stanjem baze TADA MORA biti 100% identičnost

2.25 KADA se primene migracije na praznu bazu TADA rezultat MORA biti identičan trenutnoj produkcijskoj bazi

### Nepromenjeno Ponašanje (Prevencija Regresije)

#### 1. Postojeća Funkcionalnost

3.1 KADA korisnik pristupa stranici sa apartmanima TADA sistem MORA NASTAVITI DA prikazuje listu apartmana (sa ispravnim podacima)

3.2 KADA korisnik kreira rezervaciju TADA sistem MORA NASTAVITI DA kreira rezervaciju u bazi (sa ispravnim kolonama)

3.3 KADA admin pristupa admin panelu TADA sistem MORA NASTAVITI DA prikazuje statistike (sa ispravnim podacima)

3.4 KADA admin ažurira apartman TADA sistem MORA NASTAVITI DA čuva izmene u bazi (sa ispravnim kolonama)

#### 2. Postojeće API Rute

3.5 KADA se poziva API ruta `/api/availability` TADA sistem MORA NASTAVITI DA vraća dostupnost apartmana (sa ispravnom strukturom)

3.6 KADA se poziva API ruta `/api/booking` TADA sistem MORA NASTAVITI DA kreira rezervacije (sa ispravnim kolonama)

3.7 KADA se poziva API ruta `/api/admin/apartments` TADA sistem MORA NASTAVITI DA vraća listu apartmana (sa ispravnom strukturom)

3.8 KADA se poziva API ruta `/api/admin/bookings` TADA sistem MORA NASTAVITI DA vraća listu rezervacija (sa ispravnim kolonama)

#### 3. Postojeće Komponente

3.9 KADA se renderuje `ApartmentManager` komponenta TADA sistem MORA NASTAVITI DA prikazuje formu za upravljanje apartmanima (sa ispravnim podacima)

3.10 KADA se renderuje `AvailabilityCalendar` komponenta TADA sistem MORA NASTAVITI DA prikazuje kalendar dostupnosti (sa ispravnim podacima)

3.11 KADA se renderuje `StatsCards` komponenta TADA sistem MORA NASTAVITI DA prikazuje statistike (sa ispravnim podacima)

3.12 KADA se renderuje `BookingDetails` komponenta TADA sistem MORA NASTAVITI DA prikazuje detalje rezervacije (sa ispravnim podacima)

#### 4. Postojeće Migracije

3.13 KADA se primenjuju nove migracije TADA sistem MORA NASTAVITI DA čuva postojeće podatke u bazi bez gubitka

3.14 KADA se primenjuju nove migracije TADA sistem MORA NASTAVITI DA poštuje postojeće RLS politike

3.15 KADA se primenjuju nove migracije TADA sistem MORA NASTAVITI DA poštuje postojeće funkcije i trigere

3.16 KADA se primenjuju nove migracije TADA sistem MORA NASTAVITI DA poštuje postojeće indekse i constraints
