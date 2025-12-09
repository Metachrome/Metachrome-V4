-- =====================================================
-- ADD PASSWORD_PLAIN COLUMN FOR SUPERADMIN VIEWING
-- =====================================================
-- This adds a column to store plain text passwords
-- so superadmin can view user passwords in the dashboard
-- =====================================================

-- Add password_plain column to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS password_plain TEXT;

-- Add comment to explain the column
COMMENT ON COLUMN public.users.password_plain IS 'Plain text password for superadmin viewing. Updated when user registers or changes password.';

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'password_plain';

-- =====================================================
-- IMPORTANT NOTES:
-- =====================================================
-- 1. This column stores PLAIN TEXT passwords
-- 2. Only superadmin should be able to see this
-- 3. The password_hash column is still used for authentication
-- 4. New users and password changes will populate this column
-- 5. Existing users will show "(Password not set)" until they change password
-- =====================================================

