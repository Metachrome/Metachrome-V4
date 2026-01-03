/**
 * Script to check all pending transactions and their details
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'dev.db');
const db = new Database(dbPath);

console.log('🔍 Checking all pending transactions...\n');

// Get all pending transactions with user info
const pendingTransactions = db.prepare(`
  SELECT 
    t.id,
    t.user_id,
    u.username,
    t.type,
    t.amount,
    t.symbol,
    t.status,
    t.method,
    t.description,
    t.reference_id,
    t.created_at
  FROM transactions t
  LEFT JOIN users u ON t.user_id = u.id
  WHERE t.status = 'pending'
  ORDER BY t.created_at DESC
`).all();

console.log(`Found ${pendingTransactions.length} pending transactions\n`);

if (pendingTransactions.length === 0) {
  console.log('✅ No pending transactions found!');
  db.close();
  process.exit(0);
}

// Group by type
const byType = {};
pendingTransactions.forEach(tx => {
  if (!byType[tx.type]) {
    byType[tx.type] = [];
  }
  byType[tx.type].push(tx);
});

console.log('📊 Summary by type:');
console.log('═'.repeat(100));
Object.keys(byType).forEach(type => {
  console.log(`${type}: ${byType[type].length} transactions`);
});
console.log('═'.repeat(100));
console.log('');

// Display all pending transactions
console.log('📋 All pending transactions:');
console.log('═'.repeat(100));

pendingTransactions.forEach((tx, index) => {
  console.log(`\n${index + 1}. Transaction ID: ${tx.id}`);
  console.log(`   User: ${tx.username || 'Unknown'} (${tx.user_id})`);
  console.log(`   Type: ${tx.type}`);
  console.log(`   Amount: ${tx.amount} ${tx.symbol || 'USDT'}`);
  console.log(`   Status: ${tx.status}`);
  console.log(`   Method: ${tx.method || 'N/A'}`);
  console.log(`   Description: ${tx.description || 'N/A'}`);
  console.log(`   Reference ID: ${tx.reference_id || 'N/A'}`);
  console.log(`   Created: ${tx.created_at}`);
  console.log('─'.repeat(100));
});

// Check if there are related trades for trade transactions
console.log('\n\n🔍 Checking related trades for trade transactions...\n');

const tradeTransactions = pendingTransactions.filter(tx => 
  tx.type === 'trade_win' || tx.type === 'trade_loss'
);

if (tradeTransactions.length > 0) {
  console.log(`Found ${tradeTransactions.length} pending trade transactions\n`);
  
  tradeTransactions.forEach((tx, index) => {
    console.log(`${index + 1}. Transaction: ${tx.id}`);
    
    if (tx.reference_id) {
      const trade = db.prepare(`
        SELECT id, symbol, direction, amount, status, result, profit, created_at, completed_at
        FROM trades
        WHERE id = ?
      `).get(tx.reference_id);
      
      if (trade) {
        console.log(`   ✅ Related trade found:`);
        console.log(`      Trade ID: ${trade.id}`);
        console.log(`      Symbol: ${trade.symbol}`);
        console.log(`      Direction: ${trade.direction}`);
        console.log(`      Amount: ${trade.amount}`);
        console.log(`      Status: ${trade.status}`);
        console.log(`      Result: ${trade.result || 'N/A'}`);
        console.log(`      Profit: ${trade.profit || 'N/A'}`);
        console.log(`      Completed: ${trade.completed_at || 'Not completed'}`);
      } else {
        console.log(`   ❌ No related trade found for reference_id: ${tx.reference_id}`);
      }
    } else {
      console.log(`   ⚠️  No reference_id found`);
    }
    console.log('');
  });
}

db.close();
console.log('\n✅ Check complete!');

