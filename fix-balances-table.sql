-- First, let's check what columns exist in the balances table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'balances' AND table_schema = 'public';

-- If the table exists but has wrong column names, let's drop and recreate it
DROP TABLE IF EXISTS balances CASCADE;

-- Create balances table with correct column naming and data types
CREATE TABLE balances (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL DEFAULT 'USDT',
    available DECIMAL(15,8) DEFAULT 0.00,
    locked DECIMAL(15,8) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, symbol)
);

-- Create index for faster queries
CREATE INDEX idx_balances_user_symbol ON balances(user_id, symbol);

-- Grant necessary permissions
GRANT ALL ON balances TO authenticated;
GRANT ALL ON balances TO service_role;
