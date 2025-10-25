-- Create user_verification_documents table for Supabase
-- Run this SQL in your Supabase dashboard SQL Editor

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

-- Enable RLS (Row Level Security)
ALTER TABLE public.user_verification_documents ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
-- Users can view their own documents
CREATE POLICY "Users can view their own documents" ON public.user_verification_documents
  FOR SELECT USING (user_id = auth.uid()::text);

-- Users can insert their own documents
CREATE POLICY "Users can insert their own documents" ON public.user_verification_documents
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);

-- Admins can view all documents
CREATE POLICY "Admins can view all documents" ON public.user_verification_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid()::text AND role IN ('admin', 'super_admin')
    )
  );

-- Admins can update documents
CREATE POLICY "Admins can update documents" ON public.user_verification_documents
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid()::text AND role IN ('admin', 'super_admin')
    )
  );

-- Verify the table was created
SELECT 'user_verification_documents table created successfully!' as status;
SELECT COUNT(*) as total_documents FROM public.user_verification_documents;

