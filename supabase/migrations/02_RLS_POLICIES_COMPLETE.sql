-- =====================================================
-- 02_RLS_POLICIES_COMPLETE.sql
-- Row Level Security policies for all tables
-- =====================================================

-- =====================================================
-- RLS: apartments
-- =====================================================
ALTER TABLE apartments ENABLE ROW LEVEL SECURITY;

-- Public users can view active apartments
CREATE POLICY "Public can view active apartments"
  ON apartments
  FOR SELECT
  USING (status = 'active');

-- Admin can manage all apartments
CREATE POLICY "Admin can manage apartments"
  ON apartments
  FOR ALL
  USING (auth.jwt() ->> 'email' = 'mtosic0450@gmail.com');

-- =====================================================
-- RLS: guests
-- =====================================================
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;

-- Guests can view their own profile
CREATE POLICY "Guests can view own profile"
  ON guests
  FOR SELECT
  USING (auth.uid() = auth_user_id);

-- Guests can update their own profile
CREATE POLICY "Guests can update own profile"
  ON guests
  FOR UPDATE
  USING (auth.uid() = auth_user_id);

-- Admin can manage all guests
CREATE POLICY "Admin can manage guests"
  ON guests
  FOR ALL
  USING (auth.jwt() ->> 'email' = 'mtosic0450@gmail.com');

-- =====================================================
-- RLS: bookings
-- =====================================================
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Guests can view their own bookings
CREATE POLICY "Guests can view own bookings"
  ON bookings
  FOR SELECT
  USING (
    guest_id IN (
      SELECT id FROM guests WHERE auth_user_id = auth.uid()
    )
  );

-- Guests can insert bookings for themselves
CREATE POLICY "Guests can create bookings"
  ON bookings
  FOR INSERT
  WITH CHECK (
    guest_id IN (
      SELECT id FROM guests WHERE auth_user_id = auth.uid()
    )
  );

-- Admin can manage all bookings
CREATE POLICY "Admin can manage bookings"
  ON bookings
  FOR ALL
  USING (auth.jwt() ->> 'email' = 'mtosic0450@gmail.com');

-- =====================================================
-- RLS: availability
-- =====================================================
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;

-- Public users can view availability
CREATE POLICY "Public can view availability"
  ON availability
  FOR SELECT
  USING (TRUE);

-- Admin can manage availability
CREATE POLICY "Admin can manage availability"
  ON availability
  FOR ALL
  USING (auth.jwt() ->> 'email' = 'mtosic0450@gmail.com');

-- =====================================================
-- RLS: reviews
-- =====================================================
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Public users can view approved reviews
CREATE POLICY "Public can view approved reviews"
  ON reviews
  FOR SELECT
  USING (status = 'approved');

-- Guests can view their own reviews (any status)
CREATE POLICY "Guests can view own reviews"
  ON reviews
  FOR SELECT
  USING (
    guest_id IN (
      SELECT id FROM guests WHERE auth_user_id = auth.uid()
    )
  );

-- Guests can create reviews for their bookings
CREATE POLICY "Guests can create reviews"
  ON reviews
  FOR INSERT
  WITH CHECK (
    guest_id IN (
      SELECT id FROM guests WHERE auth_user_id = auth.uid()
    )
    AND booking_id IN (
      SELECT b.id FROM bookings b
      JOIN guests g ON g.id = b.guest_id
      WHERE g.auth_user_id = auth.uid()
      AND b.status = 'completed'
    )
  );

-- Admin can manage all reviews
CREATE POLICY "Admin can manage reviews"
  ON reviews
  FOR ALL
  USING (auth.jwt() ->> 'email' = 'mtosic0450@gmail.com');

-- =====================================================
-- RLS: booking_messages
-- =====================================================
ALTER TABLE booking_messages ENABLE ROW LEVEL SECURITY;

-- Guests can view messages for their bookings
CREATE POLICY "Guests can view own booking messages"
  ON booking_messages
  FOR SELECT
  USING (
    booking_id IN (
      SELECT b.id FROM bookings b
      JOIN guests g ON g.id = b.guest_id
      WHERE g.auth_user_id = auth.uid()
    )
  );

-- Guests can send messages for their bookings
CREATE POLICY "Guests can send booking messages"
  ON booking_messages
  FOR INSERT
  WITH CHECK (
    sender_type = 'guest'
    AND booking_id IN (
      SELECT b.id FROM bookings b
      JOIN guests g ON g.id = b.guest_id
      WHERE g.auth_user_id = auth.uid()
    )
  );

-- Admin can manage all booking messages
CREATE POLICY "Admin can manage booking messages"
  ON booking_messages
  FOR ALL
  USING (auth.jwt() ->> 'email' = 'mtosic0450@gmail.com');

-- =====================================================
-- RLS: messages
-- =====================================================
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Public users can insert contact messages
CREATE POLICY "Public can send contact messages"
  ON messages
  FOR INSERT
  WITH CHECK (TRUE);

-- Admin can manage all messages
CREATE POLICY "Admin can manage messages"
  ON messages
  FOR ALL
  USING (auth.jwt() ->> 'email' = 'mtosic0450@gmail.com');

-- =====================================================
-- RLS: content
-- =====================================================
ALTER TABLE content ENABLE ROW LEVEL SECURITY;

-- Public users can view content
CREATE POLICY "Public can view content"
  ON content
  FOR SELECT
  USING (TRUE);

-- Admin can manage content
CREATE POLICY "Admin can manage content"
  ON content
  FOR ALL
  USING (auth.jwt() ->> 'email' = 'mtosic0450@gmail.com');

-- =====================================================
-- RLS: analytics_events
-- =====================================================
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Public users can insert analytics events
CREATE POLICY "Public can track analytics"
  ON analytics_events
  FOR INSERT
  WITH CHECK (TRUE);

-- Admin can view all analytics
CREATE POLICY "Admin can view analytics"
  ON analytics_events
  FOR SELECT
  USING (auth.jwt() ->> 'email' = 'mtosic0450@gmail.com');

-- Admin can manage analytics
CREATE POLICY "Admin can manage analytics"
  ON analytics_events
  FOR ALL
  USING (auth.jwt() ->> 'email' = 'mtosic0450@gmail.com');
