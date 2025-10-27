-- QUICK FIX for Policy Already Exists Error
-- Run this if you get: ERROR: 42710: policy "..." already exists
-- This script drops and recreates all policies

-- Step 1: Drop existing policies (if they exist)
DROP POLICY IF EXISTS "Users can view their own documents" ON public.user_verification_documents;
DROP POLICY IF EXISTS "Users can insert their own documents" ON public.user_verification_documents;
DROP POLICY IF EXISTS "Admins can view all documents" ON public.user_verification_documents;
DROP POLICY IF EXISTS "Admins can update documents" ON public.user_verification_documents;

-- Step 2: Recreate policies
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

-- Step 3: Verify policies were created
SELECT 'Policies recreated successfully!' as status;
SELECT policyname FROM pg_policies 
WHERE tablename = 'user_verification_documents'
ORDER BY policyname;

