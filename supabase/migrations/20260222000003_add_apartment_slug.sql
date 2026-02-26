-- Add slug column to apartments table for SEO-friendly URLs
ALTER TABLE apartments ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Create index for faster slug lookups
CREATE INDEX IF NOT EXISTS idx_apartments_slug ON apartments(slug);

-- Generate slugs for existing apartments based on name_sr
-- Standard -> standard-apartman
-- Deluxe -> deluxe-apartman
-- Premium -> premium-apartman
UPDATE apartments 
SET slug = LOWER(REGEXP_REPLACE(
  REGEXP_REPLACE(name_sr, '[^a-zA-Z0-9\s-]', '', 'g'),
  '\s+', '-', 'g'
))
WHERE slug IS NULL;

-- Add constraint to ensure slug is not empty
ALTER TABLE apartments ADD CONSTRAINT apartments_slug_not_empty CHECK (slug IS NOT NULL AND slug != '');

-- Comment
COMMENT ON COLUMN apartments.slug IS 'SEO-friendly URL slug for apartment (e.g., standard-apartman, deluxe-apartman)';
