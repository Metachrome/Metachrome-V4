-- Fix transactions table amount column precision
-- This script updates the amount column from DECIMAL(15,2) to DECIMAL(18,8)
-- to match the Drizzle ORM schema definition

-- Step 1: Check current schema
SELECT 'Current transactions table schema:' as step;
SELECT column_name, data_type, numeric_precision, numeric_scale
FROM information_schema.columns
WHERE table_name = 'transactions'
ORDER BY ordinal_position;

-- Step 2: Alter the amount column to have correct precision
-- This should work for most cases
ALTER TABLE transactions
ALTER COLUMN amount TYPE DECIMAL(18,8);

-- Step 3: Check if fee column exists and fix it
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'fee'
  ) THEN
    ALTER TABLE transactions ALTER COLUMN fee TYPE DECIMAL(18,8);
    RAISE NOTICE 'Fixed fee column';
  END IF;
END $$;

-- Step 4: Check if network_fee column exists and fix it
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'network_fee'
  ) THEN
    ALTER TABLE transactions ALTER COLUMN network_fee TYPE DECIMAL(18,8);
    RAISE NOTICE 'Fixed network_fee column';
  END IF;
END $$;

-- Step 5: Verify the fix
SELECT 'Updated transactions table schema:' as step;
SELECT column_name, data_type, numeric_precision, numeric_scale
FROM information_schema.columns
WHERE table_name = 'transactions'
ORDER BY ordinal_position;

-- Step 6: Check if there are any transactions with amount = 0 that should have values
SELECT 'Transactions with $0 amounts:' as step;
SELECT id, user_id, type, amount, created_at
FROM transactions
WHERE amount = 0
ORDER BY created_at DESC
LIMIT 10;

