-- CRITICAL FIX: Add unique constraint to prevent duplicate redemptions
-- Run this in Supabase SQL Editor

-- Step 1: Create redeem_codes table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.redeem_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    bonus_amount DECIMAL(15,2) NOT NULL,
    max_uses INTEGER,
    current_uses INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for redeem_codes
CREATE INDEX IF NOT EXISTS idx_redeem_codes_code ON public.redeem_codes(code);
CREATE INDEX IF NOT EXISTS idx_redeem_codes_active ON public.redeem_codes(is_active);

-- Step 2: Create user_redeem_history table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_redeem_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    redeem_code_id UUID REFERENCES redeem_codes(id),
    code VARCHAR(50) NOT NULL,
    bonus_amount DECIMAL(15,2) NOT NULL,
    trades_required INTEGER DEFAULT 10,
    trades_completed INTEGER DEFAULT 0,
    withdrawal_unlocked BOOLEAN DEFAULT false,
    redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Insert default redeem codes if table is empty
INSERT INTO public.redeem_codes (code, bonus_amount, max_uses, description)
SELECT 'FIRSTBONUS', 100.00, NULL, 'First time user bonus'
WHERE NOT EXISTS (SELECT 1 FROM public.redeem_codes WHERE code = 'FIRSTBONUS');

INSERT INTO public.redeem_codes (code, bonus_amount, max_uses, description)
SELECT 'LETSGO1000', 1000.00, NULL, 'High value bonus code'
WHERE NOT EXISTS (SELECT 1 FROM public.redeem_codes WHERE code = 'LETSGO1000');

INSERT INTO public.redeem_codes (code, bonus_amount, max_uses, description)
SELECT 'WELCOME50', 50.00, 100, 'Welcome bonus for new users'
WHERE NOT EXISTS (SELECT 1 FROM public.redeem_codes WHERE code = 'WELCOME50');

INSERT INTO public.redeem_codes (code, bonus_amount, max_uses, description)
SELECT 'BONUS500', 500.00, 50, 'Limited time bonus'
WHERE NOT EXISTS (SELECT 1 FROM public.redeem_codes WHERE code = 'BONUS500');

-- Step 4: Remove duplicate entries from user_redeem_history (keep only the first redemption)
DELETE FROM public.user_redeem_history a
USING public.user_redeem_history b
WHERE a.id > b.id
  AND a.user_id = b.user_id
  AND a.code = b.code;

-- Step 6: Add unique constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE table_schema = 'public'
        AND table_name = 'user_redeem_history'
        AND constraint_type = 'UNIQUE'
        AND constraint_name = 'unique_user_code_redemption'
    ) THEN
        RAISE NOTICE 'Adding unique constraint...';

        ALTER TABLE public.user_redeem_history
        ADD CONSTRAINT unique_user_code_redemption UNIQUE (user_id, code);

        RAISE NOTICE 'Constraint added successfully';
    ELSE
        RAISE NOTICE 'Constraint already exists';
    END IF;
END $$;

-- Step 7: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_redeem_history_user_id ON public.user_redeem_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_redeem_history_code ON public.user_redeem_history(code);
CREATE INDEX IF NOT EXISTS idx_user_redeem_history_user_code ON public.user_redeem_history(user_id, code);

-- Step 8: Verify the constraint exists
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1
            FROM information_schema.table_constraints
            WHERE table_schema = 'public'
            AND table_name = 'user_redeem_history'
            AND constraint_type = 'UNIQUE'
            AND constraint_name = 'unique_user_code_redemption'
        ) THEN '✅ UNIQUE CONSTRAINT EXISTS - One-time use is enforced'
        ELSE '❌ CONSTRAINT MISSING - One-time use is NOT enforced'
    END AS status;

