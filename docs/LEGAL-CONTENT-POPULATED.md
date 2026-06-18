# Pravni Sadržaj Uspešno Unet u Bazu ✅

**Datum:** 23. Februar 2026

## Šta je urađeno

Uspešno sam izvukao sve pravne tekstove iz projekta i uneo ih u Supabase bazu podataka kako bi se mogli lako menjati kroz admin panel.

## Uneti Sadržaji

### 1. Politika Privatnosti (Privacy Policy) - GDPR
Kompletan pravni tekst sa 7 sekcija:
- Koje podatke prikupljamo
- Kako koristimo vaše podatke
- Zaštita podataka
- Kolačići (Cookies)
- Vaša prava
- Rok čuvanja podataka
- Kontakt za pitanja o privatnosti

### 2. Uslovi Korišćenja i Kućni Red (Terms of Service)
Kompletan pravni tekst sa 7 sekcija:
- Rezervacija i potvrda
- Prijava i odjava (Check-in/Check-out)
- Politika otkazivanja
- Kućni red - Osnovna pravila
- Zabrane i bezbednost
- Šteta i odgovornost
- Dodatne obaveze

## Jezici

Svi tekstovi su uneti za **4 jezika**:
- 🇷🇸 **Srpski (SR)** - Originalni tekstovi
- 🇬🇧 **Engleski (EN)** - Profesionalni prevod
- 🇩🇪 **Nemački (DE)** - Koristi engleski kao fallback (može se prevesti kasnije)
- 🇮🇹 **Italijanski (IT)** - Koristi engleski kao fallback (može se prevesti kasnije)

## Statistika

- **Ukupno uneto:** 128 redova
- **Broj ključeva po jeziku:** 32 (16 privacy + 16 terms)
- **Ukupno ključeva:** 32 × 4 jezika = 128 redova
- **Greške:** 0 ❌

## Struktura Ključeva u Bazi

### Privacy Policy
```
privacy.title
privacy.lastUpdated
privacy.intro
privacy.dataCollection.title
privacy.dataCollection.content
privacy.dataUsage.title
privacy.dataUsage.content
privacy.dataProtection.title
privacy.dataProtection.content
privacy.userRights.title
privacy.userRights.content
privacy.cookies.title
privacy.cookies.content
privacy.gdpr.title
privacy.gdpr.content
privacy.contact.title
privacy.contact.content
```

### Terms of Service
```
terms.title
terms.lastUpdated
terms.intro
terms.booking.title
terms.booking.content
terms.payment.title
terms.payment.content
terms.cancellation.title
terms.cancellation.content
terms.houseRules.title
terms.houseRules.content
terms.liability.title
terms.liability.content
terms.changes.title
terms.changes.content
```

## Kako Koristiti u Admin Panelu

1. Otvori admin panel: `/admin`
2. Idi na "Upravljanje sadržajem"
3. Izaberi sekciju **"Politika privatnosti (GDPR)"** ili **"Uslovi korišćenja"**
4. Izaberi jezik (SR, EN, DE, IT)
5. Izmeni tekstove
6. Klikni "Sačuvaj izmene"

## Fajlovi Kreirani

1. **`scripts/populate-legal-content.sql`** - SQL skripta sa svim podacima
2. **`scripts/populate-legal-db.mjs`** - Node.js skripta za unos u bazu
3. **`src/components/admin/ContentEditor.tsx`** - Ažuriran sa sekcijama za pravne tekstove

## Izvorne Datoteke

Podaci su izvučeni iz:
- `messages/legal-sr.json` - Srpski tekstovi
- `messages/legal-en.json` - Engleski tekstovi
- `messages/sr.json` - Dodatni srpski sadržaj
- `messages/en.json` - Dodatni engleski sadržaj

## Sledeći Koraci

### Za Nemačke i Italijanske Prevode
Trenutno DE i IT koriste engleski tekst. Kada budete spremni:

1. Prevedite tekstove na nemački i italijanski
2. Otvorite admin panel
3. Izaberite jezik (DE ili IT)
4. Zamenite engleski tekst sa prevodima
5. Sačuvajte

### Za Dodavanje Novih Sekcija
Ako želite da dodate nove pravne sekcije (npr. "O nama"):

1. Dodajte nove ključeve u `ContentEditor.tsx` (već je pripremljeno)
2. Unesite sadržaj kroz admin panel
3. Kreirajte stranicu koja prikazuje taj sadržaj

## Provera

Možete proveriti da li su podaci u bazi:

```sql
SELECT key, language, LEFT(value::text, 50) as preview 
FROM content 
WHERE key LIKE 'privacy%' OR key LIKE 'terms%' 
ORDER BY key, language;
```

## Status: ✅ ZAVRŠENO

Svi pravni tekstovi su uspešno uneti u bazu i spremni za izmenu kroz admin panel!
