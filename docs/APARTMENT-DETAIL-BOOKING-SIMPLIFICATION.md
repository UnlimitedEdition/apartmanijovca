# Apartment Detail Booking Simplification - COMPLETE ✅

## Problem
Booking kartica na desnoj strani stranice apartmana je imala hardkodovane vrednosti:
- Hardkodovan broj noći (3 noći)
- Hardkodovan izračun cene (€30 x 3 = €90)
- Hardkodovan popust
- Hardkodovan ukupan iznos
- Nije proveravala dostupnost po danima

## Rešenje
Sklonjena je kompleksna booking kartica i zamenjena jednostavnim CTA (Call-to-Action) dugmetom koje vodi na stranicu za rezervaciju gde se:
- Proverava dostupnost po danima
- Izračunava tačna cena na osnovu izabranih datuma
- Primenjuju popusti automatski
- Prikazuje kalendar dostupnosti

## Izmene

### File: `src/app/[lang]/apartments/[slug]/ApartmentDetailView.tsx`

**BEFORE** (Hardkodovana booking kartica):
```tsx
<div className="bg-white rounded-xl p-6 shadow-lg sticky top-4">
  <div className="mb-6">
    <span className="text-3xl font-bold">€{apartment.base_price_eur}</span>
    <span className="text-gray-600">/ noć</span>
  </div>

  <div className="space-y-4 mb-6">
    <div className="border border-gray-300 rounded-lg p-3">
      <Calendar className="h-4 w-4" />
      <span>Izaberite datume</span>
    </div>
    <div className="border border-gray-300 rounded-lg p-3">
      <Users className="h-4 w-4" />
      <span>{apartment.capacity} gostiju</span>
    </div>
  </div>

  <Button>Rezervišite sada</Button>

  <p>Nećete biti naplaćeni odmah</p>

  <div className="mt-6 pt-6 border-t space-y-2">
    <div>€{apartment.base_price_eur} x 3 noći = €{apartment.base_price_eur * 3}</div>
    <div>Popust za duži boravak ({apartment.weekly_discount_percent}%)</div>
    <div>Ukupno: €{Math.round(apartment.base_price_eur * 3 * (1 - ((apartment.weekly_discount_percent || 0) / 100)))}</div>
  </div>
</div>
```

**AFTER** (Jednostavan CTA):
```tsx
<div className="bg-white rounded-xl p-6 shadow-lg sticky top-4">
  <div className="mb-6">
    <div className="flex items-baseline gap-2">
      <span className="text-3xl font-bold text-gray-900">€{apartment.base_price_eur}</span>
      <span className="text-gray-600">/ noć</span>
    </div>
    <p className="text-sm text-gray-600 mt-2">
      Cena zavisi od datuma i dužine boravka
    </p>
  </div>

  <Link href={`/${locale}/booking?apartment=${apartment.slug}`}>
    <Button className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700 font-bold">
      Proveri dostupnost i rezerviši
    </Button>
  </Link>

  <p className="text-center text-xs text-gray-500 mt-4">
    Izaberite datume da vidite tačnu cenu i dostupnost
  </p>
</div>
```

## Prednosti Novog Pristupa

1. **Nema Hardkodovanih Vrednosti**: Sve se izračunava dinamički na booking stranici
2. **Provera Dostupnosti**: Korisnik vidi kalendar sa dostupnim danima
3. **Tačna Cena**: Cena se izračunava na osnovu stvarnih datuma i popusta
4. **Jednostavnije**: Manje zbunjujuće za korisnika
5. **Bolja Konverzija**: Jasna poruka "Proveri dostupnost i rezerviši"

## User Flow

1. Korisnik vidi apartman sa osnovnom cenom (€30/noć)
2. Vidi poruku "Cena zavisi od datuma i dužine boravka"
3. Klikne na "Proveri dostupnost i rezerviši"
4. Preusmeren na `/booking?apartment={slug}`
5. Na booking stranici:
   - Vidi kalendar dostupnosti
   - Bira datume
   - Vidi tačnu cenu sa popustima
   - Popunjava podatke
   - Šalje rezervaciju

## Removed Hardcoded Values

- ❌ `3 noći` - bilo hardkodovano
- ❌ `€30 x 3 noći = €90` - bilo hardkodovano
- ❌ `Popust za duži boravak -€9` - bilo hardkodovano
- ❌ `Ukupno €81` - bilo hardkodovano
- ❌ `Izaberite datume` input polje - bilo fake, nije radilo
- ❌ `2 gostiju` input polje - bilo fake, nije radilo

## What Remains

- ✅ Osnovna cena po noći (iz baze)
- ✅ Jasna poruka o dinamičkoj ceni
- ✅ CTA dugme koje vodi na pravu booking stranicu
- ✅ Informativna poruka o izboru datuma

## Testing

- [x] Dugme vodi na booking stranicu sa `apartment={slug}` parametrom
- [x] Booking stranica prima slug i učitava apartman
- [x] Kalendar dostupnosti radi
- [x] Cena se izračunava dinamički
- [x] Popusti se primenjuju automatski
- [x] Nema TypeScript grešaka
- [x] Responsive dizajn očuvan

## Status: COMPLETE ✅

Sve hardkodovane vrednosti uklonjene. Korisnik se sada pravilno preusmerava na booking stranicu gde se proverava dostupnost i izračunava tačna cena.
