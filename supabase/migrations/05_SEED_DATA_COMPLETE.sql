-- =====================================================
-- 05_SEED_DATA_COMPLETE.sql
-- Seed data for 4 apartments and multi-language content
-- =====================================================

-- =====================================================
-- SEED DATA: Apartments
-- =====================================================

-- Insert 4 apartments with multi-language content
INSERT INTO apartments (id, name, description, bed_type, capacity, amenities, base_price_eur, images, status)
VALUES
  -- Apartman Deluxe
  (
    '11111111-1111-1111-1111-111111111111',
    '{"sr": "Apartman Deluxe", "en": "Deluxe Apartment", "de": "Deluxe Wohnung", "it": "Appartamento Deluxe"}'::jsonb,
    '{"sr": "Luksuzni apartman sa pogledom na jezero, potpuno opremljen sa modernim sadržajima.", "en": "Luxury apartment with lake view, fully equipped with modern amenities.", "de": "Luxuswohnung mit Seeblick, voll ausgestattet mit modernen Annehmlichkeiten.", "it": "Appartamento di lusso con vista lago, completamente attrezzato con comfort moderni."}'::jsonb,
    '{"sr": "1 bračni krevet + 1 kauč na razvlačenje", "en": "1 double bed + 1 sofa bed", "de": "1 Doppelbett + 1 Schlafsofa", "it": "1 letto matrimoniale + 1 divano letto"}'::jsonb,
    4,
    ARRAY['{"code": "wifi", "name": {"sr": "WiFi", "en": "WiFi", "de": "WLAN", "it": "WiFi"}}'::jsonb, '{"code": "parking", "name": {"sr": "Parking", "en": "Parking", "de": "Parkplatz", "it": "Parcheggio"}}'::jsonb, '{"code": "lake_view", "name": {"sr": "Pogled na jezero", "en": "Lake view", "de": "Seeblick", "it": "Vista lago"}}'::jsonb, '{"code": "kitchen", "name": {"sr": "Kuhinja", "en": "Kitchen", "de": "Küche", "it": "Cucina"}}'::jsonb, '{"code": "air_conditioning", "name": {"sr": "Klima", "en": "Air conditioning", "de": "Klimaanlage", "it": "Aria condizionata"}}'::jsonb],
    45.00,
    ARRAY['{"url": "/images/deluxe-1.jpg", "alt": "Deluxe apartment living room", "order": 1}'::jsonb, '{"url": "/images/deluxe-2.jpg", "alt": "Deluxe apartment bedroom", "order": 2}'::jsonb, '{"url": "/images/deluxe-3.jpg", "alt": "Deluxe apartment lake view", "order": 3}'::jsonb],
    'active'
  ),
  
  -- Apartman Standard
  (
    '22222222-2222-2222-2222-222222222222',
    '{"sr": "Apartman Standard", "en": "Standard Apartment", "de": "Standard Wohnung", "it": "Appartamento Standard"}'::jsonb,
    '{"sr": "Komforan apartman sa svim potrebnim sadržajima za ugodan boravak.", "en": "Comfortable apartment with all necessary amenities for a pleasant stay.", "de": "Komfortable Wohnung mit allen notwendigen Annehmlichkeiten für einen angenehmen Aufenthalt.", "it": "Appartamento confortevole con tutti i comfort necessari per un soggiorno piacevole."}'::jsonb,
    '{"sr": "1 bračni krevet + 1 kauč", "en": "1 double bed + 1 sofa", "de": "1 Doppelbett + 1 Sofa", "it": "1 letto matrimoniale + 1 divano"}'::jsonb,
    3,
    ARRAY['{"code": "wifi", "name": {"sr": "WiFi", "en": "WiFi", "de": "WLAN", "it": "WiFi"}}'::jsonb, '{"code": "parking", "name": {"sr": "Parking", "en": "Parking", "de": "Parkplatz", "it": "Parcheggio"}}'::jsonb, '{"code": "kitchen", "name": {"sr": "Kuhinja", "en": "Kitchen", "de": "Küche", "it": "Cucina"}}'::jsonb],
    35.00,
    ARRAY['{"url": "/images/standard-1.jpg", "alt": "Standard apartment living room", "order": 1}'::jsonb, '{"url": "/images/standard-2.jpg", "alt": "Standard apartment bedroom", "order": 2}'::jsonb],
    'active'
  ),
  
  -- Apartman Family
  (
    '33333333-3333-3333-3333-333333333333',
    '{"sr": "Apartman Family", "en": "Family Apartment", "de": "Familienwohnung", "it": "Appartamento Famiglia"}'::jsonb,
    '{"sr": "Prostran apartman idealan za porodice, sa dve spavaće sobe i velikim dnevnim boravkom.", "en": "Spacious apartment ideal for families, with two bedrooms and a large living room.", "de": "Geräumige Wohnung ideal für Familien, mit zwei Schlafzimmern und einem großen Wohnzimmer.", "it": "Appartamento spazioso ideale per famiglie, con due camere da letto e un ampio soggiorno."}'::jsonb,
    '{"sr": "2 bračna kreveta + 1 kauč na razvlačenje", "en": "2 double beds + 1 sofa bed", "de": "2 Doppelbetten + 1 Schlafsofa", "it": "2 letti matrimoniali + 1 divano letto"}'::jsonb,
    6,
    ARRAY['{"code": "wifi", "name": {"sr": "WiFi", "en": "WiFi", "de": "WLAN", "it": "WiFi"}}'::jsonb, '{"code": "parking", "name": {"sr": "Parking", "en": "Parking", "de": "Parkplatz", "it": "Parcheggio"}}'::jsonb, '{"code": "lake_view", "name": {"sr": "Pogled na jezero", "en": "Lake view", "de": "Seeblick", "it": "Vista lago"}}'::jsonb, '{"code": "kitchen", "name": {"sr": "Kuhinja", "en": "Kitchen", "de": "Küche", "it": "Cucina"}}'::jsonb, '{"code": "air_conditioning", "name": {"sr": "Klima", "en": "Air conditioning", "de": "Klimaanlage", "it": "Aria condizionata"}}'::jsonb, '{"code": "balcony", "name": {"sr": "Balkon", "en": "Balcony", "de": "Balkon", "it": "Balcone"}}'::jsonb],
    40.00,
    ARRAY['{"url": "/images/family-1.jpg", "alt": "Family apartment living room", "order": 1}'::jsonb, '{"url": "/images/family-2.jpg", "alt": "Family apartment bedroom 1", "order": 2}'::jsonb, '{"url": "/images/family-3.jpg", "alt": "Family apartment bedroom 2", "order": 3}'::jsonb],
    'active'
  ),
  
  -- Apartman Studio
  (
    '44444444-4444-4444-4444-444444444444',
    '{"sr": "Apartman Studio", "en": "Studio Apartment", "de": "Studio Wohnung", "it": "Monolocale"}'::jsonb,
    '{"sr": "Kompaktan studio apartman, savršen za parove ili solo putnike.", "en": "Compact studio apartment, perfect for couples or solo travelers.", "de": "Kompakte Studiowohnung, perfekt für Paare oder Alleinreisende.", "it": "Monolocale compatto, perfetto per coppie o viaggiatori singoli."}'::jsonb,
    '{"sr": "1 bračni krevet", "en": "1 double bed", "de": "1 Doppelbett", "it": "1 letto matrimoniale"}'::jsonb,
    2,
    ARRAY['{"code": "wifi", "name": {"sr": "WiFi", "en": "WiFi", "de": "WLAN", "it": "WiFi"}}'::jsonb, '{"code": "parking", "name": {"sr": "Parking", "en": "Parking", "de": "Parkplatz", "it": "Parcheggio"}}'::jsonb, '{"code": "kitchenette", "name": {"sr": "Čajna kuhinja", "en": "Kitchenette", "de": "Kochnische", "it": "Angolo cottura"}}'::jsonb],
    30.00,
    ARRAY['{"url": "/images/studio-1.jpg", "alt": "Studio apartment interior", "order": 1}'::jsonb, '{"url": "/images/studio-2.jpg", "alt": "Studio apartment bed", "order": 2}'::jsonb],
    'active'
  )
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- SEED DATA: Multi-language Content
-- =====================================================

-- Homepage content
INSERT INTO content (key, language, value) VALUES
  ('home.hero.title', 'sr', '"Dobrodošli u Apartmane Jovča"'::jsonb),
  ('home.hero.title', 'en', '"Welcome to Apartmani Jovča"'::jsonb),
  ('home.hero.title', 'de', '"Willkommen bei Apartmani Jovča"'::jsonb),
  ('home.hero.title', 'it', '"Benvenuti agli Apartmani Jovča"'::jsonb),
  
  ('home.hero.subtitle', 'sr', '"Vaš savršeni odmor na Bovanskom jezeru"'::jsonb),
  ('home.hero.subtitle', 'en', '"Your perfect vacation at Bovansko Lake"'::jsonb),
  ('home.hero.subtitle', 'de', '"Ihr perfekter Urlaub am Bovansko-See"'::jsonb),
  ('home.hero.subtitle', 'it', '"La vostra vacanza perfetta al Lago Bovansko"'::jsonb),
  
  ('home.hero.cta', 'sr', '"Rezervišite sada"'::jsonb),
  ('home.hero.cta', 'en', '"Book now"'::jsonb),
  ('home.hero.cta', 'de', '"Jetzt buchen"'::jsonb),
  ('home.hero.cta', 'it', '"Prenota ora"'::jsonb),

-- Gallery content
  ('gallery.title', 'sr', '"Galerija"'::jsonb),
  ('gallery.title', 'en', '"Gallery"'::jsonb),
  ('gallery.title', 'de', '"Galerie"'::jsonb),
  ('gallery.title', 'it', '"Galleria"'::jsonb),
  
  ('gallery.description', 'sr', '"Pogledajte naše apartmane i okolinu"'::jsonb),
  ('gallery.description', 'en', '"View our apartments and surroundings"'::jsonb),
  ('gallery.description', 'de', '"Sehen Sie unsere Wohnungen und Umgebung"'::jsonb),
  ('gallery.description', 'it', '"Guarda i nostri appartamenti e dintorni"'::jsonb),

-- Prices content
  ('prices.title', 'sr', '"Cenovnik"'::jsonb),
  ('prices.title', 'en', '"Prices"'::jsonb),
  ('prices.title', 'de', '"Preise"'::jsonb),
  ('prices.title', 'it', '"Prezzi"'::jsonb),
  
  ('prices.description', 'sr', '"Transparentne cene bez skrivenih troškova"'::jsonb),
  ('prices.description', 'en', '"Transparent prices with no hidden costs"'::jsonb),
  ('prices.description', 'de', '"Transparente Preise ohne versteckte Kosten"'::jsonb),
  ('prices.description', 'it', '"Prezzi trasparenti senza costi nascosti"'::jsonb),

-- Attractions content
  ('attractions.title', 'sr', '"Atrakcije"'::jsonb),
  ('attractions.title', 'en', '"Attractions"'::jsonb),
  ('attractions.title', 'de', '"Attraktionen"'::jsonb),
  ('attractions.title', 'it', '"Attrazioni"'::jsonb),
  
  ('attractions.description', 'sr', '"Otkrijte lepote Bovanskog jezera i okoline"'::jsonb),
  ('attractions.description', 'en', '"Discover the beauty of Bovansko Lake and surroundings"'::jsonb),
  ('attractions.description', 'de', '"Entdecken Sie die Schönheit des Bovansko-Sees und der Umgebung"'::jsonb),
  ('attractions.description', 'it', '"Scopri la bellezza del Lago Bovansko e dintorni"'::jsonb),

-- Contact content
  ('contact.title', 'sr', '"Kontakt"'::jsonb),
  ('contact.title', 'en', '"Contact"'::jsonb),
  ('contact.title', 'de', '"Kontakt"'::jsonb),
  ('contact.title', 'it', '"Contatto"'::jsonb),
  
  ('contact.description', 'sr', '"Kontaktirajte nas za više informacija"'::jsonb),
  ('contact.description', 'en', '"Contact us for more information"'::jsonb),
  ('contact.description', 'de', '"Kontaktieren Sie uns für weitere Informationen"'::jsonb),
  ('contact.description', 'it', '"Contattaci per maggiori informazioni"'::jsonb),
  
  ('contact.phone', 'sr', '"+381 69 334 9457"'::jsonb),
  ('contact.phone', 'en', '"+381 69 334 9457"'::jsonb),
  ('contact.phone', 'de', '"+381 69 334 9457"'::jsonb),
  ('contact.phone', 'it', '"+381 69 334 9457"'::jsonb),
  
  ('contact.email', 'sr', '"mtosic0450@gmail.com"'::jsonb),
  ('contact.email', 'en', '"mtosic0450@gmail.com"'::jsonb),
  ('contact.email', 'de', '"mtosic0450@gmail.com"'::jsonb),
  ('contact.email', 'it', '"mtosic0450@gmail.com"'::jsonb)
ON CONFLICT (key, language) DO NOTHING;

-- =====================================================
-- SEED DATA: Sample Availability (next 365 days)
-- =====================================================

-- Generate availability records for all apartments for next 365 days
-- All dates are initially available
INSERT INTO availability (apartment_id, date, is_available)
SELECT
  a.id,
  generate_series(
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '365 days',
    INTERVAL '1 day'
  )::DATE,
  TRUE
FROM apartments a
WHERE a.status = 'active'
ON CONFLICT (apartment_id, date) DO NOTHING;
