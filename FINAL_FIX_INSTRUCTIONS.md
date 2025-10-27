# Final Fix Instructions - Document Upload Issue

## 🎯 What You Need to Do

You got an RLS policy error when trying to create the verification table. Here's how to fix it:

## ✅ Step 1: Use the Fixed SQL File

1. Go to **Supabase Dashboard**
2. Go to **SQL Editor**
3. Open the file `FIXED_VERIFICATION_TABLE.sql` from the repository
4. Copy the entire contents
5. Paste into Supabase SQL Editor
6. Click **"Run"**

**Expected result:** "Success. No rows returned"

## ✅ Step 2: Verify the Table Was Created

Run this query to verify:

```sql
SELECT table_name FROM information_schema.tables
WHERE table_name = 'user_verification_documents';
```

**Expected result:** Should return one row with `user_verification_documents`

## ✅ Step 3: Restart Railway Server

1. Go to **Railway Dashboard**
2. Select your project
3. Click **"Restart"** button
4. Wait for server to restart

## ✅ Step 4: Test the Fix

1. Go to your app
2. Sign up as a new user
3. Try uploading a verification document
4. It should work now! ✅

## 🔍 What Was Wrong

The original SQL had this error:
```
ERROR:  42883: operator does not exist: uuid = text
```

**Why?** The RLS policies were comparing UUID types with TEXT types directly, which PostgreSQL doesn't allow.

## ✅ What We Fixed

Changed from:
```sql
USING (auth.uid() = user_id OR auth.jwt() ->> 'role' IN ('admin', 'super_admin'));
```

To:
```sql
USING (user_id = auth.uid()::text);
```

**Key changes:**
- ✅ Cast UUID to TEXT: `auth.uid()::text`
- ✅ Use EXISTS subqueries for admin checks
- ✅ Proper type handling throughout

## 📋 Files You Need

1. **FIXED_VERIFICATION_TABLE.sql** - The corrected SQL to run
2. **FIX_RLS_ERROR.md** - Detailed explanation of the error
3. **SUPABASE_SETUP_COMMANDS.md** - Updated with correct SQL

## 🚀 After the Fix

Once you run the fixed SQL and restart Railway:

- ✅ New users will be saved to Supabase
- ✅ Document uploads will work
- ✅ New users will appear in admin dashboard
- ✅ Verification status will show "Pending"

## 🆘 If You Still Have Issues

1. **Check if table exists:**
```sql
SELECT table_name FROM information_schema.tables
WHERE table_name = 'user_verification_documents';
```

2. **If it doesn't exist, run FIXED_VERIFICATION_TABLE.sql**

3. **If it exists but policies failed, drop and recreate:**
```sql
DROP TABLE IF EXISTS public.user_verification_documents CASCADE;
```
Then run FIXED_VERIFICATION_TABLE.sql again

4. **Restart Railway server**

5. **Test again**

## 💡 Key Points

- **The code is fixed** - All Supabase checks are correct
- **The SQL is fixed** - RLS policies use proper type casting
- **Just run the fixed SQL** - Copy from FIXED_VERIFICATION_TABLE.sql
- **Restart Railway** - Server needs to restart after SQL changes
- **Test** - Try signup and document upload

## 📞 Need Help?

If you get stuck:
1. Check the error message
2. Look at FIX_RLS_ERROR.md for solutions
3. Make sure you're running FIXED_VERIFICATION_TABLE.sql
4. Restart Railway after running SQL

**The most important thing is to run FIXED_VERIFICATION_TABLE.sql in Supabase!**

Let me know if it works! 🎉

