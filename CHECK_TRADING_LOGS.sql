-- ============================================================================
-- CHECK TRADING LOGS STATUS
-- ============================================================================
-- Quick check to see current state of trading logs
-- ============================================================================

-- 1. Count all activity logs by category
SELECT 
  action_category,
  COUNT(*) as total
FROM admin_activity_logs
GROUP BY action_category
ORDER BY total DESC;

-- 2. Count TRADING logs by action type
SELECT 
  action_type,
  COUNT(*) as total
FROM admin_activity_logs
WHERE action_category = 'TRADING'
GROUP BY action_type
ORDER BY total DESC;

-- 3. Show latest 10 TRADING logs
SELECT 
  id,
  TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') as timestamp,
  admin_username,
  action_type,
  LEFT(action_description, 80) as description,
  target_username,
  metadata->>'tradingControl' as trading_control,
  metadata->>'profitLoss' as profit_loss,
  metadata->>'amount' as amount
FROM admin_activity_logs
WHERE action_category = 'TRADING'
ORDER BY created_at DESC
LIMIT 10;

-- 4. Check if any logs have trading control metadata
SELECT 
  COUNT(*) as logs_with_trading_control
FROM admin_activity_logs
WHERE action_category = 'TRADING'
  AND metadata->>'tradingControl' IS NOT NULL;

-- 5. Check if any logs have profitLoss metadata
SELECT 
  COUNT(*) as logs_with_profit_loss
FROM admin_activity_logs
WHERE action_category = 'TRADING'
  AND metadata->>'profitLoss' IS NOT NULL;

-- 6. Count completed trades in trades table
SELECT 
  result,
  COUNT(*) as total
FROM trades
WHERE status = 'completed'
GROUP BY result
ORDER BY total DESC;

-- 7. Check if trades have been backfilled
SELECT 
  COUNT(DISTINCT t.id) as completed_trades,
  COUNT(DISTINCT aal.metadata->>'tradeId') as backfilled_logs,
  COUNT(DISTINCT t.id) - COUNT(DISTINCT aal.metadata->>'tradeId') as missing_logs
FROM trades t
LEFT JOIN admin_activity_logs aal 
  ON aal.action_category = 'TRADING' 
  AND aal.metadata->>'tradeId' = t.id::text
WHERE t.status = 'completed'
  AND t.result IN ('win', 'lose');

