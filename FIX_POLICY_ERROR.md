# Fix for Policy Already Exists Error

## Error Message
```
ERROR: 42710: policy "Users can view their own documents" for table "user_verification_documents" already exists
```

## What This Means
The `user_verification_documents` table was partially created before, and the RLS policies already exist. The updated SQL script now handles this gracefully.

## Solution

### Option 1: Use Updated SQL Script (RECOMMENDED)
The `CREATE_VERIFICATION_DOCUMENTS_TABLE.sql` file has been updated to:
1. Drop existing policies first (if they exist)
2. Then recreate them

**Steps:**
1. Go to Supabase SQL Editor
2. Click **New Query**
3. Copy and paste the updated `CREATE_VERIFICATION_DOCUMENTS_TABLE.sql`
4. Click **Run**

This will now work without errors!

### Option 2: Manual Fix (If you prefer)
If you want to manually fix it:

```sql
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own documents" ON public.user_verification_documents;
DROP POLICY IF EXISTS "Users can insert their own documents" ON public.user_verification_documents;
DROP POLICY IF EXISTS "Admins can view all documents" ON public.user_verification_documents;
DROP POLICY IF EXISTS "Admins can update documents" ON public.user_verification_documents;

-- Recreate policies
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

## Verification

After running the fix, verify everything is set up correctly:

```sql
-- Check if table exists
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'user_verification_documents';

-- Check if policies exist
SELECT policyname FROM pg_policies 
WHERE tablename = 'user_verification_documents';

-- Should show 4 policies:
-- - Users can view their own documents
-- - Users can insert their own documents
-- - Admins can view all documents
-- - Admins can update documents
```

## Next Steps

After fixing the policy error:

1. ✅ Verify the table and policies are set up correctly
2. ✅ Run `ADD_VERIFICATION_COLUMNS_TO_USERS.sql` if you haven't already
3. ✅ Deploy the updated `working-server.js`
4. ✅ Test signup with document upload

## Status

✅ **FIXED** - The updated SQL script now handles existing policies gracefully.

You can now run the updated `CREATE_VERIFICATION_DOCUMENTS_TABLE.sql` without errors!

