-- 1. Create content table
CREATE TABLE IF NOT EXISTS public.content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section TEXT NOT NULL,
    -- 'home', 'about', 'prices', etc.
    lang TEXT NOT NULL,
    -- 'en', 'sr', 'de', 'it'
    data JSONB NOT NULL DEFAULT '{}',
    published BOOLEAN DEFAULT false,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(section, lang)
);
-- 2. Create apartments table (if not exists)
CREATE TABLE IF NOT EXISTS public.apartments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT DEFAULT 'standard',
    capacity INTEGER DEFAULT 2,
    price_per_night DECIMAL(10, 2) DEFAULT 0,
    images TEXT [] DEFAULT '{}',
    description TEXT,
    amenities TEXT [] DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- 3. Create bookings table (if not exists)
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    apartment_id UUID REFERENCES apartments(id),
    guest_id UUID,
    -- Optional, can be null for direct bookings
    guest_name TEXT NOT NULL,
    guest_email TEXT NOT NULL,
    guest_phone TEXT,
    checkin DATE NOT NULL,
    checkout DATE NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status TEXT DEFAULT 'pending',
    -- 'pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- 4. Enable RLS
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.apartments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
-- 5. Policies (Admin only for MTOSIC)
CREATE POLICY "Admin full access content" ON public.content USING (auth.jwt()->>'email' = 'mtosic0450@gmail.com');
CREATE POLICY "Admin full access apartments" ON public.apartments USING (auth.jwt()->>'email' = 'mtosic0450@gmail.com');
CREATE POLICY "Admin full access bookings" ON public.bookings USING (auth.jwt()->>'email' = 'mtosic0450@gmail.com');
-- Allow public to read published content
CREATE POLICY "Public read published content" ON public.content FOR
SELECT USING (true);
-- Allow public to read apartments
CREATE POLICY "Public read apartments" ON public.apartments FOR
SELECT USING (true);