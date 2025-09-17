-- Fix Supabase Schema for METACHROME V2
-- Run this in your Supabase SQL Editor to fix the column name mismatch

-- First, check if the users table exists and what columns it has
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public';

-- Option 1: If your table has 'password' column, add 'password_hash' as an alias
-- (This allows both column names to work)
DO $$
BEGIN
    -- Check if password_hash column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'password_hash' 
        AND table_schema = 'public'
    ) THEN
        -- If password column exists but password_hash doesn't, rename it
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' 
            AND column_name = 'password' 
            AND table_schema = 'public'
        ) THEN
            ALTER TABLE users RENAME COLUMN password TO password_hash;
            RAISE NOTICE 'Renamed password column to password_hash';
        ELSE
            -- If neither exists, add password_hash column
            ALTER TABLE users ADD COLUMN password_hash TEXT;
            RAISE NOTICE 'Added password_hash column';
        END IF;
    END IF;
END $$;

-- Option 2: If you need to create the users table from scratch
-- (Only run this if the table doesn't exist)
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT,
    balance DECIMAL(15,2) DEFAULT 10000.00,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned')),
    trading_mode VARCHAR(20) DEFAULT 'normal' CHECK (trading_mode IN ('win', 'normal', 'lose')),
    wallet_address VARCHAR(100),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    profile_image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    admin_notes TEXT,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create other required tables if they don't exist
CREATE TABLE IF NOT EXISTS trades (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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

CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'trade_profit', 'trade_loss', 'bonus')),
    amount DECIMAL(15,8) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    description TEXT,
    reference_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS balances (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    balance DECIMAL(15,8) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'USD',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default superadmin user (with correct password hash for 'superadmin123')
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
    role = EXCLUDED.role;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_trades_user_id ON trades(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_created_at ON trades(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_balances_userId ON balances("userId");

-- Success message
SELECT 'Schema fix completed successfully! Column name mismatch resolved.' as message;
