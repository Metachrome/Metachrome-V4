# Deployment Migration Guide - Add Result Field

## Overview
This migration adds a `result` field to the `trades` table to properly track withdrawal eligibility based on completed trades.

## What Changed
- Added `result` VARCHAR(10) column to `trades` table
- Values: 'win', 'lose', 'normal'
- Updated existing completed trades with result based on profit

## Migration Steps for Production

### Option 1: Using the Migration Script (Recommended)

1. **Set DATABASE_URL environment variable** (if not already set in production)
   ```bash
   export DATABASE_URL="your_postgresql_connection_string"
   ```

2. **Run the migration script**
   ```bash
   npx tsx migrate-add-result-column.ts
   ```

   This script will:
   - Check if `result` column already exists
   - Add the column if it doesn't exist
   - Update existing completed trades with result values
   - Show verification data

### Option 2: Using SQL Directly

If you prefer to run SQL directly on your production database:

```sql
-- Add result column
ALTER TABLE trades 
ADD COLUMN result VARCHAR(10) CHECK (result IN ('win', 'lose', 'normal'));

-- Update existing completed trades
UPDATE trades 
SET result = CASE 
  WHEN status = 'completed' AND profit IS NOT NULL AND profit::numeric > 0 THEN 'win'
  WHEN status = 'completed' AND profit IS NOT NULL AND profit::numeric < 0 THEN 'lose'
  WHEN status = 'completed' THEN 'normal'
  ELSE NULL
END
WHERE result IS NULL;
```

### Option 3: Using Railway CLI

If deployed on Railway:

```bash
# Connect to Railway database
railway connect

# Run the migration script
npx tsx migrate-add-result-column.ts
```

## Verification

After running the migration, verify:

1. **Check column exists:**
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'trades' AND column_name = 'result';
   ```

2. **Check data:**
   ```sql
   SELECT result, COUNT(*) as count
   FROM trades
   WHERE status = 'completed'
   GROUP BY result;
   ```

3. **Test withdrawal eligibility:**
   - Login as a user with 2+ completed trades
   - Try to withdraw
   - Should work if user has 2+ completed trades with valid result

## Rollback (if needed)

If you need to rollback:

```sql
ALTER TABLE trades DROP COLUMN result;
```

## Notes

- This migration is **safe to run multiple times** - it checks if the column exists first
- Existing trades will be updated automatically based on their profit values
- New trades will have `result` set automatically by the trading service
- The withdrawal requirement is: **2 completed trades with valid result** (win/lose/normal)

