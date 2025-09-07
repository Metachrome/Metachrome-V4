-- Create options_settings table for trading duration and profit settings
CREATE TABLE IF NOT EXISTS options_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    duration INTEGER NOT NULL, -- Duration in seconds (30, 60, 120, etc.)
    "minAmount" DECIMAL(10,2) NOT NULL, -- Minimum trade amount
    "profitPercentage" DECIMAL(5,2) NOT NULL, -- Profit percentage (10.00 = 10%)
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique constraint for duration
CREATE UNIQUE INDEX IF NOT EXISTS idx_options_settings_duration ON options_settings(duration);

-- Add RLS (Row Level Security) policies
ALTER TABLE options_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Allow everyone to read options settings
CREATE POLICY "Everyone can read options settings" ON options_settings
    FOR SELECT USING (true);

-- Policy: Allow admins to insert/update/delete options settings
CREATE POLICY "Admins can manage options settings" ON options_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'super_admin')
        )
    );

-- Insert default options settings
INSERT INTO options_settings (duration, "minAmount", "profitPercentage", "isActive") VALUES
(30, 100.00, 10.00, true),   -- 30 seconds: min $100, 10% profit
(60, 1000.00, 15.00, true),  -- 60 seconds: min $1000, 15% profit
(120, 2000.00, 20.00, true), -- 2 minutes: min $2000, 20% profit
(300, 5000.00, 25.00, true)  -- 5 minutes: min $5000, 25% profit
ON CONFLICT (duration) DO NOTHING;

-- Create trades table for storing trade history
CREATE TABLE IF NOT EXISTS trades (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL DEFAULT 'BTC/USD',
    direction VARCHAR(10) NOT NULL CHECK (direction IN ('up', 'down')),
    amount DECIMAL(10,2) NOT NULL,
    duration INTEGER NOT NULL,
    "entryPrice" DECIMAL(10,2),
    "exitPrice" DECIMAL(10,2),
    profit DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "completedAt" TIMESTAMP WITH TIME ZONE,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for trades
CREATE INDEX IF NOT EXISTS idx_trades_userId ON trades("userId");
CREATE INDEX IF NOT EXISTS idx_trades_status ON trades(status);
CREATE INDEX IF NOT EXISTS idx_trades_createdAt ON trades("createdAt");

-- Add RLS policies for trades
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own trades
CREATE POLICY "Users can read own trades" ON trades
    FOR SELECT USING (
        "userId" = auth.uid() OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'super_admin')
        )
    );

-- Policy: Users can insert their own trades
CREATE POLICY "Users can insert own trades" ON trades
    FOR INSERT WITH CHECK ("userId" = auth.uid());

-- Policy: Admins can manage all trades
CREATE POLICY "Admins can manage all trades" ON trades
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'super_admin')
        )
    );

-- Create balances table for user balances
CREATE TABLE IF NOT EXISTS balances (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL DEFAULT 'USD',
    available DECIMAL(15,2) DEFAULT 0.00,
    locked DECIMAL(15,2) DEFAULT 0.00,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE("userId", symbol)
);

-- Create indexes for balances
CREATE INDEX IF NOT EXISTS idx_balances_userId ON balances("userId");
CREATE INDEX IF NOT EXISTS idx_balances_symbol ON balances(symbol);

-- Add RLS policies for balances
ALTER TABLE balances ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own balances
CREATE POLICY "Users can read own balances" ON balances
    FOR SELECT USING (
        "userId" = auth.uid() OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'super_admin')
        )
    );

-- Policy: Admins can manage all balances
CREATE POLICY "Admins can manage all balances" ON balances
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'super_admin')
        )
    );

-- Insert default balances for existing users
INSERT INTO balances ("userId", symbol, available) 
SELECT id, 'USD', 10000.00 
FROM users 
WHERE role = 'user'
ON CONFLICT ("userId", symbol) DO NOTHING;
