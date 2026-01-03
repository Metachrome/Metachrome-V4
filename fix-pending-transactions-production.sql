-- Script to fix pending trade transactions in production database
-- This will update all trade_win and trade_loss transactions from pending to completed

-- First, let's check what we have
SELECT 
  'Pending Trade Transactions' as check_type,
  COUNT(*) as count
FROM transactions
WHERE (type = 'trade_win' OR type = 'trade_loss')
AND status = 'pending';

-- Show details of pending trade transactions
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
LIMIT 20;

-- Check if there are related trades (with safe UUID casting)
SELECT
  t.id as transaction_id,
  t.type as transaction_type,
  t.amount as transaction_amount,
  t.status as transaction_status,
  t.reference_id,
  tr.id as trade_id,
  tr.symbol,
  tr.status as trade_status,
  tr.result,
  tr.profit,
  tr.completed_at
FROM transactions t
LEFT JOIN trades tr ON (
  CASE
    WHEN t.reference_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    THEN t.reference_id::uuid = tr.id
    ELSE FALSE
  END
)
WHERE (t.type = 'trade_win' OR t.type = 'trade_loss')
AND t.status = 'pending'
ORDER BY t.created_at DESC
LIMIT 20;

-- Update all pending trade transactions to completed
-- UNCOMMENT THE FOLLOWING LINES TO EXECUTE THE UPDATE:

-- UPDATE transactions
-- SET 
--   status = 'completed',
--   updated_at = NOW()
-- WHERE (type = 'trade_win' OR type = 'trade_loss')
-- AND status = 'pending';

-- Verify the update
-- SELECT 
--   'After Update' as check_type,
--   COUNT(*) as pending_count
-- FROM transactions
-- WHERE (type = 'trade_win' OR type = 'trade_loss')
-- AND status = 'pending';

