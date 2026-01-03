/**
 * Check for expired trades that are still pending
 * This script helps identify trades that should have been completed
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'metachrome.db');

try {
  const db = new Database(dbPath);
  
  console.log('🔍 Checking for expired pending trades...\n');
  
  // Get current timestamp
  const now = new Date().toISOString();
  
  // Check for expired trades
  const expiredTrades = db.prepare(`
    SELECT 
      id,
      user_id,
      symbol,
      direction,
      amount,
      entry_price,
      status,
      result,
      created_at,
      expires_at,
      (julianday('now') - julianday(expires_at)) * 24 * 60 as minutes_since_expired
    FROM trades
    WHERE status = 'active'
    AND expires_at < datetime('now')
    ORDER BY expires_at DESC
  `).all();
  
  console.log('📊 Summary:');
  console.log('─'.repeat(80));
  console.log(`Total Expired Trades: ${expiredTrades.length}`);
  console.log('─'.repeat(80));
  
  if (expiredTrades.length > 0) {
    console.log('\n⚠️  EXPIRED TRADES THAT NEED COMPLETION:\n');
    
    expiredTrades.forEach((trade, idx) => {
      console.log(`${idx + 1}. Trade ID: ${trade.id.slice(0, 8)}...`);
      console.log(`   User ID: ${trade.user_id.slice(0, 8)}...`);
      console.log(`   Symbol: ${trade.symbol}`);
      console.log(`   Direction: ${trade.direction}`);
      console.log(`   Amount: ${trade.amount} USDT`);
      console.log(`   Entry Price: ${trade.entry_price}`);
      console.log(`   Status: ${trade.status}`);
      console.log(`   Result: ${trade.result || 'NULL'}`);
      console.log(`   Created: ${trade.created_at}`);
      console.log(`   Expired: ${trade.expires_at}`);
      console.log(`   ⏰ Expired ${Math.floor(trade.minutes_since_expired)} minutes ago`);
      console.log('');
    });
    
    console.log('─'.repeat(80));
    console.log('⚠️  ACTION REQUIRED:');
    console.log('These trades should be completed. Options:');
    console.log('1. Use Admin Dashboard: Click "Fix Expired Trades" button');
    console.log('2. Restart server: Server will auto-complete on startup');
    console.log('3. Run SQL: Use fix-expired-pending-trades.sql');
    console.log('─'.repeat(80));
  } else {
    console.log('\n✅ No expired pending trades found!');
    console.log('All trades are properly completed.\n');
  }
  
  // Also check for trades with NULL result
  const nullResultTrades = db.prepare(`
    SELECT COUNT(*) as count
    FROM trades
    WHERE result IS NULL OR result = ''
  `).get();
  
  if (nullResultTrades.count > 0) {
    console.log(`\n⚠️  Found ${nullResultTrades.count} trades with NULL result`);
  }
  
  // Show active trades summary
  const activeTrades = db.prepare(`
    SELECT 
      COUNT(*) as count,
      SUM(CASE WHEN expires_at > datetime('now') THEN 1 ELSE 0 END) as still_running,
      SUM(CASE WHEN expires_at <= datetime('now') THEN 1 ELSE 0 END) as expired
    FROM trades
    WHERE status = 'active'
  `).get();
  
  console.log('\n📈 Active Trades Summary:');
  console.log('─'.repeat(80));
  console.log(`Total Active: ${activeTrades.count}`);
  console.log(`Still Running: ${activeTrades.still_running}`);
  console.log(`Expired (Need Completion): ${activeTrades.expired}`);
  console.log('─'.repeat(80));
  
  db.close();
  
} catch (error) {
  if (error.code === 'SQLITE_CANTOPEN') {
    console.error('❌ Database file not found:', dbPath);
    console.error('Make sure you are running this from the project root directory.');
  } else {
    console.error('❌ Error:', error.message);
  }
  process.exit(1);
}

