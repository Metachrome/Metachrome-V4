-- =====================================================
-- METACHROME REDEEM CODES CONDITIONS UPDATE
-- =====================================================
-- Run this SQL in your Supabase SQL Editor to update
-- redeem codes with specific eligibility conditions
-- =====================================================

-- Step 1: Add new columns to redeem_codes table for conditions
ALTER TABLE public.redeem_codes 
ADD COLUMN IF NOT EXISTS code_type VARCHAR(50) DEFAULT 'standard',
ADD COLUMN IF NOT EXISTS min_deposit_amount DECIMAL(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS min_deposit_timeframe_days INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS accumulated_deposit_required DECIMAL(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS referrals_required INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS min_loss_amount DECIMAL(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS trades_for_withdrawal INTEGER DEFAULT 0;

-- Step 2: Delete old codes and insert updated codes with conditions
DELETE FROM public.redeem_codes WHERE code IN ('WELCOME50', 'FIRSTBONUS', 'BONUS500', 'LETSGO1000', 'CASHBACK200');

-- Insert WELCOME50: 50 USDT bonus
-- Requirement: Min 500 USDT deposit within 30 days of registration
-- Withdrawal: 5 trades required
INSERT INTO public.redeem_codes (
    code, bonus_amount, max_uses, current_uses, is_active, description,
    code_type, min_deposit_amount, min_deposit_timeframe_days, trades_for_withdrawal
) VALUES (
    'WELCOME50', 50.00, NULL, 0, true,
    'Welcome bonus! Requires min 500 USDT deposit within 30 days of registration. Complete 5 trades to withdraw.',
    'deposit_timeframe', 500.00, 30, 5
);

-- Insert FIRSTBONUS: 100 USDT bonus
-- Requirement: Accumulated deposit 2000 USDT
-- Withdrawal: 5 trades required
INSERT INTO public.redeem_codes (
    code, bonus_amount, max_uses, current_uses, is_active, description,
    code_type, accumulated_deposit_required, trades_for_withdrawal
) VALUES (
    'FIRSTBONUS', 100.00, NULL, 0, true,
    'First bonus! Requires accumulated deposit of 2000 USDT. Complete 5 trades to withdraw.',
    'accumulated_deposit', 2000.00, 5
);

-- Insert BONUS500: 500 USDT bonus
-- Requirement: Invite 3 people via referral
-- Withdrawal: 3 trades required
INSERT INTO public.redeem_codes (
    code, bonus_amount, max_uses, current_uses, is_active, description,
    code_type, referrals_required, trades_for_withdrawal
) VALUES (
    'BONUS500', 500.00, NULL, 0, true,
    'Referral bonus! Invite 3 friends to join using your referral code. Complete 3 trades to withdraw.',
    'referral', 3, 3
);

-- Insert LETSGO1000: 1000 USDT bonus
-- Requirement: Accumulated deposit 10000 USDT
-- Withdrawal: No trade requirement (0)
INSERT INTO public.redeem_codes (
    code, bonus_amount, max_uses, current_uses, is_active, description,
    code_type, accumulated_deposit_required, trades_for_withdrawal
) VALUES (
    'LETSGO1000', 1000.00, NULL, 0, true,
    'High value bonus! Requires accumulated deposit of 10,000 USDT. No trade requirement for withdrawal.',
    'accumulated_deposit', 10000.00, 0
);

-- Insert CASHBACK200: 200 USDT bonus
-- Requirement: Minimum loss of 3000 USDT
-- Withdrawal: No trade requirement (0)
INSERT INTO public.redeem_codes (
    code, bonus_amount, max_uses, current_uses, is_active, description,
    code_type, min_loss_amount, trades_for_withdrawal
) VALUES (
    'CASHBACK200', 200.00, NULL, 0, true,
    'Cashback bonus! Available after 3000 USDT in trading losses. No trade requirement for withdrawal.',
    'cashback_loss', 3000.00, 0
);

-- Step 3: Create referrals tracking table if not exists
-- Note: users.id is TEXT type, not UUID
CREATE TABLE IF NOT EXISTS public.user_referrals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    referrer_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    referred_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    referral_code VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_referred_user UNIQUE (referred_id)
);

-- Step 4: Add referral_code column to users table if not exists
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS referral_code VARCHAR(50),
ADD COLUMN IF NOT EXISTS referred_by TEXT REFERENCES users(id);

-- Create index for referral lookups
CREATE INDEX IF NOT EXISTS idx_user_referrals_referrer ON public.user_referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON public.users(referral_code);

-- Step 5: Verify setup
SELECT 'Redeem codes conditions updated successfully' as status;
SELECT code, bonus_amount, code_type, min_deposit_amount, accumulated_deposit_required, 
       referrals_required, min_loss_amount, trades_for_withdrawal 
FROM public.redeem_codes 
ORDER BY bonus_amount;

-- =====================================================
-- CODES SUMMARY:
-- =====================================================
-- WELCOME50:   50 USDT  | Min 500 USDT deposit in 30 days | 5 trades to withdraw
-- FIRSTBONUS:  100 USDT | Accumulated 2000 USDT deposits  | 5 trades to withdraw
-- BONUS500:    500 USDT | 3 referrals required            | 3 trades to withdraw
-- LETSGO1000:  1000 USDT| Accumulated 10000 USDT deposits | No trade requirement
-- CASHBACK200: 200 USDT | Min 3000 USDT trading loss      | No trade requirement
-- =====================================================

