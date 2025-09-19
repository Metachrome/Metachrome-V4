const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestTrades() {
  console.log('🧪 Creating test trades for trade history...');

  try {
    const testTrades = [
      {
        user_id: 'user-angela-1758195715',
        symbol: 'BTCUSDT',
        direction: 'up',
        amount: 100,
        duration: 30,
        entry_price: 65000,
        exit_price: 65500,
        result: 'win',
        profit_loss: 10,
        status: 'completed',
        created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutes ago
        updated_at: new Date(Date.now() - 8 * 60 * 1000).toISOString()   // 8 minutes ago
      },
      {
        user_id: 'user-angela-1758195715',
        symbol: 'ETHUSDT',
        direction: 'down',
        amount: 200,
        duration: 60,
        entry_price: 3200,
        exit_price: 3250,
        result: 'lose',
        profit_loss: -200,
        status: 'completed',
        created_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(), // 20 minutes ago
        updated_at: new Date(Date.now() - 18 * 60 * 1000).toISOString()  // 18 minutes ago
      },
      {
        user_id: 'user-angela-1758195715',
        symbol: 'BTCUSDT',
        direction: 'up',
        amount: 150,
        duration: 30,
        entry_price: 64800,
        exit_price: 65100,
        result: 'win',
        profit_loss: 15,
        status: 'completed',
        created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        updated_at: new Date(Date.now() - 28 * 60 * 1000).toISOString()  // 28 minutes ago
      },
      {
        user_id: 'user-angela-1758195715',
        symbol: 'SOLUSDT',
        direction: 'down',
        amount: 50,
        duration: 60,
        entry_price: 140,
        exit_price: 135,
        result: 'win',
        profit_loss: 7.5,
        status: 'completed',
        created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
        updated_at: new Date(Date.now() - 43 * 60 * 1000).toISOString()  // 43 minutes ago
      }
    ];

    console.log('📈 Creating test trades...');
    
    for (let i = 0; i < testTrades.length; i++) {
      const trade = testTrades[i];
      const { data, error } = await supabase
        .from('trades')
        .insert([trade])
        .select()
        .single();

      if (error) {
        console.log(`❌ Error creating trade ${i + 1}:`, error.message);
      } else {
        console.log(`✅ Created trade ${i + 1}: ${data.symbol} ${data.direction} ${data.amount} USDT -> ${data.result} (${data.profit_loss} profit)`);
      }
    }

    // Verify all trades were created
    console.log('\n🔍 Verifying created trades...');
    const { data: allTrades, error: verifyError } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', 'user-angela-1758195715')
      .order('created_at', { ascending: false });

    if (verifyError) {
      console.log('❌ Error verifying trades:', verifyError.message);
    } else {
      console.log(`✅ Total trades for angela.soenoko: ${allTrades.length}`);
      console.log('\n📋 Trade History:');
      allTrades.forEach((trade, index) => {
        const profit = trade.result === 'win' ? `+${trade.profit_loss}` : trade.profit_loss;
        console.log(`  ${index + 1}. ${trade.symbol} ${trade.direction.toUpperCase()} ${trade.amount} USDT -> ${trade.result.toUpperCase()} (${profit} USDT)`);
      });
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

createTestTrades();
