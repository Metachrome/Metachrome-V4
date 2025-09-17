-- Targeted Supabase Fix for METACHROME V2
-- Based on the error: column "password" does not exist

-- Step 1: Check current users table structure
SELECT 'CURRENT USERS TABLE STRUCTURE:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 2: Add missing columns to users table (skip password rename since it doesn't exist)
DO $$
BEGIN
    -- Add password_hash column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'password_hash' AND table_schema = 'public') THEN
        ALTER TABLE users ADD COLUMN password_hash TEXT;
        RAISE NOTICE 'Added password_hash column to users table';
    ELSE
        RAISE NOTICE 'password_hash column already exists';
    END IF;

    -- Add balance column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'balance' AND table_schema = 'public') THEN
        ALTER TABLE users ADD COLUMN balance DECIMAL(15,2) DEFAULT 10000.00;
        RAISE NOTICE 'Added balance column to users table';
    ELSE
        RAISE NOTICE 'balance column already exists';
    END IF;

    -- Add role column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'role' AND table_schema = 'public') THEN
        ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user';
        RAISE NOTICE 'Added role column to users table';
    ELSE
        RAISE NOTICE 'role column already exists';
    END IF;

    -- Add status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'status' AND table_schema = 'public') THEN
        ALTER TABLE users ADD COLUMN status VARCHAR(20) DEFAULT 'active';
        RAISE NOTICE 'Added status column to users table';
    ELSE
        RAISE NOTICE 'status column already exists';
    END IF;

    -- Add trading_mode column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'trading_mode' AND table_schema = 'public') THEN
        ALTER TABLE users ADD COLUMN trading_mode VARCHAR(20) DEFAULT 'normal';
        RAISE NOTICE 'Added trading_mode column to users table';
    ELSE
        RAISE NOTICE 'trading_mode column already exists';
    END IF;

    -- Add wallet_address column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'wallet_address' AND table_schema = 'public') THEN
        ALTER TABLE users ADD COLUMN wallet_address VARCHAR(100);
        RAISE NOTICE 'Added wallet_address column to users table';
    ELSE
        RAISE NOTICE 'wallet_address column already exists';
    END IF;

    -- Add timestamps if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'created_at' AND table_schema = 'public') THEN
        ALTER TABLE users ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added created_at column to users table';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'updated_at' AND table_schema = 'public') THEN
        ALTER TABLE users ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added updated_at column to users table';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'last_login' AND table_schema = 'public') THEN
        ALTER TABLE users ADD COLUMN last_login TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added last_login column to users table';
    END IF;
END $$;

-- Step 3: Fix balances table if it exists
DO $$
BEGIN
    -- Check if balances table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'balances' AND table_schema = 'public') THEN
        -- Fix userId to user_id if needed
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'balances' AND column_name = 'userId' AND table_schema = 'public') 
           AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'balances' AND column_name = 'user_id' AND table_schema = 'public') THEN
            ALTER TABLE balances RENAME COLUMN "userId" TO user_id;
            RAISE NOTICE 'Renamed userId to user_id in balances table';
        ELSE
            RAISE NOTICE 'balances table already has correct user_id column or userId does not exist';
        END IF;
    ELSE
        -- Create balances table if it doesn't exist
        CREATE TABLE balances (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            balance DECIMAL(15,8) DEFAULT 0,
            currency VARCHAR(10) DEFAULT 'USD',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Created balances table';
    END IF;
END $$;

-- Step 4: Create other tables if they don't exist
CREATE TABLE IF NOT EXISTS trades (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
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
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'trade_profit', 'trade_loss', 'bonus')),
    amount DECIMAL(15,8) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    description TEXT,
    reference_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 5: Insert/Update superadmin user
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

-- Step 6: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_balances_user_id ON balances(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_user_id ON trades(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);

-- Step 7: Show final structure
SELECT 'FINAL USERS TABLE STRUCTURE:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 8: Verify superadmin user
SELECT 'SUPERADMIN USER VERIFICATION:' as info;
SELECT username, email, role, balance, status, trading_mode, 
       CASE WHEN password_hash IS NOT NULL THEN 'Password hash set' ELSE 'No password hash' END as password_status
FROM users WHERE username = 'superadmin';

-- Success message
SELECT 'Database fix completed successfully! All required columns added and superadmin user created.' as message;
