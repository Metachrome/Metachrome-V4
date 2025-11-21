-- =====================================================
-- CHECK USER FOREIGN KEY CONSTRAINTS
-- =====================================================
-- This script checks all tables that have foreign keys
-- referencing the users table
-- Run this in your Supabase SQL Editor to see what's blocking user deletion
-- =====================================================

-- Query 1: Find all foreign key constraints referencing users table
SELECT
    tc.table_schema,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule,
    rc.update_rule,
    tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
    ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND ccu.table_name = 'users'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- =====================================================
-- Query 2: Check if specific tables exist
-- =====================================================
SELECT 
    table_name,
    CASE 
        WHEN table_name IN (
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        ) THEN 'EXISTS'
        ELSE 'MISSING'
    END as status
FROM (
    VALUES 
        ('users'),
        ('balances'),
        ('trades'),
        ('transactions'),
        ('admin_controls'),
        ('messages'),
        ('chat_conversations'),
        ('chat_messages'),
        ('contact_requests'),
        ('user_verification_documents'),
        ('user_redeem_history'),
        ('deposit_requests'),
        ('withdrawal_requests'),
        ('trading_controls')
) AS t(table_name)
ORDER BY status DESC, table_name;

-- =====================================================
-- INSTRUCTIONS:
-- =====================================================
-- 1. Run this script in Supabase SQL Editor
-- 2. Look at Query 1 results - these show all tables with foreign keys to users
-- 3. Look at Query 2 results - these show which tables exist vs missing
-- 4. Share the results so we can fix the deleteUser function properly
-- =====================================================

