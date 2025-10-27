-- CRITICAL FIX: Remove password column from users table
-- Supabase Auth manages passwords separately, not in the users table
-- This column was causing PGRST204 errors during user creation

ALTER TABLE users DROP COLUMN IF EXISTS password;

-- Verify the column is gone
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

