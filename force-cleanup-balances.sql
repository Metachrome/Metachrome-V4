-- AGGRESSIVE CLEANUP: Remove ALL cryptocurrency balances except USDT
-- This will force a clean slate for all users

-- First, check what we're about to delete
SELECT 'BEFORE CLEANUP:' as status, user_id, symbol, available, locked 
FROM balances 
WHERE symbol != 'USDT'
ORDER BY user_id, symbol;

-- Delete ALL non-USDT balances
DELETE FROM balances WHERE symbol != 'USDT';

-- Verify cleanup
SELECT 'AFTER CLEANUP:' as status, user_id, symbol, available, locked 
FROM balances 
ORDER BY user_id, symbol;

-- If you want to also reset USDT balances to remove any test amounts:
-- UPDATE balances SET available = '0', locked = '0' WHERE symbol = 'USDT';
