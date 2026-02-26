-- 1. Analytics Table for Tracking
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    -- 'page_view', 'booking_step', 'cta_click'
    event_data JSONB DEFAULT '{}',
    session_id TEXT,
    user_id UUID REFERENCES auth.users(id),
    page_url TEXT,
    referrer TEXT,
    device_type TEXT,
    browser TEXT,
    language TEXT,
    country TEXT,
    city TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Enable RLS for Analytics
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
-- Allow public to insert analytics (anon role)
CREATE POLICY "Allow public insert analytics" ON analytics_events FOR
INSERT WITH CHECK (true);
-- Allow admins to read analytics
CREATE POLICY "Allow admin read analytics" ON analytics_events FOR
SELECT USING (auth.jwt()->>'email' = 'mtosic0450@gmail.com');
-- 2. Enhanced Messages for Guest Portal (if multi-message flow is needed)
-- The existing messages table is for contact form. 
-- For a guest portal, we might need a separate table linked to bookings.
CREATE TABLE IF NOT EXISTS booking_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id),
    sender_type TEXT NOT NULL,
    -- 'guest', 'admin'
    content TEXT NOT NULL,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Enable RLS for Booking Messages
ALTER TABLE booking_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow guests/admins to read messages" ON booking_messages FOR
SELECT USING (
        auth.uid() IN (
            SELECT guest_id
            FROM bookings
            WHERE id = booking_id
        )
        OR auth.jwt()->>'email' = 'mtosic0450@gmail.com'
    );
CREATE POLICY "Allow guests/admins to insert messages" ON booking_messages FOR
INSERT WITH CHECK (
        auth.uid() IN (
            SELECT guest_id
            FROM bookings
            WHERE id = booking_id
        )
        OR auth.jwt()->>'email' = 'mtosic0450@gmail.com'
    );
-- 3. Admin Statistics View/Function
CREATE OR REPLACE FUNCTION get_admin_stats() RETURNS JSONB AS $$
DECLARE stats JSONB;
BEGIN
SELECT jsonb_build_object(
        'total_bookings',
        (
            SELECT COUNT(*)
            FROM bookings
        ),
        'pending_bookings',
        (
            SELECT COUNT(*)
            FROM bookings
            WHERE status = 'pending'
        ),
        'total_revenue',
        (
            SELECT COALESCE(SUM(total_price), 0)
            FROM bookings
            WHERE status = 'confirmed'
        ),
        'total_guests',
        (
            SELECT COUNT(*)
            FROM guests
        ),
        'avg_rating',
        (
            SELECT COALESCE(AVG(rating), 0)
            FROM reviews
        )
    ) INTO stats;
RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- 4. Enable Real-time for new tables
ALTER PUBLICATION supabase_realtime
ADD TABLE analytics_events;
ALTER PUBLICATION supabase_realtime
ADD TABLE booking_messages;