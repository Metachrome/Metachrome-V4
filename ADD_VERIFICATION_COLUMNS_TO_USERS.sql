-- Add verification columns to users table in Supabase
-- Run this SQL in your Supabase dashboard SQL Editor

-- Add verification_status column if it doesn't exist
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS verification_status VARCHAR(50) DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected'));

-- Add has_uploaded_documents column if it doesn't exist
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS has_uploaded_documents BOOLEAN DEFAULT false;

-- Add verified_at column if it doesn't exist
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE;

-- Create index for verification_status for faster queries
CREATE INDEX IF NOT EXISTS idx_users_verification_status ON public.users(verification_status);

-- Verify the columns were added
SELECT 'Verification columns added successfully!' as status;
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'users' AND column_name IN ('verification_status', 'has_uploaded_documents', 'verified_at');

