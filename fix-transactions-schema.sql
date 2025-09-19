-- Fix transactions table schema to match application requirements
-- This script adds missing columns to the transactions table

DO $$
BEGIN
    -- Check if symbol column exists and add it if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'transactions' 
        AND column_name = 'symbol' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE transactions ADD COLUMN symbol VARCHAR(20) NOT NULL DEFAULT 'USDT';
        RAISE NOTICE 'Added symbol column to transactions table';
    ELSE
        RAISE NOTICE 'Symbol column already exists in transactions table';
    END IF;

    -- Check if fee column exists and add it if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'transactions' 
        AND column_name = 'fee' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE transactions ADD COLUMN fee DECIMAL(18,8) DEFAULT 0;
        RAISE NOTICE 'Added fee column to transactions table';
    ELSE
        RAISE NOTICE 'Fee column already exists in transactions table';
    END IF;

    -- Check if tx_hash column exists and add it if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'transactions' 
        AND column_name = 'tx_hash' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE transactions ADD COLUMN tx_hash VARCHAR(255);
        RAISE NOTICE 'Added tx_hash column to transactions table';
    ELSE
        RAISE NOTICE 'Tx_hash column already exists in transactions table';
    END IF;

    -- Check if from_address column exists and add it if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'transactions' 
        AND column_name = 'from_address' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE transactions ADD COLUMN from_address VARCHAR(255);
        RAISE NOTICE 'Added from_address column to transactions table';
    ELSE
        RAISE NOTICE 'From_address column already exists in transactions table';
    END IF;

    -- Check if to_address column exists and add it if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'transactions' 
        AND column_name = 'to_address' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE transactions ADD COLUMN to_address VARCHAR(255);
        RAISE NOTICE 'Added to_address column to transactions table';
    ELSE
        RAISE NOTICE 'To_address column already exists in transactions table';
    END IF;

    -- Check if network_fee column exists and add it if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'transactions' 
        AND column_name = 'network_fee' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE transactions ADD COLUMN network_fee DECIMAL(18,8);
        RAISE NOTICE 'Added network_fee column to transactions table';
    ELSE
        RAISE NOTICE 'Network_fee column already exists in transactions table';
    END IF;

    -- Check if metadata column exists and add it if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'transactions' 
        AND column_name = 'metadata' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE transactions ADD COLUMN metadata JSONB;
        RAISE NOTICE 'Added metadata column to transactions table';
    ELSE
        RAISE NOTICE 'Metadata column already exists in transactions table';
    END IF;

    -- Update transaction type constraint to include all required types
    BEGIN
        ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_type_check;
        ALTER TABLE transactions ADD CONSTRAINT transactions_type_check 
            CHECK (type IN ('deposit', 'withdraw', 'trade', 'transfer'));
        RAISE NOTICE 'Updated transaction type constraint';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not update transaction type constraint: %', SQLERRM;
    END;

    -- Update transaction status constraint to include all required statuses
    BEGIN
        ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_status_check;
        ALTER TABLE transactions ADD CONSTRAINT transactions_status_check 
            CHECK (status IN ('pending', 'completed', 'failed'));
        RAISE NOTICE 'Updated transaction status constraint';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not update transaction status constraint: %', SQLERRM;
    END;

END $$;

-- Display final table structure
SELECT 'Transactions table structure after migration:' as message;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'transactions' 
AND table_schema = 'public'
ORDER BY ordinal_position;
