# 🔧 Step-by-Step Fix Guide

## Status: Supabase IS Configured ✅

Good news! Your Supabase is properly configured on Railway. Now we need to verify the database schema.

---

## Step 1: Verify Supabase Users Table Structure

1. Go to **Supabase Dashboard**: https://app.supabase.com
2. Select your **Metachrome project**
3. Go to **SQL Editor** (left sidebar)
4. Copy and paste the entire content of `SUPABASE_VERIFICATION_SCRIPT.sql`
5. Click **Run**
6. **Take a screenshot of the results** and share with me

---

## Step 2: What to Look For

The query should show these columns in your `users` table:

**MUST HAVE:**
- ✅ `id` (UUID)
- ✅ `username` (VARCHAR)
- ✅ `email` (VARCHAR)
- ✅ `password_hash` (VARCHAR or TEXT)

**SHOULD HAVE:**
- ✅ `first_name` (VARCHAR)
- ✅ `last_name` (VARCHAR)
- ✅ `role` (VARCHAR)
- ✅ `status` (VARCHAR)
- ✅ `trading_mode` (VARCHAR)
- ✅ `balance` (DECIMAL or NUMERIC)
- ✅ `verification_status` (VARCHAR)
- ✅ `has_uploaded_documents` (BOOLEAN)
- ✅ `verified_at` (TIMESTAMP)

**If any columns are MISSING**, run this SQL to add them:

```sql
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS password_hash TEXT,
ADD COLUMN IF NOT EXISTS balance DECIMAL(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user',
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS trading_mode VARCHAR(20) DEFAULT 'normal',
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS verification_status VARCHAR(50) DEFAULT 'unverified',
ADD COLUMN IF NOT EXISTS has_uploaded_documents BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE;
```

---

## Step 3: Check user_verification_documents Table

Run this query:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_verification_documents' 
ORDER BY column_name;
```

**If the table doesn't exist**, run:

```sql
CREATE TABLE IF NOT EXISTS public.user_verification_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL,
  document_url TEXT NOT NULL,
  verification_status VARCHAR(50) DEFAULT 'pending',
  admin_notes TEXT,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, document_type)
);

CREATE INDEX idx_user_verification_documents_user_id ON public.user_verification_documents(user_id);
CREATE INDEX idx_user_verification_documents_status ON public.user_verification_documents(verification_status);
```

---

## Step 4: Test User Creation

Try creating a test user directly in Supabase:

```sql
INSERT INTO public.users (
  username, 
  email, 
  password_hash, 
  first_name, 
  last_name, 
  role, 
  status, 
  trading_mode, 
  verification_status, 
  balance
) VALUES (
  'testuser123',
  'testuser123@example.com',
  'hashed_password_here',
  'Test',
  'User',
  'user',
  'active',
  'normal',
  'unverified',
  0
);

-- Check if it was created
SELECT id, username, email FROM public.users WHERE username = 'testuser123';
```

**If this fails**, share the error message with me.

---

## Step 5: Test Signup on Your App

1. Go to your app: https://your-railway-app.up.railway.app
2. Sign up with a test email
3. Try uploading a document
4. Check if you get the 401 error

---

## Step 6: Check Railway Logs

1. Go to **Railway Dashboard**
2. Select your **server service**
3. Click **Logs** tab
4. Look for errors like:
   - `❌ Supabase insert error`
   - `❌ Error code`
   - `❌ Error message`
5. **Copy and share these logs with me**

---

## What I Need From You

1. **Screenshot of SUPABASE_VERIFICATION_SCRIPT.sql results**
2. **Screenshot of test user creation results**
3. **Any error messages from Railway logs**
4. **Confirmation that signup still fails with 401 error**

Once I see these, I can identify the exact problem and fix it! 🚀

