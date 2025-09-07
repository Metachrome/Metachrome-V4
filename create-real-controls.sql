-- Create real admin controls with actual user data
-- Run this in Supabase SQL Editor

-- 1. Create admin control for testuser
INSERT INTO admin_controls ("userId", "adminId", "controlType", "isActive", notes, "createdAt", "updatedAt")
VALUES (
    '498ce649-bfc8-46a8-9479-8fb329c39d35', -- testuser
    'de32bb18-5c7e-4091-9e9a-12e6aa3c253f', -- admin
    'win',
    true,
    'Test control for testuser - always win',
    NOW(),
    NOW()
);

-- 2. Create admin control for user1
INSERT INTO admin_controls ("userId", "adminId", "controlType", "isActive", notes, "createdAt", "updatedAt")
VALUES (
    '05bed8ef-94f0-40d9-ad00-0c47d6d719c6', -- user1
    'de32bb18-5c7e-4091-9e9a-12e6aa3c253f', -- admin
    'normal',
    true,
    'Test control for user1 - normal trading',
    NOW(),
    NOW()
);

-- 3. Verify the controls were created with proper user lookup
SELECT 
    ac.id,
    ac."controlType",
    ac."isActive",
    ac.notes,
    u.username as user_name,
    u.email as user_email,
    admin_user.username as admin_name
FROM admin_controls ac
LEFT JOIN users u ON ac."userId" = u.id
LEFT JOIN users admin_user ON ac."adminId" = admin_user.id
ORDER BY ac."createdAt" DESC;

-- Success message
SELECT 'Real admin controls created successfully! Users should now show proper names.' as message;
