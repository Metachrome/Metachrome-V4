-- =====================================================
-- FIX USER FOREIGN KEY CONSTRAINTS WITH CASCADE DELETE
-- =====================================================
-- This script updates all foreign key constraints that reference
-- the users table to use ON DELETE CASCADE
-- This allows user deletion to automatically delete all related records
-- Run this in your Supabase SQL Editor
-- =====================================================

-- IMPORTANT: This will modify your database schema
-- Make sure you have a backup before running this!

-- Step 1: Fix balances table
DO $$ 
BEGIN
    -- Drop existing constraint if it exists
    ALTER TABLE IF EXISTS public.balances
    DROP CONSTRAINT IF EXISTS balances_user_id_fkey;
    
    -- Add new constraint with CASCADE
    ALTER TABLE IF EXISTS public.balances
    ADD CONSTRAINT balances_user_id_fkey
    FOREIGN KEY (user_id) 
    REFERENCES public.users(id) 
    ON DELETE CASCADE;
    
    RAISE NOTICE 'Fixed balances foreign key';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Balances table: %', SQLERRM;
END $$;

-- Step 2: Fix trades table
DO $$ 
BEGIN
    ALTER TABLE IF EXISTS public.trades
    DROP CONSTRAINT IF EXISTS trades_user_id_fkey;
    
    ALTER TABLE IF EXISTS public.trades
    ADD CONSTRAINT trades_user_id_fkey
    FOREIGN KEY (user_id) 
    REFERENCES public.users(id) 
    ON DELETE CASCADE;
    
    RAISE NOTICE 'Fixed trades foreign key';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Trades table: %', SQLERRM;
END $$;

-- Step 3: Fix transactions table
DO $$ 
BEGIN
    ALTER TABLE IF EXISTS public.transactions
    DROP CONSTRAINT IF EXISTS transactions_user_id_fkey;
    
    ALTER TABLE IF EXISTS public.transactions
    ADD CONSTRAINT transactions_user_id_fkey
    FOREIGN KEY (user_id) 
    REFERENCES public.users(id) 
    ON DELETE CASCADE;
    
    RAISE NOTICE 'Fixed transactions foreign key';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Transactions table: %', SQLERRM;
END $$;

-- Step 4: Fix admin_controls table (user_id)
DO $$ 
BEGIN
    ALTER TABLE IF EXISTS public.admin_controls
    DROP CONSTRAINT IF EXISTS admin_controls_user_id_fkey;
    
    ALTER TABLE IF EXISTS public.admin_controls
    ADD CONSTRAINT admin_controls_user_id_fkey
    FOREIGN KEY (user_id) 
    REFERENCES public.users(id) 
    ON DELETE CASCADE;
    
    RAISE NOTICE 'Fixed admin_controls user_id foreign key';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Admin_controls user_id: %', SQLERRM;
END $$;

-- Step 5: Fix admin_controls table (admin_id) - SET NULL instead of CASCADE
DO $$ 
BEGIN
    ALTER TABLE IF EXISTS public.admin_controls
    DROP CONSTRAINT IF EXISTS admin_controls_admin_id_fkey;
    
    ALTER TABLE IF EXISTS public.admin_controls
    ADD CONSTRAINT admin_controls_admin_id_fkey
    FOREIGN KEY (admin_id) 
    REFERENCES public.users(id) 
    ON DELETE SET NULL;
    
    RAISE NOTICE 'Fixed admin_controls admin_id foreign key';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Admin_controls admin_id: %', SQLERRM;
END $$;

-- Step 6: Fix chat_conversations table
DO $$ 
BEGIN
    ALTER TABLE IF EXISTS public.chat_conversations
    DROP CONSTRAINT IF EXISTS chat_conversations_user_id_fkey;
    
    ALTER TABLE IF EXISTS public.chat_conversations
    ADD CONSTRAINT chat_conversations_user_id_fkey
    FOREIGN KEY (user_id) 
    REFERENCES public.users(id) 
    ON DELETE CASCADE;
    
    RAISE NOTICE 'Fixed chat_conversations foreign key';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Chat_conversations table: %', SQLERRM;
END $$;

-- Step 7: Fix user_verification_documents table
DO $$ 
BEGIN
    ALTER TABLE IF EXISTS public.user_verification_documents
    DROP CONSTRAINT IF EXISTS user_verification_documents_user_id_fkey;
    
    ALTER TABLE IF EXISTS public.user_verification_documents
    ADD CONSTRAINT user_verification_documents_user_id_fkey
    FOREIGN KEY (user_id) 
    REFERENCES public.users(id) 
    ON DELETE CASCADE;
    
    RAISE NOTICE 'Fixed user_verification_documents foreign key';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'User_verification_documents table: %', SQLERRM;
END $$;

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================
-- Check all foreign keys to users table
SELECT
    tc.table_name,
    kcu.column_name,
    rc.delete_rule,
    tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
    ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND ccu.table_name = 'users'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name;

