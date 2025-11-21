-- Simple script to populate activity logs with historical data
-- Run this in Supabase SQL Editor

-- First, ensure SYSTEM user exists
INSERT INTO users (id, username, email, password, role, balance, created_at)
VALUES (
  'SYSTEM',
  'System',
  'system@metachrome.io',
  'SYSTEM_NO_LOGIN',
  'super_admin',
  0,
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Populate from admin_controls (Trading Control Changes)
INSERT INTO admin_activity_logs (
  admin_id,
  admin_username,
  action_category,
  action_type,
  action_description,
  target_user_id,
  target_username,
  metadata,
  ip_address,
  user_agent,
  created_at
)
SELECT
  COALESCE(ac."adminId", 'SYSTEM'),
  COALESCE(admin.username, 'System'),
  'TRADING',
  'TRADING_CONTROL_SET',
  'Set trading mode to ' || UPPER(ac."controlType") || ' for user ' || COALESCE(u.username, ac."userId"),
  ac."userId",
  u.username,
  jsonb_build_object(
    'control_type', ac."controlType",
    'is_active', ac."isActive",
    'notes', ac.notes,
    'source', 'historical_import'
  ),
  '127.0.0.1',
  'System Import',
  ac."createdAt"
FROM admin_controls ac
LEFT JOIN users u ON ac."userId" = u.id
LEFT JOIN users admin ON ac."adminId" = admin.id
WHERE ac."createdAt" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM admin_activity_logs aal
    WHERE aal.action_category = 'TRADING'
      AND aal.target_user_id = ac."userId"
      AND aal.created_at = ac."createdAt"
  );

-- Populate from deposits (Approved)
INSERT INTO admin_activity_logs (
  admin_id,
  admin_username,
  action_category,
  action_type,
  action_description,
  target_user_id,
  target_username,
  metadata,
  ip_address,
  user_agent,
  created_at
)
SELECT 
  'SYSTEM',
  'System',
  'DEPOSIT',
  'APPROVE_DEPOSIT',
  'Approved deposit of $' || d.amount || ' for user ' || COALESCE(u.username, d.user_id),
  d.user_id,
  u.username,
  jsonb_build_object(
    'deposit_id', d.id,
    'amount', d.amount,
    'network', d.network,
    'status', d.status,
    'source', 'historical_import'
  ),
  '127.0.0.1',
  'System Import',
  COALESCE(d.updated_at, d.created_at)
FROM deposits d
LEFT JOIN users u ON d.user_id = u.id
WHERE d.status = 'approved'
  AND NOT EXISTS (
    SELECT 1 FROM admin_activity_logs aal
    WHERE aal.action_category = 'DEPOSIT'
      AND aal.action_type = 'APPROVE_DEPOSIT'
      AND (aal.metadata->>'deposit_id')::uuid = d.id
  );

-- Populate from deposits (Rejected)
INSERT INTO admin_activity_logs (
  admin_id,
  admin_username,
  action_category,
  action_type,
  action_description,
  target_user_id,
  target_username,
  metadata,
  ip_address,
  user_agent,
  created_at
)
SELECT 
  'SYSTEM',
  'System',
  'DEPOSIT',
  'REJECT_DEPOSIT',
  'Rejected deposit of $' || d.amount || ' for user ' || COALESCE(u.username, d.user_id),
  d.user_id,
  u.username,
  jsonb_build_object(
    'deposit_id', d.id,
    'amount', d.amount,
    'network', d.network,
    'status', d.status,
    'source', 'historical_import'
  ),
  '127.0.0.1',
  'System Import',
  COALESCE(d.updated_at, d.created_at)
FROM deposits d
LEFT JOIN users u ON d.user_id = u.id
WHERE d.status = 'rejected'
  AND NOT EXISTS (
    SELECT 1 FROM admin_activity_logs aal
    WHERE aal.action_category = 'DEPOSIT'
      AND aal.action_type = 'REJECT_DEPOSIT'
      AND (aal.metadata->>'deposit_id')::uuid = d.id
  );

-- Show results
SELECT 
  action_category,
  action_type,
  COUNT(*) as count
FROM admin_activity_logs
GROUP BY action_category, action_type
ORDER BY action_category, action_type;

SELECT 'Total activity logs: ' || COUNT(*) as summary
FROM admin_activity_logs;

