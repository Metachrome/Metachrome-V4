# Diagnostic Checklist - Document Upload Issue

## 🔍 What We Need to Check

### 1. **Supabase Configuration on Railway**
- [ ] Check if `SUPABASE_URL` environment variable is set on Railway
- [ ] Check if `SUPABASE_SERVICE_ROLE_KEY` environment variable is set on Railway
- [ ] Verify the values are correct (not truncated or corrupted)

**How to check:**
1. Go to Railway dashboard
2. Select your project
3. Go to Variables tab
4. Look for `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
5. Verify they have values

### 2. **SQL Migrations Status**
- [ ] Check if `users` table has `verification_status` column
- [ ] Check if `users` table has `has_uploaded_documents` column
- [ ] Check if `user_verification_documents` table exists
- [ ] Check if RLS policies are set up correctly

**How to check:**
1. Go to Supabase dashboard
2. Go to SQL Editor
3. Run this query:
```sql
-- Check users table columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;
```

4. Run this query:
```sql
-- Check if user_verification_documents table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'user_verification_documents';
```

### 3. **Server Logs on Railway**
- [ ] Check if server is logging "✅ Supabase configured and ready"
- [ ] Check if server is logging "📝 Inserting user to Supabase with data"
- [ ] Check if there are any Supabase errors in the logs

**How to check:**
1. Go to Railway dashboard
2. Select your project
3. Go to Logs tab
4. Look for the messages above
5. If you see errors, note them down

### 4. **Test User Creation**
- [ ] Try signing up with a new user
- [ ] Check Railway logs for:
  - "🔍 createUser called - isSupabaseConfigured: true"
  - "📝 Inserting user to Supabase with data"
  - "✅ User created in Supabase"
  - OR "❌ Supabase insert error" (if there's an error)

### 5. **Test Document Upload**
- [ ] After signup, try uploading a document
- [ ] Check Railway logs for:
  - "📄 Verification document upload request"
  - "📄 Getting user from token..."
  - "📄 User from token: {id, username}" (should find the user)
  - OR "❌ Invalid authentication" (if user not found)

## 🚨 Most Likely Issues

### Issue 1: SQL Migrations Not Run
**Symptoms:**
- Server logs show "❌ Supabase insert error: column 'verification_status' does not exist"
- OR "❌ Supabase insert error: relation 'user_verification_documents' does not exist"

**Fix:**
1. Go to Supabase SQL Editor
2. Run `ADD_VERIFICATION_COLUMNS_TO_USERS.sql`
3. Run `CREATE_VERIFICATION_DOCUMENTS_TABLE.sql`

### Issue 2: Environment Variables Not Set
**Symptoms:**
- Server logs show "⚠️ Supabase not configured - using file storage fallback"
- OR "isSupabaseConfigured set to: false"

**Fix:**
1. Go to Railway dashboard
2. Add `SUPABASE_URL` environment variable
3. Add `SUPABASE_SERVICE_ROLE_KEY` environment variable
4. Restart the server

### Issue 3: Supabase Credentials Wrong
**Symptoms:**
- Server logs show "❌ Error initializing Supabase: ..."
- OR "❌ Supabase insert error: 401 Unauthorized"

**Fix:**
1. Go to Supabase dashboard
2. Copy the correct `SUPABASE_URL` (should be like `https://xxxxx.supabase.co`)
3. Copy the correct `SUPABASE_SERVICE_ROLE_KEY` (should be a long string starting with `eyJ...`)
4. Update Railway environment variables
5. Restart the server

## 📋 Action Plan

1. **Check Railway logs** - Look for the diagnostic messages
2. **Identify the issue** - Use the symptoms above
3. **Apply the fix** - Follow the fix instructions
4. **Test again** - Try signup and document upload
5. **Report back** - Tell me what you found in the logs

## 🔧 Quick Commands

### Check Supabase table structure:
```sql
-- Check users table
\d users

-- Check user_verification_documents table
\d user_verification_documents

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'user_verification_documents';
```

### Check if user was created:
```sql
SELECT id, username, email, verification_status, has_uploaded_documents 
FROM users 
WHERE username = 'YOUR_TEST_USERNAME' 
LIMIT 1;
```

### Check if document was uploaded:
```sql
SELECT * FROM user_verification_documents 
WHERE user_id = 'USER_ID_HERE' 
LIMIT 1;
```

## 📞 Next Steps

1. Check the Railway logs
2. Look for the diagnostic messages
3. Tell me what you see
4. I'll help you fix the specific issue

**The key is to find out:**
- Is Supabase configured? (look for "✅ Supabase configured and ready")
- Is the user being created in Supabase? (look for "✅ User created in Supabase")
- Is the document upload finding the user? (look for "📄 User from token: {id, username}")

