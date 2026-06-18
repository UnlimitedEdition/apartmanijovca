-- 2026-06-18 — Uskladi apartman politike sa ZVANIČNIM Uslovima korišćenja (Kućni red)
-- Razlog: DB polja po apartmanu protivreče zvaničnim Uslovima:
--   • check-in/out: apt-2 '00:00/16:00', apt-1/4 '10:00/16:00'  →  Uslovi §2: check-in 14:00 / check-out 10:00
--   • ljubimci: apt-3 i apt-4 imaju 'pets_allowed'  →  Uslovi §4: „Kućni ljubimci nisu dozvoljeni"
-- Primena: Supabase SQL editor (paste) ili `supabase db push`.
-- NAPOMENA: ovo menja strukturna polja (inače admin domen) — pokreni SAMO ako želiš da DB prati zvanične Uslove.

-- 1) Check-in 14:00 / Check-out 10:00 za sve apartmane (Uslovi §2)
UPDATE public.apartments
SET check_in_time = '14:00', check_out_time = '10:00', updated_at = now()
WHERE check_in_time IS DISTINCT FROM '14:00' OR check_out_time IS DISTINCT FROM '10:00';

-- 2) Ljubimci NISU dozvoljeni (Uslovi §4): ukloni 'pets_allowed', osiguraj 'no_pets'
UPDATE public.apartments
SET selected_rules = (
  SELECT array_agg(DISTINCT r ORDER BY r)
  FROM unnest(array_remove(COALESCE(selected_rules, ARRAY[]::text[]), 'pets_allowed') || ARRAY['no_pets']) AS r
), updated_at = now()
WHERE 'pets_allowed' = ANY(COALESCE(selected_rules, ARRAY[]::text[]))
   OR NOT ('no_pets' = ANY(COALESCE(selected_rules, ARRAY[]::text[])));

-- Provera posle pokretanja:
-- SELECT slug, check_in_time, check_out_time, selected_rules FROM public.apartments ORDER BY slug;
