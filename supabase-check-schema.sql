-- Check existing schema in Supabase
-- Run this first to see what tables and columns exist

-- 1. Check if users table exists and its structure
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- 2. List all tables in the public schema
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 3. Check if any admin-related tables already exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%admin%' 
OR table_name LIKE '%control%'
OR table_name LIKE '%trade%'
OR table_name LIKE '%balance%'
ORDER BY table_name;
