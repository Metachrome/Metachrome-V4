-- PRODUCTION CLEANUP & FIX SCRIPT
-- This script will:
-- 1. Remove ALL dummy/demo data
-- 2. Fix the "Unknown" user issue
-- 3. Create clean production-ready system
-- 4. Fix foreign key relationships

-- ========================================
-- STEP 1: REMOVE ALL DUMMY/DEMO DATA
-- ========================================

-- First, identify demo users to delete
CREATE TEMP TABLE demo_users_to_delete AS
SELECT id FROM users WHERE
  username LIKE '%demo%'
  OR email LIKE '%demo%'
  OR username LIKE '%test%'
  OR email LIKE '%test%'
  OR username LIKE '%dummy%'
  OR email LIKE '%dummy%'
  OR username LIKE '%trader%'
  OR username IN ('trader1', 'trader2', 'trader3');

-- Delete demo trades
DELETE FROM trades WHERE "userId" IN (SELECT id FROM demo_users_to_delete);

-- Delete demo balances
DELETE FROM balances WHERE "userId" IN (SELECT id FROM demo_users_to_delete);

-- Delete demo admin controls
DELETE FROM admin_controls WHERE "userId" IN (SELECT id FROM demo_users_to_delete);

-- Now delete demo users (this will work since we removed all references)
DELETE FROM users WHERE id IN (SELECT id FROM demo_users_to_delete);

-- ========================================
-- STEP 2: CLEAN UP ORPHANED DATA
-- ========================================

-- Remove balances without valid users
DELETE FROM balances WHERE "userId" NOT IN (SELECT id FROM users);

-- Remove trades without valid users
DELETE FROM trades WHERE "userId" NOT IN (SELECT id FROM users);

-- Remove admin controls without valid users
DELETE FROM admin_controls WHERE "userId" NOT IN (SELECT id FROM users);

-- Clean up the temp table
DROP TABLE demo_users_to_delete;

-- ========================================
-- STEP 3: FIX FOREIGN KEY RELATIONSHIPS
-- ========================================

-- Ensure foreign key constraint exists for balances
ALTER TABLE balances
DROP CONSTRAINT IF EXISTS balances_userId_fkey;

ALTER TABLE balances
ADD CONSTRAINT balances_userId_fkey
FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;

-- ========================================
-- STEP 4: VERIFY CURRENT STATE
-- ========================================

SELECT 'CURRENT USERS AFTER CLEANUP:' as info;
SELECT id, username, email, role, "isActive" FROM users ORDER BY "createdAt";

SELECT 'CURRENT BALANCES AFTER CLEANUP:' as info;
SELECT
    b.id,
    b."userId",
    b.symbol,
    b.available,
    u.username,
    u.email
FROM balances b
LEFT JOIN users u ON b."userId" = u.id
ORDER BY u.username, b.symbol;

-- ========================================
-- STEP 5: CREATE PROPER BALANCES FOR REAL USERS
-- ========================================

-- Create comprehensive balances for all active real users
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

-- ========================================
-- STEP 6: FINAL VERIFICATION
-- ========================================

SELECT 'FINAL PRODUCTION STATE:' as info;

SELECT 'Users:' as section;
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN role = 'user' THEN 1 END) as regular_users,
    COUNT(CASE WHEN role = 'admin' OR role = 'super_admin' THEN 1 END) as admin_users
FROM users;

SELECT 'Balances with User Data:' as section;
SELECT 
    u.username,
    u.email,
    b.symbol,
    b.available,
    b.locked
FROM balances b
JOIN users u ON b."userId" = u.id
ORDER BY u.username, b.symbol;

SELECT 'Summary:' as section;
SELECT 
    COUNT(DISTINCT b."userId") as users_with_balances,
    COUNT(*) as total_balance_records,
    COUNT(CASE WHEN u.username IS NULL THEN 1 END) as orphaned_balances
FROM balances b
LEFT JOIN users u ON b."userId" = u.id;

SELECT 'CLEANUP COMPLETED - Production Ready!' as result;
