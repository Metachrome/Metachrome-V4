-- Quick verification script to check if activity logs data exists
-- Run this in Supabase SQL Editor

-- 1. Count total logs
SELECT 'Total Logs' as check_name, COUNT(*) as count
FROM admin_activity_logs;

-- 2. Count non-deleted logs (what the API queries)
SELECT 'Non-Deleted Logs' as check_name, COUNT(*) as count
FROM admin_activity_logs
WHERE is_deleted = false;

-- 3. Show first 5 logs
SELECT 
  id,
  admin_username,
  action_category,
  action_type,
  action_description,
  target_username,
  created_at,
  is_deleted
FROM admin_activity_logs
ORDER BY created_at DESC
LIMIT 5;

-- 4. Check column names and types
SELECT 
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'admin_activity_logs'
ORDER BY ordinal_position;

