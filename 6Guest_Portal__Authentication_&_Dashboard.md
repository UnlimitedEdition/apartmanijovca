# Guest Portal: Authentication & Dashboard

## Scope

Implementacija full-featured guest portal-a gde gosti mogu da upravljaju rezervacijama, komuniciraju, i pristupe informacijama.

**Included:**
- ✅ Authentication:
  - Magic link login (email + booking ID)
  - Supabase Auth integration
  - Auto-login iz email linka
- ✅ Portal Dashboard:
  - Booking status (Potvrđeno/Na čekanju)
  - Countdown do dolaska
  - Navigacija (Rezervacija, Komunikacija, Preporuke, FAQ)
- ✅ Moja Rezervacija tab:
  - Rezime rezervacije (sve detalje)
  - QR kod za check-in
  - Mapa lokacije (GPS koordinate)
  - Check-in/check-out instrukcije
  - House rules
  - WiFi password
  - Parking info
  - Kontakt za hitne slučajeve
- ✅ Komunikacija tab:
  - Real-time messaging sa admin-om
  - Upload dokumenata
  - Istorija komunikacije
  - Dodavanje specijalnih zahteva
- ✅ Lokalne Preporuke tab:
  - Restorani (sa mapom, ocenama)
  - Atrakcije (sa udaljenostima)
  - Aktivnosti (pecanje, šetnje)
  - Praktične info (prodavnice, apoteke)
- ✅ FAQ tab:
  - Često postavljana pitanja
  - Check-in/check-out procedure
  - Cancellation policy
- ✅ Post-Stay Review:
  - Rating (1-5 zvezdica)
  - Komentar
  - Upload slika (opciono)

**Explicitly Out:**
- ❌ Admin panel (Ticket #7)
- ❌ Email notifications (Ticket #5)

## Spec References

- `spec:29240173-654b-408c-b23c-b9a7362879c8/f6845df1-8cba-42ca-a558-bbe01d9b56bf` - Core Flows (Flow 6)
- `spec:29240173-654b-408c-b23c-b9a7362879c8/c2e4d049-5b58-42f6-af1e-098e560cc581` - Tech Plan (Guest Portal, Supabase Auth)

## Acceptance Criteria

1. ✅ Magic link authentication funkcioniše
2. ✅ Portal dashboard prikazuje booking status
3. ✅ Countdown do dolaska
4. ✅ Moja Rezervacija tab sa svim detaljima
5. ✅ QR kod za check-in generisan
6. ✅ Mapa lokacije sa GPS koordinatama
7. ✅ Real-time messaging funkcioniše (Supabase subscriptions)
8. ✅ Upload dokumenata (Supabase Storage)
9. ✅ Lokalne preporuke prikazane (restorani, atrakcije)
10. ✅ FAQ sekcija
11. ✅ Review submission form
12. ✅ Mobile-optimized portal
13. ✅ Offline support (PWA)
14. ✅ RLS policies sprečavaju pristup tuđim bookings

## Dependencies

**Depends on:**
- Ticket #1 (Infrastructure)
- Ticket #2 (Database - guests, bookings, messages, reviews tables)
- Ticket #4 (Booking System - booking creation)

## Technical Notes

- Supabase Auth magic links
- RLS za security (guests see only their bookings)
- Real-time subscriptions za messaging
- QR kod generation (qrcode library)
- Google Maps embed za lokaciju
- PWA offline support za portal access