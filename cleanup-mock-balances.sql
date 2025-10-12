-- Check what balances currently exist in the database
SELECT user_id, symbol, available, locked, created_at 
FROM balances 
ORDER BY user_id, symbol;

-- Delete all mock cryptocurrency balances (keep only USDT)
-- This will remove the 0.5000 BTC, 2.0000 ETH, 10.0000 SOL mock data
DELETE FROM balances 
WHERE symbol IN ('BTC', 'ETH', 'SOL', 'BNB', 'USDC', 'BUSD')
AND (
  available = '0.50000000' OR 
  available = '2.00000000' OR 
  available = '10.00000000' OR
  available = '0.5000' OR 
  available = '2.0000' OR 
  available = '10.0000'
);

-- Alternative: Delete ALL cryptocurrency balances (if you want to start fresh)
-- Uncomment the line below if you want to remove all crypto balances
-- DELETE FROM balances WHERE symbol != 'USDT';

-- Check what remains after cleanup
SELECT user_id, symbol, available, locked, created_at 
FROM balances 
ORDER BY user_id, symbol;
