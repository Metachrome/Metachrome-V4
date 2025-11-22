-- Simplified script to just convert admin_activity_logs columns to UUID
-- WITHOUT dealing with foreign keys or SYSTEM user migration
-- This assumes users table uses TEXT for id column

-- Step 1: Drop the view
DROP VIEW IF EXISTS admin_activity_logs_view;

-- Step 2: Drop foreign key constraint (if exists)
ALTER TABLE admin_activity_logs DROP CONSTRAINT IF EXISTS fk_admin;

-- Step 3: Check current data and show what needs to be fixed
SELECT 
  'admin_id non-UUID values' as issue,
  COUNT(*) as count
FROM admin_activity_logs
WHERE admin_id IS NOT NULL
  AND admin_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

SELECT 
  'target_user_id non-UUID values' as issue,
  COUNT(*) as count
FROM admin_activity_logs
WHERE target_user_id IS NOT NULL
  AND target_user_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- Step 4: Show sample non-UUID values
SELECT DISTINCT admin_id, 'admin_id' as column_name
FROM admin_activity_logs
WHERE admin_id IS NOT NULL
  AND admin_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
UNION ALL
SELECT DISTINCT target_user_id, 'target_user_id' as column_name
FROM admin_activity_logs
WHERE target_user_id IS NOT NULL
  AND target_user_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- Step 5: Fix non-UUID values by setting them to a special UUID
-- Using all-zeros UUID for SYSTEM or any non-UUID value
UPDATE admin_activity_logs
SET admin_id = '00000000-0000-0000-0000-000000000000'
WHERE admin_id IS NOT NULL
  AND admin_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

UPDATE admin_activity_logs
SET target_user_id = '00000000-0000-0000-0000-000000000000'
WHERE target_user_id IS NOT NULL
  AND target_user_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- Step 6: Now safe to convert columns to UUID
ALTER TABLE admin_activity_logs
ALTER COLUMN admin_id TYPE UUID USING admin_id::uuid;

ALTER TABLE admin_activity_logs
ALTER COLUMN target_user_id TYPE UUID USING
  CASE
    WHEN target_user_id IS NULL THEN NULL
    ELSE target_user_id::uuid
  END;

-- Step 7: Recreate the view
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
LEFT JOIN users u ON aal.admin_id::text = u.id::text
WHERE aal.is_deleted = FALSE
ORDER BY aal.created_at DESC;

-- Step 8: Verify the changes
SELECT
  column_name,
  data_type,
  udt_name
FROM information_schema.columns
WHERE table_name = 'admin_activity_logs'
  AND column_name IN ('admin_id', 'target_user_id')
ORDER BY ordinal_position;

-- Step 9: Show sample data
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

-- Step 10: Count total logs
SELECT COUNT(*) as total_activity_logs
FROM admin_activity_logs
WHERE is_deleted = false;

