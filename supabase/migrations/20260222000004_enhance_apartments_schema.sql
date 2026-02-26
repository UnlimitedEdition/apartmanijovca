-- Enhance apartments table with detailed fields for professional presentation

-- Add new columns for detailed apartment information
ALTER TABLE apartments ADD COLUMN IF NOT EXISTS size_sqm INTEGER;
ALTER TABLE apartments ADD COLUMN IF NOT EXISTS floor INTEGER;
ALTER TABLE apartments ADD COLUMN IF NOT EXISTS view_type JSONB; -- {sr: "Pogled na more", en: "Sea view", ...}
ALTER TABLE apartments ADD COLUMN IF NOT EXISTS bathroom_count INTEGER DEFAULT 1;
ALTER TABLE apartments ADD COLUMN IF NOT EXISTS balcony BOOLEAN DEFAULT false;
ALTER TABLE apartments ADD COLUMN IF NOT EXISTS kitchen_type JSONB; -- {sr: "Potpuno opremljena", en: "Fully equipped", ...}
ALTER TABLE apartments ADD COLUMN IF NOT EXISTS features JSONB; -- Array of {sr: "WiFi", en: "WiFi", ...}
ALTER TABLE apartments ADD COLUMN IF NOT EXISTS house_rules JSONB; -- {sr: "...", en: "...", ...}
ALTER TABLE apartments ADD COLUMN IF NOT EXISTS check_in_time TEXT DEFAULT '14:00';
ALTER TABLE apartments ADD COLUMN IF NOT EXISTS check_out_time TEXT DEFAULT '10:00';
ALTER TABLE apartments ADD COLUMN IF NOT EXISTS min_stay_nights INTEGER DEFAULT 1;
ALTER TABLE apartments ADD COLUMN IF NOT EXISTS max_stay_nights INTEGER;
ALTER TABLE apartments ADD COLUMN IF NOT EXISTS cancellation_policy JSONB; -- {sr: "...", en: "...", ...}
ALTER TABLE apartments ADD COLUMN IF NOT EXISTS gallery JSONB; -- Array of {url, caption: {sr, en, de, it}, order}
ALTER TABLE apartments ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE apartments ADD COLUMN IF NOT EXISTS virtual_tour_url TEXT;

-- Add SEO fields
ALTER TABLE apartments ADD COLUMN IF NOT EXISTS meta_title JSONB; -- {sr: "...", en: "...", ...}
ALTER TABLE apartments ADD COLUMN IF NOT EXISTS meta_description JSONB; -- {sr: "...", en: "...", ...}
ALTER TABLE apartments ADD COLUMN IF NOT EXISTS meta_keywords JSONB; -- {sr: "...", en: "...", ...}

-- Add pricing variations
ALTER TABLE apartments ADD COLUMN IF NOT EXISTS seasonal_pricing JSONB; -- Array of {season, price, start_date, end_date}
ALTER TABLE apartments ADD COLUMN IF NOT EXISTS weekend_price_eur NUMERIC(10,2);
ALTER TABLE apartments ADD COLUMN IF NOT EXISTS weekly_discount_percent INTEGER DEFAULT 0;
ALTER TABLE apartments ADD COLUMN IF NOT EXISTS monthly_discount_percent INTEGER DEFAULT 0;

-- Comments
COMMENT ON COLUMN apartments.size_sqm IS 'Apartment size in square meters';
COMMENT ON COLUMN apartments.floor IS 'Floor number (0 = ground floor)';
COMMENT ON COLUMN apartments.view_type IS 'Type of view (sea, mountain, city, garden) - multilingual';
COMMENT ON COLUMN apartments.bathroom_count IS 'Number of bathrooms';
COMMENT ON COLUMN apartments.balcony IS 'Has balcony/terrace';
COMMENT ON COLUMN apartments.kitchen_type IS 'Kitchen type description - multilingual';
COMMENT ON COLUMN apartments.features IS 'Array of features/amenities - multilingual';
COMMENT ON COLUMN apartments.house_rules IS 'House rules text - multilingual';
COMMENT ON COLUMN apartments.check_in_time IS 'Check-in time (HH:MM format)';
COMMENT ON COLUMN apartments.check_out_time IS 'Check-out time (HH:MM format)';
COMMENT ON COLUMN apartments.min_stay_nights IS 'Minimum stay requirement in nights';
COMMENT ON COLUMN apartments.max_stay_nights IS 'Maximum stay allowed in nights';
COMMENT ON COLUMN apartments.cancellation_policy IS 'Cancellation policy text - multilingual';
COMMENT ON COLUMN apartments.gallery IS 'Photo gallery with captions and order';
COMMENT ON COLUMN apartments.video_url IS 'YouTube or Vimeo video URL';
COMMENT ON COLUMN apartments.virtual_tour_url IS 'Virtual tour URL (360° view)';
COMMENT ON COLUMN apartments.meta_title IS 'SEO meta title - multilingual';
COMMENT ON COLUMN apartments.meta_description IS 'SEO meta description - multilingual';
COMMENT ON COLUMN apartments.meta_keywords IS 'SEO keywords - multilingual';
COMMENT ON COLUMN apartments.seasonal_pricing IS 'Seasonal pricing variations';
COMMENT ON COLUMN apartments.weekend_price_eur IS 'Weekend price (Friday-Sunday)';
COMMENT ON COLUMN apartments.weekly_discount_percent IS 'Discount for 7+ nights stay';
COMMENT ON COLUMN apartments.monthly_discount_percent IS 'Discount for 30+ nights stay';

-- Set default values for existing apartments
UPDATE apartments SET 
  size_sqm = 45,
  floor = 1,
  bathroom_count = 1,
  balcony = true,
  check_in_time = '14:00',
  check_out_time = '10:00',
  min_stay_nights = 1,
  weekly_discount_percent = 10,
  monthly_discount_percent = 20
WHERE size_sqm IS NULL;
