-- Fix admin_controls table structure
-- Run this in Supabase SQL Editor

-- 1. Check current structure of admin_controls table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'admin_controls' 
ORDER BY ordinal_position;

-- 2. Drop and recreate admin_controls table with correct structure
DROP TABLE IF EXISTS admin_controls;

CREATE TABLE admin_controls (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "adminId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "controlType" TEXT NOT NULL CHECK ("controlType" IN ('normal', 'win', 'lose')),
    "isActive" BOOLEAN DEFAULT true,
    notes TEXT,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_controls_userId ON admin_controls("userId");
CREATE INDEX IF NOT EXISTS idx_admin_controls_adminId ON admin_controls("adminId");
CREATE INDEX IF NOT EXISTS idx_admin_controls_isActive ON admin_controls("isActive");

-- 4. Check what users exist in the database
SELECT id, username, email, role FROM users ORDER BY "createdAt" DESC LIMIT 10;

-- 5. Insert test data using actual user IDs (replace with real IDs from above query)
-- First, let's create a test user if none exist
INSERT INTO users (id, username, email, role, "isActive", "createdAt", "updatedAt")
VALUES ('test-user-123', 'testuser', 'test@example.com', 'user', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Now create admin control for this test user
INSERT INTO admin_controls ("userId", "adminId", "controlType", "isActive", notes)
SELECT
    'test-user-123',
    (SELECT id FROM users WHERE role IN ('admin', 'super_admin') LIMIT 1),
    'win',
    true,
    'Test control - user should always win'
WHERE EXISTS (SELECT 1 FROM users WHERE id = 'test-user-123');

-- 6. Verify the table structure
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'admin_controls'
ORDER BY ordinal_position;

-- 7. Verify the data with user information
SELECT
    ac.*,
    u.username,
    u.email,
    u.role as user_role,
    admin_user.username as admin_username
FROM admin_controls ac
LEFT JOIN users u ON ac."userId" = u.id
LEFT JOIN users admin_user ON ac."adminId" = admin_user.id
ORDER BY ac."createdAt" DESC;

-- Success message
SELECT 'Admin controls table fixed successfully! Check the data above to see user details.' as message;
