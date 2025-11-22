-- Complete diagnostic script to check why activity logs are not showing

-- 1. Check if table exists
SELECT 
  'Table exists' as check_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'admin_activity_logs'
  ) THEN 'YES' ELSE 'NO' END as result;

-- 2. Check table structure
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'admin_activity_logs'
ORDER BY ordinal_position;

-- 3. Count total rows
SELECT 'Total rows' as check_name, COUNT(*) as count
FROM admin_activity_logs;

-- 4. Count non-deleted rows (what API queries)
SELECT 'Non-deleted rows' as check_name, COUNT(*) as count
FROM admin_activity_logs
WHERE is_deleted = false;

-- 5. Show ALL rows (even deleted ones)
SELECT 
  id,
  admin_id,
  admin_username,
  action_category,
  action_type,
  target_username,
  created_at,
  is_deleted
FROM admin_activity_logs
ORDER BY created_at DESC
LIMIT 10;

-- 6. Check if there are any rows with is_deleted = true
SELECT 'Deleted rows' as check_name, COUNT(*) as count
FROM admin_activity_logs
WHERE is_deleted = true;

-- 7. Check if there are any rows with is_deleted = NULL
SELECT 'NULL is_deleted rows' as check_name, COUNT(*) as count
FROM admin_activity_logs
WHERE is_deleted IS NULL;

-- 8. Group by action category
SELECT 
  action_category,
  COUNT(*) as count,
  COUNT(CASE WHEN is_deleted = false THEN 1 END) as non_deleted_count
FROM admin_activity_logs
GROUP BY action_category
ORDER BY count DESC;

-- 9. Check data types of key columns
SELECT 
  column_name,
  data_type,
  udt_name
FROM information_schema.columns
WHERE table_name = 'admin_activity_logs'
  AND column_name IN ('admin_id', 'target_user_id', 'is_deleted')
ORDER BY ordinal_position;

-- 10. Sample query that mimics what the API does
SELECT 
  id,
  admin_id,
  admin_username,
  admin_email,
  action_type,
  action_category,
  action_description,
  target_user_id,
  target_username,
  target_email,
  metadata,
  created_at,
  ip_address,
  user_agent
FROM admin_activity_logs
WHERE is_deleted = false
ORDER BY created_at DESC
LIMIT 10;

