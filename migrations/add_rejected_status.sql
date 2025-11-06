-- Add 'rejected' status to transactions table
-- This migration allows deposit and withdrawal transactions to have 'rejected' status
-- Run this in Supabase SQL Editor

-- Drop the existing constraint if it exists
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_status_check;

-- Add new constraint that includes 'rejected' status
ALTER TABLE transactions ADD CONSTRAINT transactions_status_check 
  CHECK (status IN ('pending', 'completed', 'failed', 'cancelled', 'rejected'));

-- Verify the migration
SELECT 'Migration completed successfully!' as status;
SELECT 'Transactions table now accepts rejected status' as message;

