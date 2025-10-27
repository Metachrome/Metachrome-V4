-- SIMPLE COLUMN CHECK
-- Run this to see EXACTLY what columns exist in your users table

-- Step 1: List ALL columns in users table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

