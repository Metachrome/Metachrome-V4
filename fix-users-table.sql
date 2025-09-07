-- Fix users table by adding missing columns
-- Run this in Supabase SQL Editor

-- Add missing columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS balance DECIMAL(15,2) DEFAULT 10000.00;
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';
ALTER TABLE users ADD COLUMN IF NOT EXISTS trading_mode VARCHAR(20) DEFAULT 'normal';
ALTER TABLE users ADD COLUMN IF NOT EXISTS wallet_address TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

-- Add constraints for the new columns
ALTER TABLE users ADD CONSTRAINT IF NOT EXISTS check_status 
    CHECK (status IN ('active', 'suspended', 'banned'));
    
ALTER TABLE users ADD CONSTRAINT IF NOT EXISTS check_trading_mode 
    CHECK (trading_mode IN ('win', 'normal', 'lose'));

-- Update existing users with default values
UPDATE users SET 
    balance = 10000.00 
WHERE balance IS NULL;

UPDATE users SET 
    status = 'active' 
WHERE status IS NULL;

UPDATE users SET 
    trading_mode = 'normal' 
WHERE trading_mode IS NULL;

-- Set super admin if exists
UPDATE users SET 
    balance = 1000000.00,
    role = 'super_admin',
    status = 'active',
    trading_mode = 'normal'
WHERE username = 'superadmin' OR email LIKE '%superadmin%' OR is_super_admin = true;

-- Insert sample users if table is empty
INSERT INTO users (
    id, username, email, password, role, balance, status, trading_mode, 
    "isActive", "createdAt", "updatedAt"
) VALUES 
(
    'superadmin-001',
    'superadmin',
    'superadmin@metachrome.io',
    '$2b$10$rQZ8kHWKtGKVQZ8kHWKtGOyQZ8kHWKtGKVQZ8kHWKtGKVQZ8kHWKtG',
    'super_admin',
    1000000.00,
    'active',
    'normal',
    true,
    NOW(),
    NOW()
),
(
    'demo-user-1',
    'john_trader',
    'john@example.com',
    '$2b$10$demo1hash',
    'user',
    10000.00,
    'active',
    'normal',
    true,
    NOW(),
    NOW()
),
(
    'demo-user-2',
    'sarah_crypto',
    'sarah@example.com',
    '$2b$10$demo2hash',
    'user',
    25000.00,
    'active',
    'win',
    true,
    NOW(),
    NOW()
),
(
    'demo-user-3',
    'mike_hodler',
    'mike@example.com',
    '$2b$10$demo3hash',
    'user',
    5000.00,
    'active',
    'lose',
    true,
    NOW(),
    NOW()
),
(
    'demo-admin-1',
    'admin_user',
    'admin@metachrome.io',
    '$2b$10$adminhash',
    'admin',
    100000.00,
    'active',
    'normal',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    balance = EXCLUDED.balance,
    status = EXCLUDED.status,
    trading_mode = EXCLUDED.trading_mode,
    role = EXCLUDED.role;

-- Verify the changes
SELECT 'Users table updated successfully!' as message;
SELECT COUNT(*) as total_users FROM users;
SELECT id, username, email, role, balance, status, trading_mode FROM users LIMIT 10;
