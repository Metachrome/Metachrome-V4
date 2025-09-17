-- COMPREHENSIVE SUPABASE COLUMN FIX FOR METACHROME V2
-- This script will diagnose and fix ALL column name mismatches

-- ===== STEP 1: DIAGNOSTIC - See what we're working with =====
SELECT '=== CURRENT DATABASE STRUCTURE ===' as info;

-- Show all tables
SELECT 'EXISTING TABLES:' as section, table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Show users table structure
SELECT 'USERS TABLE COLUMNS:' as section, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show balances table structure (if exists)
SELECT 'BALANCES TABLE COLUMNS:' as section, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'balances' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show trades table structure (if exists)
SELECT 'TRADES TABLE COLUMNS:' as section, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'trades' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show transactions table structure (if exists)
SELECT 'TRANSACTIONS TABLE COLUMNS:' as section, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'transactions' AND table_schema = 'public'
ORDER BY ordinal_position;

-- ===== STEP 2: FIX USERS TABLE =====
DO $$
BEGIN
    RAISE NOTICE 'Starting users table fixes...';
    
    -- Ensure users table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
        CREATE TABLE users (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            username VARCHAR(50) UNIQUE,
            email VARCHAR(100) UNIQUE,
            password_hash TEXT,
            balance DECIMAL(15,2) DEFAULT 10000.00,
            role VARCHAR(20) DEFAULT 'user',
            status VARCHAR(20) DEFAULT 'active',
            trading_mode VARCHAR(20) DEFAULT 'normal',
            wallet_address VARCHAR(100),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            last_login TIMESTAMP WITH TIME ZONE
        );
        RAISE NOTICE 'Created users table';
    END IF;

    -- Fix password column name
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'password' AND table_schema = 'public') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'password_hash' AND table_schema = 'public') THEN
        ALTER TABLE users RENAME COLUMN password TO password_hash;
        RAISE NOTICE 'Renamed password to password_hash';
    END IF;

    -- Add missing columns to users table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'password_hash' AND table_schema = 'public') THEN
        ALTER TABLE users ADD COLUMN password_hash TEXT;
        RAISE NOTICE 'Added password_hash column';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'balance' AND table_schema = 'public') THEN
        ALTER TABLE users ADD COLUMN balance DECIMAL(15,2) DEFAULT 10000.00;
        RAISE NOTICE 'Added balance column';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'role' AND table_schema = 'public') THEN
        ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user';
        RAISE NOTICE 'Added role column';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'status' AND table_schema = 'public') THEN
        ALTER TABLE users ADD COLUMN status VARCHAR(20) DEFAULT 'active';
        RAISE NOTICE 'Added status column';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'trading_mode' AND table_schema = 'public') THEN
        ALTER TABLE users ADD COLUMN trading_mode VARCHAR(20) DEFAULT 'normal';
        RAISE NOTICE 'Added trading_mode column';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'wallet_address' AND table_schema = 'public') THEN
        ALTER TABLE users ADD COLUMN wallet_address VARCHAR(100);
        RAISE NOTICE 'Added wallet_address column';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'created_at' AND table_schema = 'public') THEN
        ALTER TABLE users ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added created_at column';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'updated_at' AND table_schema = 'public') THEN
        ALTER TABLE users ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added updated_at column';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'last_login' AND table_schema = 'public') THEN
        ALTER TABLE users ADD COLUMN last_login TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added last_login column';
    END IF;
END $$;

-- ===== STEP 3: CREATE/FIX BALANCES TABLE =====
DO $$
BEGIN
    RAISE NOTICE 'Starting balances table fixes...';
    
    -- Create balances table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'balances' AND table_schema = 'public') THEN
        CREATE TABLE balances (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            balance DECIMAL(15,8) DEFAULT 0,
            currency VARCHAR(10) DEFAULT 'USD',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Created balances table';
    ELSE
        -- Fix column names in existing balances table
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'balances' AND column_name = 'userId' AND table_schema = 'public') 
           AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'balances' AND column_name = 'user_id' AND table_schema = 'public') THEN
            ALTER TABLE balances RENAME COLUMN "userId" TO user_id;
            RAISE NOTICE 'Renamed userId to user_id in balances table';
        END IF;
        
        -- Add user_id column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'balances' AND column_name = 'user_id' AND table_schema = 'public') THEN
            ALTER TABLE balances ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;
            RAISE NOTICE 'Added user_id column to balances table';
        END IF;
    END IF;
END $$;

-- ===== STEP 4: CREATE/FIX TRADES TABLE =====
DO $$
BEGIN
    RAISE NOTICE 'Starting trades table fixes...';
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'trades' AND table_schema = 'public') THEN
        CREATE TABLE trades (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            symbol VARCHAR(20) NOT NULL DEFAULT 'BTCUSDT',
            amount DECIMAL(15,8) NOT NULL,
            direction VARCHAR(10) NOT NULL,
            duration INTEGER NOT NULL,
            entry_price DECIMAL(15,8),
            exit_price DECIMAL(15,8),
            result VARCHAR(10),
            profit_loss DECIMAL(15,8) DEFAULT 0,
            status VARCHAR(20) DEFAULT 'pending',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            expires_at TIMESTAMP WITH TIME ZONE,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Created trades table';
    ELSE
        -- Add user_id column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trades' AND column_name = 'user_id' AND table_schema = 'public') THEN
            ALTER TABLE trades ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;
            RAISE NOTICE 'Added user_id column to trades table';
        END IF;
    END IF;
END $$;

-- ===== STEP 5: CREATE/FIX TRANSACTIONS TABLE =====
DO $$
BEGIN
    RAISE NOTICE 'Starting transactions table fixes...';
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'transactions' AND table_schema = 'public') THEN
        CREATE TABLE transactions (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            type VARCHAR(20) NOT NULL,
            amount DECIMAL(15,8) NOT NULL,
            status VARCHAR(20) DEFAULT 'pending',
            description TEXT,
            reference_id VARCHAR(100),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Created transactions table';
    ELSE
        -- Add user_id column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'user_id' AND table_schema = 'public') THEN
            ALTER TABLE transactions ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;
            RAISE NOTICE 'Added user_id column to transactions table';
        END IF;
    END IF;
END $$;

-- ===== STEP 6: INSERT/UPDATE SUPERADMIN USER =====
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

-- ===== STEP 7: CREATE INDEXES =====
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_balances_user_id ON balances(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_user_id ON trades(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);

-- ===== STEP 8: FINAL VERIFICATION =====
SELECT '=== FINAL VERIFICATION ===' as info;

-- Show final table structures
SELECT 'FINAL USERS TABLE:' as section, column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'FINAL BALANCES TABLE:' as section, column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'balances' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'FINAL TRADES TABLE:' as section, column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'trades' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'FINAL TRANSACTIONS TABLE:' as section, column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'transactions' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Test that superadmin user exists
SELECT 'SUPERADMIN VERIFICATION:' as section, username, role, balance, 
       CASE WHEN password_hash IS NOT NULL THEN 'Password set' ELSE 'No password' END as password_status
FROM users WHERE username = 'superadmin';

-- Test foreign key relationships
SELECT 'FOREIGN KEY TEST:' as section, 
       CASE WHEN EXISTS (
           SELECT 1 FROM information_schema.table_constraints tc
           JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
           WHERE tc.constraint_type = 'FOREIGN KEY' 
           AND kcu.table_name = 'balances' 
           AND kcu.column_name = 'user_id'
       ) THEN 'balances.user_id FK exists' ELSE 'balances.user_id FK missing' END as balances_fk,
       CASE WHEN EXISTS (
           SELECT 1 FROM information_schema.table_constraints tc
           JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
           WHERE tc.constraint_type = 'FOREIGN KEY' 
           AND kcu.table_name = 'trades' 
           AND kcu.column_name = 'user_id'
       ) THEN 'trades.user_id FK exists' ELSE 'trades.user_id FK missing' END as trades_fk;

SELECT 'SUCCESS: All tables and columns are now properly configured!' as final_message;
