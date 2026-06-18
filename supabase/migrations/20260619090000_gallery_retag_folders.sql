-- 2026-06-19 — Re-tag galerije: engleski tagovi -> srpski folderi (GALLERY_CATEGORIES)
-- Razlog: Nikolin "Organize admin gallery by folders" filtrira slike po tag==folder, a folderi su srpski
-- (Eksterijer, Sobe, Jezero, Terasa, Pogled…), dok 47 postojećih slika ima engleske tagove
-- (exterior, lake, rooms, terrace, view) + 2 bez tagova -> NIJEDNA se ne vidi u adminu.
-- Primena: Supabase SQL editor (paste) ILI `supabase db push`. Žива odmah (ne treba deploy).

-- 1) Mapiraj engleske tagove -> srpske foldere (zadržava eventualne multi-tagove)
UPDATE public.gallery
SET tags = (
  SELECT array_agg(DISTINCT CASE tag
    WHEN 'exterior' THEN 'Eksterijer'
    WHEN 'rooms'    THEN 'Sobe'
    WHEN 'lake'     THEN 'Jezero'
    WHEN 'terrace'  THEN 'Terasa'
    WHEN 'view'     THEN 'Pogled'
    ELSE tag
  END)
  FROM unnest(tags) AS tag
)
WHERE tags && ARRAY['exterior','rooms','lake','terrace','view'];

-- 2) Slike bez tagova -> default folder 'Okolina' (da nisu nevidljive)
UPDATE public.gallery
SET tags = ARRAY['Okolina']
WHERE tags IS NULL OR array_length(tags, 1) IS NULL;

-- Provera posle:
-- SELECT unnest(tags) AS folder, count(*) FROM public.gallery GROUP BY folder ORDER BY folder;
