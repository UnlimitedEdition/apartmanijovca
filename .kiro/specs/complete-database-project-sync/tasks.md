# Plan Implementacije: Kompletna Usklađenost Baze Podataka i Projekta

## Pregled

Ovaj plan pokriva sveobuhvatnu usklađenost između Supabase baze podataka i TypeScript projekta kroz 7 faza:
- **Faza 1**: TypeScript Tipovi za sve tabele
- **Faza 2**: Transformer funkcije za JSONB podatke
- **Faza 3**: Popravke API ruta (ispravni nazivi kolona)
- **Faza 4**: Popravke komponenti (korišćenje lokalizovanih podataka)
- **Faza 5**: Provera i primena SQL migracija
- **Faza 6**: Testiranje (unit, integration, property-based)
- **Faza 7**: Validacija i deployment plan

---

## FAZA 1: TypeScript Tipovi

### Cilj
Kreirati kompletne TypeScript tipove za SVE tabele u bazi podataka (10 tabela).

- [x] 1. Kreirati TypeScript tipove za sve tabele

  - [x] 1.1 Dodati GuestRecord tip
    - **Fajl**: `src/lib/types/database.ts`
    - **Lokacija**: Nakon postojećih tipova (linija ~50)
    - **Dodati**:
    ```typescript
    export interface GuestRecord {
      id: string
      full_name: string  // KRITIČNO: NE "name"
      email: string
      phone: string | null
      language: Locale
      created_at: string
      updated_at: string
    }
    ```
    - **Validacija**: Kompajlirati projekat, proveriti da nema grešaka
    - _Requirements: 2.1_

  - [x] 1.2 Dodati BookingRecord tip
    - **Fajl**: `src/lib/types/database.ts`
    - **Lokacija**: Nakon GuestRecord
    - **Dodati**:
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
      options: Json | null
      created_at: string
      updated_at: string
    }
    ```
    - **Validacija**: Kompajlirati projekat
    - _Requirements: 2.2_

  - [x] 1.3 Dodati AvailabilityRecord tip
    - **Fajl**: `src/lib/types/database.ts`
    - **Lokacija**: Nakon BookingRecord
    - **Dodati**:
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
    - **Validacija**: Kompajlirati projekat
    - _Requirements: 2.3_

  - [x] 1.4 Dodati ReviewRecord tip
    - **Fajl**: `src/lib/types/database.ts`
    - **Lokacija**: Nakon AvailabilityRecord
    - **Dodati**:
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
    - **Validacija**: Kompajlirati projekat
    - _Requirements: 2.4_

  - [x] 1.5 Dodati BookingMessageRecord tip
    - **Fajl**: `src/lib/types/database.ts`
    - **Lokacija**: Nakon ReviewRecord
    - **Dodati**:
    ```typescript
    export interface BookingMessageRecord {
      id: string
      booking_id: string
      sender_type: 'guest' | 'admin' | 'system'
      sender_id: string | null
      content: string
      attachments: Json | null
      read_at: string | null
      created_at: string
    }
    ```
    - **Validacija**: Kompajlirati projekat
    - _Requirements: 2.5_

  - [x] 1.6 Dodati MessageRecord tip
    - **Fajl**: `src/lib/types/database.ts`
    - **Lokacija**: Nakon BookingMessageRecord
    - **Dodati**:
    ```typescript
    export interface MessageRecord {
      id: string
      full_name: string  // KRITIČNO: NE "name"
      email: string
      phone: string | null
      subject: string
      message: string
      status: 'new' | 'read' | 'replied' | 'archived'
      created_at: string
      updated_at: string
    }
    ```
    - **Validacija**: Kompajlirati projekat
    - _Requirements: 2.6_

  - [x] 1.7 Dodati GalleryRecord tip
    - **Fajl**: `src/lib/types/database.ts`
    - **Lokacija**: Nakon MessageRecord
    - **Dodati**:
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
    - **Validacija**: Kompajlirati projekat
    - _Requirements: 2.7_

  - [x] 1.8 Dodati AnalyticsEventRecord tip
    - **Fajl**: `src/lib/types/database.ts`
    - **Lokacija**: Nakon GalleryRecord
    - **Dodati**:
    ```typescript
    export interface AnalyticsEventRecord {
      id: string
      event_type: string
      event_data: Json | null
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
    - **Validacija**: Kompajlirati projekat
    - _Requirements: 2.8_

  - [x] 1.9 Ažurirati ApartmentRecord tip
    - **Fajl**: `src/lib/types/database.ts`
    - **Lokacija**: Pronaći postojeći ApartmentRecord interfejs (linija ~20-35)
    - **STARO**:
    ```typescript
    export interface ApartmentRecord {
      id: string
      name: MultiLanguageText
      description: MultiLanguageText
      bed_type: MultiLanguageText
      capacity: number
      amenities: string[]  // POGREŠNO
      base_price_eur: number
      images: string[]  // POGREŠNO
      status: 'active' | 'inactive' | 'maintenance'
      created_at: string
      updated_at: string
    }
    ```
    - **NOVO**:
    ```typescript
    export interface ApartmentRecord {
      id: string
      name: Json  // JSONB: MultiLanguageText
      description: Json  // JSONB: MultiLanguageText
      bed_type: Json  // JSONB: MultiLanguageText
      capacity: number
      amenities: Json  // JSONB array: MultiLanguageText[]
      base_price_eur: number
      images: Json  // JSONB array: {url: string, alt: MultiLanguageText}[]
      status: 'active' | 'inactive' | 'maintenance'
      display_order: number  // DODATO
      created_at: string
      updated_at: string
    }
    ```
    - **Izmene**:
      - `name`: `MultiLanguageText` → `Json`
      - `description`: `MultiLanguageText` → `Json`
      - `bed_type`: `MultiLanguageText` → `Json`
      - `amenities`: `string[]` → `Json`
      - `images`: `string[]` → `Json`
      - Dodato: `display_order: number`
    - **Validacija**: Kompajlirati projekat
    - _Requirements: 2.9, 2.10, 2.11_

  - [x] 1.10 Dodati LocalizedApartment interfejs
    - **Fajl**: `src/lib/types/database.ts`
    - **Lokacija**: Nakon ApartmentRecord
    - **Dodati**:
    ```typescript
    // Frontend-friendly tip sa lokalizovanim stringovima
    export interface LocalizedApartment {
      id: string
      name: string  // Lokalizovani string
      description: string  // Lokalizovani string
      bed_type: string  // Lokalizovani string
      capacity: number
      amenities: string[]  // Array lokalizovanih stringova
      base_price_eur: number
      images: string[]  // Array URL-ova
      status: 'active' | 'inactive' | 'maintenance'
      created_at: string
      updated_at: string
    }
    ```
    - **Validacija**: Kompajlirati projekat
    - _Requirements: 2.16, 2.17, 2.18_

  - [x] 1.11 Kompajlirati projekat i proveriti greške
    - **Komanda**: `npm run build` ili `tsc --noEmit`
    - **Očekivano**: Nema TypeScript grešaka
    - **Ako ima grešaka**: Popraviti sve greške pre prelaska na Fazu 2
    - _Requirements: 2.1-2.11_

---

## FAZA 2: Transformer Functions

### Cilj
Implementirati transformer funkcije koje konvertuju JSONB objekte iz baze u lokalizovane stringove za frontend.

- [x] 2. Kreirati transformer funkcije

  - [x] 2.1 Kreirati database.ts fajl za transformere
    - **Fajl**: `src/lib/transformers/database.ts` (NOVI FAJL)
    - **Kreirati direktorijum**: `src/lib/transformers/` ako ne postoji
    - **Dodati osnovne importove**:
    ```typescript
    import { Json } from '@/lib/types/supabase'
    import { 
      ApartmentRecord, 
      LocalizedApartment,
      BookingRecord,
      ReviewRecord,
      GuestRecord,
      MultiLanguageText,
      Locale 
    } from '@/lib/types/database'
    import { getLocalizedValue } from '@/lib/localization/helpers'
    ```
    - _Requirements: 2.16_

  - [x] 2.2 Implementirati getLocalizedValue helper funkciju
    - **Fajl**: `src/lib/transformers/database.ts`
    - **Dodati**:
    ```typescript
    // Helper funkcija za ekstrakciju lokalizovane vrednosti
    function extractLocalizedValue(jsonValue: Json, locale: Locale): string {
      if (!jsonValue || typeof jsonValue !== 'object') return ''
      const obj = jsonValue as Record<string, unknown>
      return (obj[locale] as string) || (obj['sr'] as string) || ''
    }
    ```
    - _Requirements: 2.16_

  - [x] 2.3 Implementirati transformAmenities funkciju
    - **Fajl**: `src/lib/transformers/database.ts`
    - **Dodati**:
    ```typescript
    // Transformiše JSONB array amenities u string array
    function transformAmenities(amenities: Json, locale: Locale): string[] {
      if (!Array.isArray(amenities)) return []
      return amenities.map(amenity => extractLocalizedValue(amenity as Json, locale))
    }
    ```
    - _Requirements: 2.17_

  - [x] 2.4 Implementirati transformImages funkciju
    - **Fajl**: `src/lib/transformers/database.ts`
    - **Dodati**:
    ```typescript
    // Transformiše JSONB array images u string array (URL-ovi)
    interface ImageRecord {
      url: string
      alt: Json
    }

    function transformImages(images: Json): string[] {
      if (!Array.isArray(images)) return []
      return images.map((image: unknown) => {
        const img = image as ImageRecord
        return img.url
      })
    }
    ```
    - _Requirements: 2.18_

  - [x] 2.5 Implementirati transformApartmentRecord funkciju
    - **Fajl**: `src/lib/transformers/database.ts`
    - **Dodati**:
    ```typescript
    // Glavna funkcija za transformaciju ApartmentRecord → LocalizedApartment
    export function transformApartmentRecord(
      record: ApartmentRecord,
      locale: Locale
    ): LocalizedApartment {
      return {
        id: record.id,
        name: extractLocalizedValue(record.name, locale),
        description: extractLocalizedValue(record.description, locale),
        bed_type: extractLocalizedValue(record.bed_type, locale),
        capacity: record.capacity,
        amenities: transformAmenities(record.amenities, locale),
        base_price_eur: record.base_price_eur,
        images: transformImages(record.images),
        status: record.status,
        created_at: record.created_at,
        updated_at: record.updated_at
      }
    }
    ```
    - **Validacija**: Kompajlirati projekat
    - _Requirements: 2.16, 2.17, 2.18_

  - [x] 2.6 Implementirati transformBookingRecord funkciju
    - **Fajl**: `src/lib/transformers/database.ts`
    - **Dodati interfejs**:
    ```typescript
    export interface BookingResponse {
      id: string
      bookingNumber: string
      apartmentId: string
      apartmentName: string  // Lokalizovano
      guestId: string
      guestName: string
      guestEmail: string
      guestPhone: string | null
      checkIn: string
      checkOut: string
      nights: number
      totalPrice: number
      status: string
      options?: Record<string, unknown>
      createdAt: string
      updatedAt: string
    }
    ```
    - **Dodati funkciju**:
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
        apartmentName: extractLocalizedValue(record.apartment.name, locale),
        guestId: record.guest_id,
        guestName: record.guest.full_name,
        guestEmail: record.guest.email,
        guestPhone: record.guest.phone,
        checkIn: record.check_in,
        checkOut: record.check_out,
        nights: record.nights,
        totalPrice: record.total_price,
        status: record.status,
        options: record.options as Record<string, unknown> | undefined,
        createdAt: record.created_at,
        updatedAt: record.updated_at
      }
    }
    ```
    - **Validacija**: Kompajlirati projekat
    - _Requirements: 2.16_

  - [x] 2.7 Implementirati transformReviewRecord funkciju
    - **Fajl**: `src/lib/transformers/database.ts`
    - **Dodati interfejs**:
    ```typescript
    export interface ReviewResponse {
      id: string
      bookingId: string
      apartmentId: string
      apartmentName: string  // Lokalizovano
      guestId: string
      guestName: string
      rating: number
      title: string | null
      comment: string | null
      photos: string[] | null
      status: string
      approvedAt: string | null
      language: Locale
      createdAt: string
      updatedAt: string
    }
    ```
    - **Dodati funkciju**:
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
        apartmentName: extractLocalizedValue(record.apartment.name, locale),
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
    - **Validacija**: Kompajlirati projekat
    - _Requirements: 2.16_

  - [x] 2.8 Implementirati reverseTransformApartmentData funkciju
    - **Fajl**: `src/lib/transformers/database.ts`
    - **Svrha**: Transformiše frontend podatke (lokalizovani stringovi) u JSONB objekte za upis u bazu
    - **Dodati**:
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
    - **Validacija**: Kompajlirati projekat
    - _Requirements: 2.19_

  - [x] 2.9 Napisati unit testove za transformer funkcije
    - **Fajl**: `__tests__/unit/transformers.test.ts` (NOVI FAJL)
    - **Testovi**:
      - Test za `transformApartmentRecord` sa svim jezicima
      - Test za `transformAmenities` sa praznim array-em
      - Test za `transformImages` sa praznim array-em
      - Test za `transformBookingRecord`
      - Test za `transformReviewRecord`
      - Test za `reverseTransformApartmentData`
    - **Pokrenuti testove**: `npm test transformers.test.ts`
    - **Očekivano**: Svi testovi prolaze
    - _Requirements: 2.16-2.19_

---

## FAZA 3: API Route Fixes

### Cilj
Popraviti SVE API rute da koriste ispravne nazive kolona i transformer funkcije.

- [x] 3. Popraviti API rute

  - [x] 3.1 Popraviti src/app/api/availability/route.ts
    - **Fajl**: `src/app/api/availability/route.ts`
    
    - **3.1.1 Dodati importove na vrhu fajla**:
      ```typescript
      import { transformApartmentRecord } from '@/lib/transformers/database'
      import { extractLocale } from '@/lib/localization/extract'
      ```
    
    - **3.1.2 GET metoda - Linija ~60-62 (select statement)**:
      - **STARO**:
      ```typescript
      .select('id, name, type, capacity, price_per_night, bed_type')
      ```
      - **NOVO**:
      ```typescript
      .select('id, name, capacity, base_price_eur, bed_type, status, amenities, images')
      ```
      - **Razlog**: Kolone `type` i `price_per_night` ne postoje u bazi
    
    - **3.1.3 GET metoda - Linija ~130-140 (response mapping)**:
      - **STARO**:
      ```typescript
      return {
        id: apartment.id,
        name: getLocalizedValue(apartment.name as MultiLanguageText, locale),
        type: getLocalizedValue(apartment.type as MultiLanguageText, locale),
        capacity: apartment.capacity,
        price_per_night: apartment.price_per_night,
        available: isAvailable,
        unavailableDates: [...new Set(unavailableDates)].sort()
      }
      ```
      - **NOVO**:
      ```typescript
      const locale = extractLocale(request)
      const localizedApartment = transformApartmentRecord(apartment as ApartmentRecord, locale)
      
      return {
        id: localizedApartment.id,
        name: localizedApartment.name,
        capacity: localizedApartment.capacity,
        base_price_eur: localizedApartment.base_price_eur,
        bed_type: localizedApartment.bed_type,
        available: isAvailable,
        unavailableDates: [...new Set(unavailableDates)].sort()
      }
      ```
      - **Razlog**: Koristiti transformer funkciju umesto ručne transformacije
    
    - **3.1.4 POST metoda - Linija ~180-182 (select statement)**:
      - **STARO**:
      ```typescript
      .select('id, name, type, capacity, price_per_night')
      ```
      - **NOVO**:
      ```typescript
      .select('id, name, capacity, base_price_eur, bed_type, status, amenities, images')
      ```
    
    - **3.1.5 POST metoda - Linija ~200-210 (response mapping)**:
      - **STARO**:
      ```typescript
      apartments: [{
        id: apartment.id,
        name: getLocalizedValue(apartment.name as MultiLanguageText, locale),
        type: getLocalizedValue(apartment.type as MultiLanguageText, locale),
        capacity: apartment.capacity,
        price_per_night: apartment.price_per_night,
        available: isAvailable,
        unavailableDates: []
      }]
      ```
      - **NOVO**:
      ```typescript
      const localizedApartment = transformApartmentRecord(apartment as ApartmentRecord, locale)
      
      apartments: [{
        id: localizedApartment.id,
        name: localizedApartment.name,
        capacity: localizedApartment.capacity,
        base_price_eur: localizedApartment.base_price_eur,
        bed_type: localizedApartment.bed_type,
        available: isAvailable,
        unavailableDates: []
      }]
      ```
    
    - **Validacija**: 
      - Kompajlirati projekat
      - Testirati API rutu: `curl http://localhost:3000/api/availability?checkIn=2024-06-01&checkOut=2024-06-02`
      - Proveriti da response sadrži `base_price_eur` umesto `price_per_night`
      - Proveriti da `name` je string, ne objekat
    - _Requirements: 2.12, 2.13, 2.16, 2.17, 2.18_

  - [x] 3.2 Popraviti src/lib/bookings/service.ts
    - **Fajl**: `src/lib/bookings/service.ts`
    
    - **3.2.1 Dodati importove na vrhu fajla**:
      ```typescript
      import { transformApartmentRecord, transformBookingRecord } from '@/lib/transformers/database'
      import { ApartmentRecord, GuestRecord, BookingRecord } from '@/lib/types/database'
      ```
    
    - **3.2.2 createOrGetGuest funkcija - Linija ~120-122 (select)**:
      - **STARO**: `.select('id, name, phone')`
      - **NOVO**: `.select('id, full_name, phone')`
      - **Razlog**: Kolona je `full_name`, ne `name`
    
    - **3.2.3 createOrGetGuest funkcija - Linija ~125-130 (update)**:
      - **STARO**:
      ```typescript
      if (existingGuest.name !== name || existingGuest.phone !== phone) {
        const { error: updateError } = await supabase
          .from('guests')
          .update({ name, phone })
          .eq('id', existingGuest.id)
      ```
      - **NOVO**:
      ```typescript
      if (existingGuest.full_name !== name || existingGuest.phone !== phone) {
        const { error: updateError } = await supabase
          .from('guests')
          .update({ full_name: name, phone })
          .eq('id', existingGuest.id)
      ```
    
    - **3.2.4 createOrGetGuest funkcija - Linija ~138-140 (insert)**:
      - **STARO**: `.insert({ name, email, phone })`
      - **NOVO**: `.insert({ full_name: name, email, phone })`
    
    - **3.2.5 createBooking funkcija - Linija ~175-177 (select apartments)**:
      - **STARO**: `.select('id, name, price_per_night')`
      - **NOVO**: `.select('id, name, base_price_eur')`
    
    - **3.2.6 createBooking funkcija - Linija ~195 (calculateTotalPrice)**:
      - **STARO**: `const totalPrice = calculateTotalPrice(apartment.price_per_night, ...)`
      - **NOVO**: `const totalPrice = calculateTotalPrice(apartment.base_price_eur, ...)`
    
    - **3.2.7 getBookingById funkcija - Linija ~270-272 (select guests)**:
      - **STARO**: `guests!inner(id, name, email, phone)`
      - **NOVO**: `guests!inner(id, full_name, email, phone)`
    
    - **3.2.8 getBookingById funkcija - Linija ~285-290 (response mapping)**:
      - **STARO**: `guestName: (data.guests as any).name || (data.guests as any)[0]?.name,`
      - **NOVO**: `guestName: (data.guests as any).full_name || (data.guests as any)[0]?.full_name,`
    
    - **3.2.9 listBookings funkcija - Linija ~330-332 (select guests)**:
      - **STARO**: `guests!inner(id, name, email, phone)`
      - **NOVO**: `guests!inner(id, full_name, email, phone)`
    
    - **3.2.10 listBookings funkcija - Linija ~370-375 (response mapping)**:
      - **STARO**: `guestName: Array.isArray(booking.guests) ? booking.guests[0].name : booking.guests.name,`
      - **NOVO**: `guestName: Array.isArray(booking.guests) ? booking.guests[0].full_name : booking.guests.full_name,`
    
    - **Validacija**: 
      - Kompajlirati projekat
      - Testirati kreiranje rezervacije
      - Proveriti da se gost kreira sa `full_name` kolonom
    - _Requirements: 2.13, 2.14, 2.15_

  - [x] 3.3 Popraviti src/lib/bookings/service.ts - updateBooking funkcija
    - **Fajl**: `src/lib/bookings/service.ts`
    
    - **3.3.1 updateBooking funkcija - Linija ~450-452 (guest update)**:
      - **STARO**:
      ```typescript
      const updateData: { name?: string; phone?: string } = {}
      if (input.guest.name) updateData.name = input.guest.name
      ```
      - **NOVO**:
      ```typescript
      const updateData: { full_name?: string; phone?: string } = {}
      if (input.guest.name) updateData.full_name = input.guest.name
      ```
    
    - **3.3.2 updateBooking funkcija - Linija ~470-472 (select apartment)**:
      - **STARO**: `.select('price_per_night')`
      - **NOVO**: `.select('base_price_eur')`
    
    - **3.3.3 updateBooking funkcija - Linija ~480-485 (calculateTotalPrice)**:
      - **STARO**:
      ```typescript
      updateData.total_price = calculateTotalPrice(
        apartment.price_per_night,
        newCheckIn,
        newCheckOut,
        fullOptions
      )
      ```
      - **NOVO**:
      ```typescript
      updateData.total_price = calculateTotalPrice(
        apartment.base_price_eur,
        newCheckIn,
        newCheckOut,
        fullOptions
      )
      ```
    
    - **3.3.4 updateBooking funkcija - Linija ~520-522 (email trigger - select apartment)**:
      - **STARO**: `.select('id, name, name_sr, name_de, name_it')`
      - **NOVO**: `.select('id, name')`
      - **Razlog**: Kolone `name_sr`, `name_de`, `name_it` ne postoje; `name` je JSONB objekat
    
    - **3.3.5 updateBooking funkcija - Linija ~525-527 (email trigger - select guest)**:
      - **STARO**: `.select('id, name, email, phone, language')`
      - **NOVO**: `.select('id, full_name, email, phone, language')`
    
    - **3.3.6 updateBooking funkcija - Linija ~540-545 (email trigger - apartment data)**:
      - **STARO**:
      ```typescript
      apartment: {
        id: apartment?.id || '',
        name: apartment?.name || '',
        nameSr: apartment?.name_sr,
        nameDe: apartment?.name_de,
        nameIt: apartment?.name_it,
      }
      ```
      - **NOVO**:
      ```typescript
      import { extractLocale } from '@/lib/localization/extract'
      
      const locale = guest?.language as Locale || 'sr'
      const apartmentName = apartment?.name 
        ? extractLocalizedValue(apartment.name as Json, locale)
        : ''
      
      apartment: {
        id: apartment?.id || '',
        name: apartmentName,
      }
      ```
    
    - **3.3.7 updateBooking funkcija - Linija ~550-555 (email trigger - guest data)**:
      - **STARO**:
      ```typescript
      {
        name: guest?.name || '',
        email: guest?.email || '',
        phone: guest?.phone,
        language: (guest?.language as EmailLanguage) || 'en',
      }
      ```
      - **NOVO**:
      ```typescript
      {
        name: guest?.full_name || '',
        email: guest?.email || '',
        phone: guest?.phone,
        language: (guest?.language as EmailLanguage) || 'en',
      }
      ```
    
    - **Validacija**: 
      - Kompajlirati projekat
      - Testirati ažuriranje rezervacije
      - Proveriti da email trigger koristi ispravne podatke
    - _Requirements: 2.13, 2.14, 2.15, 2.16_

  - [x] 3.4 Popraviti src/hooks/useAvailability.ts
    - **Fajl**: `src/hooks/useAvailability.ts`
    
    - **3.4.1 Dodati importove na vrhu fajla**:
      ```typescript
      import { transformApartmentRecord } from '@/lib/transformers/database'
      import { ApartmentRecord, LocalizedApartment } from '@/lib/types/database'
      import { extractLocale } from '@/lib/localization/extract'
      ```
    
    - **3.4.2 Promeniti tip state-a**:
      - **STARO**: `const [apartments, setApartments] = useState<Apartment[]>([])`
      - **NOVO**: `const [apartments, setApartments] = useState<LocalizedApartment[]>([])`
    
    - **3.4.3 fetchData funkcija - Linija ~90-95 (transformacija)**:
      - **STARO**:
      ```typescript
      const apartments = (apartmentsData || []) as Apartment[]
      ```
      - **NOVO**:
      ```typescript
      // Get locale from browser or default to 'sr'
      const locale = extractLocale() || 'sr'
      
      // Transform apartment records to localized format
      const apartments = (apartmentsData || []).map(apt => 
        transformApartmentRecord(apt as ApartmentRecord, locale)
      )
      ```
      - **Razlog**: Transformisati JSONB objekte u lokalizovane stringove
    
    - **Validacija**: 
      - Kompajlirati projekat
      - Testirati hook u komponenti
      - Proveriti da `apartment.name` je string, ne objekat
    - _Requirements: 2.16, 2.17, 2.18_

  - [x] 3.5 Popraviti src/app/api/admin/apartments/[id]/route.ts
    - **Fajl**: `src/app/api/admin/apartments/[id]/route.ts`
    
    - **3.5.1 Dodati importove**:
      ```typescript
      import { transformApartmentRecord } from '@/lib/transformers/database'
      import { ApartmentRecord } from '@/lib/types/database'
      import { extractLocale } from '@/lib/localization/extract'
      ```
    
    - **3.5.2 GET metoda - select statement**:
      - **STARO**: `.select('id, name, price_per_night, capacity, status')`
      - **NOVO**: `.select('id, name, base_price_eur, capacity, status, description, bed_type, amenities, images, display_order')`
    
    - **3.5.3 GET metoda - response transformacija**:
      - **Dodati nakon fetch-a**:
      ```typescript
      const locale = extractLocale(request)
      const transformedApartment = transformApartmentRecord(apartment as ApartmentRecord, locale)
      
      return NextResponse.json({
        success: true,
        data: transformedApartment
      })
      ```
    
    - **3.5.4 PUT metoda - update statement**:
      - **STARO**:
      ```typescript
      const updateData: Partial<ApartmentRecord> = {}
      if (body.price_per_night !== undefined) {
        updateData.price_per_night = body.price_per_night
      }
      ```
      - **NOVO**:
      ```typescript
      const updateData: Partial<ApartmentRecord> = {}
      if (body.base_price_eur !== undefined) {
        updateData.base_price_eur = body.base_price_eur
      }
      ```
    
    - **Validacija**: 
      - Kompajlirati projekat
      - Testirati GET i PUT metode
    - _Requirements: 2.12, 2.16_

  - [x] 3.6 Popraviti src/app/api/portal/profile/route.ts
    - **Fajl**: `src/app/api/portal/profile/route.ts`
    
    - **3.6.1 PUT metoda - update statement**:
      - **STARO**:
      ```typescript
      const updateData: Partial<GuestRecord> = {}
      if (body.name) {
        updateData.name = body.name
      }
      ```
      - **NOVO**:
      ```typescript
      const updateData: Partial<GuestRecord> = {}
      if (body.name) {
        updateData.full_name = body.name
      }
      ```
    
    - **3.6.2 GET metoda - select statement**:
      - **STARO**: `.select('id, name, email, phone, language')`
      - **NOVO**: `.select('id, full_name, email, phone, language')`
    
    - **3.6.3 GET metoda - response mapping**:
      - **STARO**:
      ```typescript
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
      ```
      - **NOVO**:
      ```typescript
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
    
    - **Validacija**: 
      - Kompajlirati projekat
      - Testirati GET i PUT metode
    - _Requirements: 2.14, 2.15_

---

## FAZA 4: Component Fixes

### Cilj
Ažurirati komponente da koriste ispravne tipove i lokalizovane podatke.

- [x] 4. Popraviti komponente

  - [x] 4.1 Ažurirati src/components/admin/ApartmentManager.tsx
    - **Fajl**: `src/components/admin/ApartmentManager.tsx`
    
    - **4.1.1 Dodati import**:
      ```typescript
      import { LocalizedApartment } from '@/lib/types/database'
      ```
    
    - **4.1.2 Promeniti tip props**:
      - **STARO**:
      ```typescript
      interface ApartmentManagerProps {
        apartments: ApartmentRecord[]
      }
      ```
      - **NOVO**:
      ```typescript
      interface ApartmentManagerProps {
        apartments: LocalizedApartment[]
      }
      ```
    
    - **4.1.3 Renderovanje**:
      - **Napomena**: Komponenta ne treba da menja kod za renderovanje jer će API već vraćati lokalizovane stringove
      - `apartment.name` će biti string umesto objekta
      - `apartment.base_price_eur` umesto `apartment.price_per_night`
    
    - **Validacija**: 
      - Kompajlirati projekat
      - Testirati komponentu u browseru
      - Proveriti da se prikazuje tekst umesto `[object Object]`
    - _Requirements: 2.20_

  - [x] 4.2 Ažurirati src/components/booking/AvailabilityCalendar.tsx
    - **Fajl**: `src/components/booking/AvailabilityCalendar.tsx`
    
    - **4.2.1 Dodati import**:
      ```typescript
      import { LocalizedApartment } from '@/lib/types/database'
      ```
    
    - **4.2.2 Promeniti tip props**:
      - **STARO**:
      ```typescript
      interface AvailabilityCalendarProps {
        apartments: ApartmentRecord[]
      }
      ```
      - **NOVO**:
      ```typescript
      interface AvailabilityCalendarProps {
        apartments: LocalizedApartment[]
      }
      ```
    
    - **4.2.3 Renderovanje**:
      - **Napomena**: Komponenta ne treba da menja kod za renderovanje
      - `apartment.name` će biti string umesto objekta
    
    - **Validacija**: 
      - Kompajlirati projekat
      - Testirati komponentu u browseru
      - Proveriti da se prikazuje tekst umesto `[object Object]`
    - _Requirements: 2.21_

  - [x] 4.3 Ažurirati src/components/admin/StatsCards.tsx
    - **Fajl**: `src/components/admin/StatsCards.tsx`
    
    - **4.3.1 Proveriti da li komponenta direktno pristupa bazi**:
      - Ako DA, popraviti nazive kolona
      - Ako NE (koristi API), proveriti da API vraća ispravne podatke
    
    - **4.3.2 Ako komponenta koristi direktan pristup bazi**:
      - **STARO**:
      ```typescript
      const { data: bookings } = await supabase
        .from('bookings')
        .select('id, checkin, checkout, price')
      ```
      - **NOVO**:
      ```typescript
      const { data: bookings } = await supabase
        .from('bookings')
        .select('id, check_in, check_out, total_price')
      ```
    
    - **4.3.3 Renderovanje**:
      - **STARO**:
      ```typescript
      <div>Check-in: {booking.checkin}</div>
      <div>Price: {booking.price}</div>
      ```
      - **NOVO**:
      ```typescript
      <div>Check-in: {booking.check_in}</div>
      <div>Price: {booking.total_price}</div>
      ```
    
    - **Validacija**: 
      - Kompajlirati projekat
      - Testirati komponentu u admin panelu
      - Proveriti da se prikazuju ispravni podaci
    - _Requirements: 2.22_

  - [x] 4.4 Ažurirati src/components/portal/BookingDetails.tsx
    - **Fajl**: `src/components/portal/BookingDetails.tsx`
    
    - **4.4.1 Proveriti da li komponenta direktno pristupa bazi**:
      - Ako DA, popraviti nazive kolona
      - Ako NE (koristi API), proveriti da API vraća ispravne podatke
    
    - **4.4.2 Ako komponenta koristi direktan pristup bazi**:
      - **STARO**:
      ```typescript
      const { data: booking } = await supabase
        .from('bookings')
        .select(`
          id,
          checkin,
          checkout,
          price,
          guests (name, email)
        `)
      ```
      - **NOVO**:
      ```typescript
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
    
    - **4.4.3 Renderovanje**:
      - **STARO**:
      ```typescript
      <div>Guest: {booking.guests.name}</div>
      <div>Check-in: {booking.checkin}</div>
      <div>Price: {booking.price}</div>
      ```
      - **NOVO**:
      ```typescript
      <div>Guest: {booking.guests.full_name}</div>
      <div>Check-in: {booking.check_in}</div>
      <div>Price: {booking.total_price}</div>
      ```
    
    - **Validacija**: 
      - Kompajlirati projekat
      - Testirati komponentu u portalu
      - Proveriti da se prikazuju ispravni podaci
    - _Requirements: 2.22_

---

## FAZA 5: SQL Migracije (ISPRAVLJENA)

### Cilj
Proveriti da li su postojeće SQL migracije primenjene na bazu i primeniti ih ako nisu.

**KRITIČNO**: Već postoje kompletne SQL migracije u `supabase/migrations/`:
- `01_SCHEMA_COMPLETE.sql`
- `02_RLS_POLICIES_COMPLETE.sql`
- `03_FUNCTIONS_COMPLETE.sql`
- `04_REALTIME_COMPLETE.sql`
- `05_SEED_DATA_COMPLETE.sql`

**NE TREBA** kreirati nove migracije. Umesto toga, proveriti i primeniti postojeće.

- [x] 5. Proveriti i primeniti SQL migracije

  - [x] 5.1 Proveriti postojeće migracije
    - **Direktorijum**: `supabase/migrations/`
    - **Fajlovi za proveru**:
      - `01_SCHEMA_COMPLETE.sql` - Kompletna šema svih tabela
      - `02_RLS_POLICIES_COMPLETE.sql` - RLS politike
      - `03_FUNCTIONS_COMPLETE.sql` - Funkcije i trigeri
      - `04_REALTIME_COMPLETE.sql` - Realtime konfiguracija
      - `05_SEED_DATA_COMPLETE.sql` - Početni podaci
    - **Akcija**: Pročitati svaki fajl i proveriti da li pokriva sve potrebne tabele
    - _Requirements: 2.23_

  - [x] 5.2 Proveriti trenutno stanje baze podataka
    - **Komanda**: Povezati se na Supabase bazu
    - **SQL Query**:
      ```sql
      -- Proveriti koje tabele postoje
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
      
      -- Proveriti kolone u guests tabeli
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'guests'
      ORDER BY ordinal_position;
      
      -- Proveriti kolone u apartments tabeli
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'apartments'
      ORDER BY ordinal_position;
      
      -- Proveriti kolone u bookings tabeli
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'bookings'
      ORDER BY ordinal_position;
      ```
    - **Očekivano**:
      - Tabela `guests` ima kolonu `full_name` (NE `name`)
      - Tabela `apartments` ima kolonu `base_price_eur` (NE `price_per_night`)
      - Tabela `apartments` nema kolonu `type`
      - Tabela `bookings` ima kolone `check_in`, `check_out`, `nights`, `booking_number`
    - _Requirements: 2.24_

  - [x] 5.3 Uporediti strukturu baze sa SQL migracijama
    - **Akcija**: Uporediti rezultate iz 5.2 sa sadržajem `01_SCHEMA_COMPLETE.sql`
    - **Proveriti**:
      - Da li sve tabele iz migracije postoje u bazi?
      - Da li sve kolone imaju ispravne tipove?
      - Da li svi constraints postoje?
      - Da li svi indeksi postoje?
    - **Ako postoje razlike**: Dokumentovati ih i primeniti migracije
    - **Ako nema razlika**: Migracije su već primenjene, preskočiti 5.4
    - _Requirements: 2.24_

  - [x] 5.4 Primeniti migracije ako nisu primenjene
    - **SAMO AKO** su pronađene razlike u 5.3
    - **Backup PRVO**:
      ```bash
      # Kreirati backup produkcijske baze
      pg_dump -h [supabase-host] -U postgres -d postgres > backup_$(date +%Y%m%d_%H%M%S).sql
      ```
    - **Primeniti migracije**:
      ```bash
      # Opcija 1: Supabase CLI
      supabase db push
      
      # Opcija 2: Ručno izvršavanje SQL fajlova
      psql -h [supabase-host] -U postgres -d postgres -f supabase/migrations/01_SCHEMA_COMPLETE.sql
      psql -h [supabase-host] -U postgres -d postgres -f supabase/migrations/02_RLS_POLICIES_COMPLETE.sql
      psql -h [supabase-host] -U postgres -d postgres -f supabase/migrations/03_FUNCTIONS_COMPLETE.sql
      psql -h [supabase-host] -U postgres -d postgres -f supabase/migrations/04_REALTIME_COMPLETE.sql
      psql -h [supabase-host] -U postgres -d postgres -f supabase/migrations/05_SEED_DATA_COMPLETE.sql
      ```
    - **KRITIČNO**: Testirati na staging okruženju PRE produkcije
    - _Requirements: 2.25_

  - [x] 5.5 Validirati strukturu baze nakon migracija
    - **Ponoviti SQL query iz 5.2**
    - **Proveriti**:
      - Sve tabele postoje
      - Sve kolone imaju ispravne nazive i tipove
      - Svi constraints postoje
      - Svi indeksi postoje
      - RLS politike su aktivne
      - Funkcije i trigeri rade
    - **Očekivano**: 100% identičnost sa SQL migracijama
    - _Requirements: 2.24, 2.25_

  - [x] 5.6 Proveriti da postojeći podaci nisu izgubljeni
    - **SQL Query**:
      ```sql
      -- Prebrojati redove u svakoj tabeli
      SELECT 'guests' as table_name, COUNT(*) as row_count FROM guests
      UNION ALL
      SELECT 'apartments', COUNT(*) FROM apartments
      UNION ALL
      SELECT 'bookings', COUNT(*) FROM bookings
      UNION ALL
      SELECT 'availability', COUNT(*) FROM availability
      UNION ALL
      SELECT 'reviews', COUNT(*) FROM reviews
      UNION ALL
      SELECT 'messages', COUNT(*) FROM messages
      UNION ALL
      SELECT 'content', COUNT(*) FROM content;
      ```
    - **Očekivano**: Broj redova je isti kao pre migracija
    - **Ako su podaci izgubljeni**: Vratiti backup i istražiti problem
    - _Requirements: 3.13_

---

## FAZA 6: Testing

### Cilj
Napisati i pokrenuti SVE testove (unit, integration, property-based).

- [-] 6. Testiranje

  - [x] 6.1 Unit testovi za TypeScript tipove
    - **Fajl**: `__tests__/unit/database-types.test.ts` (NOVI FAJL)
    - **Testovi**:
      ```typescript
      describe('Database Types', () => {
        it('should have GuestRecord type with full_name field', () => {
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
          expect(booking.nights).toBe(1)
        })
        
        it('should have ApartmentRecord with Json types for JSONB fields', () => {
          const apartment: ApartmentRecord = {
            id: '123',
            name: { sr: 'Apartman 1', en: 'Apartment 1' } as Json,
            description: { sr: 'Opis', en: 'Description' } as Json,
            bed_type: { sr: 'Bračni krevet', en: 'Double bed' } as Json,
            capacity: 2,
            amenities: [{ sr: 'WiFi', en: 'WiFi' }] as Json,
            base_price_eur: 50,
            images: [{ url: 'https://example.com/image.jpg', alt: { sr: 'Slika' } }] as Json,
            status: 'active',
            display_order: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          expect(apartment.base_price_eur).toBe(50)
          expect(apartment.display_order).toBe(0)
        })
      })
      ```
    - **Pokrenuti**: `npm test database-types.test.ts`
    - **Očekivano**: Svi testovi prolaze
    - _Requirements: 2.1-2.11_

  - [x] 6.2 Unit testovi za transformer funkcije
    - **Fajl**: `__tests__/unit/transformers.test.ts` (NOVI FAJL)
    - **Testovi**:
      ```typescript
      import { transformApartmentRecord, transformAmenities, transformImages } from '@/lib/transformers/database'
      
      describe('Transformer Functions', () => {
        it('should transform ApartmentRecord to LocalizedApartment (Serbian)', () => {
          const record: ApartmentRecord = {
            id: '123',
            name: { sr: 'Apartman 1', en: 'Apartment 1', de: 'Wohnung 1', it: 'Appartamento 1' } as Json,
            description: { sr: 'Opis', en: 'Description', de: 'Beschreibung', it: 'Descrizione' } as Json,
            bed_type: { sr: 'Bračni krevet', en: 'Double bed', de: 'Doppelbett', it: 'Letto matrimoniale' } as Json,
            capacity: 2,
            amenities: [
              { sr: 'WiFi', en: 'WiFi', de: 'WiFi', it: 'WiFi' }
            ] as Json,
            base_price_eur: 50,
            images: [{ url: 'https://example.com/image.jpg', alt: { sr: 'Slika' } }] as Json,
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
        
        it('should transform ApartmentRecord to LocalizedApartment (English)', () => {
          const record: ApartmentRecord = {
            id: '123',
            name: { sr: 'Apartman 1', en: 'Apartment 1' } as Json,
            description: { sr: 'Opis', en: 'Description' } as Json,
            bed_type: { sr: 'Bračni krevet', en: 'Double bed' } as Json,
            capacity: 2,
            amenities: [] as Json,
            base_price_eur: 50,
            images: [] as Json,
            status: 'active',
            display_order: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          
          const localized = transformApartmentRecord(record, 'en')
          
          expect(localized.name).toBe('Apartment 1')
          expect(localized.description).toBe('Description')
          expect(localized.bed_type).toBe('Double bed')
        })
        
        it('should handle empty amenities array', () => {
          const amenities = [] as Json
          const result = transformAmenities(amenities, 'sr')
          expect(result).toEqual([])
        })
        
        it('should handle empty images array', () => {
          const images = [] as Json
          const result = transformImages(images)
          expect(result).toEqual([])
        })
      })
      ```
    - **Pokrenuti**: `npm test transformers.test.ts`
    - **Očekivano**: Svi testovi prolaze
    - _Requirements: 2.16-2.19_

  - [x] 6.3 Unit testovi za API nazive kolona
    - **Fajl**: `__tests__/unit/api-column-names.test.ts` (NOVI FAJL)
    - **Testovi**:
      ```typescript
      import { createClient } from '@supabase/supabase-js'
      
      describe('API Column Names', () => {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        
        it('should use base_price_eur instead of price_per_night in apartments', async () => {
          const { data, error } = await supabase
            .from('apartments')
            .select('id, base_price_eur')
            .limit(1)
            .single()
          
          expect(error).toBeNull()
          expect(data).toBeDefined()
          expect(data.base_price_eur).toBeDefined()
          expect(typeof data.base_price_eur).toBe('number')
        })
        
        it('should use full_name instead of name in guests', async () => {
          const { data, error } = await supabase
            .from('guests')
            .select('id, full_name')
            .limit(1)
            .single()
          
          expect(error).toBeNull()
          expect(data).toBeDefined()
          expect(data.full_name).toBeDefined()
          expect(typeof data.full_name).toBe('string')
        })
        
        it('should use check_in, check_out, nights in bookings', async () => {
          const { data, error } = await supabase
            .from('bookings')
            .select('id, check_in, check_out, nights, booking_number')
            .limit(1)
            .single()
          
          expect(error).toBeNull()
          expect(data).toBeDefined()
          expect(data.check_in).toBeDefined()
          expect(data.check_out).toBeDefined()
          expect(data.nights).toBeDefined()
          expect(data.booking_number).toBeDefined()
        })
        
        it('should NOT have type column in apartments', async () => {
          const { data, error } = await supabase
            .from('apartments')
            .select('id, type')
            .limit(1)
            .single()
          
          // Očekujemo da type bude null ili undefined jer kolona ne postoji
          expect(data?.type).toBeUndefined()
        })
      })
      ```
    - **Pokrenuti**: `npm test api-column-names.test.ts`
    - **Očekivano**: Svi testovi prolaze
    - _Requirements: 2.12-2.15_

  - [ ] 6.4 Integration testovi za API rute
    - **Fajl**: `__tests__/integration/api-routes.test.ts` (NOVI FAJL)
    - **Testovi**:
      ```typescript
      describe('API Routes Integration', () => {
        it('should return localized apartment data from /api/availability', async () => {
          const response = await fetch('http://localhost:3000/api/availability?checkIn=2024-06-01&checkOut=2024-06-02', {
            headers: { 'Accept-Language': 'sr' }
          })
          const { data } = await response.json()
          
          expect(data.apartments).toBeDefined()
          expect(data.apartments.length).toBeGreaterThan(0)
          
          const apartment = data.apartments[0]
          expect(typeof apartment.name).toBe('string')
          expect(apartment.name).not.toContain('[object Object]')
          expect(apartment.base_price_eur).toBeDefined()
          expect(typeof apartment.base_price_eur).toBe('number')
        })
        
        it('should create booking with full_name in guests', async () => {
          const response = await fetch('http://localhost:3000/api/booking', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              apartmentId: 'test-apartment-id',
              guest: {
                name: 'John Doe',
                email: 'john@example.com',
                phone: '+381123456789'
              },
              checkIn: '2024-06-01',
              checkOut: '2024-06-02'
            })
          })
          const { data, error } = await response.json()
          
          if (!error) {
            expect(data.guestName).toBe('John Doe')
            
            // Verify in database
            const { data: guest } = await supabase
              .from('guests')
              .select('full_name')
              .eq('id', data.guestId)
              .single()
            
            expect(guest.full_name).toBe('John Doe')
          }
        })
        
        it('should return localized apartment name in admin panel', async () => {
          const response = await fetch('http://localhost:3000/api/admin/apartments', {
            headers: { 'Accept-Language': 'sr' }
          })
          const { data } = await response.json()
          
          expect(data.length).toBeGreaterThan(0)
          expect(typeof data[0].name).toBe('string')
          expect(data[0].name).not.toContain('[object Object]')
        })
      })
      ```
    - **Pokrenuti**: `npm test api-routes.test.ts`
    - **Očekivano**: Svi testovi prolaze
    - _Requirements: 2.16-2.22, 3.1-3.12_

  - [x] 6.5 Property-based testovi za transformaciju
    - **Fajl**: `__tests__/property/apartment-transformation.property.test.ts` (NOVI FAJL)
    - **Instalirati fast-check**: `npm install --save-dev fast-check`
    - **Testovi**:
      ```typescript
      import fc from 'fast-check'
      import { transformApartmentRecord } from '@/lib/transformers/database'
      
      describe('Apartment Transformation Properties', () => {
        it('should always return localized strings for any valid apartment record', () => {
          fc.assert(
            fc.property(
              fc.record({
                id: fc.uuid(),
                name: fc.record({ 
                  sr: fc.string({ minLength: 1 }), 
                  en: fc.string({ minLength: 1 }), 
                  de: fc.string({ minLength: 1 }), 
                  it: fc.string({ minLength: 1 }) 
                }),
                description: fc.record({ 
                  sr: fc.string(), 
                  en: fc.string(), 
                  de: fc.string(), 
                  it: fc.string() 
                }),
                bed_type: fc.record({ 
                  sr: fc.string(), 
                  en: fc.string(), 
                  de: fc.string(), 
                  it: fc.string() 
                }),
                capacity: fc.integer({ min: 1, max: 10 }),
                amenities: fc.array(fc.record({ 
                  sr: fc.string(), 
                  en: fc.string(), 
                  de: fc.string(), 
                  it: fc.string() 
                })),
                base_price_eur: fc.double({ min: 10, max: 500 }),
                images: fc.array(fc.record({ 
                  url: fc.webUrl(), 
                  alt: fc.record({ 
                    sr: fc.string(), 
                    en: fc.string(), 
                    de: fc.string(), 
                    it: fc.string() 
                  }) 
                })),
                status: fc.constantFrom('active', 'inactive', 'maintenance'),
                display_order: fc.integer({ min: 0, max: 100 }),
                created_at: fc.date().map(d => d.toISOString()),
                updated_at: fc.date().map(d => d.toISOString())
              }),
              fc.constantFrom('sr', 'en', 'de', 'it'),
              (record, locale) => {
                const localized = transformApartmentRecord(record as any, locale)
                
                // Property 1: name is always a string
                expect(typeof localized.name).toBe('string')
                expect(localized.name.length).toBeGreaterThan(0)
                
                // Property 2: amenities is always an array of strings
                expect(Array.isArray(localized.amenities)).toBe(true)
                localized.amenities.forEach(amenity => {
                  expect(typeof amenity).toBe('string')
                })
                
                // Property 3: images is always an array of strings (URLs)
                expect(Array.isArray(localized.images)).toBe(true)
                localized.images.forEach(image => {
                  expect(typeof image).toBe('string')
                })
                
                // Property 4: base_price_eur is preserved
                expect(localized.base_price_eur).toBe(record.base_price_eur)
              }
            ),
            { numRuns: 100 }
          )
        })
      })
      ```
    - **Pokrenuti**: `npm test apartment-transformation.property.test.ts`
    - **Očekivano**: Svi testovi prolaze (100 random test cases)
    - _Requirements: 2.16-2.18_

  - [ ] 6.6 Property-based testovi za preservation
    - **Fajl**: `__tests__/property/booking-preservation.property.test.ts` (NOVI FAJL)
    - **Testovi**:
      ```typescript
      import fc from 'fast-check'
      
      describe('Booking Preservation Properties', () => {
        it('should preserve booking creation for valid data', () => {
          fc.assert(
            fc.property(
              fc.record({
                apartmentId: fc.uuid(),
                guest: fc.record({
                  name: fc.string({ minLength: 1, maxLength: 100 }),
                  email: fc.emailAddress(),
                  phone: fc.option(fc.string({ minLength: 5, maxLength: 20 }))
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
                // Property: Valid booking data should always succeed or fail with known errors
                const response = await fetch('http://localhost:3000/api/booking', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(bookingData)
                })
                const result = await response.json()
                
                if (result.error) {
                  // Only acceptable errors are availability issues
                  expect(result.error).toMatch(/not available|unavailable/)
                } else {
                  // Success case
                  expect(result.data.booking).toBeDefined()
                  expect(result.data.booking.guestName).toBe(bookingData.guest.name)
                  expect(result.data.booking.checkIn).toBe(bookingData.checkIn)
                  expect(result.data.booking.checkOut).toBe(bookingData.checkOut)
                }
              }
            ),
            { numRuns: 50 }
          )
        })
      })
      ```
    - **Pokrenuti**: `npm test booking-preservation.property.test.ts`
    - **Očekivano**: Svi testovi prolaze (50 random test cases)
    - _Requirements: 3.1-3.12_

  - [ ] 6.7 Integration test za migracije
    - **Fajl**: `__tests__/integration/migration-integrity.test.ts` (NOVI FAJL)
    - **Testovi**:
      ```typescript
      describe('Migration Integrity', () => {
        it('should have all required tables', async () => {
          const { data: tables } = await supabase
            .rpc('get_tables')
          
          const requiredTables = [
            'guests', 'apartments', 'bookings', 'availability',
            'reviews', 'booking_messages', 'messages', 'gallery',
            'analytics_events', 'content'
          ]
          
          requiredTables.forEach(table => {
            expect(tables).toContain(table)
          })
        })
        
        it('should have correct column names in guests table', async () => {
          const { data, error } = await supabase
            .from('guests')
            .select('full_name')
            .limit(1)
          
          expect(error).toBeNull()
          // Ako postoje podaci, proveriti strukturu
          if (data && data.length > 0) {
            expect(data[0]).toHaveProperty('full_name')
          }
        })
        
        it('should have correct column names in apartments table', async () => {
          const { data, error } = await supabase
            .from('apartments')
            .select('base_price_eur, display_order')
            .limit(1)
          
          expect(error).toBeNull()
          if (data && data.length > 0) {
            expect(data[0]).toHaveProperty('base_price_eur')
            expect(data[0]).toHaveProperty('display_order')
          }
        })
        
        it('should have correct column names in bookings table', async () => {
          const { data, error } = await supabase
            .from('bookings')
            .select('check_in, check_out, nights, booking_number')
            .limit(1)
          
          expect(error).toBeNull()
          if (data && data.length > 0) {
            expect(data[0]).toHaveProperty('check_in')
            expect(data[0]).toHaveProperty('check_out')
            expect(data[0]).toHaveProperty('nights')
            expect(data[0]).toHaveProperty('booking_number')
          }
        })
      })
      ```
    - **Pokrenuti**: `npm test migration-integrity.test.ts`
    - **Očekivano**: Svi testovi prolaze
    - _Requirements: 2.23-2.25_

---

## FAZA 7: Validacija i Deployment Plan

### Cilj
Validirati da sve radi i kreirati deployment plan.

- [x] 7. Validacija i Deployment

  - [x] 7.1 Validirati sve API rute
    - **Akcija**: Ručno testirati sve API rute u browseru ili Postman-u
    - **API rute za testiranje**:
      - `GET /api/availability?checkIn=2024-06-01&checkOut=2024-06-02`
        - Proveriti: `base_price_eur` postoji, `name` je string
      - `POST /api/booking` (sa test podacima)
        - Proveriti: Gost se kreira sa `full_name`
      - `GET /api/admin/apartments`
        - Proveriti: Svi apartmani imaju lokalizovane stringove
      - `GET /api/admin/bookings`
        - Proveriti: Sve rezervacije imaju ispravne nazive kolona
      - `GET /api/portal/profile`
        - Proveriti: Profil vraća `full_name`
    - **Očekivano**: Sve API rute vraćaju ispravne podatke
    - _Requirements: 2.12-2.22_

  - [x] 7.2 Validirati sve komponente
    - **Akcija**: Otvoriti aplikaciju u browseru i testirati sve komponente
    - **Komponente za testiranje**:
      - Admin Panel → Apartments Manager
        - Proveriti: Imena apartmana se prikazuju kao tekst, ne `[object Object]`
      - Booking Page → Availability Calendar
        - Proveriti: Imena apartmana se prikazuju kao tekst
      - Admin Panel → Stats Cards
        - Proveriti: Statistike se prikazuju ispravno
      - Portal → Booking Details
        - Proveriti: Detalji rezervacije se prikazuju ispravno
    - **Očekivano**: Sve komponente prikazuju ispravne podatke
    - _Requirements: 2.20-2.22_

  - [x] 7.3 Pokrenuti sve testove
    - **Komanda**: `npm test`
    - **Očekivano**: Svi testovi prolaze (unit, integration, property-based)
    - **Ako neki test pada**: Popraviti problem pre deployment-a
    - _Requirements: 2.1-2.25, 3.1-3.16_

  - [x] 7.4 Kompajlirati projekat
    - **Komanda**: `npm run build`
    - **Očekivano**: Nema TypeScript grešaka, build uspešan
    - **Ako ima grešaka**: Popraviti sve greške
    - _Requirements: 2.1-2.11_

  - [x] 7.5 Kreirati deployment plan
    - **Fajl**: `.kiro/specs/complete-database-project-sync/deployment-plan.md` (NOVI FAJL)
    - **Sadržaj**:
      ```markdown
      # Deployment Plan: Kompletna Usklađenost Baze Podataka i Projekta
      
      ## Pre-Deployment Checklist
      
      - [ ] Svi unit testovi prolaze
      - [ ] Svi integration testovi prolaze
      - [ ] Svi property-based testovi prolaze
      - [ ] TypeScript kompajlira bez grešaka
      - [ ] Migracije testirane na staging okruženju
      - [ ] Performance testovi pokazuju prihvatljive rezultate
      - [ ] Dokumentacija ažurirana
      - [ ] Backup produkcijske baze kreiran
      - [ ] Rollback plan pripremljen
      
      ## Deployment Steps
      
      ### 1. Kreirati Backup
      ```bash
      # Kreirati full backup produkcijske baze
      pg_dump -h [supabase-host] -U postgres -d postgres > backup_$(date +%Y%m%d_%H%M%S).sql
      ```
      
      ### 2. Primeniti Migracije (AKO SU POTREBNE)
      ```bash
      # Samo ako su pronađene razlike u Fazi 5
      supabase db push
      ```
      
      ### 3. Deploy Backend
      ```bash
      # Deploy API rute i transformer funkcije
      git push production main
      ```
      
      ### 4. Verifikacija
      ```bash
      # Pokrenuti smoke testove na produkciji
      npm run test:smoke:production
      ```
      
      ### 5. Monitoring
      - Pratiti error rate u Sentry/LogRocket
      - Pratiti API response times
      - Pratiti database query performance
      - Pratiti user feedback
      
      ## Rollback Plan
      
      ### Ako nešto pođe po zlu:
      
      1. **Vratiti kod**:
         ```bash
         git revert HEAD
         git push production main
         ```
      
      2. **Vratiti bazu** (samo ako su migracije primenjene):
         ```bash
         psql -h [supabase-host] -U postgres -d postgres < backup_[timestamp].sql
         ```
      
      3. **Verifikacija**:
         - Proveriti da aplikacija radi
         - Proveriti da podaci nisu izgubljeni
      
      ## Post-Deployment
      
      - [ ] Verifikovat da sve API rute rade
      - [ ] Verifikovat da sve komponente prikazuju podatke
      - [ ] Proveriti logove za greške
      - [ ] Proveriti performance metrike
      - [ ] Obavestiti tim o uspešnom deployment-u
      ```
    - _Requirements: 2.1-2.25, 3.1-3.16_

  - [x] 7.6 Ažurirati dokumentaciju
    - **Fajl**: `README.md`
    - **Dodati sekciju**:
      ```markdown
      ## Database Schema
      
      Projekat koristi Supabase PostgreSQL bazu sa sledećim tabelama:
      
      - `guests` - Gosti (kolona: `full_name`, NE `name`)
      - `apartments` - Apartmani (kolona: `base_price_eur`, NE `price_per_night`)
      - `bookings` - Rezervacije (kolone: `check_in`, `check_out`, `nights`, `booking_number`)
      - `availability` - Dostupnost apartmana
      - `reviews` - Recenzije
      - `booking_messages` - Poruke vezane za rezervacije
      - `messages` - Kontakt poruke
      - `gallery` - Galerija slika
      - `analytics_events` - Analitički eventi
      - `content` - CMS sadržaj
      
      ### JSONB Kolone
      
      Tabela `apartments` koristi JSONB kolone za multi-language podrš
ku:
      - `name` - JSONB objekat: `{sr, en, de, it}`
      - `description` - JSONB objekat: `{sr, en, de, it}`
      - `bed_type` - JSONB objekat: `{sr, en, de, it}`
      - `amenities` - JSONB array: `[{sr, en, de, it}, ...]`
      - `images` - JSONB array: `[{url, alt: {sr, en, de, it}}, ...]`
      
      ### Transformer Functions
      
      API rute koriste transformer funkcije (`src/lib/transformers/database.ts`) za konverziju JSONB objekata u lokalizovane stringove:
      - `transformApartmentRecord()` - Transformiše `ApartmentRecord` → `LocalizedApartment`
      - `transformBookingRecord()` - Transformiše `BookingRecord` sa related data
      - `transformReviewRecord()` - Transformiše `ReviewRecord` sa related data
      
      ### Migracije
      
      SQL migracije se nalaze u `supabase/migrations/`:
      - `01_SCHEMA_COMPLETE.sql` - Kompletna šema
      - `02_RLS_POLICIES_COMPLETE.sql` - RLS politike
      - `03_FUNCTIONS_COMPLETE.sql` - Funkcije i trigeri
      - `04_REALTIME_COMPLETE.sql` - Realtime konfiguracija
      - `05_SEED_DATA_COMPLETE.sql` - Početni podaci
      ```
    - _Requirements: 2.1-2.25_

---

## Checkpoint

- [x] 8. Finalni checkpoint - Osigurati da sve radi
  - **Akcija**: Proveriti da su svi zadaci iz Faza 1-7 kompletni
  - **Pitanja za korisnika**:
    - Da li sve API rute vraćaju ispravne podatke?
    - Da li sve komponente prikazuju ispravne podatke?
    - Da li svi testovi prolaze?
    - Da li TypeScript kompajlira bez grešaka?
    - Da li su migracije primenjene (ako su bile potrebne)?
  - **Ako ima problema**: Vratiti se na odgovarajuću fazu i popraviti
  - **Ako sve radi**: Projekat je spreman za deployment
  - _Requirements: 2.1-2.25, 3.1-3.16_

---

## Napomene

### Kritične Izmene

1. **Nazivi Kolona**:
   - `guests.name` → `guests.full_name`
   - `apartments.price_per_night` → `apartments.base_price_eur`
   - `apartments.type` → NE POSTOJI
   - `bookings.checkin` → `bookings.check_in`
   - `bookings.checkout` → `bookings.check_out`

2. **JSONB Tipovi**:
   - `ApartmentRecord.name` → `Json` (ne direktno `MultiLanguageText`)
   - `ApartmentRecord.amenities` → `Json` (ne `string[]`)
   - `ApartmentRecord.images` → `Json` (ne `string[]`)

3. **Transformer Funkcije**:
   - UVEK koristiti `transformApartmentRecord()` pre slanja podataka frontendu
   - UVEK koristiti `extractLocale()` za određivanje jezika

### Redosled Izvršavanja

**KRITIČNO**: Faze MORAJU biti izvršene u ovom redosledu:
1. Faza 1 (TypeScript tipovi) → Faza 2 (Transformeri) → Faza 3 (API rute) → Faza 4 (Komponente)
2. Faza 5 (Migracije) može se raditi paralelno sa Fazom 1-4
3. Faza 6 (Testiranje) nakon Faza 1-5
4. Faza 7 (Validacija) nakon Faze 6

### Trajanje

- **Faza 1**: 2-3 sata
- **Faza 2**: 3-4 sata
- **Faza 3**: 4-6 sati
- **Faza 4**: 2-3 sata
- **Faza 5**: 4-5 sati (ili 1 sat ako su migracije već primenjene)
- **Faza 6**: 6-8 sati
- **Faza 7**: 2-3 sata

**Ukupno**: 23-31 sat (3-4 radna dana)
