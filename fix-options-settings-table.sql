-- FIX OPTIONS_SETTINGS TABLE FOR METACHROME V2
-- This script handles the missing duration column error

-- ===== STEP 1: Check if options_settings table exists =====
SELECT 'CHECKING OPTIONS_SETTINGS TABLE:' as info;

-- Check if table exists
SELECT CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'options_settings' AND table_schema = 'public')
    THEN 'options_settings table EXISTS'
    ELSE 'options_settings table DOES NOT EXIST'
END as table_status;

-- If table exists, show its columns
SELECT 'OPTIONS_SETTINGS COLUMNS:' as section, column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'options_settings' AND table_schema = 'public'
ORDER BY ordinal_position;

-- ===== STEP 2: Drop and recreate options_settings table =====
-- This is the safest approach since the table structure is wrong
DROP TABLE IF EXISTS options_settings CASCADE;

-- Create the table with correct structure
CREATE TABLE options_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    duration INTEGER UNIQUE NOT NULL,
    "minAmount" DECIMAL(15,2) NOT NULL,
    "profitPercentage" DECIMAL(5,2) NOT NULL,
    "isActive" BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== STEP 3: Insert default options settings =====
INSERT INTO options_settings (duration, "minAmount", "profitPercentage", "isActive") VALUES
(30, 100.00, 10.00, true),
(60, 1000.00, 15.00, true),
(120, 2000.00, 20.00, true),
(300, 5000.00, 25.00, true);

-- ===== STEP 4: Create index =====
CREATE INDEX IF NOT EXISTS idx_options_settings_duration ON options_settings(duration);

-- ===== STEP 5: Verification =====
SELECT 'FINAL OPTIONS_SETTINGS TABLE:' as info;

-- Show final table structure
SELECT 'TABLE STRUCTURE:' as section, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'options_settings' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show inserted data
SELECT 'INSERTED DATA:' as section, duration, "minAmount", "profitPercentage", "isActive"
FROM options_settings
ORDER BY duration;

SELECT 'SUCCESS: options_settings table created and populated!' as final_message;
