-- Migration: Update contact_requests table to add image_original_name and image_path columns
-- Run this if you already created the contact_requests table before

-- Add new columns for better image tracking
ALTER TABLE contact_requests 
ADD COLUMN IF NOT EXISTS image_original_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS image_path VARCHAR(500);

-- Add comment to columns
COMMENT ON COLUMN contact_requests.image_filename IS 'Server filename (e.g., image-1234567890.jpg)';
COMMENT ON COLUMN contact_requests.image_original_name IS 'Original filename from user';
COMMENT ON COLUMN contact_requests.image_path IS 'Full path to access image (e.g., /uploads/image-1234567890.jpg)';

-- Show success message
SELECT 'contact_requests table updated successfully!' as status;

