-- Enable extensions
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Enable RLS
ALTER TABLE IF EXISTS analytics_events ENABLE ROW LEVEL SECURITY;

-- Create tables
CREATE TABLE IF NOT EXISTS content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lang TEXT NOT NULL,
  section TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS apartments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  capacity INT NOT NULL,
  price_per_night DECIMAL(10,2) NOT NULL,
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  apartment_id UUID NOT NULL REFERENCES apartments(id),
  guest_id UUID NOT NULL REFERENCES guests(id),
  checkin DATE NOT NULL,
  checkout DATE NOT NULL,
  total_price DECIMAL(10,2),
  status TEXT DEFAULT 'pending',
  booking_range DATERANGE GENERATED ALWAYS AS (daterange(checkin, checkout, '[]')) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  apartment_id UUID NOT NULL REFERENCES apartments(id),
  date DATE NOT NULL,
  available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  apartment_id UUID NOT NULL REFERENCES apartments(id),
  guest_id UUID REFERENCES guests(id),
  rating INT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_content_lang_section ON content(lang, section);
CREATE INDEX IF NOT EXISTS idx_bookings_apartment_dates ON bookings(apartment_id, checkin, checkout);
CREATE INDEX IF NOT EXISTS idx_availability_apartment_date ON availability(apartment_id, date);
CREATE INDEX IF NOT EXISTS idx_reviews_apartment ON reviews(apartment_id);

-- RLS Policies
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read content" ON content FOR SELECT USING (true);
CREATE POLICY "Allow insert content" ON content FOR INSERT WITH CHECK (true);

ALTER TABLE apartments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read apartments" ON apartments FOR SELECT USING (true);

ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow insert guests" ON guests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow read own guests" ON guests FOR SELECT USING (auth.uid() = id);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow insert bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = guest_id);
CREATE POLICY "Allow read own bookings" ON bookings FOR SELECT USING (auth.uid() = guest_id);

ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read availability" ON availability FOR SELECT USING (true);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Allow insert reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = guest_id);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow insert messages" ON messages FOR INSERT WITH CHECK (true);

-- Functions
CREATE OR REPLACE FUNCTION check_availability(apartment_id UUID, checkin DATE, checkout DATE)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM bookings
    WHERE bookings.apartment_id = $1
    AND booking_range && daterange($2, $3, '[]')
    AND status != 'cancelled'
  );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_available_apartments(checkin DATE, checkout DATE)
RETURNS TABLE (id UUID, name TEXT, type TEXT, capacity INT, price_per_night DECIMAL) AS $$
BEGIN
  RETURN QUERY
  SELECT a.id, a.name, a.type, a.capacity, a.price_per_night
  FROM apartments a
  WHERE check_availability(a.id, $1, $2);
END;
$$ LANGUAGE plpgsql;

-- Seed data for apartments
INSERT INTO apartments (name, type, capacity, price_per_night) VALUES
('Deluxe Apartment', 'deluxe', 4, 100.00),
('Standard Apartment', 'standard', 2, 70.00),
('Family Apartment', 'family', 6, 120.00),
('Basic Apartment', 'basic', 2, 50.00);

-- Content migration (example for en.json, repeat for other langs)
-- Note: In practice, load from JSON files
INSERT INTO content (lang, section, data) VALUES
('en', 'home', '{"title": "Apartments Jovča", "subtitle": "Discover the perfect place to relax in the heart of nature", "description": "Luxurious apartments with beautiful views of Bovan Lake. Ideal place for vacation, fishing and relaxation.", "reserve": "Reserve now", "welcome": "Welcome", "aboutTitle": "About Us - Welcome to Apartments Jovča", "aboutText": "Our apartments are located on the shore of the beautiful Bovan Lake..."}'),
('en', 'prices', '{"title": "Prices", "description": "Transparent prices without hidden costs", "apartments": [{"name": "Apartment with double bed", "capacity": "1-2 people", "bed": "Double bed", "note": "Ideal for couples"}, {"name": "Apartment with two single beds", "capacity": "2 people", "bed": "Two single beds", "note": "View of the lake"}], "includes": "Includes: Wi-Fi, parking, terrace use"}');

-- No overlapping bookings constraint
ALTER TABLE bookings ADD CONSTRAINT no_overlapping_bookings EXCLUDE USING gist (apartment_id WITH =, booking_range WITH &&) WHERE (status != 'cancelled');
