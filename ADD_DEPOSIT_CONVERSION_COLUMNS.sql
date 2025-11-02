-- Add conversion tracking columns to deposits table
-- This allows tracking of crypto-to-USDT conversions for deposits
-- Run this in Supabase SQL Editor

-- Add new columns to deposits table
ALTER TABLE public.deposits
ADD COLUMN IF NOT EXISTS converted_amount_usdt DECIMAL(18, 8),
ADD COLUMN IF NOT EXISTS conversion_rate DECIMAL(18, 8),
ADD COLUMN IF NOT EXISTS original_amount DECIMAL(18, 8),
ADD COLUMN IF NOT EXISTS original_currency VARCHAR(20);

-- Add comments to explain the columns
COMMENT ON COLUMN public.deposits.converted_amount_usdt IS 'The amount in USDT after conversion from original crypto';
COMMENT ON COLUMN public.deposits.conversion_rate IS 'The exchange rate used for conversion (crypto price in USD)';
COMMENT ON COLUMN public.deposits.original_amount IS 'The original deposit amount in the deposited cryptocurrency';
COMMENT ON COLUMN public.deposits.original_currency IS 'The original cryptocurrency deposited (BTC, ETH, SOL, etc.)';

-- Create index for faster queries on conversion tracking
CREATE INDEX IF NOT EXISTS idx_deposits_original_currency ON public.deposits(original_currency);
CREATE INDEX IF NOT EXISTS idx_deposits_converted_amount ON public.deposits(converted_amount_usdt);

-- Verify the columns were added
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'deposits'
AND column_name IN ('converted_amount_usdt', 'conversion_rate', 'original_amount', 'original_currency')
ORDER BY ordinal_position;

