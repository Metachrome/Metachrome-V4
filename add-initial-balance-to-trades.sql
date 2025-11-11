-- Migration: Add initial_balance column to trades table
-- This column stores the user's balance BEFORE the trade deduction
-- Used for calculating WIN/LOSE outcomes correctly

-- Add initial_balance column if it doesn't exist
ALTER TABLE trades ADD COLUMN IF NOT EXISTS initial_balance DECIMAL(15,8);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_trades_initial_balance ON trades(initial_balance);

-- Verify the column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'trades' 
AND column_name = 'initial_balance';

-- Show success message
SELECT 'initial_balance column added successfully!' as status;

