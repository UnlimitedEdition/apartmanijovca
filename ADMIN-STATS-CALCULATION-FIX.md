# Admin Stats Calculation Fix ✅

## Problem
Statistike u admin panelu nisu prikazivale prave podatke:
- Imaš rezervaciju sa statusom "checked_in" (Prijavljen) danas, ali "Dolasci danas" pokazuje 0
- Prihod pokazuje 0,00 € iako imaš potvrđene rezervacije

## Uzrok - Pogrešna Logika

### 1. Dolasci/Odlasci Danas (STARA LOGIKA)
```typescript
// POGREŠNO: Traži samo confirmed status
checkedInToday = check_in === danas && status === 'confirmed'
checkedOutToday = check_out === danas && status === 'checked_in'
```

**Problem:** Kada promeniš status u `checked_in`, rezervacija više ne računa kao "Dolazak danas"!

### 2. Prihod (STARA LOGIKA)
```typescript
// POGREŠNO: Računa samo checked_out
totalRevenue = status === 'checked_out'
```

**Problem:** Potvrđene rezervacije (`confirmed`, `checked_in`) se ne računaju u prihod!

## Rešenje - Nova Logika

### 1. Dolasci/Odlasci Danas (NOVA LOGIKA)
```typescript
// ISPRAVNO: Računa SVE rezervacije sa datumom danas (osim cancelled)
checkedInToday = check_in === danas && status !== 'cancelled'
checkedOutToday = check_out === danas && status !== 'cancelled'
```

**Logika:**
- Ako je `check_in` danas, to je dolazak - bez obzira da li je `pending`, `confirmed`, ili već `checked_in`
- Ako je `check_out` danas, to je odlazak - bez obzira na status
- Jedino se isključuju `cancelled` rezervacije

### 2. Prihod (NOVA LOGIKA)
```typescript
// ISPRAVNO: Računa confirmed + checked_in + checked_out
totalRevenue = status IN ('confirmed', 'checked_in', 'checked_out')
monthlyRevenue = created_at >= first_day_of_month && status IN ('confirmed', 'checked_in', 'checked_out')
```

**Logika:**
- Potvrđene rezervacije (`confirmed`) = očekivani prihod
- Prijavljeni gosti (`checked_in`) = prihod u toku
- Odjavljeni gosti (`checked_out`) = realizovani prihod
- `pending` i `cancelled` se NE računaju

## Primeri Sa Tvojim Podacima

### Rezervacija 1: milan tosic - Prijavljen
- Status: `checked_in`
- Check-in: 22.02.2026
- Check-out: 23.02.2026
- Cena: 35,00 €

**Stara logika:**
- ❌ Dolasci danas: NE (jer status nije `confirmed`)
- ❌ Prihod: NE (jer status nije `checked_out`)

**Nova logika:**
- ✅ Dolasci danas: DA (jer check_in === danas i status !== 'cancelled')
- ✅ Prihod: DA (35,00 €)

### Rezervacija 2: milan tosic - Potvrđeno
- Status: `confirmed`
- Check-in: 28.02.2026
- Check-out: 03.03.2026
- Cena: 105,00 €

**Stara logika:**
- ❌ Prihod: NE (jer status nije `checked_out`)

**Nova logika:**
- ✅ Prihod: DA (105,00 €)

### Ukupan Prihod (Tvoji Podaci)
- Potvrđeno: 105,00 €
- Prijavljen: 35,00 €
- **UKUPNO: 140,00 €** (umesto 0,00 €)

## Files Modified
- `src/app/api/admin/stats/route.ts`
  - Fixed: `checkedInToday` calculation (removed status check)
  - Fixed: `checkedOutToday` calculation (removed status check)
  - Fixed: `totalRevenue` calculation (includes confirmed + checked_in + checked_out)
  - Fixed: `monthlyRevenue` calculation (includes confirmed + checked_in + checked_out)

## Status: COMPLETE ✅
Statistike sada prikazuju prave podatke:
- Dolasci/Odlasci danas računaju sve rezervacije sa tim datumom
- Prihod računa sve potvrđene i aktivne rezervacije
