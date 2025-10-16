import { db } from "./db";
import { sql } from "drizzle-orm";

/**
 * This script fixes the transactions table schema to match Drizzle ORM expectations.
 * The issue: The database was created with DECIMAL(15,2) but Drizzle expects DECIMAL(18,8)
 * This causes amounts to be truncated or stored as 0.
 */
async function fixTransactionsAmountColumn() {
  try {
    console.log('🔄 Starting transactions table schema fix...');

    // Step 1: Check current schema
    console.log('📋 Checking current transactions table structure...');
    const currentSchema = await db.execute(sql`
      SELECT column_name, data_type, numeric_precision, numeric_scale
      FROM information_schema.columns
      WHERE table_name = 'transactions'
      AND column_name = 'amount'
      ORDER BY ordinal_position
    `);
    
    console.log('Current amount column:', currentSchema.rows);

    // Step 2: Check if we need to fix the column
    const amountColumn = currentSchema.rows?.[0];
    
    if (!amountColumn) {
      console.error('❌ Amount column not found!');
      return;
    }

    const currentPrecision = amountColumn.numeric_precision;
    const currentScale = amountColumn.numeric_scale;
    
    console.log(`Current precision: ${currentPrecision}, scale: ${currentScale}`);
    console.log(`Expected precision: 18, scale: 8`);

    if (currentPrecision === 18 && currentScale === 8) {
      console.log('✅ Amount column already has correct precision!');
      return;
    }

    // Step 3: Alter the column to have correct precision
    console.log('⚠️ Amount column precision is incorrect - attempting to fix...');
    
    try {
      // First, try to alter the column directly
      await db.execute(sql`
        ALTER TABLE transactions 
        ALTER COLUMN amount TYPE DECIMAL(18,8)
      `);
      console.log('✅ Amount column precision updated to DECIMAL(18,8)');
    } catch (alterError) {
      console.error('❌ Could not alter amount column directly:', alterError);
      console.log('💡 This might require recreating the table');
      
      // If direct alter fails, we might need to recreate the table
      // But this is risky, so we'll just log the error
      throw alterError;
    }

    // Step 4: Verify the fix
    console.log('\n📋 Verifying updated schema...');
    const updatedSchema = await db.execute(sql`
      SELECT column_name, data_type, numeric_precision, numeric_scale
      FROM information_schema.columns
      WHERE table_name = 'transactions'
      AND column_name = 'amount'
    `);
    
    console.log('Updated amount column:', updatedSchema.rows);
    console.log('\n✅ Migration completed successfully!');

  } catch (error) {
    console.error('❌ Error during migration:', error);
    throw error;
  }
}

// Run the migration
fixTransactionsAmountColumn().catch(console.error);

