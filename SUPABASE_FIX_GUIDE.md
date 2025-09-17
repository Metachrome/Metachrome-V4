# 🔧 Supabase Database Fix Guide for METACHROME V2

## ❌ **Error Encountered:**
```
ERROR: 42703: column "user_id" does not exist
ERROR: 42703: column "password_hash" does not exist
```

## 🔍 **Root Cause:**
Your Supabase database has a different table structure than what the application expects. This is common when using different schema files or when tables were created with different column names.

## 📋 **Step-by-Step Fix Process:**

### **Step 1: Diagnose Current Structure**
Run this in your Supabase SQL Editor to see what you currently have:

```sql
-- Check what tables exist
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check users table structure
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public';

-- Check balances table structure  
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'balances' AND table_schema = 'public';
```

### **Step 2: Apply the Appropriate Fix**

#### **Option A: If you have existing tables with wrong column names**
```sql
-- Fix users table
ALTER TABLE users RENAME COLUMN password TO password_hash;

-- Fix balances table (if it has userId instead of user_id)
ALTER TABLE balances RENAME COLUMN "userId" TO user_id;

-- Add missing columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS balance DECIMAL(15,2) DEFAULT 10000.00;
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';
ALTER TABLE users ADD COLUMN IF NOT EXISTS trading_mode VARCHAR(20) DEFAULT 'normal';
```

#### **Option B: If you need to create tables from scratch**
```sql
-- Drop existing tables if they have wrong structure
DROP TABLE IF EXISTS balances CASCADE;
DROP TABLE IF EXISTS trades CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table with correct structure
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
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

-- Create balances table
CREATE TABLE balances (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    balance DECIMAL(15,8) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'USD',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trades table
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

-- Create transactions table
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
```

### **Step 3: Insert Default Data**
```sql
-- Insert superadmin user
INSERT INTO users (username, email, password_hash, balance, role, status, trading_mode) VALUES
('superadmin', 'superadmin@metachrome.io', '$2b$10$rQZ8kHWKtGKVQZ8kHWKtGOyQZ8kHWKtGKVQZ8kHWKtGKVQZ8kHWKtG', 1000000.00, 'super_admin', 'active', 'normal')
ON CONFLICT (username) DO UPDATE SET 
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role;
```

### **Step 4: Verify the Fix**
```sql
-- Check that all tables exist with correct columns
SELECT 
    table_name,
    string_agg(column_name, ', ' ORDER BY ordinal_position) as columns
FROM information_schema.columns 
WHERE table_schema = 'public' 
GROUP BY table_name
ORDER BY table_name;

-- Test that superadmin user exists
SELECT username, role FROM users WHERE username = 'superadmin';
```

## 🚀 **Quick Fix Script**
If you want to run everything at once, use the `fix-supabase-complete.sql` file:

1. Go to your Supabase dashboard
2. Open SQL Editor
3. Copy and paste the entire `fix-supabase-complete.sql` content
4. Run the script
5. Check for any errors and fix them individually

## ✅ **Expected Result**
After running the fix, you should have:
- ✅ `users` table with `password_hash` column
- ✅ `balances` table with `user_id` column (not `userId`)
- ✅ `trades` table with `user_id` column
- ✅ `transactions` table with `user_id` column
- ✅ Superadmin user created with correct credentials
- ✅ All foreign key relationships working

## 🔐 **Test the Fix**
After applying the fix, test with:
```sql
-- This should work without errors
SELECT u.username, u.role, b.balance 
FROM users u 
LEFT JOIN balances b ON b.user_id = u.id 
WHERE u.username = 'superadmin';
```

## 📞 **If You Still Get Errors**
1. Run the diagnostic script (`check-supabase-tables.sql`) first
2. Share the output so we can see your exact table structure
3. Apply the specific fix for your situation

The key is making sure your database column names match what the application code expects!
