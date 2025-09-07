-- Complete Supabase Database Setup for METACHROME V4
-- Run this in Supabase SQL Editor if tables don't exist

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    balance DECIMAL(15,2) DEFAULT 10000.00,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned')),
    trading_mode VARCHAR(20) DEFAULT 'normal' CHECK (trading_mode IN ('win', 'normal', 'lose')),
    wallet_address VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- 2. Create trades table
CREATE TABLE IF NOT EXISTS trades (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL DEFAULT 'BTCUSDT',
    amount DECIMAL(15,8) NOT NULL,
    direction VARCHAR(10) NOT NULL CHECK (direction IN ('up', 'down')),
    duration INTEGER NOT NULL, -- in seconds
    entry_price DECIMAL(15,8) NOT NULL,
    exit_price DECIMAL(15,8),
    result VARCHAR(10) CHECK (result IN ('win', 'lose', 'pending')),
    profit DECIMAL(15,8) DEFAULT 0,
    type VARCHAR(20) DEFAULT 'options' CHECK (type IN ('options', 'spot')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- 3. Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'trade_win', 'trade_loss', 'bonus', 'spot_buy', 'spot_sell')),
    amount DECIMAL(15,8) NOT NULL,
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create options_settings table
CREATE TABLE IF NOT EXISTS options_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    duration INTEGER NOT NULL UNIQUE,
    "minAmount" DECIMAL(10,2) NOT NULL,
    "profitPercentage" DECIMAL(5,2) NOT NULL,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create balances table
CREATE TABLE IF NOT EXISTS balances (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL DEFAULT 'USDT',
    available DECIMAL(15,8) DEFAULT 0.00,
    locked DECIMAL(15,8) DEFAULT 0.00,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE("userId", symbol)
);

-- Insert default super admin user
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
    '$2b$10$rQZ8kHWKtGKVQZ8kHWKtGOyQZ8kHWKtGKVQZ8kHWKtGKVQZ8kHWKtG', -- password: superadmin123
    1000000.00,
    'super_admin',
    'active',
    'normal'
) ON CONFLICT (username) DO NOTHING;

-- Insert demo users
INSERT INTO users (username, email, password_hash, balance, role, status, trading_mode) VALUES
('demo-user-1', 'demo1@metachrome.io', '$2b$10$demo1hash', 10000.00, 'user', 'active', 'normal'),
('demo-user-2', 'demo2@metachrome.io', '$2b$10$demo2hash', 25000.00, 'user', 'active', 'win'),
('demo-user-3', 'demo3@metachrome.io', '$2b$10$demo3hash', 5000.00, 'user', 'active', 'lose'),
('admin-user', 'admin@metachrome.io', '$2b$10$adminhash', 100000.00, 'admin', 'active', 'normal')
ON CONFLICT (username) DO NOTHING;

-- Insert default options settings
INSERT INTO options_settings (duration, "minAmount", "profitPercentage", "isActive") VALUES
(30, 100.00, 10.00, true),
(60, 1000.00, 15.00, true),
(120, 2000.00, 20.00, true),
(300, 5000.00, 25.00, true)
ON CONFLICT (duration) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_trades_user_id ON trades(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_created_at ON trades(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_balances_userId ON balances("userId");

-- Success message
SELECT 'Database setup completed successfully!' as message;
