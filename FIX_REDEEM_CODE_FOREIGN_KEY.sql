-- =====================================================
-- FIX REDEEM CODE FOREIGN KEY CONSTRAINT
-- =====================================================
-- This script fixes the foreign key constraint in user_redeem_history
-- to allow deletion and updates of redeem codes
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Step 1: Drop the existing foreign key constraint
ALTER TABLE public.user_redeem_history
DROP CONSTRAINT IF EXISTS user_redeem_history_redeem_code_id_fkey;

-- Step 2: Re-add the foreign key constraint with ON DELETE SET NULL
-- This allows redeem codes to be deleted without violating the constraint
ALTER TABLE public.user_redeem_history
ADD CONSTRAINT user_redeem_history_redeem_code_id_fkey
FOREIGN KEY (redeem_code_id) 
REFERENCES public.redeem_codes(id) 
ON DELETE SET NULL
ON UPDATE CASCADE;

-- Step 3: Verify the constraint was added correctly
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule,
    rc.update_rule
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
    AND tc.table_name = 'user_redeem_history'
    AND kcu.column_name = 'redeem_code_id';

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================
-- After running this script:
-- 1. Redeem codes can be deleted without foreign key errors
-- 2. When a redeem code is deleted, the redeem_code_id in 
--    user_redeem_history will be set to NULL (preserving history)
-- 3. The code column in user_redeem_history still contains 
--    the original code text for historical reference
-- =====================================================

