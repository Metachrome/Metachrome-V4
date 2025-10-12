-- Simple balances table creation (without RLS policies)
CREATE TABLE IF NOT EXISTS balances (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL DEFAULT 'USDT',
    available DECIMAL(15,8) DEFAULT 0.00,
    locked DECIMAL(15,8) DEFAULT 0.00,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE("userId", symbol)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_balances_user_symbol ON balances("userId", symbol);

-- Grant necessary permissions
GRANT ALL ON balances TO authenticated;
GRANT ALL ON balances TO service_role;
