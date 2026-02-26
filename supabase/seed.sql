-- =====================================================
-- Seed Data for Apartmani Jovca
-- =====================================================
-- This file contains initial/sample data for the database.
-- Run this after the main migration file.
-- Language: Serbian (sr) is the default content language
-- =====================================================

-- =====================================================
-- APARTMENTS (Stanovi)
-- =====================================================
-- Clear existing apartments if re-seeding
-- DELETE FROM apartments; -- Uncomment if needed

-- Insert apartments with Serbian names and descriptions
INSERT INTO apartments (id, name, type, capacity, price_per_night, images) VALUES
(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Apartman Jezero',
  'deluxe',
  4,
  85.00,
  ARRAY[
    '/images/apartments/jezero-1.jpg',
    '/images/apartments/jezero-2.jpg',
    '/images/apartments/jezero-3.jpg'
  ]
),
(
  'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  'Apartman Sova',
  'standard',
  2,
  60.00,
  ARRAY[
    '/images/apartments/sova-1.jpg',
    '/images/apartments/sova-2.jpg'
  ]
),
(
  'c3d4e5f6-a7b8-9012-cdef-123456789012',
  'Apartman Porodica',
  'family',
  6,
  110.00,
  ARRAY[
    '/images/apartments/porodica-1.jpg',
    '/images/apartments/porodica-2.jpg',
    '/images/apartments/porodica-3.jpg',
    '/images/apartments/porodica-4.jpg'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- CONTENT - Site Settings and Localized Content (sr)
-- =====================================================

-- Site Settings (Postavke sajta)
INSERT INTO content (lang, section, data) VALUES
-- Serbian (default language)
('sr', 'site_settings', '{
  "site_name": "Apartmani Jovca",
  "site_description": "Luksuzni apartmani sa prelepim pogledom na jezero Bovan. Idealno mesto za odmor, ribolov i relaksaciju.",
  "contact_email": "info@apartmani-jovca.rs",
  "contact_phone": "+381 64 123 4567",
  "whatsapp": "+381 64 123 4567",
  "address": "Bovan, Aleksinac, Srbija",
  "social_facebook": "https://facebook.com/apartmani-jovca",
  "social_instagram": "https://instagram.com/apartmani-jovca",
  "checkin_time": "14:00",
  "checkout_time": "10:00",
  "currency": "RSD",
  "languages": ["sr", "en", "de", "it"]
}'),

-- Home page content (sr)
('sr', 'home', '{
  "title": "Apartmani Jovca",
  "subtitle": "Otkrijte savrreno mesto za odmor u srcu prirode",
  "description": "Luksuzni apartmani sa prelepim pogledom na jezero Bovan. Idealno mesto za odmor, ribolov i relaksaciju.",
  "reserve": "Rezerviite sada",
  "welcome": "Dobrodoli",
  "aboutTitle": "O nama - Dobrodoli u Apartmane Jovca",
  "aboutText": "Nai apartmani se nalaze na obali prelepog jezera Bovan, okrueni netaknutom prirodom. Nudimo udoban smeaj sa svim modernim pogodnostima. Bovan jezero je poznato po odlicnom ribolovu, a u blizini se nalaze brojne turisticke atrakcije poput manastira Ravanica i banje Ribarska.",
  "features": [
    {"icon": "wifi", "title": "Besplatan Wi-Fi", "description": "Brz internet u svim apartmanima"},
    {"icon": "parking", "title": "Besplatan parking", "description": "Obezbedjen parking za sve goste"},
    {"icon": "terrace", "title": "Terasa sa pogledom", "description": "Uivajte u prelepom pogledu na jezero"},
    {"icon": "kitchen", "title": "Potpuno opremljena kuhinja", "description": "Sve to vam je potrebno za boravak"}
  ]
}'),

-- Prices page content (sr)
('sr', 'prices', '{
  "title": "Cene",
  "description": "Transparentne cene bez skrivenih trokova",
  "includes": "Ukljucuje: Wi-Fi, parking, korienje terase, posteljina, penici",
  "note": "Cene mogu varirati zavisno od sezone. Kontaktirajte nas za detalje.",
  "seasonal": {
    "low": {"months": "Novembar - Mart", "discount": "20% popusta"},
    "high": {"months": "Jul - Avgust", "surcharge": " +20% na osnovnu cenu"}
  }
}'),

-- Contact page content (sr)
('sr', 'contact', '{
  "title": "Kontakt",
  "subtitle": "Javite nam se",
  "description": "Tu smo da odgovorimo na sva vaa pitanja. Kontaktirajte nas putem forme, telefona ili posetite na licno mesto.",
  "form": {
    "name": "Ime",
    "email": "Email adresa",
    "phone": "Telefon",
    "message": "Poruka",
    "submit": "Poalji poruku"
  },
  "info": {
    "address_title": "Adresa",
    "phone_title": "Telefon",
    "email_title": "Email",
    "working_hours": "Radno vreme"
  }
}')

ON CONFLICT (lang, section) DO NOTHING;

-- =====================================================
-- ATTRACTIONS (Atrakcije) - Stored in content table
-- =====================================================

INSERT INTO content (lang, section, data) VALUES
('sr', 'attractions', '{
  "title": "Atrakcije u blizini",
  "description": "Otkrijte prelepe atrakcije u okolini jezera Bovan",
  "items": [
    {
      "id": "attr-1",
      "name": "Jezero Bovan",
      "description": "Vestacko jezero nastalo 1983. godine, poznato po odlicnom ribolovu i prelepim pejzaima. Idealno za kupanje, suncanje i uivanje u prirodi.",
      "distance": "0 km",
      "image": "/images/attractions/bovan-lake.jpg",
      "type": "nature",
      "activities": ["ribolov", "kupanje", "piknik", "etnja"]
    },
    {
      "id": "attr-2",
      "name": "Manastir Ravanica",
      "description": "Srpski pravoslavni manastir iz 14. veka, zaduibina kneza Lazara. Jedan od najznacajnijih spomenika srpske srednjovekovne arhitekture.",
      "distance": "15 km",
      "image": "/images/attractions/ravanica.jpg",
      "type": "cultural",
      "activities": ["obilazak", "molitva", "fotografisanje"]
    },
    {
      "id": "attr-3",
      "name": "Banja Ribarska",
      "description": "Lecilita banja poznata po lekovitim termalnim vodama. Nudi tretmane za reumatske bolesti i rehabilitaciju.",
      "distance": "20 km",
      "image": "/images/attractions/ribarska-banja.jpg",
      "type": "wellness",
      "activities": ["banja", "masaa", "relax"]
    },
    {
      "id": "attr-4",
      "name": "Soko Grad",
      "description": "Srednjovekovna tvrjava na obroncima planine Ozren. Nudi prelep pogled na okolinu i bogatu istoriju.",
      "distance": "25 km",
      "image": "/images/attractions/soko-grad.jpg",
      "type": "historical",
      "activities": ["planinarenje", "obilazak", "fotografisanje"]
    },
    {
      "id": "attr-5",
      "name": "Planina Ozren",
      "description": "Planina pogodna za planinarenje, sa brojnim stazama i prirodnim lepotama. Popularna destinacija za ljubitelje prirode.",
      "distance": "10 km",
      "image": "/images/attractions/ozren.jpg",
      "type": "nature",
      "activities": ["planinarenje", "biciklizam", "piknik"]
    }
  ]
}')
ON CONFLICT (lang, section) DO NOTHING;

-- =====================================================
-- ENGLISH CONTENT (en)
-- =====================================================

INSERT INTO content (lang, section, data) VALUES
('en', 'site_settings', '{
  "site_name": "Apartments Jovca",
  "site_description": "Luxurious apartments with beautiful views of Bovan Lake. Ideal place for vacation, fishing and relaxation.",
  "contact_email": "info@apartmani-jovca.rs",
  "contact_phone": "+381 64 123 4567",
  "whatsapp": "+381 64 123 4567",
  "address": "Bovan, Aleksinac, Serbia",
  "social_facebook": "https://facebook.com/apartmani-jovca",
  "social_instagram": "https://instagram.com/apartmani-jovca",
  "checkin_time": "14:00",
  "checkout_time": "10:00",
  "currency": "RSD",
  "languages": ["sr", "en", "de", "it"]
}'),

('en', 'home', '{
  "title": "Apartments Jovca",
  "subtitle": "Discover the perfect place to relax in the heart of nature",
  "description": "Luxurious apartments with beautiful views of Bovan Lake. Ideal place for vacation, fishing and relaxation.",
  "reserve": "Reserve now",
  "welcome": "Welcome",
  "aboutTitle": "About Us - Welcome to Apartments Jovca",
  "aboutText": "Our apartments are located on the shore of the beautiful Bovan Lake, surrounded by untouched nature. We offer comfortable accommodation with all modern amenities. Bovan Lake is known for excellent fishing, and nearby there are numerous tourist attractions such as Ravanica Monastery and Ribarska Banja.",
  "features": [
    {"icon": "wifi", "title": "Free Wi-Fi", "description": "Fast internet in all apartments"},
    {"icon": "parking", "title": "Free parking", "description": "Parking provided for all guests"},
    {"icon": "terrace", "title": "Terrace with view", "description": "Enjoy the beautiful lake view"},
    {"icon": "kitchen", "title": "Fully equipped kitchen", "description": "Everything you need for your stay"}
  ]
}'),

('en', 'attractions', '{
  "title": "Nearby Attractions",
  "description": "Discover beautiful attractions around Bovan Lake",
  "items": [
    {
      "id": "attr-1",
      "name": "Bovan Lake",
      "description": "Artificial lake created in 1983, known for excellent fishing and beautiful landscapes. Ideal for swimming, sunbathing and enjoying nature.",
      "distance": "0 km",
      "image": "/images/attractions/bovan-lake.jpg",
      "type": "nature",
      "activities": ["fishing", "swimming", "picnic", "walking"]
    },
    {
      "id": "attr-2",
      "name": "Ravanica Monastery",
      "description": "Serbian Orthodox monastery from the 14th century, endowment of Prince Lazar. One of the most significant monuments of Serbian medieval architecture.",
      "distance": "15 km",
      "image": "/images/attractions/ravanica.jpg",
      "type": "cultural",
      "activities": ["sightseeing", "prayer", "photography"]
    },
    {
      "id": "attr-3",
      "name": "Ribarska Banja Spa",
      "description": "Health resort known for healing thermal waters. Offers treatments for rheumatic diseases and rehabilitation.",
      "distance": "20 km",
      "image": "/images/attractions/ribarska-banja.jpg",
      "type": "wellness",
      "activities": ["spa", "massage", "relax"]
    }
  ]
}')

ON CONFLICT (lang, section) DO NOTHING;

-- =====================================================
-- GERMAN CONTENT (de)
-- =====================================================

INSERT INTO content (lang, section, data) VALUES
('de', 'site_settings', '{
  "site_name": "Apartments Jovca",
  "site_description": "Luxusapartments mit wunderschönem Blick auf den Bovan-See. Der ideale Ort für Urlaub, Angeln und Entspannung.",
  "contact_email": "info@apartmani-jovca.rs",
  "contact_phone": "+381 64 123 4567",
  "whatsapp": "+381 64 123 4567",
  "address": "Bovan, Aleksinac, Serbien",
  "checkin_time": "14:00",
  "checkout_time": "10:00",
  "currency": "RSD"
}'),

('de', 'home', '{
  "title": "Apartments Jovca",
  "subtitle": "Entdecken Sie den perfekten Ort zum Entspannen im Herzen der Natur",
  "description": "Luxusapartments mit wunderschönem Blick auf den Bovan-See. Der ideale Ort für Urlaub, Angeln und Entspannung.",
  "reserve": "Jetzt reservieren",
  "welcome": "Willkommen",
  "aboutTitle": "Über uns - Willkommen in Apartments Jovca",
  "aboutText": "Unsere Apartments befinden sich am Ufer des wunderschönen Bovan-Sees, umgeben von unberührter Natur. Wir bieten komfortable Unterkunft mit allen modernen Annehmlichkeiten."
}')

ON CONFLICT (lang, section) DO NOTHING;

-- =====================================================
-- ITALIAN CONTENT (it)
-- =====================================================

INSERT INTO content (lang, section, data) VALUES
('it', 'site_settings', '{
  "site_name": "Appartamenti Jovca",
  "site_description": "Appartamenti di lusso con una splendida vista sul lago Bovan. Il luogo ideale per vacanze, pesca e relax.",
  "contact_email": "info@apartmani-jovca.rs",
  "contact_phone": "+381 64 123 4567",
  "whatsapp": "+381 64 123 4567",
  "address": "Bovan, Aleksinac, Serbia",
  "checkin_time": "14:00",
  "checkout_time": "10:00",
  "currency": "RSD"
}'),

('it', 'home', '{
  "title": "Appartamenti Jovca",
  "subtitle": "Scopri il luogo perfetto per rilassarti nel cuore della natura",
  "description": "Appartamenti di lusso con una splendida vista sul lago Bovan. Il luogo ideale per vacanze, pesca e relax.",
  "reserve": "Prenota ora",
  "welcome": "Benvenuto",
  "aboutTitle": "Chi siamo - Benvenuto agli Appartamenti Jovca",
  "aboutText": "I nostri appartamenti si trovano sulla riva del bellissimo lago Bovan, circondati da natura incontaminata. Offriamo sistemazioni confortevoli con tutti i comfort moderni."
}')

ON CONFLICT (lang, section) DO NOTHING;

-- =====================================================
-- SAMPLE AVAILABILITY (Optional - for testing)
-- =====================================================
-- Mark next 30 days as available for all apartments
-- Uncomment to use:
/*
INSERT INTO availability (apartment_id, date, available)
SELECT 
  a.id,
  CURRENT_DATE + GENERATE_SERIES(0, 29),
  TRUE
FROM apartments a;
*/

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify the seed was successful:
-- SELECT * FROM apartments;
-- SELECT lang, section FROM content ORDER BY lang, section;
-- SELECT * FROM content WHERE section = 'attractions';