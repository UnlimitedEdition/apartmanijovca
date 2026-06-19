-- 2026-06-19 ? Separate gallery ordering per public/admin folder.
-- display_order remains the global "Sve" order.
-- Each visible folder gets its own order column so folder ordering is 1..N
-- without duplicates or gaps.

ALTER TABLE public.gallery
  ADD COLUMN IF NOT EXISTS exterior_order integer,
  ADD COLUMN IF NOT EXISTS lake_order integer,
  ADD COLUMN IF NOT EXISTS rooms_order integer,
  ADD COLUMN IF NOT EXISTS terrace_order integer,
  ADD COLUMN IF NOT EXISTS view_order integer;

-- Normalize global order used by "Sve".
WITH ranked AS (
  SELECT
    id,
    row_number() OVER (ORDER BY display_order ASC NULLS LAST, created_at DESC, id ASC)::integer AS new_order
  FROM public.gallery
)
UPDATE public.gallery AS gallery
SET display_order = ranked.new_order
FROM ranked
WHERE gallery.id = ranked.id;

-- Reset folder-specific order columns before rebuilding them.
UPDATE public.gallery
SET
  exterior_order = NULL,
  lake_order = NULL,
  rooms_order = NULL,
  terrace_order = NULL,
  view_order = NULL;

WITH ranked AS (
  SELECT
    id,
    row_number() OVER (ORDER BY display_order ASC, created_at DESC, id ASC)::integer AS folder_order
  FROM public.gallery
  WHERE tags @> ARRAY['Eksterijer']::text[]
)
UPDATE public.gallery AS gallery
SET exterior_order = ranked.folder_order
FROM ranked
WHERE gallery.id = ranked.id;

WITH ranked AS (
  SELECT
    id,
    row_number() OVER (ORDER BY display_order ASC, created_at DESC, id ASC)::integer AS folder_order
  FROM public.gallery
  WHERE tags @> ARRAY['Jezero']::text[]
)
UPDATE public.gallery AS gallery
SET lake_order = ranked.folder_order
FROM ranked
WHERE gallery.id = ranked.id;

WITH ranked AS (
  SELECT
    id,
    row_number() OVER (ORDER BY display_order ASC, created_at DESC, id ASC)::integer AS folder_order
  FROM public.gallery
  WHERE tags @> ARRAY['Sobe']::text[]
)
UPDATE public.gallery AS gallery
SET rooms_order = ranked.folder_order
FROM ranked
WHERE gallery.id = ranked.id;

WITH ranked AS (
  SELECT
    id,
    row_number() OVER (ORDER BY display_order ASC, created_at DESC, id ASC)::integer AS folder_order
  FROM public.gallery
  WHERE tags @> ARRAY['Terasa']::text[]
)
UPDATE public.gallery AS gallery
SET terrace_order = ranked.folder_order
FROM ranked
WHERE gallery.id = ranked.id;

WITH ranked AS (
  SELECT
    id,
    row_number() OVER (ORDER BY display_order ASC, created_at DESC, id ASC)::integer AS folder_order
  FROM public.gallery
  WHERE tags @> ARRAY['Pogled']::text[]
)
UPDATE public.gallery AS gallery
SET view_order = ranked.folder_order
FROM ranked
WHERE gallery.id = ranked.id;

ALTER TABLE public.gallery
  DROP CONSTRAINT IF EXISTS gallery_display_order_positive,
  ADD CONSTRAINT gallery_display_order_positive CHECK (display_order >= 1),
  DROP CONSTRAINT IF EXISTS gallery_exterior_order_positive,
  ADD CONSTRAINT gallery_exterior_order_positive CHECK (exterior_order IS NULL OR exterior_order >= 1),
  DROP CONSTRAINT IF EXISTS gallery_lake_order_positive,
  ADD CONSTRAINT gallery_lake_order_positive CHECK (lake_order IS NULL OR lake_order >= 1),
  DROP CONSTRAINT IF EXISTS gallery_rooms_order_positive,
  ADD CONSTRAINT gallery_rooms_order_positive CHECK (rooms_order IS NULL OR rooms_order >= 1),
  DROP CONSTRAINT IF EXISTS gallery_terrace_order_positive,
  ADD CONSTRAINT gallery_terrace_order_positive CHECK (terrace_order IS NULL OR terrace_order >= 1),
  DROP CONSTRAINT IF EXISTS gallery_view_order_positive,
  ADD CONSTRAINT gallery_view_order_positive CHECK (view_order IS NULL OR view_order >= 1);

CREATE INDEX IF NOT EXISTS idx_gallery_exterior_order ON public.gallery(exterior_order) WHERE exterior_order IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_gallery_lake_order ON public.gallery(lake_order) WHERE lake_order IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_gallery_rooms_order ON public.gallery(rooms_order) WHERE rooms_order IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_gallery_terrace_order ON public.gallery(terrace_order) WHERE terrace_order IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_gallery_view_order ON public.gallery(view_order) WHERE view_order IS NOT NULL;
