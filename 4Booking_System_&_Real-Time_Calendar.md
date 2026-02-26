# Booking System & Real-Time Calendar

## Scope

Implementacija kompletnog booking sistema sa 4-step flow-om i real-time kalendarom dostupnosti.

**Included:**
- ✅ 4-Step Booking Flow:
  - Step 1: Date selection (single calendar, check-in/check-out)
  - Step 2: Apartment selection (dostupni apartmani za datume)
  - Step 3: Additional options (crib, parking, early check-in, special requests)
  - Step 4: Contact info (ime, email, telefon, broj gostiju)
- ✅ Real-time kalendar:
  - Supabase real-time subscriptions
  - Dostupnost + cena + real-time total kalkulacija
  - Optimistic updates
  - Conflict resolution (prevent double-bookings)
- ✅ Availability logic:
  - Check availability function
  - Get available apartments function
  - Update availability on booking
- ✅ Booking request creation:
  - Create booking (status: pending)
  - Generate booking number (BJ-2024-XXXX)
  - Store guest info
- ✅ Confirmation page:
  - Success message
  - Booking summary
  - Timeline (šta se dešava dalje)
  - Link ka guest portal
- ✅ Progress indicator (Korak 1 od 4)
- ✅ Form validation (real-time)
- ✅ Mobile-optimized calendar (touch-friendly)

**Explicitly Out:**
- ❌ Email notifications (Ticket #5)
- ❌ Guest portal (Ticket #6)
- ❌ Admin booking management (Ticket #7)

## Spec References

- `spec:29240173-654b-408c-b23c-b9a7362879c8/f6845df1-8cba-42ca-a558-bbe01d9b56bf` - Core Flows (Flow 4, 5)
- `spec:29240173-654b-408c-b23c-b9a7362879c8/c2e4d049-5b58-42f6-af1e-098e560cc581` - Tech Plan (Real-time Calendar, Booking Flow)

## Acceptance Criteria

1. ✅ 4-step booking flow implementiran
2. ✅ Single calendar (Airbnb-style) sa check-in/check-out
3. ✅ Real-time dostupnost prikazana u kalendaru
4. ✅ Cena po noći i total kalkulacija (real-time)
5. ✅ Apartment selection prikazuje samo dostupne apartmane
6. ✅ Options step sa checkboxes i textarea
7. ✅ Contact form sa validacijom
8. ✅ Booking summary sidebar (desktop) ili card (mobile)
9. ✅ Progress indicator funkcioniše
10. ✅ Booking kreiran u database (status: pending)
11. ✅ Booking number generisan (BJ-2024-XXXX)
12. ✅ Confirmation page prikazana sa timeline
13. ✅ Real-time calendar updates (Supabase subscriptions)
14. ✅ No double-bookings (database constraint)
15. ✅ Mobile-optimized (touch-friendly calendar)

## Dependencies

**Depends on:**
- Ticket #1 (Infrastructure)
- Ticket #2 (Database - apartments, bookings, availability tables)

## Technical Notes

- SSR za booking flow (dynamic availability)
- Client component za interactive calendar
- Server action za booking submission
- Supabase real-time subscriptions
- Optimistic UI updates
- Form validation sa Zod ili React Hook Form