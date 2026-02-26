-- Quick verification query to check all apartments
-- Run this in Supabase SQL Editor to see all apartment data

SELECT 
  id,
  slug,
  name->>'sr' as naziv_sr,
  name->>'en' as naziv_en,
  base_price_eur as cena,
  capacity as kapacitet,
  status,
  display_order as redosled,
  size_sqm as velicina,
  city as grad,
  created_at,
  updated_at
FROM apartments
ORDER BY display_order, created_at;

-- Count apartments by status
SELECT 
  status,
  COUNT(*) as broj_apartmana
FROM apartments
GROUP BY status;

-- Check which apartments have images
SELECT 
  slug,
  name->>'sr' as naziv,
  CASE 
    WHEN images IS NULL THEN 'Nema slika'
    WHEN jsonb_array_length(images::jsonb) = 0 THEN 'Prazan array'
    ELSE jsonb_array_length(images::jsonb)::text || ' slika'
  END as broj_slika
FROM apartments
ORDER BY display_order;

-- Check which apartments have GPS coordinates
SELECT 
  slug,
  name->>'sr' as naziv,
  CASE 
    WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 'DA (' || latitude || ', ' || longitude || ')'
    ELSE 'NE'
  END as ima_gps
FROM apartments
ORDER BY display_order;
