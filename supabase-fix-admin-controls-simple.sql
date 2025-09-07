-- Fix admin_controls table structure (Simple Version)
-- Run this in Supabase SQL Editor

-- 1. Drop and recreate admin_controls table with correct structure
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

-- 2. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_controls_userId ON admin_controls("userId");
CREATE INDEX IF NOT EXISTS idx_admin_controls_adminId ON admin_controls("adminId");
CREATE INDEX IF NOT EXISTS idx_admin_controls_isActive ON admin_controls("isActive");

-- 3. Show existing users in your database
SELECT id, username, email, role FROM users ORDER BY "createdAt" DESC;

-- 4. Create admin control for the first regular user found
INSERT INTO admin_controls ("userId", "adminId", "controlType", "isActive", notes) 
SELECT 
    u.id as userId,
    admin.id as adminId,
    'win' as controlType,
    true as isActive,
    'Test control - user should always win' as notes
FROM users u
CROSS JOIN (SELECT id FROM users WHERE role IN ('admin', 'super_admin') LIMIT 1) admin
WHERE u.role = 'user'
LIMIT 1;

-- 5. Verify the data with user information
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
SELECT 'Admin controls table fixed! Control created for existing user.' as message;
