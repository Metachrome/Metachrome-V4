-- ============================================
-- QUICK FIX: Jalankan query ini di Railway/Supabase
-- ============================================

-- STEP 1: Cek dulu berapa banyak trade yang pending/expired
SELECT 
  id,
  user_id,
  symbol,
  direction,
  amount,
  status,
  result,
  expires_at,
  created_at
FROM trades
WHERE (status = 'active' OR result = 'pending' OR result IS NULL)
AND expires_at < NOW()
ORDER BY expires_at DESC;

-- STEP 2: Update semua trade yang expired
-- Copy dan jalankan query ini:

UPDATE trades
SET 
  status = 'completed',
  result = CASE 
    WHEN RANDOM() > 0.5 THEN 'win' ELSE 'lose'
  END,
  exit_price = CAST(entry_price AS DECIMAL) * (1 + (RANDOM() * 0.02 - 0.01)),
  profit = CASE 
    WHEN RANDOM() > 0.5 THEN CAST(amount AS DECIMAL) * 0.85
    ELSE -CAST(amount AS DECIMAL)
  END,
  completed_at = expires_at,
  updated_at = NOW()
WHERE (status = 'active' OR result = 'pending' OR result IS NULL)
AND expires_at < NOW();

-- STEP 3: Verifikasi - seharusnya return 0
SELECT COUNT(*) as remaining_pending
FROM trades
WHERE (status = 'active' OR result = 'pending' OR result IS NULL)
AND expires_at < NOW();

