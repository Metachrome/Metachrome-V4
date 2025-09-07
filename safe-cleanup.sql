-- SAFE PRODUCTION CLEANUP SCRIPT
-- This script safely removes demo data while respecting foreign key constraints

-- ========================================
-- STEP 1: IDENTIFY WHAT TO CLEAN
-- ========================================

-- Show current users before cleanup
SELECT 'CURRENT USERS BEFORE CLEANUP:' as info;
SELECT id, username, email, role, "isActive" FROM users ORDER BY "createdAt";

-- ========================================
-- STEP 2: SAFE DELETION (RESPECTS FOREIGN KEYS)
-- ========================================

-- Delete trades for demo users first
DELETE FROM trades WHERE "userId" IN (
  SELECT id FROM users WHERE 
    username LIKE '%demo%' 
    OR email LIKE '%demo%'
    OR username LIKE '%test%'
    OR email LIKE '%test%'
    OR username LIKE '%dummy%'
    OR email LIKE '%dummy%'
    OR username IN ('trader1', 'trader2', 'trader3')
);

-- Delete balances for demo users
DELETE FROM balances WHERE "userId" IN (
  SELECT id FROM users WHERE 
    username LIKE '%demo%' 
    OR email LIKE '%demo%'
    OR username LIKE '%test%'
    OR email LIKE '%test%'
    OR username LIKE '%dummy%'
    OR email LIKE '%dummy%'
    OR username IN ('trader1', 'trader2', 'trader3')
);

-- Delete admin controls for demo users
DELETE FROM admin_controls WHERE "userId" IN (
  SELECT id FROM users WHERE 
    username LIKE '%demo%' 
    OR email LIKE '%demo%'
    OR username LIKE '%test%'
    OR email LIKE '%test%'
    OR username LIKE '%dummy%'
    OR email LIKE '%dummy%'
    OR username IN ('trader1', 'trader2', 'trader3')
);

-- Now safely delete demo users (no foreign key violations)
DELETE FROM users WHERE 
  username LIKE '%demo%' 
  OR email LIKE '%demo%'
  OR username LIKE '%test%'
  OR email LIKE '%test%'
  OR username LIKE '%dummy%'
  OR email LIKE '%dummy%'
  OR username IN ('trader1', 'trader2', 'trader3');

-- ========================================
-- STEP 3: CLEAN UP ANY ORPHANED DATA
-- ========================================

-- Remove any orphaned balances
DELETE FROM balances WHERE "userId" NOT IN (SELECT id FROM users);

-- Remove any orphaned trades
DELETE FROM trades WHERE "userId" NOT IN (SELECT id FROM users);

-- Remove any orphaned admin controls
DELETE FROM admin_controls WHERE "userId" NOT IN (SELECT id FROM users);

-- ========================================
-- STEP 4: CREATE BALANCES FOR REAL USERS
-- ========================================

-- Create balances for any real users who don't have them
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
) currency
WHERE u.role = 'user' 
  AND u."isActive" = true
  AND NOT EXISTS (
    SELECT 1 FROM balances b 
    WHERE b."userId" = u.id AND b.symbol = currency.symbol
  );

-- ========================================
-- STEP 5: VERIFY RESULTS
-- ========================================

SELECT 'CLEANUP COMPLETED!' as result;

SELECT 'REMAINING USERS:' as info;
SELECT id, username, email, role, "isActive" FROM users ORDER BY "createdAt";

SELECT 'USER BALANCES:' as info;
SELECT 
    u.username,
    u.email,
    b.symbol,
    b.available,
    b.locked
FROM balances b
JOIN users u ON b."userId" = u.id
ORDER BY u.username, b.symbol;

SELECT 'SUMMARY:' as info;
SELECT 
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM balances) as total_balances,
    (SELECT COUNT(*) FROM trades) as total_trades,
    (SELECT COUNT(*) FROM admin_controls) as total_controls;
