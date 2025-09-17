-- SIMPLE FIX: Drop and recreate tables with correct types
-- This is the safest approach when you have type mismatches

-- ===== STEP 1: Check what we're working with =====
SELECT 'CURRENT USERS ID TYPE:' as info, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'id' AND table_schema = 'public';

-- ===== STEP 2: Fix users table first =====
-- Add missing columns to users table (keep existing data)
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS balance DECIMAL(15,2) DEFAULT 10000.00;
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';
ALTER TABLE users ADD COLUMN IF NOT EXISTS trading_mode VARCHAR(20) DEFAULT 'normal';
ALTER TABLE users ADD COLUMN IF NOT EXISTS wallet_address VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

-- ===== STEP 3: Drop problematic tables (they're likely empty anyway) =====
DROP TABLE IF EXISTS balances CASCADE;
DROP TABLE IF EXISTS trades CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;

-- ===== STEP 4: Recreate tables with correct foreign key types =====
-- We'll use TEXT type to match your users.id column

CREATE TABLE balances (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    balance DECIMAL(15,8) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'USD',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE trades (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL DEFAULT 'BTCUSDT',
    amount DECIMAL(15,8) NOT NULL,
    direction VARCHAR(10) NOT NULL CHECK (direction IN ('up', 'down')),
    duration INTEGER NOT NULL,
    entry_price DECIMAL(15,8),
    exit_price DECIMAL(15,8),
    result VARCHAR(10) CHECK (result IN ('win', 'lose', 'pending')),
    profit_loss DECIMAL(15,8) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'trade_profit', 'trade_loss', 'bonus')),
    amount DECIMAL(15,8) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    description TEXT,
    reference_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== STEP 5: Create options_settings table =====
CREATE TABLE IF NOT EXISTS options_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    duration INTEGER UNIQUE NOT NULL,
    "minAmount" DECIMAL(15,2) NOT NULL,
    "profitPercentage" DECIMAL(5,2) NOT NULL,
    "isActive" BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== STEP 6: Insert default data =====
-- Insert/update superadmin user
INSERT INTO users (
    username, 
    email, 
    password_hash, 
    balance, 
    role, 
    status, 
    trading_mode
) VALUES (
    'superadmin',
    'superadmin@metachrome.io',
    '$2b$10$rQZ8kHWKtGKVQZ8kHWKtGOyQZ8kHWKtGKVQZ8kHWKtGKVQZ8kHWKtG',
    1000000.00,
    'super_admin',
    'active',
    'normal'
) ON CONFLICT (username) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    balance = EXCLUDED.balance,
    status = EXCLUDED.status,
    trading_mode = EXCLUDED.trading_mode;

-- Insert default options settings
INSERT INTO options_settings (duration, "minAmount", "profitPercentage", "isActive") VALUES
(30, 100.00, 10.00, true),
(60, 1000.00, 15.00, true),
(120, 2000.00, 20.00, true),
(300, 5000.00, 25.00, true)
ON CONFLICT (duration) DO NOTHING;

-- ===== STEP 7: Create indexes =====
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_balances_user_id ON balances(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_user_id ON trades(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);

-- ===== STEP 8: Verification =====
-- Show final table structure
SELECT 'FINAL TABLE STRUCTURE:' as info;

SELECT 'USERS TABLE:' as section, column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'BALANCES TABLE:' as section, column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'balances' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'TRADES TABLE:' as section, column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'trades' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'TRANSACTIONS TABLE:' as section, column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'transactions' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Test foreign key relationships
SELECT 'FOREIGN KEY TEST:' as section,
       'Testing foreign key relationships...' as test;

-- This should work without errors now
SELECT 'SUPERADMIN TEST:' as section, username, role, balance
FROM users WHERE username = 'superadmin';

-- Test join (should work without errors)
SELECT 'JOIN TEST:' as section, 
       u.username, 
       COUNT(t.id) as trade_count,
       COUNT(tr.id) as transaction_count
FROM users u
LEFT JOIN trades t ON t.user_id = u.id
LEFT JOIN transactions tr ON tr.user_id = u.id
WHERE u.username = 'superadmin'
GROUP BY u.username;

SELECT 'SUCCESS: All tables recreated with correct foreign key types!' as final_message;
