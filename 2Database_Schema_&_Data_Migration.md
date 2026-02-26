# Database Schema & Data Migration

## Scope

Kreiranje kompletne PostgreSQL database schema u Supabase i migracija postojećih podataka iz JSON fajlova.

**Included:**
- ✅ Kreiranje svih tabela (apartments, bookings, guests, availability, reviews, messages, content, analytics_events)
- ✅ Database indexes za performance
- ✅ Row Level Security (RLS) policies
- ✅ Database functions (check_availability, get_available_apartments)
- ✅ Migracija content iz JSON fajlova (`file:backend/data/*.json`) u PostgreSQL
- ✅ Migracija slika iz `file:backend/uploads/` u Supabase Storage
- ✅ Seed data za 4 apartmana
- ✅ Test data za development

**Explicitly Out:**
- ❌ Frontend implementacija (Ticket #3, #4)
- ❌ Email notifications (Ticket #5)
- ❌ Guest portal UI (Ticket #6)
- ❌ Admin panel UI (Ticket #7)

## Spec References

- `spec:29240173-654b-408c-b23c-b9a7362879c8/c2e4d049-5b58-42f6-af1e-098e560cc581` - Tech Plan (Data Model section)
- `spec:29240173-654b-408c-b23c-b9a7362879c8/463fe2f3-6b6c-42de-90f2-7ff37afc64ee` - Epic Brief (4 apartmana, multi-language)

## Acceptance Criteria

1. ✅ Sve tabele kreirane sa ispravnim schema
2. ✅ Indexes kreirani na svim frequently-queried columns
3. ✅ RLS policies implementirane i testirane
4. ✅ Database functions rade ispravno (check_availability, get_available_apartments)
5. ✅ Content migriran iz JSON fajlova (4 jezika: sr, en, it, de)
6. ✅ Slike migrirane u Supabase Storage sa ispravnim URLs
7. ✅ Seed data za 4 apartmana (Deluxe, Standard, Family, + 1)
8. ✅ No overlapping bookings constraint funkcioniše
9. ✅ Migration scripts dokumentovani
10. ✅ Database backup strategy definisana

## Dependencies

**Depends on:** Ticket #1 (Infrastructure Setup)

## Technical Notes

- Koristiti Supabase migrations (`supabase/migrations/`)
- RLS policies za security (database-level authorization)
- JSONB za multi-language content
- Daterange za booking overlap prevention
- Seed data za development i testing