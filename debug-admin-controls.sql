-- Debug admin controls and user lookup
-- Run this in Supabase SQL Editor to see what's happening

-- 1. Check what users exist
SELECT 'USERS TABLE:' as section;
SELECT id, username, email, role, "isActive", "createdAt" 
FROM users 
ORDER BY "createdAt" DESC;

-- 2. Check what admin controls exist
SELECT 'ADMIN CONTROLS TABLE:' as section;
SELECT id, "userId", "adminId", "controlType", "isActive", notes, "createdAt"
FROM admin_controls 
ORDER BY "createdAt" DESC;

-- 3. Check the foreign key relationship
SELECT 'FOREIGN KEY TEST:' as section;
SELECT 
    ac.id as control_id,
    ac."userId",
    ac."controlType",
    ac."isActive",
    u.id as user_id,
    u.username,
    u.email,
    u.role,
    admin_user.username as admin_username
FROM admin_controls ac
LEFT JOIN users u ON ac."userId" = u.id
LEFT JOIN users admin_user ON ac."adminId" = admin_user.id
ORDER BY ac."createdAt" DESC;

-- 4. Check if there are any orphaned controls (controls without matching users)
SELECT 'ORPHANED CONTROLS:' as section;
SELECT ac.*, 'NO MATCHING USER' as issue
FROM admin_controls ac
LEFT JOIN users u ON ac."userId" = u.id
WHERE u.id IS NULL;

-- 5. Show the exact query that the API should be using
SELECT 'API QUERY RESULT:' as section;
SELECT 
    ac.*,
    json_build_object(
        'id', u.id,
        'username', u.username,
        'email', u.email
    ) as users
FROM admin_controls ac
LEFT JOIN users u ON ac."userId" = u.id
WHERE ac."isActive" = true
ORDER BY ac."createdAt" DESC;
