-- =====================================================
-- Migration: Update Contact Information to Centralized Values
-- Date: 2026-03-01
-- Description: Updates all contact email and phone numbers to use centralized values
-- =====================================================

-- Update Serbian (sr) site settings
UPDATE content 
SET data = jsonb_set(
  jsonb_set(
    jsonb_set(
      data,
      '{contact_email}',
      '"apartmanijovca@gmail.com"'
    ),
    '{contact_phone}',
    '"+381 65 237 8080"'
  ),
  '{whatsapp}',
  '"+381 65 237 8080"'
)
WHERE lang = 'sr' AND section = 'site_settings';

-- Update English (en) site settings
UPDATE content 
SET data = jsonb_set(
  jsonb_set(
    jsonb_set(
      data,
      '{contact_email}',
      '"apartmanijovca@gmail.com"'
    ),
    '{contact_phone}',
    '"+381 65 237 8080"'
  ),
  '{whatsapp}',
  '"+381 65 237 8080"'
)
WHERE lang = 'en' AND section = 'site_settings';

-- Update German (de) site settings
UPDATE content 
SET data = jsonb_set(
  jsonb_set(
    jsonb_set(
      data,
      '{contact_email}',
      '"apartmanijovca@gmail.com"'
    ),
    '{contact_phone}',
    '"+381 65 237 8080"'
  ),
  '{whatsapp}',
  '"+381 65 237 8080"'
)
WHERE lang = 'de' AND section = 'site_settings';

-- Update Italian (it) site settings
UPDATE content 
SET data = jsonb_set(
  jsonb_set(
    jsonb_set(
      data,
      '{contact_email}',
      '"apartmanijovca@gmail.com"'
    ),
    '{contact_phone}',
    '"+381 65 237 8080"'
  ),
  '{whatsapp}',
  '"+381 65 237 8080"'
)
WHERE lang = 'it' AND section = 'site_settings';

-- Verify the updates
SELECT 
  lang,
  section,
  data->>'contact_email' as email,
  data->>'contact_phone' as phone,
  data->>'whatsapp' as whatsapp
FROM content 
WHERE section = 'site_settings'
ORDER BY lang;
