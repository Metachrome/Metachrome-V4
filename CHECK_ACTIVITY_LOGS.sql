-- Check if admin_activity_logs table exists and has data
-- Run this in Supabase SQL Editor to diagnose the issue

-- 1. Check if table exists
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'admin_activity_logs';

-- 2. Check table structure
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'admin_activity_logs'
ORDER BY ordinal_position;

-- 3. Check if SYSTEM user exists
SELECT id, username, email, role
FROM users
WHERE id = 'SYSTEM' OR username = 'System';

-- 4. Count total logs
SELECT COUNT(*) as total_logs
FROM admin_activity_logs;

-- 5. Count logs by category
SELECT 
  action_category,
  COUNT(*) as count
FROM admin_activity_logs
GROUP BY action_category
ORDER BY count DESC;

-- 6. Show first 10 logs
SELECT 
  id,
  admin_username,
  action_category,
  action_type,
  action_description,
  created_at
FROM admin_activity_logs
ORDER BY created_at DESC
LIMIT 10;

-- 7. Check if there's data in source tables
SELECT 'admin_controls' as table_name, COUNT(*) as count FROM admin_controls
UNION ALL
SELECT 'deposits', COUNT(*) FROM deposits WHERE status IN ('approved', 'rejected')
UNION ALL
SELECT 'withdrawals', COUNT(*) FROM withdrawals WHERE status IN ('approved', 'rejected')
UNION ALL
SELECT 'user_verification_documents', COUNT(*) FROM user_verification_documents WHERE verification_status IN ('approved', 'rejected');

