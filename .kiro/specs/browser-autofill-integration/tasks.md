# Plan implementacije: Integracija sa automatskim popunjavanjem pretraživača

## Pregled

Ova implementacija dodaje standardne HTML atribute za autofill (`autocomplete`, `name`, `type`, `id`) na polja formulara za rezervaciju u komponenti `BookingFlow.tsx`. Izmene su minimalne i fokusirane na Step 3 (Guest Information Form), gde se prikupljaju podaci o gostu (ime, email, telefon).

Implementacija koristi WHATWG HTML standard za maksimalnu kompatibilnost sa svim glavnim pretraživačima (Chrome, Firefox, Safari, Edge) i poboljšava pristupačnost kroz pravilno povezivanje labela sa input poljima.

## Zadaci

- [x] 1. Dodati autofill atribute na polje za ime
  - Dodati `id="guest-name"` atribut na Input komponentu
  - Dodati `name="name"` atribut
  - Dodati `type="text"` atribut
  - Dodati `autoComplete="name"` atribut (WHATWG standard)
  - Dodati `aria-required="true"` atribut za pristupačnost
  - Dodati `htmlFor="guest-name"` na odgovarajući label element
  - Lokacija: `src/app/[lang]/booking/BookingFlow.tsx`, Step 3, polje za ime
  - _Zahtevi: 1.1, 1.2, 1.3, 1.4, 6.1, 6.2, 6.4_

- [x] 2. Dodati autofill atribute na polje za email
  - Dodati `id="guest-email"` atribut na Input komponentu
  - Dodati `name="email"` atribut
  - Verifikovati da `type="email"` atribut već postoji (već implementirano)
  - Dodati `autoComplete="email"` atribut (WHATWG standard)
  - Dodati `aria-required="true"` atribut za pristupačnost
  - Dodati `htmlFor="guest-email"` na odgovarajući label element
  - Lokacija: `src/app/[lang]/booking/BookingFlow.tsx`, Step 3, polje za email
  - _Zahtevi: 2.1, 2.2, 2.3, 2.4, 6.1, 6.2, 6.4_

- [x] 3. Dodati autofill atribute na polje za telefon
  - Dodati `id="guest-phone"` atribut na Input komponentu
  - Dodati `name="tel"` atribut (koristi 'tel' umesto 'phone' prema WHATWG standardu)
  - Dodati `type="tel"` atribut
  - Dodati `autoComplete="tel"` atribut (WHATWG standard)
  - Dodati `aria-required="true"` atribut za pristupačnost
  - Dodati `htmlFor="guest-phone"` na odgovarajući label element
  - Lokacija: `src/app/[lang]/booking/BookingFlow.tsx`, Step 3, polje za telefon
  - _Zahtevi: 3.1, 3.2, 3.3, 3.4, 6.1, 6.2, 6.4_

- [x] 4. Verifikovati da Input komponenta prosleđuje HTML atribute
  - Proveriti implementaciju `src/app/[lang]/components/ui/input.tsx`
  - Ako komponenta ne prosleđuje atribute, dodati `{...props}` spread operator
  - Osigurati da svi custom atributi (`id`, `name`, `type`, `autoComplete`, `aria-required`) budu prosleđeni DOM elementu
  - _Zahtevi: 1.1-1.4, 2.1-2.4, 3.1-3.4_

- [ ]* 5. Napisati unit testove za autofill atribute
  - [ ]* 5.1 Test za kompletan set autofill atributa
    - **Property 1: Kompletan set autofill atributa**
    - **Validira: Zahtevi 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4**
    - Renderovati BookingFlow komponentu i navigirati do Step 3
    - Pronaći sva tri input polja (ime, email, telefon)
    - Verifikovati da svako polje ima `id`, `name`, `type`, `autoComplete`, i `required` atribute
    - Lokacija: `__tests__/unit/booking-autofill.test.tsx`
  
  - [ ]* 5.2 Test za WHATWG standardne autocomplete vrednosti
    - **Property 2: WHATWG standardne autocomplete vrednosti**
    - **Validira: Zahtev 4.5**
    - Renderovati BookingFlow komponentu i navigirati do Step 3
    - Verifikovati da polje za ime ima `autoComplete="name"`
    - Verifikovati da polje za email ima `autoComplete="email"`
    - Verifikovati da polje za telefon ima `autoComplete="tel"`
    - Lokacija: `__tests__/unit/booking-autofill.test.tsx`
  
  - [ ]* 5.3 Test za povezane labele
    - **Property 3: Povezane labele**
    - **Validira: Zahtevi 6.1, 6.2**
    - Renderovati BookingFlow komponentu i navigirati do Step 3
    - Pronaći sve label elemente
    - Verifikovati da svaki label ima `htmlFor` atribut koji odgovara `id` atributu input polja
    - Verifikovati da svaki label sadrži neprazan tekst
    - Lokacija: `__tests__/unit/booking-autofill.test.tsx`
  
  - [ ]* 5.4 Test za required atribut
    - **Property 6: Required atribut na obaveznim poljima**
    - **Validira: Zahtev 6.4**
    - Renderovati BookingFlow komponentu i navigirati do Step 3
    - Verifikovati da sva tri polja (ime, email, telefon) imaju `required` atribut
    - Lokacija: `__tests__/unit/booking-autofill.test.tsx`
  
  - [ ]* 5.5 Test za očuvanu validaciju
    - **Property 7: Očuvana validacija nakon dodavanja autofill atributa**
    - **Validira: Zahtevi 7.1, 7.2, 7.3**
    - Renderovati BookingFlow komponentu i navigirati do Step 3
    - Testirati da validacija za prazna polja i dalje radi
    - Testirati da validacija email formata i dalje radi
    - Verifikovati da se prikazuju odgovarajuće poruke o greškama
    - Lokacija: `__tests__/unit/booking-autofill.test.tsx`

- [x] 6. Checkpoint - Verifikacija implementacije
  - Osigurati da svi testovi prolaze
  - Manuelno testirati formu u Chrome DevTools (Autofill simulation)
  - Pitati korisnika ako postoje pitanja ili nejasnoće

- [ ]* 7. Manuelno testiranje u različitim pretraživačima
  - Kreirati `__tests__/manual/browser-autofill-test.md` sa instrukcijama
  - Dokumentovati korake za testiranje u Chrome, Firefox, Safari, Edge
  - Uključiti instrukcije za čuvanje test podataka u pretraživaču
  - Uključiti instrukcije za verifikaciju autofill funkcionalnosti
  - _Zahtevi: 4.1, 4.2, 4.3, 4.4, 8.1, 8.2, 8.3, 8.4, 8.5_

## Napomene

- Zadaci označeni sa `*` su opcioni i mogu biti preskočeni za brži MVP
- Svaki zadatak referencira specifične zahteve radi sledljivosti
- Implementacija ne zahteva promene na backend-u ili bazi podataka
- Autofill je progresivno poboljšanje - forma radi normalno i bez njega
- Postojeća validaciona logika ostaje nepromenjena
- React state automatski hvata vrednosti koje pretraživač popuni kroz autofill
