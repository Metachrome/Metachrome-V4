-- Fix trade_loss transaction amounts
-- This migration updates old trade_loss transactions that have amount = 0
-- to show the correct percentage-based loss amount

-- Step 1: Check current trade_loss transactions with amount = 0
SELECT
  t.id,
  t.user_id,
  t.type,
  t.amount,
  t.description,
  t.reference_id,
  tr.amount as trade_amount,
  tr.duration
FROM transactions t
LEFT JOIN trades tr ON t.reference_id::uuid = tr.id
WHERE t.type = 'trade_loss'
  AND (t.amount = 0 OR t.amount IS NULL OR t.amount = '0')
ORDER BY t.created_at DESC;

-- Step 2: Update trade_loss transactions with correct amounts
-- For 30s trades: loss = 10% of trade amount
-- For 60s trades: loss = 15% of trade amount

UPDATE transactions t
SET amount = CASE
  WHEN tr.duration = 30 THEN tr.amount * 0.10
  WHEN tr.duration = 60 THEN tr.amount * 0.15
  ELSE tr.amount * 0.10  -- Default to 10% if duration not found
END,
updated_at = NOW()
FROM trades tr
WHERE t.reference_id::uuid = tr.id
  AND t.type = 'trade_loss'
  AND (t.amount = 0 OR t.amount IS NULL OR t.amount = '0');

-- Step 3: Verify the update
SELECT
  t.id,
  t.user_id,
  t.type,
  t.amount as transaction_amount,
  t.description,
  tr.amount as trade_amount,
  tr.duration,
  CASE
    WHEN tr.duration = 30 THEN tr.amount * 0.10
    WHEN tr.duration = 60 THEN tr.amount * 0.15
    ELSE tr.amount * 0.10
  END as expected_loss_amount
FROM transactions t
LEFT JOIN trades tr ON t.reference_id::uuid = tr.id
WHERE t.type = 'trade_loss'
ORDER BY t.created_at DESC
LIMIT 20;

-- Step 4: Show summary
SELECT 
  'Migration completed!' as status,
  COUNT(*) as total_trade_loss_transactions,
  COUNT(CASE WHEN t.amount > 0 THEN 1 END) as transactions_with_amount,
  COUNT(CASE WHEN t.amount = 0 OR t.amount IS NULL THEN 1 END) as transactions_with_zero_amount
FROM transactions t
WHERE t.type = 'trade_loss';

