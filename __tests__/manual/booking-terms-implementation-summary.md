# Implementacija: Uslovi Korišćenja i Instrukcije za Goste

## Problem
Kada gost šalje zahtev za rezervaciju:
1. Ne zna koje uslove prihvata
2. Ne dobija jasne instrukcije šta sledi nakon slanja zahteva

## Rešenje

### 1. Checkbox za Uslove Korišćenja (Pre Slanja)
- ✅ Dodat obavezan checkbox u koraku 3 (Vaši podaci)
- ✅ Checkbox sadrži linkove ka:
  - Uslovima korišćenja (`/[lang]/terms`)
  - Politici privatnosti (`/[lang]/privacy`)
- ✅ Linkovi se otvaraju u novom tabu
- ✅ Dugme "Pošalji zahtev" je disabled dok checkbox nije čekiran
- ✅ Prikazuje se error poruka ako korisnik pokuša da pošalje bez prihvatanja

### 2. Instrukcije Nakon Slanja (Post Slanja)
- ✅ Success stranica sada prikazuje "Šta sledi?" sekciju
- ✅ 3 jasna koraka:
  1. Email potvrda zahteva
  2. Kontakt u roku od 24h
  3. Instrukcije za plaćanje i dolazak
- ✅ Vizuelno istaknuto sa plavom karticom i numerisanim koracima

### 3. Nove Stranice
Kreirane stranice za sve jezike:
- `/[lang]/terms` - Uslovi korišćenja
- `/[lang]/privacy` - Politika privatnosti

### 4. Prevodi
Dodati prevodi u sve jezike (sr, en, de, it):
- `booking.form.acceptTerms` - "Prihvatam"
- `booking.form.termsLink` - "uslove korišćenja"
- `booking.form.and` - "i"
- `booking.form.privacyLink` - "politiku privatnosti"
- `booking.messages.acceptTermsRequired` - Error poruka
- `booking.messages.instructionsTitle` - "Šta sledi?"
- `booking.messages.instructionsStep1/2/3` - Koraci

## Izmenjeni Fajlovi

### Frontend
- `src/app/[lang]/booking/BookingFlow.tsx` - Dodat checkbox i instrukcije
- `src/app/[lang]/terms/page.tsx` - Nova stranica
- `src/app/[lang]/privacy/page.tsx` - Nova stranica

### Prevodi
- `messages/sr.json` - Srpski prevodi
- `messages/en.json` - Engleski prevodi
- `messages/de.json` - Nemački prevodi
- `messages/it.json` - Italijanski prevodi

### Testovi
- `__tests__/manual/booking-terms-checkbox-test.md` - Test plan

## Tehnički Detalji

### BookingData Interface
```typescript
interface BookingData {
  // ... existing fields
  acceptedTerms: boolean  // NOVO
}
```

### Validacija
```typescript
if (!bookingData.acceptedTerms) {
  setSubmitError(t('messages.acceptTermsRequired'))
  return
}
```

### Disabled Button Logic
```typescript
disabled={
  !bookingData.contact.name || 
  !bookingData.contact.email || 
  !bookingData.acceptedTerms ||  // NOVO
  isSubmitting
}
```

## Dizajn
- Checkbox je u plavoj kartici sa border-om za vizuelnu pažnju
- Linkovi su bold i primary boje
- Instrukcije su u plavoj kartici sa numerisanim koracima
- Konzistentno sa postojećim dizajnom (rounded-3xl, font-black, itd.)

## Pravna Zaštita
✅ Gost mora eksplicitno da prihvati uslove
✅ Linkovi omogućavaju čitanje uslova pre prihvatanja
✅ Checkbox je obavezan (required)
✅ Validacija sprečava slanje bez prihvatanja

## Korisničko Iskustvo
✅ Jasno je šta gost prihvata
✅ Lako je pročitati uslove (novi tab)
✅ Jasne instrukcije šta sledi nakon slanja
✅ Profesionalan i transparentan proces
