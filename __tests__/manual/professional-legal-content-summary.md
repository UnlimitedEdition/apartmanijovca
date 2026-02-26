# Profesionalan Pravni Sadržaj - Implementacija

## Problem
Stranice za Uslove korišćenja i Politiku privatnosti su bile generičke, neprofesionalne i bez konkretnih informacija specifičnih za Apartmane Jovča.

## Rešenje
Kreiran je potpuno profesionalan, detaljan pravni sadržaj baziran na stvarnom kućnom redu i poslovnim pravilima.

## Sadržaj Politike Privatnosti

### 1. Koje podatke prikupljamo
- Lični podaci (ime, telefon, email)
- Identifikacioni podaci (lična karta/pasoš - zakonska obaveza)
- Podaci o rezervaciji
- Finansijski podaci
- Komunikacija

### 2. Kako koristimo podatke
- Obrada rezervacija
- Prijava gostiju (zakonska obaveza)
- Komunikacija o boravku
- Obrada plaćanja

### 3. Zaštita podataka
- Sigurni serveri sa enkripcijom
- Pristup samo ovlašćenim licima
- Bez deljenja sa trećim stranama (osim zakonski)

### 4. Kolačići
- Jezička podešavanja
- Analiza posećenosti (anonimno)
- Poboljšanje korisničkog iskustva

### 5. Prava korisnika
- Uvid u podatke
- Ispravka netačnih podataka
- Brisanje podataka
- Povlačenje saglasnosti

### 6. Rok čuvanja
- Prijave gostiju: 1 godina
- Finansijski podaci: 5 godina
- Ostali podaci: 2 godine

## Sadržaj Uslova Korišćenja

### 1. Rezervacija i potvrda
- Važeća tek nakon pisane potvrde
- Depozit 50€ obavezan
- Puna uplata 7 dana pre dolaska
- Obavezuje obe strane

### 2. Prijava i odjava
- Check-in: od 14:00 (rani +10€/sat)
- Check-out: do 10:00 (kasni +10€/sat)
- Prijava gostiju zakonski obavezna

### 3. Politika otkazivanja
- 14+ dana: 100% povraćaj (osim 30€)
- 7-14 dana: 50% povraćaj
- <7 dana: bez povraćaja

### 4. Kućni red - Osnovna pravila
- Tišina: 22:00-08:00 (kazna: prekid bez povraćaja)
- Maksimalan broj gostiju (dodatni +20€/noć)
- Pušenje samo na terasi (kazna 100€)
- Ljubimci uz najavu (+15€/dan)

### 5. Zabrane i bezbednost
- Žurke (kazna 200€)
- Iznošenje inventara (naknada po vrednosti)
- Ilegalne aktivnosti (prijava policiji)

### 6. Šteta i odgovornost
- Naknada po stvarnoj vrednosti
- Depozit 50€ kao garancija
- Povraćaj u roku od 24h

### 7. Dodatne obaveze
- Urednost objekta
- Odlaganje smeća
- Isključivanje uređaja
- Gubitak ključa (50€)

## Tehnička Implementacija

### Fajlovi
- `src/app/[lang]/terms/page.tsx` - Ažurirana stranica sa profesionalnim layoutom
- `src/app/[lang]/privacy/page.tsx` - Ažurirana stranica sa profesionalnim layoutom
- `messages/legal-sr.json` - Srpski prevodi
- `messages/legal-en.json` - Engleski prevodi
- `messages/legal-de.json` - Nemački prevodi
- `messages/legal-it.json` - Italijanski prevodi
- `scripts/update-legal-translations.cjs` - Skripta za ažuriranje

### Dizajn Poboljšanja
- Veći naslov (text-5xl md:text-6xl)
- "Poslednje ažurirano" datum
- Bullet liste za jasnoću
- Istaknute sekcije sa plavom pozadinom
- Kontakt informacije na kraju
- Konzistentan spacing i typography

### Jezici
✅ Srpski (sr)
✅ Engleski (en)
✅ Nemački (de)
✅ Italijanski (it)

## Pravna Zaštita

### Pokriveno
✅ GDPR-like zaštita podataka
✅ Jasna pravila otkazivanja
✅ Definisane kazne za kršenje
✅ Zakonske obaveze (prijava gostiju)
✅ Finansijske odredbe
✅ Bezbednosna pravila
✅ Odgovornost za štetu

### Profesionalnost
✅ Konkretni iznosi (50€ depozit, 100€ kazna za pušenje, itd.)
✅ Jasni vremenski rokovi (14 dana, 7 dana, 24 sata)
✅ Specifična pravila (tišina 22:00-08:00)
✅ Zakonske reference (prijava gostiju, čuvanje podataka)
✅ Kontakt informacije za pitanja

## Testiranje

### Manuelni Test
1. Otvori `/sr/terms` - proveri da li se prikazuje kompletan sadržaj
2. Otvori `/sr/privacy` - proveri da li se prikazuje kompletan sadržaj
3. Ponovi za `/en/`, `/de/`, `/it/`
4. Proveri linkove iz booking forme
5. Proveri da li se stranice otvaraju u novom tabu

### Očekivani Rezultati
- 7 sekcija u Terms
- 6 sekcija u Privacy
- Kontakt informacije na kraju
- Profesionalan dizajn
- Svi prevodi rade

## Zaključak
Kreiran je potpuno profesionalan pravni sadržaj koji:
- Štiti vlasnika pravno
- Informiše goste jasno
- Definiše pravila precizno
- Izgleda profesionalno
- Radi na svim jezicima
