-- =====================================================
-- SAFE UPDATE REDEEM CODES CONDITIONS (PRESERVES DATA)
-- =====================================================
-- This script UPDATES existing redeem_codes WITHOUT deleting
-- Preserves current_uses and all existing user redemption data
-- =====================================================

-- Step 1: Add new columns (if not exist)
ALTER TABLE public.redeem_codes
ADD COLUMN IF NOT EXISTS code_type VARCHAR(50) DEFAULT 'standard',
ADD COLUMN IF NOT EXISTS min_deposit_amount DECIMAL(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS min_deposit_timeframe_days INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS accumulated_deposit_required DECIMAL(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS referrals_required INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS min_loss_amount DECIMAL(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS trades_for_withdrawal INTEGER DEFAULT 2,
ADD COLUMN IF NOT EXISTS trades_before_withdrawal INTEGER DEFAULT 2;

-- Step 2: UPDATE existing codes with conditions (PRESERVE current_uses!)

-- WELCOME50: Min 500 USDT deposit in 30 days, 5 trades to UNLOCK bonus
UPDATE public.redeem_codes SET
    description = 'Welcome bonus! Min 500 USDT deposit in 30 days. Trade 5x to unlock bonus.',
    code_type = 'deposit_timeframe',
    min_deposit_amount = 500.00,
    min_deposit_timeframe_days = 30,
    trades_for_withdrawal = 5
WHERE code = 'WELCOME50';

-- FIRSTBONUS: 2000 USDT accumulated deposits, 5 trades to UNLOCK bonus
UPDATE public.redeem_codes SET
    description = 'First bonus! 2000 USDT accumulated deposits required. Trade 5x to unlock bonus.',
    code_type = 'accumulated_deposit',
    accumulated_deposit_required = 2000.00,
    trades_for_withdrawal = 5
WHERE code = 'FIRSTBONUS';

-- BONUS500: 3 referrals required, 3 trades to UNLOCK bonus
UPDATE public.redeem_codes SET
    description = 'Referral bonus! Invite 3 friends. Trade 3x to unlock bonus.',
    code_type = 'referral',
    referrals_required = 3,
    trades_for_withdrawal = 3
WHERE code = 'BONUS500';

-- LETSGO1000: 10000 USDT accumulated deposits, INSTANT bonus (no trades required)
UPDATE public.redeem_codes SET
    description = 'High value bonus! 10,000 USDT deposits required. Bonus added instantly!',
    code_type = 'accumulated_deposit',
    accumulated_deposit_required = 10000.00,
    trades_for_withdrawal = 0
WHERE code = 'LETSGO1000';

-- CASHBACK200: 3000 USDT trading loss, INSTANT bonus (no trades required)
UPDATE public.redeem_codes SET
    description = 'Cashback! Available after 3000 USDT trading losses. Bonus added instantly!',
    code_type = 'cashback_loss',
    min_loss_amount = 3000.00,
    trades_for_withdrawal = 0
WHERE code = 'CASHBACK200';

-- Step 3: Fix RLS policies for user_redeem_history (allow API inserts)
DROP POLICY IF EXISTS "Users can insert own redeem history" ON public.user_redeem_history;
DROP POLICY IF EXISTS "Admins can view all redeem history" ON public.user_redeem_history;
DROP POLICY IF EXISTS "Users can view own redeem history" ON public.user_redeem_history;
DROP POLICY IF EXISTS "Allow all inserts to redeem history" ON public.user_redeem_history;
DROP POLICY IF EXISTS "Allow all selects from redeem history" ON public.user_redeem_history;
DROP POLICY IF EXISTS "Allow all updates to redeem history" ON public.user_redeem_history;

-- Create permissive policies for API (service role)
CREATE POLICY "Allow all inserts to redeem history" ON public.user_redeem_history
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all selects from redeem history" ON public.user_redeem_history
    FOR SELECT USING (true);

CREATE POLICY "Allow all updates to redeem history" ON public.user_redeem_history
    FOR UPDATE USING (true);

-- Step 4: Verify update (shows current_uses preserved)
SELECT 
    code,
    bonus_amount,
    current_uses,
    code_type,
    min_deposit_amount,
    min_deposit_timeframe_days,
    accumulated_deposit_required,
    referrals_required,
    min_loss_amount,
    trades_for_withdrawal,
    is_active
FROM public.redeem_codes
ORDER BY bonus_amount;

-- Check total redemption history
SELECT 'Total redemption records:' as info, COUNT(*) as count FROM public.user_redeem_history;
SELECT 'Codes by redemption count:' as info, code, COUNT(*) as times_redeemed 
FROM public.user_redeem_history GROUP BY code;

-- =====================================================
-- SUMMARY (CURRENT_USES PRESERVED):
-- =====================================================
-- WELCOME50:   50 USDT  | Min 500 USDT deposit in 30 days | Trade 5x to unlock bonus
-- FIRSTBONUS:  100 USDT | 2000 USDT accumulated deposits  | Trade 5x to unlock bonus
-- BONUS500:    500 USDT | 3 referrals required            | Trade 3x to unlock bonus
-- LETSGO1000:  1000 USDT| 10000 USDT accumulated deposits | INSTANT (bonus added immediately)
-- CASHBACK200: 200 USDT | 3000 USDT trading loss          | INSTANT (bonus added immediately)
-- =====================================================
--
-- FLOW:
-- 1. User redeems code → eligibility checked
-- 2. If trades required > 0: bonus is PENDING (not added to balance yet)
-- 3. User must complete X trades
-- 4. After trades completed: bonus is ADDED to balance
-- 5. If trades required = 0: bonus added INSTANTLY to balance
-- =====================================================

