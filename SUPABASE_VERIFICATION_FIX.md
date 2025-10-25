# Supabase Verification Documents Setup

## Problem
The document upload feature is failing with a 500 error because the Supabase database is missing:
1. The `user_verification_documents` table
2. The `verification_status`, `has_uploaded_documents`, and `verified_at` columns in the `users` table

## Solution

### Step 1: Add Verification Columns to Users Table

1. Go to your Supabase dashboard: https://app.supabase.com
2. Select your project
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

### Step 4: Test the Upload Feature

1. Wait 2-3 minutes for Railway to redeploy with the latest code
2. Go to https://www.metachrome.io/profile?tab=verification
3. Try uploading a document again
4. It should now work! ✅

## Troubleshooting

### If you get "relation does not exist" error:
- Make sure you ran both SQL scripts
- Check that the table names are exactly: `user_verification_documents` (with underscores)

### If you get "column does not exist" error:
- Make sure you ran the `ADD_VERIFICATION_COLUMNS_TO_USERS.sql` script first
- Verify the columns were added by running the verification query above

### If upload still fails:
- Check the Railway logs for detailed error messages
- Make sure the Supabase service role key has proper permissions
- Verify the user_id format matches (should be TEXT, not UUID)

## Files Included

- `ADD_VERIFICATION_COLUMNS_TO_USERS.sql` - Adds verification columns to users table
- `CREATE_VERIFICATION_DOCUMENTS_TABLE.sql` - Creates the verification documents table
- `SUPABASE_VERIFICATION_FIX.md` - This guide

## What These Changes Do

### Users Table Changes
- `verification_status` - Tracks if user is 'unverified', 'pending', 'verified', or 'rejected'
- `has_uploaded_documents` - Boolean flag indicating if user has uploaded any documents
- `verified_at` - Timestamp of when user was verified

### New Table: user_verification_documents
- Stores all uploaded verification documents
- Links documents to users via `user_id`
- Tracks document type (id_card, passport, etc.)
- Stores document URL and verification status
- Includes admin notes and verification timestamp
- Has proper indexes for performance
- Includes RLS policies for security

## Next Steps

After running these SQL scripts:
1. The document upload feature will work
2. Users can upload verification documents
3. Admins can review and approve/reject documents
4. User verification status will update automatically

