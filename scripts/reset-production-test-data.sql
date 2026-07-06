-- =====================================================
-- RESET TEST PODATAKA ZA PRODUKCIJU (Apartmani Jovča)
-- =====================================================
-- Namena: sajt je prešao u produkciju. Sve rezervacije u bazi su TEST
-- rezervacije → brišu se na nulu. Prihod je IZVEDEN iz `bookings`
-- (SUM(total_price) za status checked_in/checked_out u /api/admin/stats),
-- pa se automatski nulira kad se obrišu rezervacije — nema zasebne
-- "revenue" kolone/tabele koju treba resetovati.
--
-- POKRETANJE: Supabase → SQL Editor → nalepi ceo fajl → Run.
-- Sve je u JEDNOJ transakciji (BEGIN…COMMIT): ili prođe sve ili ništa.
--
-- Redosled brisanja (zbog FK ograničenja):
--   1) availability  — briše i "fantom" blokove (reason='booked', booking_id
--                      koji je ostao posle ranijih brisanja jer je FK
--                      ON DELETE SET NULL, ne CASCADE)
--   2) bookings      — CASCADE briše reviews i booking_messages;
--                      email_events.booking_id se postavlja na NULL
--   3) guests        — tek posle bookings (bookings.guest_id je ON DELETE RESTRICT)
-- =====================================================

-- ---- 1. DIJAGNOSTIKA PRE BRISANJA (pogledaj brojke pre nego što nastaviš) ----
SELECT 'PRE: bookings ukupno'              AS metrika, COUNT(*)::text AS vrednost FROM bookings
UNION ALL SELECT 'PRE: prihod (checked_in/out)', COALESCE(SUM(total_price),0)::text FROM bookings WHERE status IN ('checked_in','checked_out')
UNION ALL SELECT 'PRE: guests ukupno',           COUNT(*)::text FROM guests
UNION ALL SELECT 'PRE: availability ukupno',     COUNT(*)::text FROM availability
UNION ALL SELECT 'PRE: availability booked',     COUNT(*)::text FROM availability WHERE reason = 'booked'
UNION ALL SELECT 'PRE: availability fantom (booked, booking_id IS NULL)', COUNT(*)::text FROM availability WHERE reason = 'booked' AND booking_id IS NULL
UNION ALL SELECT 'PRE: reviews ukupno',          COUNT(*)::text FROM reviews
UNION ALL SELECT 'PRE: booking_messages ukupno', COUNT(*)::text FROM booking_messages;

-- ---- 2. BRISANJE (transakcija) ----
BEGIN;

-- Sve dnevne dostupnosti (i fantom "booked" blokovi i ručni maintenance/blocked).
-- Posle produkcijskog reseta krećeš od čistog stanja; prave ručne blokade
-- (održavanje/blokirano) dodaješ ponovo kroz admin panel kad zatreba.
DELETE FROM availability;

-- Rezervacije — CASCADE briše reviews + booking_messages; email_events.booking_id → NULL.
DELETE FROM bookings;

-- Gosti — brišu se tek posle bookings (FK guest_id je ON DELETE RESTRICT).
DELETE FROM guests;

-- ---- 3. PROVERA POSLE BRISANJA (sve mora biti 0) ----
SELECT 'POSLE: bookings'         AS metrika, COUNT(*)::text AS vrednost FROM bookings
UNION ALL SELECT 'POSLE: guests',        COUNT(*)::text FROM guests
UNION ALL SELECT 'POSLE: availability',  COUNT(*)::text FROM availability
UNION ALL SELECT 'POSLE: reviews',       COUNT(*)::text FROM reviews
UNION ALL SELECT 'POSLE: booking_messages', COUNT(*)::text FROM booking_messages
UNION ALL SELECT 'POSLE: prihod',        COALESCE(SUM(total_price),0)::text FROM bookings WHERE status IN ('checked_in','checked_out');

-- Ako brojke iz koraka 3 nisu sve 0, ne potvrđuj — pokreni ROLLBACK umesto COMMIT.
COMMIT;
-- ROLLBACK;  -- <- odkomentariši i pokreni ovo umesto COMMIT ako nešto ne štima
