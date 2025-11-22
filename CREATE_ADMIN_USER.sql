-- Create Admin User (not superadmin)
-- This admin can access the dashboard but cannot:
-- 1. Change user wallet addresses
-- 2. See superadmin users in the user list

-- First, check if admin user already exists
DO $$
DECLARE
  admin_exists BOOLEAN;
  admin_id UUID;
  hashed_password TEXT;
BEGIN
  -- Check if admin user exists
  SELECT EXISTS(SELECT 1 FROM users WHERE username = 'admin') INTO admin_exists;
  
  IF NOT admin_exists THEN
    -- Generate UUID for admin
    admin_id := gen_random_uuid();
    
    -- Hash password 'admin123' using bcrypt
    -- Note: You need to replace this with actual bcrypt hash
    -- Generate it using: bcrypt.hash('admin123', 10)
    -- For now, using a placeholder - YOU MUST UPDATE THIS!
    hashed_password := '$2b$10$YourBcryptHashHere';
    
    -- Insert admin user
    INSERT INTO users (
      id,
      username,
      email,
      password,
      role,
      balance,
      status,
      trading_mode,
      created_at,
      updated_at
    ) VALUES (
      admin_id,
      'admin',
      'admin@metachrome.com',
      hashed_password,
      'admin',  -- Role is 'admin', not 'super_admin'
      50000,
      'active',
      'normal',
      NOW(),
      NOW()
    );
    
    RAISE NOTICE 'Admin user created successfully with ID: %', admin_id;
  ELSE
    RAISE NOTICE 'Admin user already exists';
  END IF;
END $$;

-- Verify the admin user
SELECT 
  id,
  username,
  email,
  role,
  balance,
  status,
  created_at
FROM users 
WHERE username = 'admin';

