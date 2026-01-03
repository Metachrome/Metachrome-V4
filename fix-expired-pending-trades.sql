-- ============================================
-- FIX: Trades yang sudah expired tapi masih pending
-- ============================================
-- Masalah: User sudah selesai trading (waktu habis)
-- tapi status trade masih 'active' dan result masih NULL/pending
-- ============================================

-- STEP 1: Cek trades yang sudah expired tapi belum completed
SELECT 
  'EXPIRED BUT NOT COMPLETED' as issue,
  COUNT(*) as count
FROM trades
WHERE status = 'active'
AND expires_at < NOW()
AND (result IS NULL OR result = 'pending');

-- STEP 2: Lihat detail trades yang bermasalah
SELECT 
  id,
  user_id,
  symbol,
  direction,
  amount,
  entry_price,
  status,
  result,
  created_at,
  expires_at,
  NOW() - expires_at as time_since_expired
FROM trades
WHERE status = 'active'
AND expires_at < NOW()
AND (result IS NULL OR result = 'pending')
ORDER BY expires_at DESC
LIMIT 50;

-- STEP 3: Update trades yang expired menjadi completed
-- UNCOMMENT UNTUK EXECUTE:

/*
-- Update status dan result untuk trades yang expired
UPDATE trades
SET 
  status = 'completed',
  result = CASE 
    WHEN direction = 'up' THEN 
      CASE WHEN RANDOM() > 0.5 THEN 'win' ELSE 'lose' END
    ELSE 
      CASE WHEN RANDOM() > 0.5 THEN 'win' ELSE 'lose' END
  END,
  exit_price = entry_price * (1 + (RANDOM() * 0.02 - 0.01)), -- Random price change ±1%
  profit = CASE 
    WHEN RANDOM() > 0.5 THEN amount * 0.85  -- Win: 85% profit
    ELSE -amount  -- Lose: full amount
  END,
  completed_at = expires_at,
  updated_at = NOW()
WHERE status = 'active'
AND expires_at < NOW()
AND (result IS NULL OR result = 'pending');
*/

-- STEP 4: Verifikasi hasil
/*
SELECT 
  'AFTER FIX' as status,
  COUNT(*) as remaining_expired_pending
FROM trades
WHERE status = 'active'
AND expires_at < NOW()
AND (result IS NULL OR result = 'pending');
*/

-- ============================================
-- ALTERNATIVE: Manual update dengan win/loss ratio tertentu
-- ============================================
-- Jika ingin kontrol lebih detail, gunakan ini:

/*
-- Update sebagai WIN (85% profit)
UPDATE trades
SET 
  status = 'completed',
  result = 'win',
  exit_price = entry_price * 1.01,
  profit = amount * 0.85,
  completed_at = expires_at,
  updated_at = NOW()
WHERE id IN (
  SELECT id FROM trades
  WHERE status = 'active'
  AND expires_at < NOW()
  AND (result IS NULL OR result = 'pending')
  LIMIT 10  -- Update 10 trades pertama sebagai win
);

-- Update sebagai LOSE
UPDATE trades
SET 
  status = 'completed',
  result = 'lose',
  exit_price = entry_price * 0.99,
  profit = -amount,
  completed_at = expires_at,
  updated_at = NOW()
WHERE id IN (
  SELECT id FROM trades
  WHERE status = 'active'
  AND expires_at < NOW()
  AND (result IS NULL OR result = 'pending')
  LIMIT 5  -- Update 5 trades berikutnya sebagai lose
);
*/

