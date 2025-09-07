-- Create only the users table first
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

-- 2. Create indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 3. Insert default admin user
INSERT INTO users (username, email, password, role, "isActive") 
VALUES ('admin', 'admin@metachrome.com', 'admin123', 'admin', true)
ON CONFLICT (username) DO NOTHING;

-- 4. Insert test users
INSERT INTO users (username, email, password, role, "isActive") 
VALUES ('testuser', 'test@metachrome.com', 'password123', 'user', true)
ON CONFLICT (username) DO NOTHING;

INSERT INTO users (username, email, password, role, "isActive") 
VALUES ('user1', 'user1@metachrome.com', 'password123', 'user', true)
ON CONFLICT (username) DO NOTHING;

-- 5. Add balances for users (if balances table exists)
INSERT INTO balances ("userId", symbol, available) 
SELECT id, 'USD', '10000.00' 
FROM users 
WHERE role = 'user'
ON CONFLICT DO NOTHING;

-- Success message
SELECT 'Users table created successfully!' as message;
