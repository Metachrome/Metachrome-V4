-- ============================================================================
-- BACKFILL TRADING ACTIVITY LOGS FROM HISTORICAL TRADES
-- ============================================================================
-- This script populates admin_activity_logs table with historical trading data
-- from the trades table, including win/lose control settings, P&L, and amounts
-- ============================================================================

-- STEP 1: Count existing TRADING logs before backfill
DO $$
DECLARE
  existing_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO existing_count
  FROM admin_activity_logs
  WHERE action_category = 'TRADING';
  
  RAISE NOTICE 'Existing TRADING logs before backfill: %', existing_count;
END $$;

-- STEP 2: Backfill TRADING logs from trades table
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
  -- Admin ID: Always use SYSTEM UUID for historical backfill
  '00000000-0000-0000-0000-000000000000'::uuid as admin_id,

  -- Admin username: Use SuperAdmin if user has trading control, otherwise SYSTEM
  CASE
    WHEN u.trading_mode IN ('win', 'lose') THEN 'SuperAdmin'
    ELSE 'SYSTEM'
  END as admin_username,

  -- Admin email
  CASE
    WHEN u.trading_mode IN ('win', 'lose') THEN 'superadmin@metachrome.io'
    ELSE 'system@metachrome.io'
  END as admin_email,
  
  'TRADING' as action_category,
  
  -- Action type based on result
  CASE 
    WHEN t.result = 'win' THEN 'TRADE_WIN'
    WHEN t.result = 'lose' THEN 'TRADE_LOSS'
    ELSE 'TRADE_CREATED'
  END as action_type,
  
  -- Description with P&L and trading control info
  CONCAT(
    u.username, ' ',
    CASE 
      WHEN t.result = 'win' THEN 'won'
      WHEN t.result = 'lose' THEN 'lost'
      ELSE 'created'
    END,
    ' trade on ', COALESCE(t.symbol, 'BTC/USDT'), ' ',
    COALESCE(t.direction, 'up'), ': ',
    CASE 
      WHEN t.result = 'win' THEN CONCAT('+', COALESCE(t.profit_loss::text, '0'))
      WHEN t.result = 'lose' THEN COALESCE(t.profit_loss::text, '0')
      ELSE CONCAT(t.amount::text, ' USDT')
    END,
    CASE 
      WHEN t.result IN ('win', 'lose') THEN ' USDT'
      ELSE ''
    END,
    CASE 
      WHEN u.trading_mode IS NOT NULL AND u.trading_mode != 'normal' 
      THEN CONCAT(' (Admin Control: ', UPPER(u.trading_mode), ')')
      ELSE ''
    END
  ) as action_description,
  
  -- Target user
  CASE 
    WHEN t.user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    THEN t.user_id::uuid
    ELSE '00000000-0000-0000-0000-000000000000'::uuid
  END as target_user_id,
  
  u.username as target_username,
  u.email as target_email,
  
  -- Metadata with all trading details
  jsonb_build_object(
    'tradeId', t.id,
    'symbol', COALESCE(t.symbol, 'BTC/USDT'),
    'direction', COALESCE(t.direction, 'up'),
    'amount', COALESCE(t.amount, 0),
    'duration', COALESCE(t.duration, 30),
    'entryPrice', COALESCE(t.entry_price, 0),
    'exitPrice', COALESCE(t.exit_price, 0),
    'profitLoss', COALESCE(t.profit_loss, 0),
    'profitPercentage', CASE 
      WHEN t.duration = 30 THEN 10
      WHEN t.duration = 60 THEN 15
      WHEN t.duration = 90 THEN 20
      WHEN t.duration = 120 THEN 25
      WHEN t.duration = 180 THEN 30
      WHEN t.duration = 240 THEN 50
      WHEN t.duration = 300 THEN 75
      WHEN t.duration = 600 THEN 100
      ELSE 10
    END,
    'tradingControl', COALESCE(u.trading_mode, 'normal'),
    'result', COALESCE(t.result, 'pending'),
    'status', COALESCE(t.status, 'active'),
    'source', 'historical_backfill'
  ) as metadata,
  
  t.created_at as created_at,
  NULL as ip_address,
  NULL as user_agent
  
FROM trades t
LEFT JOIN users u ON u.id::text = t.user_id
WHERE t.status = 'completed'
  AND t.result IN ('win', 'lose')
  AND NOT EXISTS (
    SELECT 1 FROM admin_activity_logs aal
    WHERE aal.action_category = 'TRADING'
      AND aal.metadata->>'tradeId' = t.id
  )
ORDER BY t.created_at ASC;

-- STEP 3: Count TRADING logs after backfill
DO $$
DECLARE
  total_count INTEGER;
  win_count INTEGER;
  lose_count INTEGER;
  created_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_count
  FROM admin_activity_logs
  WHERE action_category = 'TRADING';

  SELECT COUNT(*) INTO win_count
  FROM admin_activity_logs
  WHERE action_category = 'TRADING' AND action_type = 'TRADE_WIN';

  SELECT COUNT(*) INTO lose_count
  FROM admin_activity_logs
  WHERE action_category = 'TRADING' AND action_type = 'TRADE_LOSS';

  SELECT COUNT(*) INTO created_count
  FROM admin_activity_logs
  WHERE action_category = 'TRADING' AND action_type = 'TRADE_CREATED';

  RAISE NOTICE 'Total TRADING logs after backfill: %', total_count;
  RAISE NOTICE '  - TRADE_WIN: %', win_count;
  RAISE NOTICE '  - TRADE_LOSS: %', lose_count;
  RAISE NOTICE '  - TRADE_CREATED: %', created_count;
END $$;

-- STEP 4: Show sample of backfilled TRADING logs
SELECT
  id,
  TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') as timestamp,
  admin_username,
  action_type,
  action_description,
  target_username,
  metadata->>'tradingControl' as trading_control,
  metadata->>'profitLoss' as profit_loss,
  metadata->>'amount' as amount
FROM admin_activity_logs
WHERE action_category = 'TRADING'
  AND action_type IN ('TRADE_WIN', 'TRADE_LOSS')
ORDER BY created_at DESC
LIMIT 20;

-- SUMMARY
DO $$
DECLARE
  total_trading_logs INTEGER;
  win_logs INTEGER;
  lose_logs INTEGER;
  with_control INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_trading_logs
  FROM admin_activity_logs
  WHERE action_category = 'TRADING' AND action_type IN ('TRADE_WIN', 'TRADE_LOSS');

  SELECT COUNT(*) INTO win_logs
  FROM admin_activity_logs
  WHERE action_category = 'TRADING' AND action_type = 'TRADE_WIN';

  SELECT COUNT(*) INTO lose_logs
  FROM admin_activity_logs
  WHERE action_category = 'TRADING' AND action_type = 'TRADE_LOSS';

  SELECT COUNT(*) INTO with_control
  FROM admin_activity_logs
  WHERE action_category = 'TRADING'
    AND action_type IN ('TRADE_WIN', 'TRADE_LOSS')
    AND metadata->>'tradingControl' IN ('win', 'lose');

  RAISE NOTICE '========================================';
  RAISE NOTICE 'TRADING LOGS BACKFILL SUMMARY';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total trading logs: %', total_trading_logs;
  RAISE NOTICE 'Win logs: %', win_logs;
  RAISE NOTICE 'Lose logs: %', lose_logs;
  RAISE NOTICE 'With admin control: %', with_control;
  RAISE NOTICE '========================================';
END $$;

