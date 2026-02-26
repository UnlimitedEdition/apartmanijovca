# Admin Auto-Refresh Fix ✅

## Problem
Kada uđeš na admin panel, statistike su uvek 0 i moraš da klikneš "Osveži stats" da bi video prave podatke.

### Uzrok:
1. `src/app/admin/page.tsx` šalje samo 4 statistike sa vrednostima 0:
   ```typescript
   stats={{
     totalBookings: 0,
     pendingBookings: 0,
     confirmedBookings: 0,
     totalReviews: 0,
   }}
   ```

2. `StatsCards` očekuje 9 različitih statistika (dolasci danas, odlasci danas, popunjenost, prihod, itd.)

3. `StatsCards` je primao `initialStats` prop koji je bio nepotpun, pa nije učitavao prave podatke

## Rešenje

### 1. Uklonjen `initialStats` prop
`StatsCards` sada automatski učitava podatke preko API-ja pri svakom renderovanju.

### 2. Dodato automatsko učitavanje pri mount-u
```typescript
useEffect(() => {
  refreshStats()
}, [refreshStats])
```
Čim se admin panel otvori, automatski se učitavaju statistike.

### 3. Dodato force refresh za StatsCards
```typescript
const [statsKey, setStatsKey] = useState(0)

const refreshStats = useCallback(async () => {
  // ... fetch stats ...
  setStatsKey(prev => prev + 1) // Force StatsCards to refresh
}, [])

<StatsCards key={statsKey} />
```
Kada se klikne "Osveži stats" ili promeni status bookinga, `StatsCards` se potpuno re-renderuje sa novim podacima.

### 4. Auto-refresh na promenu statusa
Kada odobriš/otkažeš rezervaciju, statistike se automatski osvežavaju bez potrebe za ručnim klikom.

## Kako Sada Radi

1. **Otvoriš admin panel** → Automatski se učitavaju statistike (nema više 0)
2. **Promeniš status rezervacije** → Statistike se automatski osvežavaju
3. **Klikneš "Osveži stats"** → Ručno osvežavanje (ako želiš)

## Files Modified
- `src/app/admin/AdminDashboard.tsx`
  - Dodato: `useEffect` import
  - Dodato: `statsKey` state za force refresh
  - Dodato: Auto-load stats on mount
  - Dodato: Force refresh StatsCards kada se klikne "Osveži stats"
  - Uklonjeno: `initialStats` prop za StatsCards

## Status: COMPLETE ✅
Admin panel sada automatski učitava i osvežava statistike bez potrebe za ručnim klikom.
