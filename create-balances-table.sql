-- Create balances table if it doesn't exist
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

-- Enable Row Level Security
ALTER TABLE balances ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own balances" ON balances;
DROP POLICY IF EXISTS "Users can update their own balances" ON balances;
DROP POLICY IF EXISTS "Users can insert their own balances" ON balances;

-- Create policy for users to access their own balances
CREATE POLICY "Users can view their own balances" ON balances
    FOR SELECT USING (auth.uid() = "userId");

-- Create policy for users to update their own balances (for admin operations)
CREATE POLICY "Users can update their own balances" ON balances
    FOR UPDATE USING (auth.uid() = "userId");

-- Create policy for inserting balances
CREATE POLICY "Users can insert their own balances" ON balances
    FOR INSERT WITH CHECK (auth.uid() = "userId");

-- Grant necessary permissions
GRANT ALL ON balances TO authenticated;
GRANT ALL ON balances TO service_role;
