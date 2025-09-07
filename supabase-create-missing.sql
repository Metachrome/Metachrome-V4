-- Create missing tables for CryptoTradeX
-- Run this in Supabase SQL Editor

-- 1. Create users table (this is what's missing!)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
    "firstName" TEXT,
    "lastName" TEXT,
    "walletAddress" TEXT,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- 2. Create options_settings table
CREATE TABLE IF NOT EXISTS options_settings (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    duration INTEGER NOT NULL,
    "minAmount" TEXT NOT NULL,
    "profitPercentage" TEXT NOT NULL,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- 3. Create indexes
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_options_settings_duration ON options_settings(duration);

-- 4. Insert default admin user
INSERT INTO users (username, email, password, role, "isActive") 
VALUES ('admin', 'admin@metachrome.com', 'admin123', 'admin', true)
ON CONFLICT (username) DO NOTHING;

-- 5. Insert test users
INSERT INTO users (username, email, password, role, "isActive") 
VALUES ('testuser', 'test@metachrome.com', 'password123', 'user', true)
ON CONFLICT (username) DO NOTHING;

INSERT INTO users (username, email, password, role, "isActive") 
VALUES ('user1', 'user1@metachrome.com', 'password123', 'user', true)
ON CONFLICT (username) DO NOTHING;

-- 6. Insert default options settings
INSERT INTO options_settings (duration, "minAmount", "profitPercentage", "isActive") VALUES
('30', '100.00', '10.00', true),
('60', '1000.00', '15.00', true),
('120', '2000.00', '20.00', true),
('300', '5000.00', '25.00', true)
ON CONFLICT DO NOTHING;

-- 7. Add balances for users (if balances table exists)
INSERT INTO balances ("userId", symbol, available) 
SELECT id, 'USD', '10000.00' 
FROM users 
WHERE role = 'user'
ON CONFLICT DO NOTHING;

-- Success message
SELECT 'Missing tables created successfully!' as message;
