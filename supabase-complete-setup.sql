-- Complete setup script for CryptoTradeX
-- Run this in Supabase SQL Editor

-- 1. Create users table first (if it doesn't exist)
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
    "firstName" VARCHAR(100),
    "lastName" VARCHAR(100),
    "walletAddress" VARCHAR(255),
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create admin_controls table
CREATE TABLE IF NOT EXISTS admin_controls (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "userId" UUID NOT NULL,
    "adminId" UUID NOT NULL,
    "controlType" VARCHAR(20) NOT NULL CHECK ("controlType" IN ('normal', 'win', 'lose')),
    "isActive" BOOLEAN DEFAULT true,
    notes TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create options_settings table
CREATE TABLE IF NOT EXISTS options_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    duration INTEGER NOT NULL,
    "minAmount" DECIMAL(10,2) NOT NULL,
    "profitPercentage" DECIMAL(5,2) NOT NULL,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create trades table
CREATE TABLE IF NOT EXISTS trades (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "userId" UUID NOT NULL,
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

-- 5. Create balances table
CREATE TABLE IF NOT EXISTS balances (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "userId" UUID NOT NULL,
    symbol VARCHAR(20) NOT NULL DEFAULT 'USD',
    available DECIMAL(15,2) DEFAULT 0.00,
    locked DECIMAL(15,2) DEFAULT 0.00,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create indexes
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

CREATE INDEX IF NOT EXISTS idx_admin_controls_userId ON admin_controls("userId");
CREATE INDEX IF NOT EXISTS idx_admin_controls_adminId ON admin_controls("adminId");
CREATE INDEX IF NOT EXISTS idx_admin_controls_isActive ON admin_controls("isActive");

CREATE INDEX IF NOT EXISTS idx_options_settings_duration ON options_settings(duration);

CREATE INDEX IF NOT EXISTS idx_trades_userId ON trades("userId");
CREATE INDEX IF NOT EXISTS idx_trades_status ON trades(status);
CREATE INDEX IF NOT EXISTS idx_trades_createdAt ON trades("createdAt");

CREATE INDEX IF NOT EXISTS idx_balances_userId ON balances("userId");
CREATE INDEX IF NOT EXISTS idx_balances_symbol ON balances(symbol);

-- 7. Insert default admin user (if not exists)
INSERT INTO users (username, email, password, role, "isActive") 
VALUES ('admin', 'admin@metachrome.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', true)
ON CONFLICT (username) DO NOTHING;

-- 8. Insert default options settings
INSERT INTO options_settings (duration, "minAmount", "profitPercentage", "isActive") VALUES
(30, 100.00, 10.00, true),
(60, 1000.00, 15.00, true),
(120, 2000.00, 20.00, true),
(300, 5000.00, 25.00, true)
ON CONFLICT DO NOTHING;

-- 9. Create a test user
INSERT INTO users (username, email, password, role, "isActive") 
VALUES ('testuser', 'test@metachrome.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', true)
ON CONFLICT (username) DO NOTHING;

-- 10. Insert default balance for test user
INSERT INTO balances ("userId", symbol, available) 
SELECT id, 'USD', 10000.00 
FROM users 
WHERE username = 'testuser'
ON CONFLICT DO NOTHING;

-- Success message
SELECT 'All tables created successfully!' as message;
