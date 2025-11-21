-- Populate admin_activity_logs with historical data from existing tables
-- Run this in Supabase SQL Editor AFTER creating the admin_activity_logs table
-- This will backfill activity logs from past admin actions

-- Step 0: Create SYSTEM user if it doesn't exist (for historical logs without admin info)
INSERT INTO users (id, username, email, role, status, created_at)
VALUES ('SYSTEM', 'System', 'system@metachrome.io', 'super_admin', 'active', NOW())
ON CONFLICT (id) DO NOTHING;

-- 1. Insert historical trading mode changes from admin_controls table
INSERT INTO admin_activity_logs (
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
  user_agent,
  is_deleted
)
SELECT
  ac."adminId" as admin_id,
  admin_user.username as admin_username,
  admin_user.email as admin_email,
  'TRADING_CONTROL_SET' as action_type,
  'TRADING' as action_category,
  CONCAT('Set trading mode to ', UPPER(ac."controlType"), ' for user ', target_user.username) as action_description,
  ac."userId" as target_user_id,
  target_user.username as target_username,
  target_user.email as target_email,
  jsonb_build_object(
    'control_type', ac."controlType",
    'is_active', ac."isActive",
    'notes', ac.notes
  ) as metadata,
  ac."createdAt" as created_at,
  NULL as ip_address,
  NULL as user_agent,
  false as is_deleted
FROM admin_controls ac
LEFT JOIN users admin_user ON ac."adminId" = admin_user.id
LEFT JOIN users target_user ON ac."userId" = target_user.id
WHERE ac."createdAt" IS NOT NULL;

-- 2. Insert historical deposit approvals from deposits table
INSERT INTO admin_activity_logs (
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
  user_agent,
  is_deleted
)
SELECT 
  'SYSTEM' as admin_id,
  'System' as admin_username,
  NULL as admin_email,
  CASE 
    WHEN d.status = 'approved' THEN 'DEPOSIT_APPROVED'
    WHEN d.status = 'rejected' THEN 'DEPOSIT_REJECTED'
  END as action_type,
  'TRANSACTIONS' as action_category,
  CASE 
    WHEN d.status = 'approved' THEN CONCAT('Approved deposit of ', d.amount, ' ', d.currency, ' for user ', d.username)
    WHEN d.status = 'rejected' THEN CONCAT('Rejected deposit of ', d.amount, ' ', d.currency, ' for user ', d.username)
  END as action_description,
  d.user_id as target_user_id,
  d.username as target_username,
  u.email as target_email,
  jsonb_build_object(
    'amount', d.amount,
    'currency', d.currency,
    'deposit_id', d.id,
    'status', d.status,
    'receipt_uploaded', d.receipt_uploaded
  ) as metadata,
  COALESCE(d.updated_at, d.created_at) as created_at,
  NULL as ip_address,
  NULL as user_agent,
  false as is_deleted
FROM deposits d
LEFT JOIN users u ON d.user_id = u.id
WHERE d.status IN ('approved', 'rejected')
  AND d.created_at IS NOT NULL;

-- 3. Insert historical withdrawal approvals from withdrawals table
INSERT INTO admin_activity_logs (
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
  user_agent,
  is_deleted
)
SELECT 
  'SYSTEM' as admin_id,
  'System' as admin_username,
  NULL as admin_email,
  CASE 
    WHEN w.status = 'approved' THEN 'WITHDRAWAL_APPROVED'
    WHEN w.status = 'rejected' THEN 'WITHDRAWAL_REJECTED'
  END as action_type,
  'TRANSACTIONS' as action_category,
  CASE 
    WHEN w.status = 'approved' THEN CONCAT('Approved withdrawal of ', w.amount, ' ', w.currency, ' for user ', w.username)
    WHEN w.status = 'rejected' THEN CONCAT('Rejected withdrawal of ', w.amount, ' ', w.currency, ' for user ', w.username)
  END as action_description,
  w.user_id as target_user_id,
  w.username as target_username,
  u.email as target_email,
  jsonb_build_object(
    'amount', w.amount,
    'currency', w.currency,
    'withdrawal_id', w.id,
    'address', w.address,
    'status', w.status
  ) as metadata,
  COALESCE(w.updated_at, w.created_at) as created_at,
  NULL as ip_address,
  NULL as user_agent,
  false as is_deleted
FROM withdrawals w
LEFT JOIN users u ON w.user_id = u.id
WHERE w.status IN ('approved', 'rejected')
  AND w.created_at IS NOT NULL;

-- 4. Insert historical verification approvals from user_verification_documents table
INSERT INTO admin_activity_logs (
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
  user_agent,
  is_deleted
)
SELECT
  'SYSTEM' as admin_id,
  'System' as admin_username,
  NULL as admin_email,
  CASE
    WHEN uvd.verification_status = 'approved' THEN 'VERIFICATION_APPROVED'
    WHEN uvd.verification_status = 'rejected' THEN 'VERIFICATION_REJECTED'
  END as action_type,
  'VERIFICATION' as action_category,
  CASE
    WHEN uvd.verification_status = 'approved' THEN CONCAT('Approved ', uvd.document_type, ' verification for user ', u.username)
    WHEN uvd.verification_status = 'rejected' THEN CONCAT('Rejected ', uvd.document_type, ' verification for user ', u.username)
  END as action_description,
  uvd.user_id as target_user_id,
  u.username as target_username,
  u.email as target_email,
  jsonb_build_object(
    'document_type', uvd.document_type,
    'verification_status', uvd.verification_status,
    'admin_notes', uvd.admin_notes,
    'document_id', uvd.id
  ) as metadata,
  COALESCE(uvd.verified_at, uvd.updated_at, uvd.created_at) as created_at,
  NULL as ip_address,
  NULL as user_agent,
  false as is_deleted
FROM user_verification_documents uvd
LEFT JOIN users u ON uvd.user_id = u.id
WHERE uvd.verification_status IN ('approved', 'rejected')
  AND uvd.created_at IS NOT NULL;

-- 5. Insert historical user role changes (detect from users table if possible)
-- Note: This only works if you have audit trail or can detect role changes
-- For now, we'll create a log for all current admins/super_admins as "USER_ROLE_CHANGED"
INSERT INTO admin_activity_logs (
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
  user_agent,
  is_deleted
)
SELECT
  'SYSTEM' as admin_id,
  'System' as admin_username,
  NULL as admin_email,
  'USER_ROLE_CHANGED' as action_type,
  'USER_MANAGEMENT' as action_category,
  CONCAT('User ', u.username, ' role set to ', UPPER(u.role)) as action_description,
  u.id as target_user_id,
  u.username as target_username,
  u.email as target_email,
  jsonb_build_object(
    'new_role', u.role,
    'status', u.status
  ) as metadata,
  u.created_at,
  NULL as ip_address,
  NULL as user_agent,
  false as is_deleted
FROM users u
WHERE u.role IN ('admin', 'super_admin')
  AND u.created_at IS NOT NULL;

-- Verification query to check inserted logs
SELECT
  action_category,
  action_type,
  COUNT(*) as count
FROM admin_activity_logs
GROUP BY action_category, action_type
ORDER BY action_category, action_type;

-- Show summary
SELECT
  'Historical activity logs populated successfully!' as status,
  COUNT(*) as total_logs_inserted
FROM admin_activity_logs;

