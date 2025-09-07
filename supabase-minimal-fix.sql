-- Check structure of all existing tables
-- Run this in Supabase SQL Editor

-- 1. Check structure of existing admin_controls table
SELECT 'admin_controls' as table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'admin_controls'
ORDER BY ordinal_position;

-- 2. Check structure of existing balances table
SELECT 'balances' as table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'balances'
ORDER BY ordinal_position;

-- 3. Check structure of existing options_settings table
SELECT 'options_settings' as table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'options_settings'
ORDER BY ordinal_position;

-- 4. Check structure of existing users table
SELECT 'users' as table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
