-- Fix Balances Production Script
-- This script will create proper user balances with real usernames

-- 1. First, let's see what users we have
SELECT 'Current Users:' as info;
SELECT id, username, email, role, "isActive" FROM users ORDER BY "createdAt";

-- 2. Check current balances
SELECT 'Current Balances:' as info;
SELECT b.*, u.username 
FROM balances b 
LEFT JOIN users u ON b."userId" = u.id 
ORDER BY b."createdAt";

-- 3. Delete any existing balances to start fresh
DELETE FROM balances;

-- 4. Create comprehensive balances for all users
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
WHERE u.role = 'user' AND u."isActive" = true;

-- 5. Verify the results
SELECT 'New Balances Created:' as info;
SELECT 
    u.username,
    u.email,
    b.symbol,
    b.available,
    b.locked
FROM balances b
JOIN users u ON b."userId" = u.id
ORDER BY u.username, b.symbol;

-- 6. Count summary
SELECT 
    'Summary:' as info,
    COUNT(DISTINCT b."userId") as total_users_with_balances,
    COUNT(*) as total_balance_records
FROM balances b
JOIN users u ON b."userId" = u.id;

SELECT 'Script completed successfully!' as result;
