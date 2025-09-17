-- Clear all demo data from METACHROME database
-- This will remove all users except superadmin and all associated data

-- ===== STEP 1: Clear all transactions =====
DELETE FROM transactions;

-- ===== STEP 2: Clear all trades =====
DELETE FROM trades;

-- ===== STEP 3: Clear all balances =====
DELETE FROM balances;

-- ===== STEP 4: Clear all admin controls =====
DELETE FROM admin_controls;

-- ===== STEP 5: Clear all users except superadmin =====
DELETE FROM users WHERE role != 'super_admin' AND username != 'superadmin';

-- ===== STEP 6: Reset superadmin balance to default =====
UPDATE users 
SET balance = 1000000.00, 
    trading_mode = 'normal',
    status = 'active'
WHERE username = 'superadmin' AND role = 'super_admin';

-- ===== STEP 7: Verify cleanup =====
SELECT 'Cleanup completed!' as message;
SELECT 'Remaining users:' as info;
SELECT username, email, role, balance, status FROM users;

SELECT 'Remaining transactions:' as info;
SELECT COUNT(*) as transaction_count FROM transactions;

SELECT 'Remaining trades:' as info;
SELECT COUNT(*) as trade_count FROM trades;

SELECT 'Remaining balances:' as info;
SELECT COUNT(*) as balance_count FROM balances;
