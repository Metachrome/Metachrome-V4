-- Fix Superadmin Verification and Balance Issues
-- Run this in Supabase SQL Editor

-- 1. Check current superadmin users
SELECT 
    id, 
    username, 
    email, 
    role, 
    verification_status, 
    balance,
    created_at
FROM users 
WHERE role = 'super_admin'
ORDER BY created_at DESC;

-- 2. Update all superadmin users to have verified status
UPDATE users 
SET 
    verification_status = 'verified',
    updated_at = NOW()
WHERE role = 'super_admin' 
  AND (verification_status IS NULL OR verification_status != 'verified');

-- 3. Check if superadmin has balance (should not be 0)
-- If balance is 0, set default balance for superadmin
UPDATE users 
SET 
    balance = 1000000.00,
    updated_at = NOW()
WHERE role = 'super_admin' 
  AND (balance IS NULL OR balance = 0);

-- 4. Verify the changes
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

-- 5. Optional: Create verification document record for superadmin (if table exists)
-- This ensures consistency in the system
-- First, check if user_verification_documents table exists
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'user_verification_documents'
    ) THEN
        -- Insert verification documents for superadmins who don't have one yet
        INSERT INTO user_verification_documents (
            user_id,
            document_type,
            document_url,
            verification_status,
            admin_notes,
            created_at,
            verified_at
        )
        SELECT
            u.id,
            'admin_verified',
            '/system/superadmin-verified.jpg',
            'approved',
            'Superadmin - automatically verified',
            NOW(),
            NOW()
        FROM users u
        WHERE u.role = 'super_admin'
          AND NOT EXISTS (
            SELECT 1 FROM user_verification_documents uvd
            WHERE uvd.user_id = u.id
          );

        RAISE NOTICE 'Verification documents created for superadmins';
    ELSE
        RAISE NOTICE 'Table user_verification_documents does not exist, skipping...';
    END IF;
END $$;

-- 6. Summary report
SELECT 
    'Total Superadmins' as metric,
    COUNT(*) as count
FROM users 
WHERE role = 'super_admin'
UNION ALL
SELECT 
    'Verified Superadmins' as metric,
    COUNT(*) as count
FROM users 
WHERE role = 'super_admin' AND verification_status = 'verified'
UNION ALL
SELECT 
    'Superadmins with Balance > 0' as metric,
    COUNT(*) as count
FROM users 
WHERE role = 'super_admin' AND balance > 0;

