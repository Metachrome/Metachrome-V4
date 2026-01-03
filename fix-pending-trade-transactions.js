/**
 * Script to fix pending trade transactions
 * This will update all trade_win and trade_loss transactions from pending to completed
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'dev.db');
const db = new Database(dbPath);

console.log('🔍 Checking for pending trade transactions...\n');

// Get all pending trade transactions
const pendingTrades = db.prepare(`
  SELECT id, user_id, type, amount, status, created_at, description
  FROM transactions
  WHERE (type = 'trade_win' OR type = 'trade_loss')
  AND status = 'pending'
  ORDER BY created_at DESC
`).all();

console.log(`Found ${pendingTrades.length} pending trade transactions\n`);

if (pendingTrades.length === 0) {
  console.log('✅ No pending trade transactions found. All good!');
  db.close();
  process.exit(0);
}

// Display pending transactions
console.log('📋 Pending trade transactions:');
console.log('─'.repeat(100));
pendingTrades.forEach((tx, index) => {
  console.log(`${index + 1}. ID: ${tx.id}`);
  console.log(`   User: ${tx.user_id}`);
  console.log(`   Type: ${tx.type}`);
  console.log(`   Amount: ${tx.amount}`);
  console.log(`   Status: ${tx.status}`);
  console.log(`   Created: ${tx.created_at}`);
  console.log(`   Description: ${tx.description || 'N/A'}`);
  console.log('─'.repeat(100));
});

// Ask for confirmation
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('\n⚠️  Do you want to update these transactions to "completed"? (yes/no): ', (answer) => {
  if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
    console.log('\n🔄 Updating transactions...\n');
    
    const updateStmt = db.prepare(`
      UPDATE transactions
      SET status = 'completed',
          updated_at = CURRENT_TIMESTAMP
      WHERE (type = 'trade_win' OR type = 'trade_loss')
      AND status = 'pending'
    `);
    
    const result = updateStmt.run();
    
    console.log(`✅ Updated ${result.changes} transactions to "completed"\n`);
    
    // Verify the update
    const stillPending = db.prepare(`
      SELECT COUNT(*) as count
      FROM transactions
      WHERE (type = 'trade_win' OR type = 'trade_loss')
      AND status = 'pending'
    `).get();
    
    if (stillPending.count === 0) {
      console.log('✅ All trade transactions are now completed!');
    } else {
      console.log(`⚠️  Warning: ${stillPending.count} trade transactions are still pending`);
    }
  } else {
    console.log('\n❌ Update cancelled');
  }
  
  db.close();
  rl.close();
});

