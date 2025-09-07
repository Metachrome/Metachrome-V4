-- Create options_settings table for trading durations
-- Run this in Supabase SQL Editor

-- 1. Create options_settings table
CREATE TABLE IF NOT EXISTS options_settings (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    duration TEXT NOT NULL,
    "minAmount" TEXT NOT NULL,
    "profitPercentage" TEXT NOT NULL,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- 2. Create index for options_settings
CREATE INDEX IF NOT EXISTS idx_options_settings_duration ON options_settings(duration);

-- 3. Insert default options settings
INSERT INTO options_settings (duration, "minAmount", "profitPercentage", "isActive") VALUES
('30', '100.00', '10.00', true),
('60', '1000.00', '15.00', true),
('120', '2000.00', '20.00', true),
('300', '5000.00', '25.00', true)
ON CONFLICT DO NOTHING;

-- Success message
SELECT 'Options settings table created successfully!' as message;
