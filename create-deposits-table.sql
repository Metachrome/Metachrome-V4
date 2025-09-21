-- Create deposits table for real-time admin dashboard sync
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS deposits (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verifying', 'approved', 'rejected')),
    receipt_uploaded BOOLEAN DEFAULT FALSE,
    receipt_filename TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_deposits_status ON deposits(status);
CREATE INDEX IF NOT EXISTS idx_deposits_user_id ON deposits(user_id);
CREATE INDEX IF NOT EXISTS idx_deposits_created_at ON deposits(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE deposits ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to see their own deposits
CREATE POLICY "Users can view own deposits" ON deposits
    FOR SELECT USING (auth.uid()::text = user_id);

-- Create policy for admin users to see all deposits
CREATE POLICY "Admins can view all deposits" ON deposits
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid()::text 
            AND users.role IN ('admin', 'super_admin')
        )
    );

-- Grant permissions
GRANT ALL ON deposits TO authenticated;
GRANT ALL ON deposits TO service_role;
