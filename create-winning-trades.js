const postgres = require('postgres');

async function createWinningTrades() {
  try {
    console.log('🔧 Creating some winning trades to improve win rate...');
    
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
      
      // Create some winning trades
      const winningTrades = [
        {
          id: 'win-trade-001',
          amount: 100,
          direction: 'up',
          entry_price: 65000.00,
          exit_price: 65500.00,
          profit: 85.00
        },
        {
          id: 'win-trade-002',
          amount: 200,
          direction: 'down',
          entry_price: 65500.00,
          exit_price: 65000.00,
          profit: 170.00
        },
        {
          id: 'win-trade-003',
          amount: 150,
          direction: 'up',
          entry_price: 65000.00,
          exit_price: 65800.00,
          profit: 127.50
        },
        {
          id: 'win-trade-004',
          amount: 300,
          direction: 'down',
          entry_price: 65800.00,
          exit_price: 65200.00,
          profit: 255.00
        },
        {
          id: 'win-trade-005',
          amount: 250,
          direction: 'up',
          entry_price: 65200.00,
          exit_price: 65900.00,
          profit: 212.50
        }
      ];
      
      for (let i = 0; i < winningTrades.length; i++) {
        const trade = winningTrades[i];
        const hoursAgo = (i + 1) * 3; // 3, 6, 9, 12, 15 hours ago
        
        await client`
          INSERT INTO trades (
            id, user_id, symbol, amount, direction, duration, entry_price, exit_price, result, profit, status, created_at, expires_at, updated_at
          ) VALUES (
            ${trade.id},
            ${userId},
            'BTCUSDT',
            ${trade.amount},
            ${trade.direction},
            30,
            ${trade.entry_price},
            ${trade.exit_price},
            'win',
            ${trade.profit},
            'completed',
            NOW() - INTERVAL '${hoursAgo} hours',
            NOW() - INTERVAL '${hoursAgo - 1} hours',
            NOW()
          )
        `;
        
        console.log(`✅ Created winning trade: ${trade.id} - $${trade.amount} -> +$${trade.profit}`);
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
      
    } else {
      console.log('❌ angela.soenoko user not found!');
    }
    
    await client.end();
    console.log('\n🎉 Winning trades creation completed!');
    
  } catch (error) {
    console.error('❌ Error creating winning trades:', error);
  }
}

createWinningTrades();
