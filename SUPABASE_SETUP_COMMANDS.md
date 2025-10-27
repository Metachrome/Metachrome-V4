# Supabase Setup Commands

## 🚀 Quick Setup

If you haven't run the SQL migrations yet, follow these steps:

### Step 1: Go to Supabase SQL Editor
1. Open https://supabase.com
2. Log in to your account
3. Select your project
4. Go to **SQL Editor** (left sidebar)

### Step 2: Run First Migration
Copy and paste this entire SQL block into the SQL Editor and click "Run":

```sql
-- Add verification columns to users table if they don't exist
ALTER TABLE users
ADD COLUMN IF NOT EXISTS verification_status VARCHAR(50) DEFAULT 'unverified',
ADD COLUMN IF NOT EXISTS has_uploaded_documents BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_verification_status ON users(verification_status);
```

**Expected result:** "Success. No rows returned"

### Step 3: Run Second Migration
Copy and paste this entire SQL block into the SQL Editor and click "Run":

```sql
-- Create user_verification_documents table
CREATE TABLE IF NOT EXISTS public.user_verification_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL,
  document_url TEXT NOT NULL,
  verification_status VARCHAR(50) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_verification_documents_user_id ON public.user_verification_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_user_verification_documents_status ON public.user_verification_documents(verification_status);
CREATE INDEX IF NOT EXISTS idx_user_verification_documents_created_at ON public.user_verification_documents(created_at);

-- Enable RLS
ALTER TABLE public.user_verification_documents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own documents" ON public.user_verification_documents;
DROP POLICY IF EXISTS "Users can insert their own documents" ON public.user_verification_documents;
DROP POLICY IF EXISTS "Admins can view all documents" ON public.user_verification_documents;
DROP POLICY IF EXISTS "Admins can update documents" ON public.user_verification_documents;

-- Create RLS policies
CREATE POLICY "Users can view their own documents" ON public.user_verification_documents
  FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert their own documents" ON public.user_verification_documents
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Admins can view all documents" ON public.user_verification_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()::text AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update documents" ON public.user_verification_documents
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()::text AND role IN ('admin', 'super_admin')
    )
  );
```

**Expected result:** "Success. No rows returned"

### Step 4: Verify Setup
Run this query to verify everything is set up correctly:

```sql
-- Check if columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('verification_status', 'has_uploaded_documents', 'verified_at')
ORDER BY column_name;

-- Check if table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'user_verification_documents';
```

**Expected result:** Should show 3 columns and 1 table

## ✅ Verification Checklist

After running the migrations, verify:

- [ ] `verification_status` column exists in `users` table
- [ ] `has_uploaded_documents` column exists in `users` table
- [ ] `verified_at` column exists in `users` table
- [ ] `user_verification_documents` table exists
- [ ] Indexes are created
- [ ] RLS policies are set up

## 🔧 If Something Goes Wrong

### Error: "column already exists"
This is fine! It means the column was already created. Just continue to the next step.

### Error: "table already exists"
This is fine! It means the table was already created. Just continue to the next step.

### Error: "policy already exists"
This is fine! The SQL includes `DROP POLICY IF EXISTS` to handle this. Just continue.

### Error: "permission denied"
This means your Supabase credentials don't have permission. Make sure you're using the **Service Role Key**, not the **Anon Key**.

## 📋 After Setup

Once the migrations are complete:

1. **Restart Railway server** - Go to Railway dashboard and restart the server
2. **Test signup** - Try signing up with a new user
3. **Test document upload** - Try uploading a verification document
4. **Check admin dashboard** - New user should appear with "Pending" verification status

## 🆘 Still Having Issues?

If you still see the "Invalid authentication" error after running the migrations:

1. Check Railway logs for error messages
2. Make sure `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set on Railway
3. Make sure the values are correct (not truncated)
4. Restart the Railway server

## 📞 Need Help?

If you get stuck:
1. Take a screenshot of the error
2. Copy the exact error message
3. Tell me what you see
4. I'll help you fix it

The most important thing is to **run both SQL migrations** in Supabase before testing again.

