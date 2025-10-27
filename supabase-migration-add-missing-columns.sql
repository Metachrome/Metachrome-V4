-- Migration: Add missing columns to users table
-- This migration adds columns that the application code expects but were missing from the schema

-- Add balance column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS balance numeric(18,8) DEFAULT 0;

-- Add status column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS status varchar DEFAULT 'active';

-- Add trading_mode column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS trading_mode varchar DEFAULT 'normal';

-- Add verification_status column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_status varchar DEFAULT 'unverified';

-- Add has_uploaded_documents column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS has_uploaded_documents boolean DEFAULT false;

-- Verify the columns were added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

