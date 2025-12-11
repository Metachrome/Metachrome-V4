-- Add result column to trades table for withdrawal eligibility check
-- This column stores the trade outcome: 'win', 'lose', or 'normal'

ALTER TABLE trades ADD COLUMN result TEXT CHECK (result IN ('win', 'lose', 'normal'));

-- Update existing completed trades to have a result based on their profit
-- Positive profit = win, negative profit = lose, zero or null = normal
UPDATE trades 
SET result = CASE 
  WHEN status = 'completed' AND profit IS NOT NULL AND CAST(profit AS REAL) > 0 THEN 'win'
  WHEN status = 'completed' AND profit IS NOT NULL AND CAST(profit AS REAL) < 0 THEN 'lose'
  WHEN status = 'completed' THEN 'normal'
  ELSE NULL
END
WHERE result IS NULL;

