-- Add admin user to the correct users table
-- Run this if login doesn't work

-- Check which users table has the right structure for our app
SELECT table_name, column_name 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('username', 'password', 'role')
ORDER BY table_name, ordinal_position;

-- Add admin user (this will work with either table structure)
INSERT INTO users (username, email, password, role) 
VALUES ('admin', 'admin@metachrome.com', 'admin123', 'admin')
ON CONFLICT (username) DO UPDATE SET 
password = 'admin123', 
role = 'admin';

-- Add test user
INSERT INTO users (username, email, password, role) 
VALUES ('testuser', 'test@metachrome.com', 'password123', 'user')
ON CONFLICT (username) DO UPDATE SET 
password = 'password123', 
role = 'user';

-- Check if users were added
SELECT username, email, role FROM users WHERE username IN ('admin', 'testuser');
