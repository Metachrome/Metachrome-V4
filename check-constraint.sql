-- Run this in Supabase SQL Editor to check if the unique constraint exists

-- Check if user_redeem_history table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'user_redeem_history'
);

-- Check constraints on user_redeem_history table
SELECT
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
WHERE tc.table_schema = 'public'
    AND tc.table_name = 'user_redeem_history'
ORDER BY tc.constraint_type, kcu.column_name;

-- Check if the specific unique constraint exists
SELECT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_schema = 'public'
    AND table_name = 'user_redeem_history'
    AND constraint_type = 'UNIQUE'
    AND constraint_name LIKE '%user%code%'
);

