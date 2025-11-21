-- Fix admin_activity_logs table to use UUID instead of TEXT for ID columns
-- Run this if you already created the table with TEXT columns

-- First, check current column types
SELECT 
  column_name,
  data_type,
  udt_name
FROM information_schema.columns
WHERE table_name = 'admin_activity_logs'
  AND column_name IN ('admin_id', 'target_user_id')
ORDER BY ordinal_position;

-- If admin_id is TEXT, convert to UUID
DO $$
BEGIN
  -- Check if admin_id is TEXT
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'admin_activity_logs' 
      AND column_name = 'admin_id' 
      AND data_type = 'text'
  ) THEN
    -- Drop foreign key constraint first
    ALTER TABLE admin_activity_logs DROP CONSTRAINT IF EXISTS fk_admin;
    
    -- Convert admin_id from TEXT to UUID
    ALTER TABLE admin_activity_logs 
    ALTER COLUMN admin_id TYPE UUID USING admin_id::uuid;
    
    -- Re-add foreign key constraint
    ALTER TABLE admin_activity_logs
    ADD CONSTRAINT fk_admin
      FOREIGN KEY(admin_id) 
      REFERENCES users(id)
      ON DELETE SET NULL;
      
    RAISE NOTICE 'admin_id converted from TEXT to UUID';
  ELSE
    RAISE NOTICE 'admin_id is already UUID';
  END IF;
END $$;

-- If target_user_id is TEXT, convert to UUID
DO $$
BEGIN
  -- Check if target_user_id is TEXT
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'admin_activity_logs' 
      AND column_name = 'target_user_id' 
      AND data_type = 'text'
  ) THEN
    -- Convert target_user_id from TEXT to UUID (allow NULL)
    ALTER TABLE admin_activity_logs 
    ALTER COLUMN target_user_id TYPE UUID USING 
      CASE 
        WHEN target_user_id IS NULL THEN NULL
        ELSE target_user_id::uuid
      END;
      
    RAISE NOTICE 'target_user_id converted from TEXT to UUID';
  ELSE
    RAISE NOTICE 'target_user_id is already UUID';
  END IF;
END $$;

-- Verify the changes
SELECT 
  column_name,
  data_type,
  udt_name
FROM information_schema.columns
WHERE table_name = 'admin_activity_logs'
  AND column_name IN ('admin_id', 'target_user_id')
ORDER BY ordinal_position;

-- Show sample data to verify
SELECT 
  id,
  admin_id,
  admin_username,
  target_user_id,
  target_username,
  action_category,
  action_type,
  created_at
FROM admin_activity_logs
ORDER BY created_at DESC
LIMIT 5;

