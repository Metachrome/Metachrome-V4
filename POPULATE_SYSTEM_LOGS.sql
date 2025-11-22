-- Backfill Activity Logs for REDEEM_CODES, BALANCE, and SYSTEM categories
-- Run this in Supabase SQL Editor to populate historical logs

-- =====================================================
-- STEP 1: Count existing logs before backfill
-- =====================================================
SELECT 'Existing logs before backfill' as status, COUNT(*) as count
FROM admin_activity_logs;

-- =====================================================
-- STEP 2: Backfill BALANCE logs from transactions (deposits/withdrawals)
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
  'BALANCE' as action_category,
  CASE
    WHEN t.type = 'deposit' THEN 'DEPOSIT_APPROVED'
    WHEN t.type = 'withdrawal' THEN 'WITHDRAWAL_APPROVED'
    ELSE 'BALANCE_UPDATED'
  END as action_type,
  CONCAT(
    'Admin ',
    CASE
      WHEN t.type = 'deposit' THEN 'approved deposit'
      WHEN t.type = 'withdrawal' THEN 'approved withdrawal'
      ELSE 'updated balance'
    END,
    ' for ', u.username, ': ', t.amount, ' ', t.symbol
  ) as action_description,
  CASE
    WHEN t.user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    THEN t.user_id::uuid
    ELSE '00000000-0000-0000-0000-000000000000'::uuid
  END as target_user_id,
  u.username as target_username,
  u.email as target_email,
  jsonb_build_object(
    'transaction_type', t.type,
    'symbol', t.symbol,
    'amount', t.amount,
    'status', t.status,
    'source', 'historical_backfill'
  ) as metadata,
  t.created_at as created_at,
  NULL as ip_address,
  NULL as user_agent
FROM transactions t
LEFT JOIN users u ON u.id::text = t.user_id
WHERE t.type IN ('deposit', 'withdrawal')
  AND t.status = 'completed'
  AND NOT EXISTS (
    -- Avoid duplicates
    SELECT 1 FROM admin_activity_logs aal
    WHERE aal.action_category = 'BALANCE'
      AND aal.target_user_id::text = t.user_id
      AND aal.created_at = t.created_at
  )
ORDER BY t.created_at ASC;

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
-- STEP 4: Backfill CHAT logs from transactions (admin messages)
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
  CASE
    WHEN (t.metadata::jsonb->>'fromUserId')::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    THEN (t.metadata::jsonb->>'fromUserId')::uuid
    ELSE '00000000-0000-0000-0000-000000000000'::uuid
  END as admin_id,
  COALESCE(admin_user.username, 'Admin') as admin_username,
  admin_user.email as admin_email,
  'CHAT' as action_category,
  'MESSAGE_SENT' as action_type,
  CONCAT(
    'Admin sent message to ', u.username, ': "',
    LEFT(t.metadata::jsonb->>'message', 50),
    CASE WHEN LENGTH(t.metadata::jsonb->>'message') > 50 THEN '...' ELSE '' END,
    '"'
  ) as action_description,
  CASE
    WHEN t.user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    THEN t.user_id::uuid
    ELSE '00000000-0000-0000-0000-000000000000'::uuid
  END as target_user_id,
  u.username as target_username,
  u.email as target_email,
  jsonb_build_object(
    'message', t.metadata::jsonb->>'message',
    'message_type', t.metadata::jsonb->>'type',
    'has_attachment', (t.metadata::jsonb->'attachment') IS NOT NULL,
    'source', 'historical_backfill'
  ) as metadata,
  t.created_at as created_at,
  NULL as ip_address,
  NULL as user_agent
FROM transactions t
LEFT JOIN users u ON u.id::text = t.user_id
LEFT JOIN users admin_user ON admin_user.id::text = (t.metadata::jsonb->>'fromUserId')
WHERE t.symbol = 'MSG'
  AND t.metadata IS NOT NULL
  AND t.metadata::jsonb->>'kind' = 'chat'
  AND t.metadata::jsonb->>'fromUserId' != t.user_id  -- Only admin messages (fromUserId != toUserId)
  AND NOT EXISTS (
    -- Avoid duplicates
    SELECT 1 FROM admin_activity_logs aal
    WHERE aal.action_category = 'CHAT'
      AND aal.target_user_id::text = t.user_id
      AND aal.created_at = t.created_at
  )
ORDER BY t.created_at ASC;

-- =====================================================
-- STEP 5: Backfill SYSTEM logs for user registrations
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
  CASE
    WHEN u.id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    THEN u.id::text::uuid
    ELSE '00000000-0000-0000-0000-000000000000'::uuid
  END as target_user_id,
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
  AND u.id::text != '00000000-0000-0000-0000-000000000000'
  AND NOT EXISTS (
    -- Avoid duplicates
    SELECT 1 FROM admin_activity_logs aal
    WHERE aal.action_category = 'SYSTEM'
      AND aal.action_type = 'USER_REGISTERED'
      AND aal.target_user_id::text = u.id::text
  );

-- =====================================================
-- STEP 6: Count logs after backfill
-- =====================================================
SELECT 'Logs after backfill' as status, COUNT(*) as count
FROM admin_activity_logs;

SELECT 'Logs by category' as status, action_category, COUNT(*) as count
FROM admin_activity_logs
GROUP BY action_category
ORDER BY count DESC;

-- =====================================================
-- STEP 7: Show sample logs
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
WHERE action_category IN ('BALANCE', 'CHAT', 'REDEEM_CODES', 'SYSTEM')
ORDER BY created_at DESC
LIMIT 20;

-- =====================================================
-- SUMMARY
-- =====================================================
SELECT
  'SUMMARY' as report_type,
  (SELECT COUNT(*) FROM admin_activity_logs WHERE action_category = 'BALANCE') as balance_logs,
  (SELECT COUNT(*) FROM admin_activity_logs WHERE action_category = 'CHAT') as chat_logs,
  (SELECT COUNT(*) FROM admin_activity_logs WHERE action_category = 'REDEEM_CODES') as redeem_code_logs,
  (SELECT COUNT(*) FROM admin_activity_logs WHERE action_category = 'SYSTEM') as system_logs,
  (SELECT COUNT(*) FROM admin_activity_logs) as total_logs;

