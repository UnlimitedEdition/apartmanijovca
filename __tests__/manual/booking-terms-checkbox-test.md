# Test: Booking Terms & Conditions Checkbox

## Cilj
Proveriti da li gost mora da prihvati uslove korišćenja pre slanja zahteva za rezervaciju i da li dobija jasne instrukcije nakon slanja.

## Pre-uslovi
- Aplikacija je pokrenuta
- Postoje dostupni apartmani u bazi

## Test Koraci

### 1. Navigacija do booking forme
1. Otvori aplikaciju u browseru
2. Klikni na "Rezerviši" dugme
3. **Očekivano**: Otvara se booking flow sa 3 koraka

### 2. Korak 1 - Izbor datuma i apartmana
1. Izaberi check-in datum (npr. sutra)
2. Izaberi check-out datum (npr. za 3 dana)
3. Izaberi apartman iz kalendara
4. Klikni "Sledeće"
5. **Očekivano**: Prelazi na korak 2

### 3. Korak 2 - Opcije
1. Opciono izaberi neke opcije (krevetac, parking, itd.)
2. Klikni "Sledeće"
3. **Očekivano**: Prelazi na korak 3

### 4. Korak 3 - Podaci gosta i uslovi
1. Unesi ime (npr. "Marko Petrović")
2. Unesi telefon (npr. "+381641234567")
3. Unesi email (npr. "test@example.com")
4. **Proveri checkbox za uslove**:
   - Checkbox je vidljiv
   - Tekst kaže "Prihvatam uslove korišćenja i politiku privatnosti"
   - Linkovi "uslove korišćenja" i "politiku privatnosti" su klikabilni
   - Linkovi otvaraju odgovarajuće stranice u novom tabu
5. **Pokušaj da pošalješ bez čekiranja**:
   - Klikni "Pošalji zahtev za rezervaciju"
   - **Očekivano**: Dugme je disabled ili se prikazuje error poruka
6. **Čekiraj checkbox**:
   - Klikni na checkbox
   - **Očekivano**: Checkbox je čekiran, dugme postaje enabled
7. Klikni "Pošalji zahtev za rezervaciju"
8. **Očekivano**: Zahtev se šalje

### 5. Success stranica sa instrukcijama
1. **Proveri success poruku**:
   - Zelena ikonica sa checkmark-om
   - Naslov "Zahtev za rezervaciju je uspešno poslat!"
   - Podnaslov "Kontaktiraćemo vas uskoro sa potvrdom."
2. **Proveri rezime rezervacije**:
   - Prikazuje izabrani apartman
   - Prikazuje datume
   - Prikazuje ukupnu cenu
3. **Proveri "Šta sledi?" sekciju**:
   - Plava kartica sa naslovom "Šta sledi?"
   - 3 numerisana koraka:
     1. "Primićete email potvrdu vašeg zahteva"
     2. "Kontaktiraćemo vas u roku od 24h radi potvrde"
     3. "Nakon potvrde, dobićete instrukcije za plaćanje i dolazak"
4. **Očekivano**: Sve instrukcije su jasno prikazane

### 6. Provera linkova ka uslovima
1. Otvori novi tab
2. Idi na `/sr/terms`
3. **Očekivano**: 
   - Stranica se učitava
   - Prikazuje "Uslovi korišćenja"
   - Ima 4 sekcije sa sadržajem
4. Idi na `/sr/privacy`
5. **Očekivano**: 
   - Stranica se učitava
   - Prikazuje "Politika privatnosti"
   - Ima 4 sekcije sa sadržajem

### 7. Multi-jezik test
Ponovi korake 4-6 za:
- Engleski (`/en/booking`, `/en/terms`, `/en/privacy`)
- Nemački (`/de/booking`, `/de/terms`, `/de/privacy`)
- Italijanski (`/it/booking`, `/it/terms`, `/it/privacy`)

## Očekivani Rezultati
✅ Checkbox za uslove je obavezan pre slanja
✅ Linkovi ka uslovima i privatnosti rade
✅ Success stranica prikazuje jasne instrukcije u 3 koraka
✅ Sve radi na svim jezicima
✅ Dugme je disabled dok checkbox nije čekiran

## Napomene
- Checkbox mora biti čekiran da bi se omogućilo slanje
- Linkovi se otvaraju u novom tabu (target="_blank")
- Instrukcije su jasne i profesionalne
- Dizajn je konzistentan sa ostatkom aplikacije
