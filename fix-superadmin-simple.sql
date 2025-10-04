-- Simple Fix for Superadmin Verification and Balance
-- Run this in Supabase SQL Editor

-- Step 1: Check current superadmin status
SELECT 
    id, 
    username, 
    email, 
    role, 
    verification_status, 
    balance
FROM users 
WHERE role = 'super_admin'
ORDER BY created_at DESC;

-- Step 2: Update all superadmin users to verified status
UPDATE users 
SET 
    verification_status = 'verified',
    updated_at = NOW()
WHERE role = 'super_admin';

-- Step 3: Set default balance for superadmin (if balance is 0 or NULL)
UPDATE users 
SET 
    balance = 1000000.00,
    updated_at = NOW()
WHERE role = 'super_admin' 
  AND (balance IS NULL OR balance = 0);

-- Step 4: Verify the changes
SELECT 
    id, 
    username, 
    email, 
    role, 
    verification_status, 
    balance,
    updated_at
FROM users 
WHERE role = 'super_admin'
ORDER BY created_at DESC;

