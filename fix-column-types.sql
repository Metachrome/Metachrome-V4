-- FIX COLUMN TYPE MISMATCH FOR METACHROME V2
-- This script handles the UUID vs TEXT type mismatch

-- ===== STEP 1: DIAGNOSTIC - Check current data types =====
SELECT '=== CHECKING COLUMN TYPES ===' as info;

-- Check users.id column type
SELECT 'USERS ID COLUMN TYPE:' as section, 
       column_name, data_type, character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'id' AND table_schema = 'public';

-- Check existing foreign key columns
SELECT 'EXISTING FOREIGN KEY COLUMNS:' as section,
       table_name, column_name, data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND (column_name = 'user_id' OR column_name = 'userId')
ORDER BY table_name;

-- ===== STEP 2: FIX BASED ON USERS.ID TYPE =====
DO $$
DECLARE
    users_id_type text;
BEGIN
    -- Get the actual data type of users.id
    SELECT data_type INTO users_id_type
    FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'id' AND table_schema = 'public';
    
    RAISE NOTICE 'Users.id column type is: %', users_id_type;
    
    -- ===== FIX USERS TABLE FIRST =====
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

    -- ===== FIX BALANCES TABLE =====
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'balances' AND table_schema = 'public') THEN
        -- Create balances table with matching data type
        IF users_id_type = 'uuid' THEN
            CREATE TABLE balances (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                balance DECIMAL(15,8) DEFAULT 0,
                currency VARCHAR(10) DEFAULT 'USD',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        ELSE
            CREATE TABLE balances (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
                balance DECIMAL(15,8) DEFAULT 0,
                currency VARCHAR(10) DEFAULT 'USD',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        END IF;
        RAISE NOTICE 'Created balances table with % user_id type', users_id_type;
    ELSE
        -- Fix existing balances table
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'balances' AND column_name = 'userId' AND table_schema = 'public') 
           AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'balances' AND column_name = 'user_id' AND table_schema = 'public') THEN
            ALTER TABLE balances RENAME COLUMN "userId" TO user_id;
            RAISE NOTICE 'Renamed userId to user_id in balances table';
        END IF;
        
        -- Add user_id column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'balances' AND column_name = 'user_id' AND table_schema = 'public') THEN
            IF users_id_type = 'uuid' THEN
                ALTER TABLE balances ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;
            ELSE
                ALTER TABLE balances ADD COLUMN user_id TEXT REFERENCES users(id) ON DELETE CASCADE;
            END IF;
            RAISE NOTICE 'Added user_id column to balances table with % type', users_id_type;
        END IF;
    END IF;

    -- ===== FIX TRADES TABLE =====
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'trades' AND table_schema = 'public') THEN
        -- Create trades table with matching data type
        IF users_id_type = 'uuid' THEN
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
        ELSE
            CREATE TABLE trades (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
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
        END IF;
        RAISE NOTICE 'Created trades table with % user_id type', users_id_type;
    ELSE
        -- Add user_id column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trades' AND column_name = 'user_id' AND table_schema = 'public') THEN
            IF users_id_type = 'uuid' THEN
                ALTER TABLE trades ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;
            ELSE
                ALTER TABLE trades ADD COLUMN user_id TEXT REFERENCES users(id) ON DELETE CASCADE;
            END IF;
            RAISE NOTICE 'Added user_id column to trades table with % type', users_id_type;
        END IF;
    END IF;

    -- ===== FIX TRANSACTIONS TABLE =====
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'transactions' AND table_schema = 'public') THEN
        -- Create transactions table with matching data type
        IF users_id_type = 'uuid' THEN
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
        ELSE
            CREATE TABLE transactions (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
                type VARCHAR(20) NOT NULL,
                amount DECIMAL(15,8) NOT NULL,
                status VARCHAR(20) DEFAULT 'pending',
                description TEXT,
                reference_id VARCHAR(100),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        END IF;
        RAISE NOTICE 'Created transactions table with % user_id type', users_id_type;
    ELSE
        -- Add user_id column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'user_id' AND table_schema = 'public') THEN
            IF users_id_type = 'uuid' THEN
                ALTER TABLE transactions ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;
            ELSE
                ALTER TABLE transactions ADD COLUMN user_id TEXT REFERENCES users(id) ON DELETE CASCADE;
            END IF;
            RAISE NOTICE 'Added user_id column to transactions table with % type', users_id_type;
        END IF;
    END IF;

END $$;

-- ===== STEP 3: INSERT/UPDATE SUPERADMIN USER =====
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

-- ===== STEP 4: CREATE INDEXES =====
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_balances_user_id ON balances(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_user_id ON trades(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);

-- ===== STEP 5: FINAL VERIFICATION =====
SELECT '=== FINAL VERIFICATION ===' as info;

-- Show final column types
SELECT 'FINAL COLUMN TYPES:' as section,
       table_name, column_name, data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'balances', 'trades', 'transactions')
AND column_name IN ('id', 'user_id')
ORDER BY table_name, column_name;

-- Test foreign key relationships
SELECT 'FOREIGN KEY TEST:' as section,
       tc.table_name, 
       kcu.column_name,
       ccu.table_name AS foreign_table_name,
       ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public'
  AND kcu.column_name = 'user_id';

-- Verify superadmin user
SELECT 'SUPERADMIN USER:' as section, username, role, balance,
       CASE WHEN password_hash IS NOT NULL THEN 'Password set' ELSE 'No password' END as password_status
FROM users WHERE username = 'superadmin';

SELECT 'SUCCESS: Column type mismatch fixed! All foreign keys should work now.' as final_message;
