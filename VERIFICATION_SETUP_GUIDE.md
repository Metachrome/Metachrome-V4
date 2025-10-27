# METACHROME V2 - Document Verification Setup Guide

## Problem Summary
New users cannot upload verification documents during signup because:
1. The Supabase database is missing verification columns in the `users` table
2. The `user_verification_documents` table doesn't exist
3. New users are not being properly saved to Supabase

## Solution - Complete Setup

### Step 1: Add Verification Columns to Users Table

1. Go to your Supabase dashboard: https://app.supabase.com
2. Select your METACHROME project
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the contents of `ADD_VERIFICATION_COLUMNS_TO_USERS.sql`
6. Click **Run** (or press Ctrl+Enter)

**Expected output:**
```
Verification columns added successfully!
```

### Step 2: Create User Verification Documents Table

1. In the same SQL Editor, click **New Query**
2. Copy and paste the contents of `CREATE_VERIFICATION_DOCUMENTS_TABLE.sql`
3. Click **Run** (or press Ctrl+Enter)

**Expected output:**
```
user_verification_documents table created successfully!
```

### Step 3: Verify the Setup

Run this query to verify everything is set up correctly:

```sql
-- Check users table columns
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'users' AND column_name IN ('verification_status', 'has_uploaded_documents', 'verified_at')
ORDER BY column_name;

-- Check user_verification_documents table exists
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'user_verification_documents';
```

You should see:
- 3 columns in the users table (verification_status, has_uploaded_documents, verified_at)
- 1 table: user_verification_documents

## What Was Fixed

### 1. User Registration (createUser function)
- Now properly saves all user fields to Supabase including:
  - `verification_status` (default: 'unverified')
  - `has_uploaded_documents` (default: false)
  - `balance`, `status`, `trading_mode`, `referral_code`, etc.

### 2. Document Upload Authentication
- Enhanced token decoding with retry logic
- Better error handling and fallback to local storage
- Improved Supabase lookup for newly created users

### 3. Admin Dashboard
- New users now appear immediately in the superadmin dashboard
- Real-time sync via WebSocket broadcasts

## Testing the Fix

### Test 1: Sign Up as New User
1. Go to signup page
2. Fill in all required fields
3. Upload an ID document
4. Click "Sign Up"
5. You should see success message

### Test 2: Check Admin Dashboard
1. Log in as superadmin
2. Go to Users page
3. You should see the newly created user in the list

### Test 3: Check Verification Status
1. Log in as the new user
2. Go to Profile > Verification
3. You should see "Pending" status
4. Document should be listed

## Troubleshooting

### If upload still fails:
- Check the Railway logs for detailed error messages
- Make sure the Supabase service role key has proper permissions
- Verify the user_id format matches (should be TEXT, not UUID)

### If new users don't appear in admin dashboard:
- Refresh the admin dashboard page
- Check that the user was created in Supabase (SQL query: `SELECT * FROM users ORDER BY created_at DESC LIMIT 1;`)
- Check server logs for any errors during user creation

### If verification columns are missing:
- Run the SQL scripts again
- Check for any SQL errors in the Supabase dashboard
- Verify you're running the queries in the correct database

## Files Included

- `ADD_VERIFICATION_COLUMNS_TO_USERS.sql` - Adds verification columns to users table
- `CREATE_VERIFICATION_DOCUMENTS_TABLE.sql` - Creates the verification documents table
- `VERIFICATION_SETUP_GUIDE.md` - This guide

## Next Steps

After running these SQL scripts:
1. ✅ Document upload feature will work
2. ✅ Users can upload verification documents during signup
3. ✅ Admins can review and approve/reject documents
4. ✅ User verification status will update automatically
5. ✅ New users will appear in admin dashboard immediately

