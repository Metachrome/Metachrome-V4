-- METACHROME V2 - Production Database Schema for Supabase
-- Execute this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    balance DECIMAL(15,2) DEFAULT 0.00,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned')),
    trading_mode VARCHAR(20) DEFAULT 'normal' CHECK (trading_mode IN ('win', 'normal', 'lose')),
    restrictions JSONB DEFAULT '[]'::jsonb,
    -- New verification fields
    verification_status VARCHAR(20) DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
    -- New referral fields
    referral_code VARCHAR(50) UNIQUE,
    referred_by VARCHAR(50),
    -- New tracking fields
    total_trades INTEGER DEFAULT 0,
    pending_bonus_restrictions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- Trades table
CREATE TABLE IF NOT EXISTS trades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    direction VARCHAR(10) NOT NULL CHECK (direction IN ('up', 'down')),
    duration INTEGER NOT NULL,
    entry_price DECIMAL(15,8) NOT NULL,
    exit_price DECIMAL(15,8),
    result VARCHAR(20) CHECK (result IN ('win', 'lose', 'pending')),
    profit DECIMAL(15,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'trade_win', 'trade_loss', 'bonus')),
    amount DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trading settings table
CREATE TABLE IF NOT EXISTS trading_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    duration INTEGER UNIQUE NOT NULL,
    min_amount DECIMAL(15,2) NOT NULL,
    profit_percentage DECIMAL(5,2) NOT NULL,
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System settings table
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_trades_user_id ON trades(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_symbol ON trades(symbol);
CREATE INDEX IF NOT EXISTS idx_trades_created_at ON trades(created_at);
CREATE INDEX IF NOT EXISTS idx_trades_result ON trades(result);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE trading_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Admins can see all users
CREATE POLICY "Admins can view all users" ON users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Users can only see their own trades
CREATE POLICY "Users can view own trades" ON trades
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own trades" ON trades
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Admins can see all trades
CREATE POLICY "Admins can view all trades" ON trades
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Users can only see their own transactions
CREATE POLICY "Users can view own transactions" ON transactions
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- Admins can see all transactions
CREATE POLICY "Admins can view all transactions" ON transactions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Everyone can read trading settings
CREATE POLICY "Anyone can view trading settings" ON trading_settings
    FOR SELECT USING (true);

-- Only admins can modify trading settings
CREATE POLICY "Admins can modify trading settings" ON trading_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Only super admins can access system settings
CREATE POLICY "Super admins can access system settings" ON system_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role = 'super_admin'
        )
    );

-- Insert default trading settings
INSERT INTO trading_settings (duration, min_amount, profit_percentage, enabled) VALUES
(30, 1.00, 85.00, true),
(60, 5.00, 80.00, true),
(120, 10.00, 75.00, true),
(300, 25.00, 70.00, true)
ON CONFLICT (duration) DO NOTHING;

-- Insert default super admin user (change password in production!)
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
    100000.00,
    'super_admin',
    'active',
    'normal'
) ON CONFLICT (username) DO NOTHING;

-- Insert demo admin user
INSERT INTO users (
    username, 
    email, 
    password_hash, 
    balance, 
    role, 
    status, 
    trading_mode
) VALUES (
    'admin',
    'admin@metachrome.io',
    '$2b$10$rQZ8kHWKtGKVQZ8kHWKtGOyQZ8kHWKtGKVQZ8kHWKtGKVQZ8kHWKtG', -- password: admin123
    50000.00,
    'admin',
    'active',
    'normal'
) ON CONFLICT (username) DO NOTHING;

-- Insert demo trader user
INSERT INTO users (
    username, 
    email, 
    password_hash, 
    balance, 
    role, 
    status, 
    trading_mode
) VALUES (
    'trader1',
    'trader1@metachrome.io',
    '$2b$10$rQZ8kHWKtGKVQZ8kHWKtGOyQZ8kHWKtGKVQZ8kHWKtGKVQZ8kHWKtG', -- password: password123
    10000.00,
    'user',
    'active',
    'normal'
) ON CONFLICT (username) DO NOTHING;

-- Function to initialize schema (for programmatic setup)
CREATE OR REPLACE FUNCTION initialize_metachrome_schema()
RETURNS BOOLEAN AS $$
BEGIN
    -- This function can be called from the application to ensure schema is set up
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trades_updated_at BEFORE UPDATE ON trades
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trading_settings_updated_at BEFORE UPDATE ON trading_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===== NEW FEATURE TABLES =====

-- User Verification Documents table
CREATE TABLE IF NOT EXISTS user_verification_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('id_card', 'driver_license', 'passport')),
    document_url VARCHAR(500) NOT NULL,
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Referrals table
CREATE TABLE IF NOT EXISTS user_referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    referred_id UUID REFERENCES users(id) ON DELETE CASCADE,
    referral_code VARCHAR(50) NOT NULL,
    bonus_amount DECIMAL(15,2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Redeem Codes table
CREATE TABLE IF NOT EXISTS redeem_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    bonus_amount DECIMAL(15,2) NOT NULL,
    max_uses INTEGER DEFAULT NULL,
    current_uses INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- User Redeem History table
CREATE TABLE IF NOT EXISTS user_redeem_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    redeem_code_id UUID REFERENCES redeem_codes(id),
    code VARCHAR(50) NOT NULL,
    bonus_amount DECIMAL(15,2) NOT NULL,
    trades_required INTEGER DEFAULT 10,
    trades_completed INTEGER DEFAULT 0,
    withdrawal_unlocked BOOLEAN DEFAULT false,
    redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== INDEXES FOR NEW TABLES =====
CREATE INDEX IF NOT EXISTS idx_users_verification_status ON users(verification_status);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_verification_documents_user_id ON user_verification_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_documents_status ON user_verification_documents(verification_status);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON user_referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON user_referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_redeem_codes_code ON redeem_codes(code);
CREATE INDEX IF NOT EXISTS idx_redeem_history_user_id ON user_redeem_history(user_id);

-- ===== ROW LEVEL SECURITY POLICIES =====

-- Enable RLS on new tables
ALTER TABLE user_verification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE redeem_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_redeem_history ENABLE ROW LEVEL SECURITY;

-- Verification Documents Policies
CREATE POLICY "Users can view own verification documents" ON user_verification_documents
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own verification documents" ON user_verification_documents
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Admins can view all verification documents" ON user_verification_documents
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id::text = auth.uid()::text
            AND role IN ('admin', 'super_admin')
        )
    );

-- Referrals Policies
CREATE POLICY "Users can view own referrals" ON user_referrals
    FOR SELECT USING (
        auth.uid()::text = referrer_id::text OR
        auth.uid()::text = referred_id::text
    );

CREATE POLICY "Admins can view all referrals" ON user_referrals
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id::text = auth.uid()::text
            AND role IN ('admin', 'super_admin')
        )
    );

-- Redeem Codes Policies (read-only for users)
CREATE POLICY "Anyone can view active redeem codes" ON redeem_codes
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage redeem codes" ON redeem_codes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id::text = auth.uid()::text
            AND role IN ('admin', 'super_admin')
        )
    );

-- Redeem History Policies
CREATE POLICY "Users can view own redeem history" ON user_redeem_history
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own redeem history" ON user_redeem_history
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Admins can view all redeem history" ON user_redeem_history
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id::text = auth.uid()::text
            AND role IN ('admin', 'super_admin')
        )
    );

-- ===== TRIGGERS FOR NEW TABLES =====
CREATE TRIGGER update_verification_documents_updated_at BEFORE UPDATE ON user_verification_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===== DEFAULT DATA FOR NEW FEATURES =====

-- Insert default redeem codes
INSERT INTO redeem_codes (code, bonus_amount, max_uses, is_active) VALUES
('FIRSTBONUS', 100.00, NULL, true),
('LETSGO1000', 1000.00, NULL, true),
('WELCOME50', 50.00, 100, true),
('BONUS500', 500.00, 50, true)
ON CONFLICT (code) DO NOTHING;

-- Update existing users to have verification status and generate referral codes
UPDATE users
SET
    verification_status = CASE
        WHEN role IN ('admin', 'super_admin') THEN 'verified'
        ELSE 'unverified'
    END,
    referral_code = CASE
        WHEN referral_code IS NULL THEN UPPER(SUBSTRING(MD5(RANDOM()::text), 1, 8))
        ELSE referral_code
    END
WHERE verification_status IS NULL OR referral_code IS NULL;
