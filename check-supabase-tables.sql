-- Diagnostic script to check your current Supabase table structure
-- Run this FIRST to see what tables and columns you currently have

-- 1. List all tables in your database
SELECT 
    'EXISTING TABLES:' as info,
    table_name
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Show detailed column information for each table
SELECT 
    'TABLE STRUCTURE DETAILS:' as info,
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
ORDER BY table_name, ordinal_position;

-- 3. Check specifically for users table columns
SELECT 
    'USERS TABLE COLUMNS:' as info,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Check for balances table columns
SELECT 
    'BALANCES TABLE COLUMNS:' as info,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'balances' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Check for trades table columns
SELECT 
    'TRADES TABLE COLUMNS:' as info,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'trades' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. Check for transactions table columns
SELECT 
    'TRANSACTIONS TABLE COLUMNS:' as info,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'transactions' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 7. Show foreign key relationships
SELECT 
    'FOREIGN KEY RELATIONSHIPS:' as info,
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public';

-- 8. Check if specific problematic columns exist
SELECT 
    'COLUMN EXISTENCE CHECK:' as info,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'password_hash' AND table_schema = 'public') 
        THEN 'users.password_hash EXISTS' 
        ELSE 'users.password_hash MISSING' 
    END as password_hash_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'password' AND table_schema = 'public') 
        THEN 'users.password EXISTS' 
        ELSE 'users.password MISSING' 
    END as password_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'balances' AND column_name = 'user_id' AND table_schema = 'public') 
        THEN 'balances.user_id EXISTS' 
        ELSE 'balances.user_id MISSING' 
    END as balances_user_id_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'balances' AND column_name = 'userId' AND table_schema = 'public') 
        THEN 'balances.userId EXISTS' 
        ELSE 'balances.userId MISSING' 
    END as balances_userId_status;

-- 9. Show current data in users table (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
        RAISE NOTICE 'Users table exists, checking data...';
    ELSE
        RAISE NOTICE 'Users table does not exist';
    END IF;
END $$;

-- This will show you exactly what your current database structure looks like
-- Run this first, then use the appropriate fix script based on the results
