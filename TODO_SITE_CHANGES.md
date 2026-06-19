# TODO izmene za sajt

Ovaj fajl je lista dogovorenih izmena koje treba raditi korak po korak.

## Admin / Apartmani / Opis

- Skloniti `Dodatne karakteristike` iz admin forme za apartmane.
- Skloniti detaljna `Pravila kuce` iz admin forme za apartmane.

## Admin / Apartmani / Cene

- Skloniti `Sezonske cene` iz admin forme za apartmane.

## Admin / Apartmani / SEO

- `Meta naslov` treba da ostane samo na srpskom u admin panelu.
- `Meta opis` treba da ostane samo na srpskom u admin panelu.
- Ne brisati postojece EN/DE/IT vrednosti iz baze/podataka, samo ih skloniti iz admin forme.

## Admin / Apartmani / Lokacija

- Promeniti grad na `Bovan` gde se prikazuje/cuva lokacija apartmana.

## Admin / Dostupnost

- Omoguciti izbor raspona datuma na kalendaru klikom: od kog datuma do kog datuma.
- Posle izbora raspona treba jasno obeleziti izabrane dane.

## Admin / Tekstovi

- `Izaberi sekciju` prozor/panel treba pomeriti da bude izmedju `Tekstovi` i `Poruke` u admin navigaciji/rasporedu.
- Sekcije za tekstove treba da se otvore kada se klikne na `Tekstovi`.
- Dodati jos podesavanja za tekst sa pocetne stranice.

## Admin / Poruke

- Kada se klikne na poruku, poruka treba samo da se prosiri na istom mestu.
- Ne sme da skace na kraj stranice i tera korisnika da skroluje.

## Admin / Galerija

- Kada je izabran folder i klikne se `Dodaj sliku`, ne treba rucno unositi tag.
- Nova slika treba automatski da se ubaci u folder koji je trenutno izabran.

## Redosled rada

Raditi jednu izmenu po jednu:

1. Proveriti postojeci kod i ponasanje.
2. Napraviti minimalnu izmenu.
3. Pokrenuti testove.
4. Pokrenuti build ako je izmena veca ili utice na admin UI.
5. Commit/push tek kada provere prodju.
