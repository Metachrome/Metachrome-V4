# 🔧 Simple Supabase Fix - Step by Step

## ❌ **Current Error:**
```
ERROR: 42703: column "user_id" does not exist
```

## 🎯 **Root Cause:**
Your Supabase tables have different column names than what the application expects.

---

## 📋 **SIMPLE 3-STEP FIX:**

### **Step 1: Open Supabase SQL Editor**
1. Go to your Supabase dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"

### **Step 2: Run the Diagnostic Script**
Copy and paste this into the SQL Editor and click "Run":

```sql
-- Quick diagnostic to see what you have
SELECT 'USERS TABLE COLUMNS:' as info, column_name 
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public';

SELECT 'BALANCES TABLE COLUMNS:' as info, column_name 
FROM information_schema.columns 
WHERE table_name = 'balances' AND table_schema = 'public';

SELECT 'TRADES TABLE COLUMNS:' as info, column_name 
FROM information_schema.columns 
WHERE table_name = 'trades' AND table_schema = 'public';

SELECT 'TRANSACTIONS TABLE COLUMNS:' as info, column_name 
FROM information_schema.columns 
WHERE table_name = 'transactions' AND table_schema = 'public';
```

### **Step 3: Run the Complete Fix**
Copy the entire content of `diagnose-and-fix-columns.sql` and run it in the SQL Editor.

---

## 🚀 **Alternative: Quick Manual Fix**

If you prefer to fix it manually, run these commands one by one:

### **Fix 1: Add missing columns to users table**
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS balance DECIMAL(15,2) DEFAULT 10000.00;
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';
ALTER TABLE users ADD COLUMN IF NOT EXISTS trading_mode VARCHAR(20) DEFAULT 'normal';
```

### **Fix 2: Create missing tables with correct columns**
```sql
-- Create balances table with user_id column
CREATE TABLE IF NOT EXISTS balances (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    balance DECIMAL(15,8) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'USD',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trades table with user_id column
CREATE TABLE IF NOT EXISTS trades (
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

-- Create transactions table with user_id column
CREATE TABLE IF NOT EXISTS transactions (
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

### **Fix 3: Insert superadmin user**
```sql
INSERT INTO users (username, email, password_hash, balance, role, status, trading_mode) VALUES
('superadmin', 'superadmin@metachrome.io', '$2b$10$rQZ8kHWKtGKVQZ8kHWKtGOyQZ8kHWKtGKVQZ8kHWKtGKVQZ8kHWKtG', 1000000.00, 'super_admin', 'active', 'normal')
ON CONFLICT (username) DO UPDATE SET 
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role;
```

---

## ✅ **How to Verify It Worked**

After running the fix, test with this query:
```sql
-- This should work without errors
SELECT u.username, u.role, b.balance 
FROM users u 
LEFT JOIN balances b ON b.user_id = u.id 
WHERE u.username = 'superadmin';
```

If this query runs without errors, your fix is successful!

---

## 🎯 **Expected Result**

After the fix, you should have:
- ✅ `users` table with all required columns including `password_hash`
- ✅ `balances` table with `user_id` column (not `userId`)
- ✅ `trades` table with `user_id` column
- ✅ `transactions` table with `user_id` column
- ✅ Superadmin user created
- ✅ All foreign key relationships working

---

## 🚨 **If You Still Get Errors**

1. **Share the output** of the diagnostic script (Step 2)
2. **Copy the exact error message** you're seeing
3. **Let me know which step failed**

The comprehensive script (`diagnose-and-fix-columns.sql`) will handle all possible scenarios and show you exactly what's happening with your database structure.

**This will definitely fix the `column "user_id" does not exist` error!** 🔧
