import { db } from "./server/db";
import { sql } from "drizzle-orm";

async function migrateDatabase() {
  try {
    console.log('🔄 Starting database migration...');

    // Check if method column exists
    const tableInfo = await db.all(sql`PRAGMA table_info(transactions)`);
    const hasMethodColumn = tableInfo.some((col: any) => col.name === 'method');

    if (!hasMethodColumn) {
      console.log('➕ Adding method column to transactions table...');
      await db.run(sql`ALTER TABLE transactions ADD COLUMN method TEXT`);
      console.log('✅ Method column added successfully');
    } else {
      console.log('✅ Method column already exists');
    }

    // Check if currency column exists
    const hasCurrencyColumn = tableInfo.some((col: any) => col.name === 'currency');

    if (!hasCurrencyColumn) {
      console.log('➕ Adding currency column to transactions table...');
      await db.run(sql`ALTER TABLE transactions ADD COLUMN currency TEXT`);
      console.log('✅ Currency column added successfully');
    } else {
      console.log('✅ Currency column already exists');
    }

    // Check if network_fee column exists
    const hasNetworkFeeColumn = tableInfo.some((col: any) => col.name === 'network_fee');

    if (!hasNetworkFeeColumn) {
      console.log('➕ Adding network_fee column to transactions table...');
      await db.run(sql`ALTER TABLE transactions ADD COLUMN network_fee TEXT`);
      console.log('✅ Network_fee column added successfully');
    } else {
      console.log('✅ Network_fee column already exists');
    }

    // Check if metadata column exists
    const hasMetadataColumn = tableInfo.some((col: any) => col.name === 'metadata');

    if (!hasMetadataColumn) {
      console.log('➕ Adding metadata column to transactions table...');
      await db.run(sql`ALTER TABLE transactions ADD COLUMN metadata TEXT`);
      console.log('✅ Metadata column added successfully');
    } else {
      console.log('✅ Metadata column already exists');
    }
    
    console.log('🎉 Database migration completed successfully!');
    
    // Verify the updated schema
    console.log('\n📋 Updated transactions table structure:');
    const updatedTableInfo = await db.all(sql`PRAGMA table_info(transactions)`);
    console.table(updatedTableInfo);
    
  } catch (error) {
    console.error('❌ Error during migration:', error);
  }
}

migrateDatabase();
