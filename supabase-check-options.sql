-- Check if options_settings table exists and its structure
-- Run this in Supabase SQL Editor

-- 1. Check if options_settings table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'options_settings';

-- 2. Check structure of options_settings table (if it exists)
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'options_settings' 
ORDER BY ordinal_position;

-- 3. List all tables again to see current state
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
