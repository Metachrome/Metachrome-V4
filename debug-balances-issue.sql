-- Debug Balances Issue Script
-- This script will help identify and fix the "Unknown" user issue

-- 1. Check current users
SELECT 'Current Users:' as info;
SELECT id, username, email, role, "isActive" FROM users ORDER BY "createdAt";

-- 2. Check current balances with user join
SELECT 'Current Balances with User Data:' as info;
SELECT 
    b.id,
    b."userId",
    b.symbol,
    b.available,
    b.locked,
    u.username,
    u.email,
    u.role
FROM balances b 
LEFT JOIN users u ON b."userId" = u.id 
ORDER BY b."createdAt";

-- 3. Check for orphaned balances (balances without valid users)
SELECT 'Orphaned Balances (no matching user):' as info;
SELECT 
    b.id,
    b."userId",
    b.symbol,
    b.available
FROM balances b 
LEFT JOIN users u ON b."userId" = u.id 
WHERE u.id IS NULL;

-- 4. Check for users without balances
SELECT 'Users without balances:' as info;
SELECT 
    u.id,
    u.username,
    u.email
FROM users u 
LEFT JOIN balances b ON u.id = b."userId" 
WHERE b."userId" IS NULL AND u.role = 'user' AND u."isActive" = true;

-- 5. Fix: Delete orphaned balances
DELETE FROM balances 
WHERE "userId" NOT IN (SELECT id FROM users);

-- 6. Fix: Create balances for users who don't have any
INSERT INTO balances ("userId", symbol, available, locked, "createdAt", "updatedAt")
SELECT 
    u.id,
    currency.symbol,
    CASE 
        WHEN currency.symbol = 'USD' THEN 10000.00
        WHEN currency.symbol = 'USDT' THEN 5000.00
        WHEN currency.symbol = 'BTC' THEN 0.1
        WHEN currency.symbol = 'ETH' THEN 1.0
        WHEN currency.symbol = 'BNB' THEN 10.0
        WHEN currency.symbol = 'ADA' THEN 1000.0
        WHEN currency.symbol = 'DOT' THEN 100.0
        WHEN currency.symbol = 'LINK' THEN 50.0
        ELSE 0.0
    END as available,
    0.00 as locked,
    NOW() as "createdAt",
    NOW() as "updatedAt"
FROM users u
CROSS JOIN (
    SELECT 'USD' as symbol
    UNION ALL SELECT 'USDT'
    UNION ALL SELECT 'BTC'
    UNION ALL SELECT 'ETH'
    UNION ALL SELECT 'BNB'
    UNION ALL SELECT 'ADA'
    UNION ALL SELECT 'DOT'
    UNION ALL SELECT 'LINK'
) currency
WHERE u.role = 'user' 
  AND u."isActive" = true
  AND NOT EXISTS (
    SELECT 1 FROM balances b 
    WHERE b."userId" = u.id AND b.symbol = currency.symbol
  );

-- 7. Final verification
SELECT 'Final Verification - Balances with User Data:' as info;
SELECT 
    b.id,
    b."userId",
    b.symbol,
    b.available,
    b.locked,
    u.username,
    u.email
FROM balances b 
JOIN users u ON b."userId" = u.id 
ORDER BY u.username, b.symbol;

SELECT 'Summary:' as info;
SELECT 
    COUNT(DISTINCT b."userId") as users_with_balances,
    COUNT(*) as total_balance_records
FROM balances b
JOIN users u ON b."userId" = u.id;

SELECT 'Script completed - Unknown users should be fixed!' as result;
