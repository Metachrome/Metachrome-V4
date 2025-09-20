-- METACHROME REDEEM CODES DATABASE SETUP
-- Run this script in Supabase SQL Editor to create all required tables

-- 1. Create redeem_codes table
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

-- 2. Create user_redeem_history table
CREATE TABLE IF NOT EXISTS public.user_redeem_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL,
  bonus_amount DECIMAL(10,2) NOT NULL,
  redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_code_redemption UNIQUE (user_id, code)
);

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_redeem_codes_code ON public.redeem_codes(code);
CREATE INDEX IF NOT EXISTS idx_redeem_codes_active ON public.redeem_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_redeem_codes_created_at ON public.redeem_codes(created_at);
CREATE INDEX IF NOT EXISTS idx_user_redeem_history_user_id ON public.user_redeem_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_redeem_history_code ON public.user_redeem_history(code);

-- 4. Insert default redeem codes
INSERT INTO public.redeem_codes (code, bonus_amount, max_uses, current_uses, description) VALUES
  ('FIRSTBONUS', 100.00, NULL, 0, 'First time user bonus'),
  ('LETSGO1000', 1000.00, NULL, 0, 'High value bonus code'),
  ('WELCOME50', 50.00, 100, 0, 'Welcome bonus for new users'),
  ('BONUS500', 500.00, 50, 0, 'Limited time bonus')
ON CONFLICT (code) DO NOTHING;

-- 5. Enable Row Level Security (RLS) for security
ALTER TABLE public.redeem_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_redeem_history ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for redeem_codes table
-- Allow authenticated users to read active codes
CREATE POLICY "Allow authenticated users to read active redeem codes" ON public.redeem_codes
  FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);

-- Allow service role to manage all codes (for admin operations)
CREATE POLICY "Allow service role full access to redeem codes" ON public.redeem_codes
  FOR ALL USING (auth.role() = 'service_role');

-- 7. Create RLS policies for user_redeem_history table
-- Allow users to read their own redemption history
CREATE POLICY "Allow users to read own redemption history" ON public.user_redeem_history
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow service role to manage all redemption history (for admin operations)
CREATE POLICY "Allow service role full access to redemption history" ON public.user_redeem_history
  FOR ALL USING (auth.role() = 'service_role');

-- 8. Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. Create trigger to automatically update updated_at
CREATE TRIGGER update_redeem_codes_updated_at BEFORE UPDATE ON public.redeem_codes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. Verify the setup
SELECT 'Setup completed successfully!' as status;
SELECT 'Redeem codes table:' as info, count(*) as total_codes FROM public.redeem_codes;
SELECT 'Available codes:' as info, code, bonus_amount, is_active FROM public.redeem_codes ORDER BY bonus_amount DESC;
