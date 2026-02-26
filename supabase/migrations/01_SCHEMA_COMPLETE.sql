-- =====================================================
-- 01_SCHEMA_COMPLETE.sql
-- Complete database schema with all tables, indexes, and constraints
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist"; -- Required for exclusion constraints

-- =====================================================
-- TABLE: apartments
-- =====================================================
CREATE TABLE apartments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Multi-language content
  name JSONB NOT NULL,
  description JSONB NOT NULL,
  bed_type JSONB NOT NULL,
  
  -- Capacity and amenities
  capacity INT NOT NULL CHECK (capacity > 0),
  amenities JSONB[] DEFAULT '{}',
  
  -- Pricing
  base_price_eur DECIMAL(10,2) NOT NULL CHECK (base_price_eur > 0),
  
  -- Images
  images JSONB[] DEFAULT '{}',
  
  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for apartments
CREATE INDEX idx_apartments_status ON apartments(status);

-- Comments for apartments
COMMENT ON TABLE apartments IS 'Apartment listings with multi-language content';
COMMENT ON COLUMN apartments.name IS 'Multi-language names: {"sr": "...", "en": "...", "de": "...", "it": "..."}';
COMMENT ON COLUMN apartments.amenities IS 'Array of amenity codes: ["wifi", "parking", "lake_view", ...]';

-- =====================================================
-- TABLE: guests
-- =====================================================
CREATE TABLE guests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Contact information
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  
  -- Authentication reference
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Preferences
  language TEXT NOT NULL DEFAULT 'sr' CHECK (language IN ('sr', 'en', 'de', 'it')),
  
  -- Statistics (updated by triggers)
  total_bookings INT NOT NULL DEFAULT 0 CHECK (total_bookings >= 0),
  total_nights INT NOT NULL DEFAULT 0 CHECK (total_nights >= 0),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for guests
CREATE INDEX idx_guests_email ON guests(email);
CREATE INDEX idx_guests_auth_user_id ON guests(auth_user_id);

-- Comments for guests
COMMENT ON TABLE guests IS 'Guest information and authentication references';
COMMENT ON COLUMN guests.auth_user_id IS 'Reference to Supabase auth.users for guest portal access';
COMMENT ON COLUMN guests.total_bookings IS 'Total confirmed bookings (updated by trigger)';
COMMENT ON COLUMN guests.total_nights IS 'Total nights stayed (updated by trigger)';

-- =====================================================
-- TABLE: bookings
-- =====================================================
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Booking reference
  booking_number TEXT NOT NULL UNIQUE,
  
  -- Foreign keys
  apartment_id UUID NOT NULL REFERENCES apartments(id) ON DELETE RESTRICT,
  guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE RESTRICT,
  
  -- Dates
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  nights INT GENERATED ALWAYS AS (check_out - check_in) STORED,
  
  -- Guest details
  num_guests INT NOT NULL CHECK (num_guests > 0),
  arrival_time TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show')),
  
  -- Pricing
  price_per_night DECIMAL(10,2) NOT NULL CHECK (price_per_night > 0),
  total_price DECIMAL(10,2) NOT NULL CHECK (total_price > 0),
  
  -- Additional options
  options JSONB DEFAULT '[]',
  special_requests TEXT,
  
  -- Status timestamps
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  checked_in_at TIMESTAMPTZ,
  checked_out_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Metadata
  source TEXT NOT NULL DEFAULT 'website' CHECK (source IN ('website', 'phone', 'email', 'booking_com')),
  language TEXT NOT NULL DEFAULT 'sr' CHECK (language IN ('sr', 'en', 'de', 'it')),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CHECK (check_out > check_in)
);

-- Indexes for bookings
CREATE INDEX idx_bookings_apartment_id ON bookings(apartment_id);
CREATE INDEX idx_bookings_guest_id ON bookings(guest_id);
CREATE INDEX idx_bookings_dates ON bookings(check_in, check_out);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_booking_number ON bookings(booking_number);

-- CRITICAL: Exclusion constraint to prevent overlapping bookings
-- This ensures zero double-bookings at the database level
CREATE UNIQUE INDEX idx_bookings_no_overlap 
  ON bookings USING GIST (
    apartment_id WITH =,
    daterange(check_in, check_out, '[]') WITH &&
  )
  WHERE status IN ('confirmed', 'pending');

-- Comments for bookings
COMMENT ON TABLE bookings IS 'Booking records with overlap prevention';
COMMENT ON COLUMN bookings.booking_number IS 'Human-readable reference: BJ-2024-0123';
COMMENT ON COLUMN bookings.nights IS 'Calculated as (check_out - check_in), stored for performance';
COMMENT ON COLUMN bookings.options IS 'Additional options: ["crib", "early_checkin", "late_checkout"]';
COMMENT ON INDEX idx_bookings_no_overlap IS 'CRITICAL: Prevents overlapping bookings for same apartment';

-- =====================================================
-- TABLE: availability
-- =====================================================
CREATE TABLE availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Foreign keys
  apartment_id UUID NOT NULL REFERENCES apartments(id) ON DELETE CASCADE,
  
  -- Date
  date DATE NOT NULL,
  
  -- Availability
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  price_override DECIMAL(10,2) CHECK (price_override IS NULL OR price_override > 0),
  
  -- Reason for unavailability
  reason TEXT CHECK (reason IS NULL OR reason IN ('booked', 'maintenance', 'blocked')),
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Unique constraint: one record per apartment per date
  UNIQUE(apartment_id, date)
);

-- Indexes for availability
CREATE INDEX idx_availability_apartment_date ON availability(apartment_id, date);
CREATE INDEX idx_availability_date ON availability(date);

-- Comments for availability
COMMENT ON TABLE availability IS 'Per-date availability tracking with price overrides';
COMMENT ON COLUMN availability.price_override IS 'Override base price for specific dates (e.g., holidays)';
COMMENT ON COLUMN availability.reason IS 'Why unavailable: booked, maintenance, or manually blocked';

-- =====================================================
-- TABLE: reviews
-- =====================================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Foreign keys
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  apartment_id UUID NOT NULL REFERENCES apartments(id) ON DELETE CASCADE,
  
  -- Rating
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  
  -- Review content
  title TEXT,
  comment TEXT,
  
  -- Guest photos
  photos JSONB[] DEFAULT '{}',
  
  -- Approval workflow
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_at TIMESTAMPTZ,
  
  -- Metadata
  language TEXT NOT NULL DEFAULT 'sr' CHECK (language IN ('sr', 'en', 'de', 'it')),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for reviews
CREATE INDEX idx_reviews_apartment_id ON reviews(apartment_id);
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- Comments for reviews
COMMENT ON TABLE reviews IS 'Guest reviews with approval workflow';
COMMENT ON COLUMN reviews.photos IS 'Guest-uploaded photos: [{"url": "...", "caption": "..."}, ...]';
COMMENT ON COLUMN reviews.status IS 'Approval status: pending, approved, or rejected';

-- =====================================================
-- TABLE: booking_messages
-- =====================================================
CREATE TABLE booking_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Foreign keys
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  
  -- Sender information
  sender_type TEXT NOT NULL CHECK (sender_type IN ('guest', 'admin')),
  sender_id UUID NOT NULL,
  
  -- Message content
  content TEXT NOT NULL,
  attachments JSONB[] DEFAULT '{}',
  
  -- Read status
  read_at TIMESTAMPTZ,
  
  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for booking_messages
CREATE INDEX idx_booking_messages_booking_id ON booking_messages(booking_id);
CREATE INDEX idx_booking_messages_created_at ON booking_messages(created_at DESC);

-- Comments for booking_messages
COMMENT ON TABLE booking_messages IS 'Guest-admin communication within guest portal';
COMMENT ON COLUMN booking_messages.attachments IS 'File attachments: [{"url": "...", "type": "image", "name": "..."}, ...]';

-- =====================================================
-- TABLE: messages
-- =====================================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Contact information
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  
  -- Message content
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
  
  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for messages
CREATE INDEX idx_messages_status ON messages(status);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- Comments for messages
COMMENT ON TABLE messages IS 'Contact form submissions from public website';

-- =====================================================
-- TABLE: content
-- =====================================================
CREATE TABLE content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Content key-value
  key TEXT NOT NULL,
  language TEXT NOT NULL CHECK (language IN ('sr', 'en', 'de', 'it')),
  value JSONB NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Unique constraint: one value per key per language
  UNIQUE(key, language)
);

-- Indexes for content
CREATE INDEX idx_content_key_language ON content(key, language);

-- Comments for content
COMMENT ON TABLE content IS 'Multi-language CMS content with key-value structure';
COMMENT ON COLUMN content.key IS 'Content key: home.hero.title, prices.description, etc.';
COMMENT ON COLUMN content.value IS 'Flexible JSONB value: text, rich text, arrays, objects';

-- =====================================================
-- TABLE: analytics_events
-- =====================================================
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Event information
  event_type TEXT NOT NULL,
  event_data JSONB,
  
  -- Session information
  session_id TEXT,
  user_id UUID,
  
  -- Context
  page_url TEXT,
  referrer TEXT,
  device_type TEXT CHECK (device_type IS NULL OR device_type IN ('mobile', 'tablet', 'desktop')),
  browser TEXT,
  language TEXT,
  
  -- Geo information (from Vercel edge)
  country TEXT,
  city TEXT,
  
  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for analytics_events
CREATE INDEX idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX idx_analytics_events_session_id ON analytics_events(session_id);

-- Comments for analytics_events
COMMENT ON TABLE analytics_events IS 'Custom analytics tracking for booking funnel and user behavior';
COMMENT ON COLUMN analytics_events.event_type IS 'Event type: page_view, booking_step, cta_click, etc.';
COMMENT ON COLUMN analytics_events.event_data IS 'Event-specific data: {"step": 1, "apartment_id": "..."}';
