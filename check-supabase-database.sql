-- Check Supabase Database Setup
-- Run this in Supabase SQL Editor to verify your database

-- 1. Check if tables exist
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Check users table structure and data
SELECT 'USERS TABLE' as check_type;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

SELECT COUNT(*) as user_count FROM users;
SELECT id, username, email, role, status, balance FROM users LIMIT 5;

-- 3. Check trades table
SELECT 'TRADES TABLE' as check_type;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'trades' 
ORDER BY ordinal_position;

SELECT COUNT(*) as trade_count FROM trades;

-- 4. Check transactions table
SELECT 'TRANSACTIONS TABLE' as check_type;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'transactions' 
ORDER BY ordinal_position;

SELECT COUNT(*) as transaction_count FROM transactions;

-- 5. Check options_settings table
SELECT 'OPTIONS_SETTINGS TABLE' as check_type;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'options_settings' 
ORDER BY ordinal_position;

SELECT COUNT(*) as options_settings_count FROM options_settings;
SELECT * FROM options_settings;

-- 6. Check balances table
SELECT 'BALANCES TABLE' as check_type;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'balances' 
ORDER BY ordinal_position;

SELECT COUNT(*) as balance_count FROM balances;
