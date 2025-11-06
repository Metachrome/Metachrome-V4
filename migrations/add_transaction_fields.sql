-- Add missing fields to transactions table for deposit/withdrawal functionality
-- This migration adds fields that exist in SQLite schema but missing in PostgreSQL

-- Add symbol column (currency symbol like USDT, BTC, ETH)
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS symbol VARCHAR(20);

-- Add fee column (transaction fee)
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS fee DECIMAL(15,8);

-- Add tx_hash column (blockchain transaction hash)
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS tx_hash VARCHAR(255);

-- Add method column (payment method: crypto, card, bank)
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS method VARCHAR(50);

-- Add currency column (currency for the transaction)
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS currency VARCHAR(20);

-- Add metadata column (JSON metadata for additional information)
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS metadata TEXT;

-- Update existing transactions to have default symbol if null
UPDATE transactions SET symbol = 'USDT' WHERE symbol IS NULL;

-- Create index on symbol for faster queries
CREATE INDEX IF NOT EXISTS idx_transactions_symbol ON transactions(symbol);

-- Create index on status for faster queries
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);

-- Create index on type for faster queries
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);

-- Create index on user_id and created_at for faster user transaction queries
CREATE INDEX IF NOT EXISTS idx_transactions_user_created ON transactions(user_id, created_at DESC);

-- Verify the migration
SELECT 'Migration completed successfully!' as status;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'transactions' 
ORDER BY ordinal_position;

