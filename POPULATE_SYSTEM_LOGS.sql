-- Backfill Activity Logs for REDEEM_CODES, BALANCE, and SYSTEM categories
-- Run this in Supabase SQL Editor to populate historical logs

-- =====================================================
-- STEP 1: Ensure SYSTEM user exists
-- =====================================================
INSERT INTO users (id, username, email, role, status, balance, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000000'::uuid,
  'System',
  'system@metachrome.io',
  'super_admin',
  'active',
  0,
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STEP 2: Count existing logs before backfill
-- =====================================================
SELECT 'Existing logs before backfill' as status, COUNT(*) as count
FROM admin_activity_logs;

-- =====================================================
-- STEP 3: Backfill REDEEM_CODES logs from user_redeem_history
-- =====================================================
INSERT INTO admin_activity_logs (
  admin_id,
  admin_username,
  admin_email,
  action_category,
  action_type,
  action_description,
  target_user_id,
  target_username,
  target_email,
  metadata,
  created_at,
  ip_address,
  user_agent
)
SELECT
  '00000000-0000-0000-0000-000000000000'::uuid as admin_id,
  'System' as admin_username,
  'system@metachrome.io' as admin_email,
  'REDEEM_CODES' as action_category,
  'CODE_REDEEMED' as action_type,
  CONCAT(
    'User ', u.username, ' redeemed code "', urh.code, '" - +', 
    urh.bonus_amount, ' USDT bonus'
  ) as action_description,
  CASE 
    WHEN urh.user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    THEN urh.user_id::uuid 
    ELSE '00000000-0000-0000-0000-000000000000'::uuid 
  END as target_user_id,
  u.username as target_username,
  u.email as target_email,
  jsonb_build_object(
    'code', urh.code,
    'bonus_amount', urh.bonus_amount,
    'trades_required', COALESCE(urh.trades_required, 10),
    'trades_completed', COALESCE(urh.trades_completed, 0),
    'withdrawal_unlocked', COALESCE(urh.withdrawal_unlocked, false),
    'source', 'historical_backfill'
  ) as metadata,
  urh.redeemed_at as created_at,
  NULL as ip_address,
  NULL as user_agent
FROM user_redeem_history urh
LEFT JOIN users u ON u.id::text = urh.user_id
WHERE NOT EXISTS (
  -- Avoid duplicates
  SELECT 1 FROM admin_activity_logs aal
  WHERE aal.action_category = 'REDEEM_CODES'
    AND aal.action_type = 'CODE_REDEEMED'
    AND aal.target_user_id::text = urh.user_id
    AND aal.metadata->>'code' = urh.code
    AND aal.created_at = urh.redeemed_at
);

-- =====================================================
-- STEP 4: Backfill SYSTEM logs for user registrations
-- =====================================================
INSERT INTO admin_activity_logs (
  admin_id,
  admin_username,
  admin_email,
  action_category,
  action_type,
  action_description,
  target_user_id,
  target_username,
  target_email,
  metadata,
  created_at,
  ip_address,
  user_agent
)
SELECT
  '00000000-0000-0000-0000-000000000000'::uuid as admin_id,
  'System' as admin_username,
  'system@metachrome.io' as admin_email,
  'SYSTEM' as action_category,
  'USER_REGISTERED' as action_type,
  CONCAT('New user registered: ', u.username) as action_description,
  u.id as target_user_id,
  u.username as target_username,
  u.email as target_email,
  jsonb_build_object(
    'role', u.role,
    'status', u.status,
    'initial_balance', COALESCE(u.balance, 0),
    'source', 'historical_backfill'
  ) as metadata,
  u.created_at as created_at,
  NULL as ip_address,
  NULL as user_agent
FROM users u
WHERE u.role IN ('user', 'admin', 'super_admin')
  AND u.id != '00000000-0000-0000-0000-000000000000'::uuid
  AND NOT EXISTS (
    -- Avoid duplicates
    SELECT 1 FROM admin_activity_logs aal
    WHERE aal.action_category = 'SYSTEM'
      AND aal.action_type = 'USER_REGISTERED'
      AND aal.target_user_id = u.id
  );

-- =====================================================
-- STEP 5: Count logs after backfill
-- =====================================================
SELECT 'Logs after backfill' as status, COUNT(*) as count
FROM admin_activity_logs;

SELECT 'Logs by category' as status, action_category, COUNT(*) as count
FROM admin_activity_logs
GROUP BY action_category
ORDER BY count DESC;

-- =====================================================
-- STEP 6: Show sample logs
-- =====================================================
SELECT 
  id,
  admin_username,
  action_category,
  action_type,
  action_description,
  target_username,
  created_at
FROM admin_activity_logs
WHERE action_category IN ('REDEEM_CODES', 'SYSTEM')
ORDER BY created_at DESC
LIMIT 20;

-- =====================================================
-- SUMMARY
-- =====================================================
SELECT 
  'SUMMARY' as report_type,
  (SELECT COUNT(*) FROM admin_activity_logs WHERE action_category = 'REDEEM_CODES') as redeem_code_logs,
  (SELECT COUNT(*) FROM admin_activity_logs WHERE action_category = 'SYSTEM') as system_logs,
  (SELECT COUNT(*) FROM admin_activity_logs) as total_logs;

