-- Migration: Add checkbox/counter fields for apartment options
-- Date: 2026-02-22
-- Description: Adds fields for predefined bed counts, amenities, rules, and view selection

-- Add bed_counts column (JSONB) - stores bed counts like {"double_bed": 1, "single_bed": 2}
ALTER TABLE apartments
ADD COLUMN IF NOT EXISTS bed_counts JSONB DEFAULT '{}'::jsonb;

-- Add selected_amenities column (TEXT[]) - stores amenity IDs
ALTER TABLE apartments
ADD COLUMN IF NOT EXISTS selected_amenities TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add selected_rules column (TEXT[]) - stores rule IDs
ALTER TABLE apartments
ADD COLUMN IF NOT EXISTS selected_rules TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add selected_view column (TEXT) - stores single view ID
ALTER TABLE apartments
ADD COLUMN IF NOT EXISTS selected_view TEXT;

-- Add comments for documentation
COMMENT ON COLUMN apartments.bed_counts IS 'JSONB object storing bed type counts, e.g., {"double_bed": 1, "single_bed": 2}';
COMMENT ON COLUMN apartments.selected_amenities IS 'Array of amenity IDs from predefined options (wifi, ac, parking, etc.)';
COMMENT ON COLUMN apartments.selected_rules IS 'Array of house rule IDs from predefined options (no_smoking, no_pets, etc.)';
COMMENT ON COLUMN apartments.selected_view IS 'Single view type ID from predefined options (lake_view, sea_view, mountain_view, etc.)';

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_apartments_selected_amenities ON apartments USING GIN (selected_amenities);
CREATE INDEX IF NOT EXISTS idx_apartments_selected_rules ON apartments USING GIN (selected_rules);
CREATE INDEX IF NOT EXISTS idx_apartments_selected_view ON apartments (selected_view);
CREATE INDEX IF NOT EXISTS idx_apartments_bed_counts ON apartments USING GIN (bed_counts);
