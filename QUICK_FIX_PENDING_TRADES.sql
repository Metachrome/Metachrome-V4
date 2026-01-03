-- ============================================
-- QUICK FIX: Update Pending Trade Transactions
-- ============================================
-- This script will update all trade_win and trade_loss transactions
-- from 'pending' to 'completed' status
-- ============================================

-- STEP 1: Check how many pending trade transactions exist
SELECT 
  'BEFORE UPDATE' as status,
  type,
  COUNT(*) as count
FROM transactions
WHERE (type = 'trade_win' OR type = 'trade_loss')
AND status = 'pending'
GROUP BY type;

-- STEP 2: Show details of pending trade transactions
SELECT 
  id,
  user_id,
  type,
  amount,
  symbol,
  status,
  created_at,
  reference_id
FROM transactions
WHERE (type = 'trade_win' OR type = 'trade_loss')
AND status = 'pending'
ORDER BY created_at DESC
LIMIT 50;

-- STEP 3: Update all pending trade transactions to completed
-- UNCOMMENT THE LINES BELOW TO EXECUTE THE UPDATE:

/*
UPDATE transactions
SET 
  status = 'completed',
  updated_at = NOW()
WHERE (type = 'trade_win' OR type = 'trade_loss')
AND status = 'pending';
*/

-- STEP 4: Verify the update (run after uncommenting step 3)
/*
SELECT 
  'AFTER UPDATE' as status,
  type,
  COUNT(*) as count
FROM transactions
WHERE (type = 'trade_win' OR type = 'trade_loss')
GROUP BY type, status;
*/

-- ============================================
-- ALTERNATIVE: Update specific transactions by ID
-- ============================================
-- If you want to update specific transactions only,
-- use this format:
/*
UPDATE transactions
SET 
  status = 'completed',
  updated_at = NOW()
WHERE id IN (
  'transaction-id-1',
  'transaction-id-2',
  'transaction-id-3'
);
*/

