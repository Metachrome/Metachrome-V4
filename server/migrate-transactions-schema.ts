import { db } from "./db";
import { sql } from "drizzle-orm";

async function migrateTransactionsSchema() {
  try {
    console.log('🔄 Starting transactions table schema migration...');

    // Step 1: Check current schema
    console.log('📋 Checking current transactions table structure...');
    const currentSchema = await db.execute(sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'transactions'
      ORDER BY ordinal_position
    `);
    
    console.log('Current schema:', currentSchema);

    // Step 2: Check if amount column has correct precision
    const amountColumn = currentSchema.rows?.find((col: any) => col.column_name === 'amount');
    
    if (amountColumn) {
      console.log(`Current amount column type: ${amountColumn.data_type}`);
      
      // If it's NUMERIC or DECIMAL with wrong precision, we need to fix it
      if (amountColumn.data_type.includes('numeric') || amountColumn.data_type.includes('decimal')) {
        console.log('✅ Amount column exists and is decimal type');
        
        // Check if we need to alter the column
        if (!amountColumn.data_type.includes('18,8')) {
          console.log('⚠️ Amount column precision is not 18,8 - attempting to fix...');
          
          try {
            // Alter the column to have correct precision
            await db.execute(sql`
              ALTER TABLE transactions 
              ALTER COLUMN amount TYPE DECIMAL(18,8)
            `);
            console.log('✅ Amount column precision updated to DECIMAL(18,8)');
          } catch (alterError) {
            console.error('❌ Could not alter amount column directly:', alterError);
            console.log('💡 This might require recreating the table');
          }
        }
      }
    } else {
      console.error('❌ Amount column not found in transactions table!');
    }

    // Step 3: Verify the fix
    console.log('\n📋 Verifying updated schema...');
    const updatedSchema = await db.execute(sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'transactions'
      ORDER BY ordinal_position
    `);
    
    console.log('Updated schema:', updatedSchema);
    console.log('\n✅ Migration completed!');

  } catch (error) {
    console.error('❌ Error during migration:', error);
    throw error;
  }
}

// Run the migration
migrateTransactionsSchema().catch(console.error);

