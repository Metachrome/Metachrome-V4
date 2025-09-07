-- METACHROME V2 - Supabase Migration Script
-- Run this in Supabase SQL Editor when deploying to Vercel

-- 1. Create users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    balance DECIMAL(15,2) DEFAULT 10000.00,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'superadmin', 'super_admin')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'banned')),
    trading_mode TEXT DEFAULT 'normal' CHECK (trading_mode IN ('win', 'normal', 'lose')),
    wallet_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create trades table
CREATE TABLE IF NOT EXISTS trades (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    direction TEXT NOT NULL CHECK (direction IN ('up', 'down')),
    duration INTEGER NOT NULL,
    entry_price DECIMAL(15,2) NOT NULL,
    exit_price DECIMAL(15,2),
    result TEXT DEFAULT 'pending' CHECK (result IN ('pending', 'win', 'lose')),
    profit DECIMAL(15,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- 3. Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'trade_profit', 'trade_loss')),
    amount DECIMAL(15,2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create wallet_history table
CREATE TABLE IF NOT EXISTS wallet_history (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    action TEXT NOT NULL CHECK (action IN ('deposit', 'withdrawal', 'trade', 'bonus')),
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create admin_controls table
CREATE TABLE IF NOT EXISTS admin_controls (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    control_type TEXT NOT NULL CHECK (control_type IN ('win', 'normal', 'lose')),
    is_active BOOLEAN DEFAULT true,
    created_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create trading_settings table
CREATE TABLE IF NOT EXISTS trading_settings (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    duration INTEGER NOT NULL,
    min_amount DECIMAL(15,2) NOT NULL,
    profit_percentage DECIMAL(5,2) NOT NULL,
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Insert default admin users
INSERT INTO users (username, email, password, balance, role, status, trading_mode) VALUES
('admin', 'admin@metachrome.io', 'admin123', 50000.00, 'admin', 'active', 'normal'),
('superadmin', 'superadmin@metachrome.io', 'superadmin123', 100000.00, 'super_admin', 'active', 'normal')
ON CONFLICT (username) DO NOTHING;

-- 8. Insert default trading settings
INSERT INTO trading_settings (duration, min_amount, profit_percentage, enabled) VALUES
(30, 100.00, 10.00, true),
(60, 1000.00, 15.00, true)
ON CONFLICT DO NOTHING;

-- 9. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_trades_user_id ON trades(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_created_at ON trades(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);

-- 10. Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE trading_settings ENABLE ROW LEVEL SECURITY;

-- 11. Create RLS policies (basic examples - adjust as needed)
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid()::text = id);
CREATE POLICY "Admins can view all users" ON users FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid()::text 
        AND role IN ('admin', 'super_admin')
    )
);

-- Success message
SELECT 'METACHROME V2 database setup completed successfully!' as status;
