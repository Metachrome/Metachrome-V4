/**
 * Script to check transactions table schema
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'dev.db');
const db = new Database(dbPath);

console.log('🔍 Checking transactions table schema...\n');

// Get table info
const tableInfo = db.prepare(`PRAGMA table_info(transactions)`).all();

console.log('📋 Transactions table columns:');
console.log('═'.repeat(80));
tableInfo.forEach(col => {
  console.log(`${col.name.padEnd(20)} | ${col.type.padEnd(15)} | ${col.notnull ? 'NOT NULL' : 'NULL'.padEnd(8)} | Default: ${col.dflt_value || 'NULL'}`);
});
console.log('═'.repeat(80));

// Get sample pending transaction
console.log('\n📋 Sample pending transactions:');
const sample = db.prepare(`
  SELECT *
  FROM transactions
  WHERE status = 'pending'
  LIMIT 3
`).all();

if (sample.length > 0) {
  console.log(`\nFound ${sample.length} sample(s):\n`);
  sample.forEach((tx, index) => {
    console.log(`${index + 1}. Transaction:`);
    Object.keys(tx).forEach(key => {
      console.log(`   ${key}: ${tx[key]}`);
    });
    console.log('─'.repeat(80));
  });
} else {
  console.log('\n✅ No pending transactions found!');
}

db.close();

