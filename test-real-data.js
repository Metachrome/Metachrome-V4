const postgres = require('postgres');

async function testRealData() {
  try {
    console.log('🧪 Testing REAL data in database...');
    
    const DATABASE_URL = "postgresql://postgres:HopeAmdHope87^(@db.pybsyzbxyliufkgywtpf.supabase.co:5432/postgres";
    const client = postgres(DATABASE_URL);
    
    // Test connection
    const result = await client`SELECT version()`;
    console.log('✅ Connected to database:', result[0].version.split(' ')[0]);
    
    // 1. Check user verification status
    console.log('\n🧪 Test 1: User Verification Status');
    const user = await client`
      SELECT id, username, verification_status, has_uploaded_documents
      FROM users 
      WHERE username = 'angela.soenoko'
      LIMIT 1
    `;
    
    if (user.length > 0) {
      console.log('👤 User:', user[0]);
      console.log('✅ Verification Status:', user[0].verification_status);
      console.log('✅ Has Documents:', user[0].has_uploaded_documents);
    } else {
      console.log('❌ User not found');
    }
    
    // 2. Check trade statistics
    console.log('\n🧪 Test 2: Trade Statistics');
    const tradeStats = await client`
      SELECT 
        COUNT(*) as total_trades,
        COUNT(CASE WHEN result = 'win' THEN 1 END) as win_trades,
        COUNT(CASE WHEN result = 'lose' THEN 1 END) as lose_trades,
        COALESCE(SUM(CASE WHEN result = 'win' THEN profit END), 0) as total_profit,
        COALESCE(SUM(CASE WHEN result = 'lose' THEN ABS(profit) END), 0) as total_loss,
        COALESCE(SUM(profit), 0) as net_pnl
      FROM trades 
      WHERE profit IS NOT NULL
    `;
    
    const stats = tradeStats[0];
    const winRate = stats.total_trades > 0 ? (stats.win_trades / stats.total_trades * 100) : 0;
    
    console.log('📊 Trade Statistics:');
    console.log(`  Total Trades: ${stats.total_trades}`);
    console.log(`  Win Trades: ${stats.win_trades}`);
    console.log(`  Lose Trades: ${stats.lose_trades}`);
    console.log(`  Win Rate: ${winRate.toFixed(2)}%`);
    console.log(`  Total Profit: $${stats.total_profit}`);
    console.log(`  Total Loss: $${stats.total_loss}`);
    console.log(`  Net P&L: $${stats.net_pnl}`);
    
    // 3. Check withdrawal history
    console.log('\n🧪 Test 3: Withdrawal History');
    const withdrawals = await client`
      SELECT id, user_id, amount, currency, status, created_at
      FROM withdrawals 
      WHERE user_id = ${user[0]?.id}
      ORDER BY created_at DESC
    `;
    
    console.log('💸 Withdrawal Records:', withdrawals.length);
    withdrawals.forEach((w, i) => {
      console.log(`  ${i+1}. ${w.id}: ${w.amount} ${w.currency} - ${w.status} (${w.created_at.toISOString().split('T')[0]})`);
    });
    
    // 4. Summary
    console.log('\n🎉 REAL DATA TEST SUMMARY:');
    console.log('1. User Verification:', user[0]?.verification_status === 'verified' ? '✅ VERIFIED' : '❌ NOT VERIFIED');
    console.log('2. Win Rate:', winRate > 0 ? `✅ ${winRate.toFixed(2)}%` : '❌ 0%');
    console.log('3. Total Profit:', stats.total_profit > 0 ? `✅ $${stats.total_profit}` : '❌ $0');
    console.log('4. Withdrawal History:', withdrawals.length > 0 ? `✅ ${withdrawals.length} records` : '❌ No records');
    
    const allWorking = user[0]?.verification_status === 'verified' && 
                      winRate > 0 && 
                      stats.total_profit > 0 && 
                      withdrawals.length > 0;
    
    if (allWorking) {
      console.log('\n🎉 ALL REAL DATA IS WORKING PERFECTLY! 🎉');
    } else {
      console.log('\n⚠️ Some data may need attention');
    }
    
    await client.end();
    
  } catch (error) {
    console.error('❌ Error testing real data:', error);
  }
}

testRealData();
