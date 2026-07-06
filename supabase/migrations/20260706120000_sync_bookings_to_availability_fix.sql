-- =====================================================
-- MIRROR: bookings  ->  availability  (ISPRAVNA autosinhronizacija)
-- =====================================================
-- Problem koji ovo rešava:
--   `availability` tabela se NIJE sinhronizovala sa `bookings`. Stari trigger
--   (20260301000000) je bio bugovit: nije pokrivao `checked_in`, nije čistio
--   stare datume kad se rezervaciji promene datumi, i koristio je INCLUSIVE
--   ranΓe (blokirao dan odjave). Uz to je `ON DELETE SET NULL` ostavljao
--   "fantom" redove (reason='booked', booking_id=NULL) koji su večno držali
--   datum zauzet iako rezervacija više ne postoji -> DUPLIRANJE / neslaganje.
--
-- Nova pravila (identična ostatku aplikacije):
--   * ZAUZIMAJUĆI statusi = pending, confirmed, checked_in
--     (isto kao OCCUPYING_BOOKING_STATUSES i DB f-ja check_availability).
--   * SVE ostalo (cancelled, no_show, checked_out, legacy completed) OSLOBAĐA datume.
--   * Half-open opseg [check_in, check_out): dan ODJAVE ostaje SLOBODAN
--     (gost izlazi 10:00, novi ulazi 14:00 istog dana).
--   * Trigger upravlja ISKLJUČIVO redovima koje "poseduje" ta rezervacija
--     (booking_id = <id>). Ručne blokade (booking_id IS NULL: maintenance/blocked,
--     price_override) se NIKAD ne brišu autosinhronizacijom.
--   * INSERT/UPDATE prvo obriše staru projekciju te rezervacije pa je ponovo
--     izgradi -> ispravno pokriva promenu datuma, promenu apartmana i promenu statusa.
--
-- Izvor istine ostaje `bookings`. `availability` je NJEGOVA održavana projekcija
-- (+ ručne blokade). Nema dvostrukog ručnog unosa.
--
-- POKRETANJE: Supabase SQL Editor. Bezbedno je pokrenuti više puta (idempotentno).
-- Preporuka: pokreni POSLE reset skripte (scripts/reset-production-test-data.sql),
-- ali radi i nezavisno — backfill na kraju uskladi tabelu sa trenutnim stanjem.
-- =====================================================

-- ---- 1. TRIGGER FUNKCIJA ----
CREATE OR REPLACE FUNCTION sync_booking_to_availability()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  d DATE;
BEGIN
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
    -- Uvek prvo ukloni prethodnu projekciju OVE rezervacije (pokriva promenu
    -- datuma / apartmana / statusa; ne dira ručne blokade jer su booking_id IS NULL).
    DELETE FROM availability WHERE booking_id = NEW.id;

    -- Ako je status zauzimajući, upiši po jedan red za svaku NOĆ [check_in, check_out).
    IF NEW.status IN ('pending', 'confirmed', 'checked_in') THEN
      d := NEW.check_in;
      WHILE d < NEW.check_out LOOP
        INSERT INTO availability (
          apartment_id, date, is_available, booking_id, reason, created_at, updated_at
        )
        VALUES (
          NEW.apartment_id, d, FALSE, NEW.id, 'booked', NOW(), NOW()
        )
        ON CONFLICT (apartment_id, date) DO UPDATE SET
          is_available = FALSE,
          booking_id   = NEW.id,
          reason       = 'booked',
          updated_at   = NOW();

        d := d + INTERVAL '1 day';
      END LOOP;
    END IF;

    RETURN NEW;
  END IF;

  IF (TG_OP = 'DELETE') THEN
    DELETE FROM availability WHERE booking_id = OLD.id;
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$;

COMMENT ON FUNCTION sync_booking_to_availability IS
  'Mirror bookings->availability. Zauzimaju: pending/confirmed/checked_in. Half-open [check_in,check_out). Upravlja samo redovima sa booking_id=<id>; ručne blokade ostaju netaknute.';

-- ---- 2. TRIGGER ----
DROP TRIGGER IF EXISTS sync_booking_to_availability_trigger ON bookings;
CREATE TRIGGER sync_booking_to_availability_trigger
  AFTER INSERT OR UPDATE OR DELETE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION sync_booking_to_availability();

COMMENT ON TRIGGER sync_booking_to_availability_trigger ON bookings IS
  'Autosinhronizacija rezervacija u availability tabelu (mirror).';

-- ---- 3. BACKFILL / REBUILD (jednokratno usklađivanje sa trenutnim stanjem) ----
-- 3a. Obriši sve redove izvedene iz rezervacija (bilo koji booking_id) ...
DELETE FROM availability WHERE booking_id IS NOT NULL;
-- 3b. ... i fantom "booked" redove koji su ostali sa booking_id=NULL (stari SET NULL).
DELETE FROM availability WHERE booking_id IS NULL AND reason = 'booked';
--     (Ručne blokade maintenance/blocked i price_override redovi sa booking_id=NULL OSTAJU.)

-- 3c. Ponovo izgradi projekciju iz svih trenutno zauzimajućih rezervacija.
INSERT INTO availability (apartment_id, date, is_available, booking_id, reason, created_at, updated_at)
SELECT
  b.apartment_id,
  gs::date AS date,
  FALSE,
  b.id,
  'booked',
  NOW(),
  NOW()
FROM bookings b
CROSS JOIN LATERAL generate_series(
  b.check_in::timestamp,
  (b.check_out - INTERVAL '1 day')::timestamp,  -- half-open: iskljucuje dan odjave
  INTERVAL '1 day'
) AS gs
WHERE b.status IN ('pending', 'confirmed', 'checked_in')
ON CONFLICT (apartment_id, date) DO UPDATE SET
  is_available = FALSE,
  booking_id   = EXCLUDED.booking_id,
  reason       = 'booked',
  updated_at   = NOW();

-- ---- 4. PROVERA (broj booked datuma u availability mora = zbir noći zauzimajućih rezervacija) ----
SELECT
  (SELECT COUNT(*) FROM availability WHERE reason = 'booked' AND booking_id IS NOT NULL) AS availability_booked_dana,
  (SELECT COALESCE(SUM(check_out - check_in), 0) FROM bookings WHERE status IN ('pending','confirmed','checked_in')) AS ocekivano_nocenja;
-- Ove dve brojke moraju biti JEDNAKE. (Posle produkcijskog reseta: obe = 0.)
