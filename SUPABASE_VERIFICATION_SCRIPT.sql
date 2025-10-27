-- SUPABASE VERIFICATION SCRIPT
-- Run this in Supabase SQL Editor to check if your users table is properly configured

-- Step 1: Check users table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Step 2: Check if verification columns exist
SELECT 
  column_name
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('verification_status', 'has_uploaded_documents', 'verified_at', 'password_hash', 'balance', 'role', 'status', 'trading_mode', 'first_name', 'last_name')
ORDER BY column_name;

-- Step 3: Check user_verification_documents table
SELECT 
  column_name, 
  data_type
FROM information_schema.columns 
WHERE table_name = 'user_verification_documents' 
ORDER BY ordinal_position;

-- Step 4: Count users in database
SELECT COUNT(*) as total_users FROM public.users;

-- Step 5: Check if any users exist
SELECT id, username, email, verification_status FROM public.users LIMIT 5;

-- Step 6: Check for any errors in recent inserts
-- (This helps identify if there are constraint violations)
SELECT * FROM public.users WHERE created_at > NOW() - INTERVAL '1 hour' ORDER BY created_at DESC LIMIT 10;

