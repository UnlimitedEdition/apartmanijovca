-- Fix JSONB apartment data - Remove numeric keys, keep only language keys
-- This migration cleans up corrupted JSONB data that has both numeric and language keys

-- Function to clean JSONB by keeping only sr, en, de, it keys
CREATE OR REPLACE FUNCTION clean_jsonb_languages(data jsonb)
RETURNS jsonb AS $$
DECLARE
  result jsonb := '{}'::jsonb;
BEGIN
  -- Extract only language keys (sr, en, de, it)
  IF data ? 'sr' THEN
    result := result || jsonb_build_object('sr', data->'sr');
  END IF;
  IF data ? 'en' THEN
    result := result || jsonb_build_object('en', data->'en');
  END IF;
  IF data ? 'de' THEN
    result := result || jsonb_build_object('de', data->'de');
  END IF;
  IF data ? 'it' THEN
    result := result || jsonb_build_object('it', data->'it');
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Clean all JSONB fields in apartments table
UPDATE apartments
SET 
  name = clean_jsonb_languages(name),
  description = clean_jsonb_languages(description),
  bed_type = clean_jsonb_languages(bed_type),
  kitchen_type = CASE 
    WHEN kitchen_type IS NOT NULL THEN clean_jsonb_languages(kitchen_type)
    ELSE NULL
  END,
  house_rules = CASE 
    WHEN house_rules IS NOT NULL THEN clean_jsonb_languages(house_rules)
    ELSE NULL
  END,
  cancellation_policy = CASE 
    WHEN cancellation_policy IS NOT NULL THEN clean_jsonb_languages(cancellation_policy)
    ELSE NULL
  END,
  view_type = CASE 
    WHEN view_type IS NOT NULL THEN clean_jsonb_languages(view_type)
    ELSE NULL
  END;

-- Clean features JSONB (it's a JSONB, not array)
UPDATE apartments
SET features = (
  SELECT jsonb_agg(clean_jsonb_languages(elem))
  FROM jsonb_array_elements(features) elem
)
WHERE features IS NOT NULL 
  AND jsonb_typeof(features) = 'array' 
  AND jsonb_array_length(features) > 0;

-- Clean amenities array (it's jsonb[] array type)
UPDATE apartments
SET amenities = (
  SELECT ARRAY(
    SELECT clean_jsonb_languages(elem)
    FROM unnest(amenities) elem
  )
)
WHERE amenities IS NOT NULL AND array_length(amenities, 1) > 0;

-- Clean gallery captions (it's a JSONB array)
UPDATE apartments
SET gallery = (
  SELECT jsonb_agg(
    jsonb_build_object(
      'url', elem->>'url',
      'caption', clean_jsonb_languages(elem->'caption'),
      'order', (elem->>'order')::int
    )
  )
  FROM jsonb_array_elements(gallery) elem
)
WHERE gallery IS NOT NULL 
  AND jsonb_typeof(gallery) = 'array'
  AND jsonb_array_length(gallery) > 0;

-- Verify the cleanup
DO $$
DECLARE
  apartment_record RECORD;
  has_numeric_keys BOOLEAN := FALSE;
BEGIN
  FOR apartment_record IN 
    SELECT id, slug, name FROM apartments
  LOOP
    -- Check if name has any numeric keys
    IF EXISTS (
      SELECT 1 FROM jsonb_object_keys(apartment_record.name) k 
      WHERE k ~ '^\d+$'
    ) THEN
      has_numeric_keys := TRUE;
      RAISE NOTICE 'Apartment % (%) still has numeric keys in name', 
        apartment_record.slug, apartment_record.id;
    END IF;
  END LOOP;
  
  IF NOT has_numeric_keys THEN
    RAISE NOTICE 'All apartments cleaned successfully - no numeric keys found';
  END IF;
END $$;

-- Drop the helper function (no longer needed)
DROP FUNCTION IF EXISTS clean_jsonb_languages(jsonb);

COMMENT ON TABLE apartments IS 'Apartments table with cleaned JSONB language fields (sr, en, de, it only)';
