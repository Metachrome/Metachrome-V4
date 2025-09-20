-- =====================================================
-- METACHROME REDEEM CODES TABLE CREATION SCRIPT
-- =====================================================
-- Run this SQL in your Supabase SQL Editor to create
-- the missing redeem_codes table and related tables
-- =====================================================

-- Step 1: Create the redeem_codes table
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

-- Step 2: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_redeem_codes_code ON public.redeem_codes(code);
CREATE INDEX IF NOT EXISTS idx_redeem_codes_active ON public.redeem_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_redeem_codes_created_at ON public.redeem_codes(created_at);

-- Step 3: Create the user_redeem_history table
CREATE TABLE IF NOT EXISTS public.user_redeem_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    redeem_code_id UUID REFERENCES redeem_codes(id),
    code VARCHAR(50) NOT NULL,
    bonus_amount DECIMAL(15,2) NOT NULL,
    trades_required INTEGER DEFAULT 10,
    trades_completed INTEGER DEFAULT 0,
    withdrawal_unlocked BOOLEAN DEFAULT false,
    redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Create indexes for user_redeem_history
CREATE INDEX IF NOT EXISTS idx_user_redeem_history_user_id ON public.user_redeem_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_redeem_history_code ON public.user_redeem_history(code);

-- Step 5: Insert default redeem codes
INSERT INTO public.redeem_codes (code, bonus_amount, max_uses, current_uses, is_active, description) VALUES
    ('FIRSTBONUS', 100.00, NULL, 0, true, 'First time user bonus'),
    ('LETSGO1000', 1000.00, NULL, 0, true, 'High value bonus code'),
    ('WELCOME50', 50.00, 100, 0, true, 'Welcome bonus for new users'),
    ('BONUS500', 500.00, 50, 0, true, 'Limited time bonus')
ON CONFLICT (code) DO NOTHING;

-- Step 6: Set up Row Level Security (RLS) policies
ALTER TABLE public.redeem_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_redeem_history ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view active redeem codes
CREATE POLICY "Anyone can view active redeem codes" ON public.redeem_codes
    FOR SELECT USING (is_active = true);

-- Policy: Admins can manage all redeem codes
CREATE POLICY "Admins can manage redeem codes" ON public.redeem_codes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id::text = auth.uid()::text
            AND role IN ('admin', 'super_admin')
        )
    );

-- Policy: Users can view their own redeem history
CREATE POLICY "Users can view own redeem history" ON public.user_redeem_history
    FOR SELECT USING (
        auth.uid()::text = user_id::text
    );

-- Policy: Users can insert their own redeem history
CREATE POLICY "Users can insert own redeem history" ON public.user_redeem_history
    FOR INSERT WITH CHECK (
        auth.uid()::text = user_id::text
    );

-- Policy: Admins can view all redeem history
CREATE POLICY "Admins can view all redeem history" ON public.user_redeem_history
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id::text = auth.uid()::text
            AND role IN ('admin', 'super_admin')
        )
    );

-- Step 7: Verify the setup
SELECT 'redeem_codes table created successfully' as status;
SELECT COUNT(*) as total_codes FROM public.redeem_codes;
SELECT code, bonus_amount, is_active FROM public.redeem_codes ORDER BY created_at;

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================
-- After running this script:
-- 1. The redeem_codes table will be created
-- 2. The user_redeem_history table will be created
-- 3. Default redeem codes will be inserted
-- 4. Security policies will be set up
-- 5. The admin dashboard should work without errors
-- 6. Users should be able to redeem codes successfully
-- =====================================================
