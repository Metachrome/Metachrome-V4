-- METACHROME REDEEM CODES TABLE SETUP
-- Run this SQL in your Supabase dashboard to fix the admin dashboard

-- Step 1: Create redeem_codes table
CREATE TABLE IF NOT EXISTS public.redeem_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  bonus_amount DECIMAL(10,2) NOT NULL,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create user_redeem_history table
CREATE TABLE IF NOT EXISTS public.user_redeem_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL,
  bonus_amount DECIMAL(10,2) NOT NULL,
  redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_code_redemption UNIQUE (user_id, code)
);

-- Step 3: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_redeem_codes_code ON public.redeem_codes(code);
CREATE INDEX IF NOT EXISTS idx_redeem_codes_active ON public.redeem_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_redeem_codes_created_at ON public.redeem_codes(created_at);
CREATE INDEX IF NOT EXISTS idx_user_redeem_history_user_id ON public.user_redeem_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_redeem_history_code ON public.user_redeem_history(code);

-- Step 4: Insert sample redeem codes
INSERT INTO public.redeem_codes (code, bonus_amount, max_uses, current_uses, description) VALUES
  ('FIRSTBONUS', 100.00, NULL, 0, 'First time user bonus'),
  ('LETSGO1000', 1000.00, NULL, 0, 'High value bonus code'),
  ('WELCOME50', 50.00, 100, 0, 'Welcome bonus for new users'),
  ('BONUS500', 500.00, 50, 0, 'Limited time bonus')
ON CONFLICT (code) DO NOTHING;

-- Step 5: Enable Row Level Security (RLS) if needed
ALTER TABLE public.redeem_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_redeem_history ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS policies for admin access
CREATE POLICY "Admin can manage redeem codes" ON public.redeem_codes
  FOR ALL USING (true);

CREATE POLICY "Admin can manage redeem history" ON public.user_redeem_history
  FOR ALL USING (true);

-- Verification query (run this to check if setup worked)
SELECT 'Setup Complete!' as status, count(*) as total_codes FROM public.redeem_codes;
