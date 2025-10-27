# Fix RLS Policy Error

## 🚨 Error You Got

```
ERROR:  42883: operator does not exist: uuid = text
HINT:  No operator matches the given name and argument types. You might need to add explicit type casts.
```

## ✅ What This Means

The RLS policies were trying to compare UUID types with TEXT types, which PostgreSQL doesn't allow directly.

## 🔧 How to Fix It

### Option 1: Use the Fixed SQL File (Recommended)

1. Go to Supabase SQL Editor
2. Open the file `FIXED_VERIFICATION_TABLE.sql` from the repository
3. Copy the entire contents
4. Paste into Supabase SQL Editor
5. Click "Run"

**This file has:**
- ✅ Proper type casting (`auth.uid()::text`)
- ✅ EXISTS subqueries for admin checks
- ✅ All policies corrected

### Option 2: Manual Fix

If you already have the table created, just drop and recreate the policies:

```sql
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own documents" ON public.user_verification_documents;
DROP POLICY IF EXISTS "Users can insert their own documents" ON public.user_verification_documents;
DROP POLICY IF EXISTS "Admins can view all documents" ON public.user_verification_documents;
DROP POLICY IF EXISTS "Admins can update documents" ON public.user_verification_documents;

-- Create corrected policies
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

## 🔑 Key Changes

### Before (Wrong):
```sql
USING (auth.uid() = user_id OR auth.jwt() ->> 'role' IN ('admin', 'super_admin'));
```

### After (Correct):
```sql
USING (user_id = auth.uid()::text);
```

**Why?**
- `auth.uid()` returns UUID
- `user_id` is TEXT
- Need to cast UUID to TEXT: `auth.uid()::text`
- Use EXISTS subquery for admin checks instead of JWT parsing

## ✅ After Running the Fix

1. You should see: "Success. No rows returned"
2. The table is now ready to use
3. Restart Railway server
4. Test signup and document upload

## 📋 Next Steps

1. Run the fixed SQL
2. Restart Railway
3. Try signing up with document upload
4. It should work now! ✅

## 🆘 Still Getting Errors?

If you still see errors:

1. Check if the table already exists:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_name = 'user_verification_documents';
```

2. If it exists, drop it and recreate:
```sql
DROP TABLE IF EXISTS public.user_verification_documents CASCADE;
```

3. Then run `FIXED_VERIFICATION_TABLE.sql` again

## 💡 Key Points

- **Type casting is important** - Always cast UUID to TEXT when comparing
- **EXISTS is safer** - Use EXISTS subqueries instead of JWT parsing
- **Drop and recreate** - If policies fail, drop them and recreate

The fixed SQL file handles all of this correctly! 🚀

