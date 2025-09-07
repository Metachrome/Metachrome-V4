-- Simple debug - run each query separately
-- Copy and paste each query one by one in Supabase SQL Editor

-- Query 1: Check users
SELECT id, username, email, role FROM users ORDER BY "createdAt" DESC LIMIT 5;

-- Query 2: Check admin controls  
SELECT id, "userId", "adminId", "controlType", "isActive" FROM admin_controls ORDER BY "createdAt" DESC LIMIT 5;

-- Query 3: Test the join
SELECT 
    ac.id,
    ac."userId", 
    u.username,
    u.email
FROM admin_controls ac
LEFT JOIN users u ON ac."userId" = u.id
LIMIT 5;
