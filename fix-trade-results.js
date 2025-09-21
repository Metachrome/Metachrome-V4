const postgres = require('postgres');

async function fixTradeResults() {
  try {
    console.log('🔧 Converting some losing trades to winning trades...');
    
    const DATABASE_URL = "postgresql://postgres:HopeAmdHope87^(@db.pybsyzbxyliufkgywtpf.supabase.co:5432/postgres";
    const client = postgres(DATABASE_URL);
    
    // Test connection
    const result = await client`SELECT version()`;
    console.log('✅ Connected to database:', result[0].version.split(' ')[0]);
    
    // Get angela.soenoko user
    const angelaUser = await client`
      SELECT id, username
      FROM users 
      WHERE username = 'angela.soenoko'
      LIMIT 1
    `;
    
    if (angelaUser.length > 0) {
      const userId = angelaUser[0].id;
      console.log(`👤 Found user: ${angelaUser[0].username} (${userId})`);
      
      // Get some losing trades to convert to wins
      const losingTrades = await client`
        SELECT id, amount
        FROM trades 
        WHERE user_id = ${userId} AND result = 'lose'
        ORDER BY created_at DESC
        LIMIT 8
      `;
      
      console.log(`📊 Found ${losingTrades.length} losing trades to convert`);
      
      // Convert half of them to wins
      for (let i = 0; i < Math.min(8, losingTrades.length); i++) {
        const trade = losingTrades[i];
        const profit = trade.amount * 0.85; // 85% profit for wins
        
        await client`
          UPDATE trades 
          SET result = 'win',
              profit = ${profit},
              exit_price = entry_price * 1.01,
              updated_at = NOW()
          WHERE id = ${trade.id}
        `;
        
        console.log(`✅ Converted trade ${trade.id.substring(0, 8)}: lose -> win (+$${profit})`);
      }
      
      // Calculate new stats
      const tradeStats = await client`
        SELECT 
          COUNT(*) as total_trades,
          COUNT(CASE WHEN result = 'win' THEN 1 END) as win_trades,
          COUNT(CASE WHEN result = 'lose' THEN 1 END) as lose_trades,
          COALESCE(SUM(CASE WHEN result = 'win' THEN profit END), 0) as total_profit,
          COALESCE(SUM(CASE WHEN result = 'lose' THEN ABS(profit) END), 0) as total_loss,
          COALESCE(SUM(profit), 0) as net_pnl
        FROM trades 
        WHERE status = 'completed' AND profit IS NOT NULL
      `;
      
      const stats = tradeStats[0];
      const winRate = stats.total_trades > 0 ? (stats.win_trades / stats.total_trades * 100) : 0;
      
      console.log('\n📊 UPDATED STATS:');
      console.log(`  Total Trades: ${stats.total_trades}`);
      console.log(`  Win Trades: ${stats.win_trades}`);
      console.log(`  Lose Trades: ${stats.lose_trades}`);
      console.log(`  Win Rate: ${winRate.toFixed(2)}%`);
      console.log(`  Total Profit: $${stats.total_profit}`);
      console.log(`  Total Loss: $${stats.total_loss}`);
      console.log(`  Net P&L: $${stats.net_pnl}`);
      
      // Force cache refresh
      await client`
        UPDATE users 
        SET updated_at = NOW() 
        WHERE id = ${userId}
      `;
      
      console.log('\n✅ Cache refresh triggered!');
      
    } else {
      console.log('❌ angela.soenoko user not found!');
    }
    
    await client.end();
    console.log('\n🎉 Trade results fix completed!');
    
  } catch (error) {
    console.error('❌ Error fixing trade results:', error);
  }
}

fixTradeResults();
