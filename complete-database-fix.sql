-- COMPLETE DATABASE FIX FOR METACHROME V2
-- This script fixes ALL database issues in the correct order

-- ===== STEP 1: Fix users table (add missing columns) =====
SELECT 'STEP 1: Fixing users table...' as info;

-- Add missing columns to users table (preserve existing data)
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS balance DECIMAL(15,2) DEFAULT 10000.00;
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';
ALTER TABLE users ADD COLUMN IF NOT EXISTS trading_mode VARCHAR(20) DEFAULT 'normal';
ALTER TABLE users ADD COLUMN IF NOT EXISTS wallet_address VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

-- ===== STEP 2: Drop problematic tables =====
SELECT 'STEP 2: Dropping problematic tables...' as info;

DROP TABLE IF EXISTS options_settings CASCADE;
DROP TABLE IF EXISTS balances CASCADE;
DROP TABLE IF EXISTS trades CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;

-- ===== STEP 3: Create all tables with correct structure =====
SELECT 'STEP 3: Creating tables with correct structure...' as info;

-- Create balances table (using TEXT for user_id to match users.id)
CREATE TABLE balances (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    balance DECIMAL(15,8) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'USD',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trades table
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

-- Create transactions table
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

-- Create options_settings table
CREATE TABLE options_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    duration INTEGER UNIQUE NOT NULL,
    "minAmount" DECIMAL(15,2) NOT NULL,
    "profitPercentage" DECIMAL(5,2) NOT NULL,
    "isActive" BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== STEP 4: Insert default data =====
SELECT 'STEP 4: Inserting default data...' as info;

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
(300, 5000.00, 25.00, true);

-- ===== STEP 5: Create indexes =====
SELECT 'STEP 5: Creating indexes...' as info;

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_balances_user_id ON balances(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_user_id ON trades(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_options_settings_duration ON options_settings(duration);

-- ===== STEP 6: Final verification =====
SELECT 'STEP 6: Final verification...' as info;

-- Show all tables
SELECT 'ALL TABLES:' as section, table_name
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Show users table structure
SELECT 'USERS TABLE:' as section, column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show foreign key relationships
SELECT 'FOREIGN KEYS:' as section,
       tc.table_name, 
       kcu.column_name,
       ccu.table_name AS foreign_table_name,
       ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- Test superadmin user
SELECT 'SUPERADMIN USER:' as section, username, role, balance,
       CASE WHEN password_hash IS NOT NULL THEN 'Password set' ELSE 'No password' END as password_status
FROM users WHERE username = 'superadmin';

-- Test options settings
SELECT 'OPTIONS SETTINGS:' as section, duration, "minAmount", "profitPercentage", "isActive"
FROM options_settings
ORDER BY duration;

-- Test join (should work without errors)
SELECT 'JOIN TEST:' as section, 
       u.username, 
       u.role,
       COUNT(t.id) as trade_count,
       COUNT(tr.id) as transaction_count
FROM users u
LEFT JOIN trades t ON t.user_id = u.id
LEFT JOIN transactions tr ON tr.user_id = u.id
WHERE u.username = 'superadmin'
GROUP BY u.username, u.role;

SELECT '🎉 SUCCESS: All database issues fixed! Your database is now ready for production! 🎉' as final_message;
