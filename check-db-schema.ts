import { db } from "./server/db";

async function checkDatabaseSchema() {
  try {
    console.log('🔍 Checking database schema...');
    
    // Check if transactions table exists and its structure
    const tableInfo = await db.all("PRAGMA table_info(transactions)");
    console.log('📋 Transactions table structure:');
    console.table(tableInfo);
    
    // Check if method column exists
    const hasMethodColumn = tableInfo.some((col: any) => col.name === 'method');
    console.log(`🔧 Method column exists: ${hasMethodColumn}`);
    
    if (!hasMethodColumn) {
      console.log('❌ Method column is missing - this is causing the database error');
      console.log('💡 Solution: Need to add the method column to the transactions table');
    }
    
    // Check current balances
    console.log('\n💰 Current balances in database:');
    const balances = await db.all("SELECT * FROM balances");
    console.table(balances);
    
    // Check current users
    console.log('\n👤 Current users in database:');
    const users = await db.all("SELECT id, username, email, role FROM users");
    console.table(users);
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
  }
}

checkDatabaseSchema();
