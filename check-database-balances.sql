-- Check if balances table exists and what data it contains
SELECT 
    table_name, 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_name = 'balances' 
ORDER BY ordinal_position;

-- Check all balances in the database
SELECT 
    user_id, 
    symbol, 
    available, 
    locked, 
    created_at,
    updated_at
FROM balances 
ORDER BY user_id, symbol;

-- Count balances by symbol
SELECT 
    symbol, 
    COUNT(*) as count,
    SUM(CAST(available AS DECIMAL)) as total_available
FROM balances 
GROUP BY symbol 
ORDER BY symbol;
