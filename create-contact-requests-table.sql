-- Migration: Create contact_requests table
-- This table stores contact form submissions from users
-- Each contact request is linked to a chat conversation for admin response

-- Create contact_requests table
CREATE TABLE IF NOT EXISTS contact_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  message TEXT NOT NULL,
  has_image BOOLEAN DEFAULT FALSE,
  image_filename VARCHAR(255),
  conversation_id UUID REFERENCES chat_conversations(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, in_progress, resolved
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_contact_requests_status ON contact_requests(status);
CREATE INDEX IF NOT EXISTS idx_contact_requests_created_at ON contact_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_requests_email ON contact_requests(email);
CREATE INDEX IF NOT EXISTS idx_contact_requests_conversation_id ON contact_requests(conversation_id);

-- Enable Row Level Security (RLS)
ALTER TABLE contact_requests ENABLE ROW LEVEL SECURITY;

-- Create policy: Anyone can insert (submit contact form)
CREATE POLICY "Anyone can submit contact requests"
  ON contact_requests
  FOR INSERT
  WITH CHECK (true);

-- Create policy: Only admins can view all contact requests
CREATE POLICY "Admins can view all contact requests"
  ON contact_requests
  FOR SELECT
  USING (true); -- You can add admin role check here if needed

-- Create policy: Only admins can update contact requests
CREATE POLICY "Admins can update contact requests"
  ON contact_requests
  FOR UPDATE
  USING (true); -- You can add admin role check here if needed

-- Verify the table was created
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'contact_requests'
ORDER BY ordinal_position;

-- Show success message
SELECT 'contact_requests table created successfully!' as status;

