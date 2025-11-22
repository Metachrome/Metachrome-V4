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

-- Step 0: Prepare SYSTEM user with proper UUID
DO $$
DECLARE
  system_uuid UUID := '00000000-0000-0000-0000-000000000000';
  old_system_exists BOOLEAN;
BEGIN
  -- Check if old SYSTEM user exists (with text ID)
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE username = 'System'
      AND email = 'system@metachrome.io'
      AND id::text = 'SYSTEM'
  ) INTO old_system_exists;

  -- Create new SYSTEM user with proper UUID (if not exists)
  INSERT INTO users (id, username, email, role, status, balance, created_at)
  VALUES (system_uuid, 'System', 'system@metachrome.io', 'super_admin', 'active', 0, NOW())
  ON CONFLICT (id) DO NOTHING;

  RAISE NOTICE 'Ensured SYSTEM user exists with UUID: %', system_uuid;

  -- If old SYSTEM user exists, we need to update references
  IF old_system_exists THEN
    -- Temporarily disable the foreign key constraint
    ALTER TABLE admin_activity_logs DROP CONSTRAINT IF EXISTS fk_admin;

    -- Update all activity logs that reference 'SYSTEM' text to use UUID text
    UPDATE admin_activity_logs
    SET admin_id = system_uuid::text
    WHERE admin_id = 'SYSTEM';

    RAISE NOTICE 'Updated % activity logs to use SYSTEM UUID', (SELECT COUNT(*) FROM admin_activity_logs WHERE admin_id = system_uuid::text);

    -- Delete old SYSTEM user (now safe because we removed FK constraint)
    DELETE FROM users WHERE id::text = 'SYSTEM' AND id != system_uuid;

    RAISE NOTICE 'Deleted old SYSTEM user with text ID';

    -- Re-add foreign key constraint (will be added again later in the script)
    -- We'll add it back after converting to UUID
  ELSE
    RAISE NOTICE 'No old SYSTEM user found, skipping cleanup';
  END IF;
END $$;

-- Step 1: Drop the view that depends on these columns
DROP VIEW IF EXISTS admin_activity_logs_view;

-- Step 2: Convert admin_id from TEXT to UUID (if needed)
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

-- Step 3: Convert target_user_id from TEXT to UUID (if needed)
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

-- Step 4: Recreate the view
CREATE OR REPLACE VIEW admin_activity_logs_view AS
SELECT
  aal.id,
  aal.admin_id,
  aal.admin_username,
  aal.admin_email,
  aal.action_type,
  aal.action_category,
  aal.action_description,
  aal.target_user_id,
  aal.target_username,
  aal.target_email,
  aal.metadata,
  aal.created_at,
  aal.ip_address,
  aal.user_agent,
  -- Join with users table to get current admin info
  u.username as current_admin_username,
  u.email as current_admin_email,
  u.role as admin_role
FROM admin_activity_logs aal
LEFT JOIN users u ON aal.admin_id = u.id
WHERE aal.is_deleted = FALSE
ORDER BY aal.created_at DESC;

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

