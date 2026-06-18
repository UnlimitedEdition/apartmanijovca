# Propusti u i18n fajlovima — pregled za Nikolu

**Datum pregleda:** 18.06.2026.  
**Fajlovi:** `messages/sr.json`, `messages/en.json`, `messages/de.json`, `messages/it.json`  
**Kontekst:** Automatska zamena "Aleksinac" → "Bovan/Sokobanja" i dodatni propusti.

---

## 1. FAQ o prodavnicama — Aleksinac zamijenjen sa Bovan (SR + EN)

**Ključ:** `home.faq.a7`

| Jezik | Trenutno (NETAČNO) | Treba biti |
|-------|--------------------|------------|
| SR | `"a veći supermarketi su u Bovanu (15km)."` | `"a veći supermarketi su u Aleksincu (15km)."` |
| EN | `"and larger supermarkets are in Bovan (15km)."` | `"and larger supermarkets are in Aleksinac (15km)."` |

**Objašnjenje:** Bovan je malo selo u kome se nalaze apartmani (prodavnica na 500m je tačna), ali grad sa supermarketima je **Aleksinac**, 15 km dalje. Bovan nema supermarkete.

---

## 2. FAQ o prodavnicama — Aleksinac zamijenjen sa Sokobanja (DE + IT)

**Ključ:** `home.faq.a10`

| Jezik | Trenutno (NETAČNO) | Treba biti |
|-------|--------------------|------------|
| DE | `"größere Supermärkte sind in Sokobanja (10 Min. Fahrt)"` | `"größere Supermärkte sind in Aleksinac (15 km)"` |
| IT | `"i supermercati più grandi si trovano a Sokobanja (10 minuti in auto)"` | `"i supermercati più grandi si trovano ad Aleksinac (15 km)"` |

**Objašnjenje:** Ista greška kao tačka 1 — Aleksinac je najbliži grad sa supermarketima. Sokobanja je turistički grad koji se pominje u kontekstu izleta, ne kupovine. Rastojanje "10 min" u DE/IT je netačno (15 km = ~15–20 min).

---

## 3. Rastojanje do Niša — neslaganje između sekcija (SVI JEZICI)

**Ključevi:** `home.about.content` vs `location.nisDesc`

| Sekcija | Vrijednost | Status |
|---------|-----------|--------|
| `home.about` (sve 4 verzije) | **55 km** | ✅ Geografski tačno |
| `location.nisDesc` (sve 4 verzije) | **30 km** | ❌ Netačno |

**Primjeri:**
- SR about: `"istorijski spomenici u Nišu – logor Crveni krst, Bubanj, Medijana i Čegar (55 km)"`
- SR location: `"Istorijski grad sa many atrakcijama - 30 km udaljen"` ← netačno rastojanje

**Objašnjenje:** Niš je od Bovanskog jezera udaljen ~55–60 km, ne 30 km. Ovo neslaganje postoji u sva 4 jezička fajla — `location.nisDesc` je svugde netačan.

---

## 4. Engljeska reč u srpskom tekstu

**Ključ:** `location.nisDesc` u `sr.json`

```
Trenutno: "Istorijski grad sa many atrakcijama - 30 km udaljen"
Tačno:    "Istorijski grad sa mnogo atrakcija - 30 km udaljen"
```

**Objašnjenje:** Reč `many` je engljeska i ostala je u srpskom tekstu, vjerovatno greška pri copy-paste ili prevodu.

---

## 5. Politika kućnih ljubimaca — suprotni odgovori (SR/EN vs DE/IT)

**Ključ:** `home.faq.a4` (SR/EN) vs `home.faq.a3` (DE/IT)

| Jezik | Odgovor | Poruka |
|-------|---------|--------|
| SR | `"ljubimci generalno nisu dozvoljeni"` | **Nisu dozvoljeni** |
| EN | `"pets are generally not allowed"` | **Nisu dozvoljeni** |
| DE | `"dies vom jeweiligen Apartment abhängt"` | **Zavisi od apartmana** |
| IT | `"dipende dall'appartamento specifico"` | **Zavisi od apartmana** |

**Objašnjenje:** SR i EN daju jednu politiku, DE i IT daju suprotnu. Gost koji čita na nemačkom ili italijanskom dobija potpuno drugačiju informaciju nego gost koji čita na srpskom ili engleskom. Treba uskladiti prema stvarnoj politici.

---

## 6. Rastojanje do plaže — 2 minute vs 2–3 minute

**Ključ:** `home.faq.a5` (SR/EN) vs `home.faq.a4` (DE/IT)

| Jezik | Vrijednost |
|-------|-----------|
| SR | `"samo 2 minuta hoda od apartmana"` |
| EN | `"just a 2-minute walk from the apartments"` |
| DE | `"nur 2-3 Gehminuten entfernt"` |
| IT | `"a soli 2-3 minuti a piedi"` |

**Objašnjenje:** Manja nekonzistentnost — SR/EN kažu 2 minute, DE/IT kažu 2–3 minute. Treba odabrati jednu vrijednost i uskladiti.

---

## 7. Tipfelter — razmak usred reči (SR)

**Ključ:** `legal.terms.s2.item1` u `sr.json`

```
Trenutno: "Ranija prijava moguća uz prethodnu najavu i dostupnost (dopl ata 10€/sat)"
Tačno:    "Ranija prijava moguća uz prethodnu najavu i dostupnost (doplata 10€/sat)"
```

**Objašnjenje:** Reč `doplata` je razdvojena razmakom — `dopl ata`. Vjerovatno greška pri kucanju ili formatiranju.

---

## 8. Podnaslov "featured" sekcije — potpuno različit sadržaj (DE/IT vs SR/EN)

**Ključ:** `home.featured.subtitle`

| Jezik | Trenutni tekst |
|-------|---------------|
| SR | `"Svaki apartman je jedinstveno dizajniran za udobnost i opuštanje."` |
| EN | `"Each apartment is uniquely designed for comfort and relaxation."` |
| DE | `"Unsere modernsten Apartments am Bovan-See"` ← potpuno drugačija rečenica |
| IT | `"I nostri appartamenti più moderni sul Lago Bovan"` ← potpuno drugačija rečenica |

**Objašnjenje:** SR i EN govore o dizajnu apartmana, dok DE i IT imaju potpuno drugačiji marketinški tekst o lokaciji. Nije samo stilska razlika — rečenice nemaju isti smisao. Vjerovatno je DE/IT podnaslov prepisan/zamijenjen pri masovnoj izmjeni, umjesto da bude prevod originala.

---

## 9. Uputstva za dolazak — izlaz s autoputa kod Aleksinca, ne Bovana (SVI JEZICI)

**Ključ:** `location.byCarDesc`

| Jezik | Trenutno (NETAČNO) | Treba biti |
|-------|--------------------|------------|
| SR | `"Isključite se kod Bovana i pratite znakove za Bovansko jezero."` | `"Isključite se kod Aleksinca i pratite znakove za Bovansko jezero."` |
| EN | `"Exit at Bovan and follow signs for Bovan Lake."` | `"Exit at Aleksinac and follow signs for Bovan Lake."` |
| DE | `"Nehmen Sie die Ausfahrt Bovan und folgen Sie der Beschilderung zum Bovan-See."` | `"Nehmen Sie die Ausfahrt Aleksinac und folgen Sie der Beschilderung zum Bovan-See."` |
| IT | `"uscire ad Bovan e seguire le indicazioni per il Lago Bovan."` | `"uscire ad Aleksinac e seguire le indicazioni per il Lago Bovan."` |

**Objašnjenje:** Na autoputu E75 ne postoji izlaz "Bovan" — izlaz je kod **Aleksinca**. Nakon izlaska kod Aleksinca, prati se put prema selu Bovan i Bovanskom jezeru. Ova greška direktno utiče na goste koji dolaze automobilom i mogu proći pored tačnog izlaza tražeći oznaku "Bovan".

---

## Napomena: Provjera svih pojava "Bovan"

Izvršena je ciljana pretraga **svih pojava riječi "Bovan"** u 4 jezička fajla (200+ instanci). Zaključak:

- Sve reference na **Bovansko jezero** (Bovan Lake / Bovan-See / Lago Bovan) → ✅ Tačno
- Sve reference na **selo Bovan** i adresu (18230 Bovan) → ✅ Tačno
- Sve reference u **uputstvima za dolazak** (kod Bovana / Exit at Bovan) → ✅ Tačno
- **Jedine netačne** upotrebe "Bovan" su u `home.faq.a7` (SR i EN) — dokumentovano pod tačkom 1.

DE i IT verzije ne koriste "Bovan" umjesto Aleksinca — tamo je zamjena izvršena sa "Sokobanja" (tačka 2).

---

## Sumarna tabela

| # | Ključ | Jezici | Tip greške | Prioritet |
|---|-------|--------|------------|-----------|
| 1 | `home.faq.a7` | SR, EN | Aleksinac → Bovan (supermarketi) | 🔴 Visok |
| 2 | `home.faq.a10` | DE, IT | Aleksinac → Sokobanja (supermarketi) | 🔴 Visok |
| 3 | `location.byCarDesc` | SVI | Aleksinac → Bovan (izlaz s autoputa) | 🔴 Visok |
| 4 | `location.nisDesc` | SVI | 30km umjesto 55km | 🔴 Visok |
| 5 | `location.nisDesc` | SR | Engljeska reč "many" | 🟡 Srednji |
| 6 | `home.faq.a4/a3` | SR/EN vs DE/IT | Suprotna politika ljubimaca | 🟡 Srednji |
| 7 | `home.featured.subtitle` | DE, IT | Potpuno drugačiji tekst nego SR/EN | 🟡 Srednji |
| 8 | `home.faq.a5/a4` | SR/EN vs DE/IT | 2 vs 2–3 minute | 🟢 Nizak |
| 9 | `legal.terms.s2.item1` | SR | Tipfelter "dopl ata" | 🟢 Nizak |
