-- Create admin_controls table for managing user trading controls
CREATE TABLE IF NOT EXISTS admin_controls (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "adminId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "controlType" VARCHAR(20) NOT NULL CHECK ("controlType" IN ('normal', 'win', 'lose')),
    "isActive" BOOLEAN DEFAULT true,
    notes TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_admin_controls_userId ON admin_controls("userId");
CREATE INDEX IF NOT EXISTS idx_admin_controls_adminId ON admin_controls("adminId");
CREATE INDEX IF NOT EXISTS idx_admin_controls_isActive ON admin_controls("isActive");

-- Create unique constraint to prevent duplicate active controls per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_controls_unique_active_user 
ON admin_controls("userId") 
WHERE "isActive" = true;

-- Add RLS (Row Level Security) policies
ALTER TABLE admin_controls ENABLE ROW LEVEL SECURITY;

-- Policy: Allow admins to read all controls
CREATE POLICY "Admins can read all admin controls" ON admin_controls
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'super_admin')
        )
    );

-- Policy: Allow admins to insert controls
CREATE POLICY "Admins can insert admin controls" ON admin_controls
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'super_admin')
        )
    );

-- Policy: Allow admins to update controls
CREATE POLICY "Admins can update admin controls" ON admin_controls
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'super_admin')
        )
    );

-- Policy: Allow admins to delete controls
CREATE POLICY "Admins can delete admin controls" ON admin_controls
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'super_admin')
        )
    );

-- Insert some sample data for testing
INSERT INTO admin_controls ("userId", "adminId", "controlType", "isActive", notes) 
SELECT 
    u1.id as "userId",
    u2.id as "adminId", 
    'normal' as "controlType",
    true as "isActive",
    'Default control setting' as notes
FROM users u1, users u2 
WHERE u1.role = 'user' 
AND u2.role IN ('admin', 'super_admin')
AND NOT EXISTS (
    SELECT 1 FROM admin_controls ac 
    WHERE ac."userId" = u1.id AND ac."isActive" = true
)
LIMIT 1;
