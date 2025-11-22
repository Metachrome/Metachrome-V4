-- ============================================================================
-- POPULATE TRADING HISTORY TO ACTIVITY LOGS
-- This script creates activity log entries for all historical trades
-- ============================================================================

-- First, let's check what we have
SELECT 'Existing trading logs' as info, COUNT(*) as count
FROM admin_activity_logs
WHERE action_category = 'TRADING';

SELECT 'Total trades in database' as info, COUNT(*) as count
FROM trades;

-- ============================================================================
-- STEP 1: Create logs for TRADE_CREATED (all trades)
-- ============================================================================

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
  ip_address,
  user_agent,
  is_deleted,
  created_at
)
SELECT
  '00000000-0000-0000-0000-000000000000'::uuid as admin_id,
  'SYSTEM' as admin_username,
  NULL as admin_email,
  'TRADE_CREATED' as action_type,
  'TRADING' as action_category,
  CONCAT(
    'User ', COALESCE(u.username, 'Unknown'),
    ' created ', UPPER(t.direction),
    ' trade for ', COALESCE(t.symbol, 'UNKNOWN'),
    ' with ', COALESCE(t.amount::text, '0'), ' USDT',
    ' (', COALESCE(t.duration::text, '0'), 's)'
  ) as action_description,
  CASE
    WHEN t.user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    THEN t.user_id::uuid
    ELSE '00000000-0000-0000-0000-000000000000'::uuid
  END as target_user_id,
  u.username as target_username,
  u.email as target_email,
  jsonb_build_object(
    'tradeId', t.id,
    'symbol', COALESCE(t.symbol, 'UNKNOWN'),
    'direction', COALESCE(t.direction, 'unknown'),
    'amount', COALESCE(t.amount, 0),
    'duration', COALESCE(t.duration, 0),
    'entryPrice', COALESCE(t.entry_price, 0),
    'source', 'historical_backfill'
  ) as metadata,
  NULL as ip_address,
  NULL as user_agent,
  false as is_deleted,
  t.created_at as created_at
FROM trades t
LEFT JOIN users u ON t.user_id = u.id::text
WHERE NOT EXISTS (
  -- Don't create duplicates
  SELECT 1 FROM admin_activity_logs aal
  WHERE aal.action_type = 'TRADE_CREATED'
    AND aal.metadata->>'tradeId' = t.id::text
);

-- ============================================================================
-- STEP 2: Create logs for TRADE_WON (completed winning trades)
-- ============================================================================

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
  ip_address,
  user_agent,
  is_deleted,
  created_at
)
SELECT
  '00000000-0000-0000-0000-000000000000'::uuid as admin_id,
  'SYSTEM' as admin_username,
  NULL as admin_email,
  'TRADE_WON' as action_type,
  'TRADING' as action_category,
  CONCAT(
    'User ', COALESCE(u.username, 'Unknown'),
    ' WON ', UPPER(t.direction),
    ' trade for ', COALESCE(t.symbol, 'UNKNOWN'),
    ' - +', COALESCE(ABS(t.profit_loss)::text, '0'), ' USDT'
  ) as action_description,
  CASE
    WHEN t.user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    THEN t.user_id::uuid
    ELSE '00000000-0000-0000-0000-000000000000'::uuid
  END as target_user_id,
  u.username as target_username,
  u.email as target_email,
  jsonb_build_object(
    'tradeId', t.id,
    'symbol', COALESCE(t.symbol, 'UNKNOWN'),
    'direction', COALESCE(t.direction, 'unknown'),
    'amount', COALESCE(t.amount, 0),
    'duration', COALESCE(t.duration, 0),
    'entryPrice', COALESCE(t.entry_price, 0),
    'exitPrice', COALESCE(t.exit_price, t.entry_price, 0),
    'result', 'win',
    'balanceChange', COALESCE(t.profit_loss, 0),
    'source', 'historical_backfill'
  ) as metadata,
  NULL as ip_address,
  NULL as user_agent,
  false as is_deleted,
  COALESCE(t.updated_at, t.created_at + (t.duration || ' seconds')::interval) as created_at
FROM trades t
LEFT JOIN users u ON t.user_id = u.id::text
WHERE t.result = 'win'
  AND NOT EXISTS (
    -- Don't create duplicates
    SELECT 1 FROM admin_activity_logs aal
    WHERE aal.action_type = 'TRADE_WON'
      AND aal.metadata->>'tradeId' = t.id::text
  );

-- ============================================================================
-- STEP 3: Create logs for TRADE_LOST (completed losing trades)
-- ============================================================================

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
  ip_address,
  user_agent,
  is_deleted,
  created_at
)
SELECT 
  '00000000-0000-0000-0000-000000000000'::uuid as admin_id,
  'SYSTEM' as admin_username,
  NULL as admin_email,
  'TRADE_LOST' as action_type,
  'TRADING' as action_category,
  CONCAT(
    'User ', COALESCE(u.username, 'Unknown'),
    ' LOST ', UPPER(t.direction),
    ' trade for ', COALESCE(t.symbol, 'UNKNOWN'),
    ' - -', COALESCE(ABS(t.profit_loss)::text, '0'), ' USDT'
  ) as action_description,
  CASE
    WHEN t.user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    THEN t.user_id::uuid
    ELSE '00000000-0000-0000-0000-000000000000'::uuid
  END as target_user_id,
  u.username as target_username,
  u.email as target_email,
  jsonb_build_object(
    'tradeId', t.id,
    'symbol', COALESCE(t.symbol, 'UNKNOWN'),
    'direction', COALESCE(t.direction, 'unknown'),
    'amount', COALESCE(t.amount, 0),
    'duration', COALESCE(t.duration, 0),
    'entryPrice', COALESCE(t.entry_price, 0),
    'exitPrice', COALESCE(t.exit_price, t.entry_price, 0),
    'result', 'lose',
    'balanceChange', COALESCE(t.profit_loss, 0),
    'source', 'historical_backfill'
  ) as metadata,
  NULL as ip_address,
  NULL as user_agent,
  false as is_deleted,
  COALESCE(t.updated_at, t.created_at + (t.duration || ' seconds')::interval) as created_at
FROM trades t
LEFT JOIN users u ON t.user_id = u.id::text
WHERE t.result = 'lose'
  AND NOT EXISTS (
    -- Don't create duplicates
    SELECT 1 FROM admin_activity_logs aal
    WHERE aal.action_type = 'TRADE_LOST'
      AND aal.metadata->>'tradeId' = t.id::text
  );

-- ============================================================================
-- VERIFICATION: Show results
-- ============================================================================

SELECT 'Trading logs after backfill' as info, COUNT(*) as count
FROM admin_activity_logs
WHERE action_category = 'TRADING';

SELECT 'Breakdown by action type' as info, action_type, COUNT(*) as count
FROM admin_activity_logs
WHERE action_category = 'TRADING'
GROUP BY action_type
ORDER BY action_type;

-- Show sample of created logs
SELECT
  created_at,
  action_type,
  action_description,
  target_username,
  metadata->>'symbol' as symbol,
  metadata->>'amount' as amount,
  metadata->>'result' as result
FROM admin_activity_logs
WHERE action_category = 'TRADING'
ORDER BY created_at DESC
LIMIT 20;

-- ============================================================================
-- SUMMARY
-- ============================================================================

SELECT
  'SUMMARY' as section,
  (SELECT COUNT(*) FROM trades) as total_trades,
  (SELECT COUNT(*) FROM admin_activity_logs WHERE action_category = 'TRADING') as total_trading_logs,
  (SELECT COUNT(*) FROM admin_activity_logs WHERE action_type = 'TRADE_CREATED') as trade_created_logs,
  (SELECT COUNT(*) FROM admin_activity_logs WHERE action_type = 'TRADE_WON') as trade_won_logs,
  (SELECT COUNT(*) FROM admin_activity_logs WHERE action_type = 'TRADE_LOST') as trade_lost_logs;

