const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestTrade() {
  console.log('🧪 Creating test trade...');

  try {
    // Create a completed test trade for angela.soenoko
    const testTrade = {
      user_id: 'user-angela-1758195715',
      symbol: 'BTCUSDT',
      direction: 'up',
      amount: 100,
      duration: 30,
      entry_price: 65000,
      exit_price: 65500,
      result: 'win',
      payout: 110,
      created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
      updated_at: new Date().toISOString()
    };

    const { data: trade, error: tradeError } = await supabase
      .from('trades')
      .insert([testTrade])
      .select()
      .single();

    if (tradeError) {
      console.log('❌ Error creating test trade:', tradeError.message);
    } else {
      console.log('✅ Test trade created successfully:', trade.id);
      console.log('📈 Trade details:', {
        symbol: trade.symbol,
        direction: trade.direction,
        amount: trade.amount,
        result: trade.result,
        payout: trade.payout
      });
    }

    // Create another test trade (loss)
    const testTrade2 = {
      user_id: 'user-angela-1758195715',
      symbol: 'ETHUSDT',
      direction: 'down',
      amount: 200,
      duration: 60,
      entry_price: 3200,
      exit_price: 3250,
      result: 'lose',
      payout: 0,
      created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutes ago
      updated_at: new Date(Date.now() - 8 * 60 * 1000).toISOString() // 8 minutes ago
    };

    const { data: trade2, error: tradeError2 } = await supabase
      .from('trades')
      .insert([testTrade2])
      .select()
      .single();

    if (tradeError2) {
      console.log('❌ Error creating second test trade:', tradeError2.message);
    } else {
      console.log('✅ Second test trade created successfully:', trade2.id);
      console.log('📈 Trade details:', {
        symbol: trade2.symbol,
        direction: trade2.direction,
        amount: trade2.amount,
        result: trade2.result,
        payout: trade2.payout
      });
    }

    // Verify trades were created
    console.log('🔍 Verifying trades...');
    const { data: allTrades, error: verifyError } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', 'user-angela-1758195715');

    if (verifyError) {
      console.log('❌ Error verifying trades:', verifyError.message);
    } else {
      console.log('✅ Total trades for angela.soenoko:', allTrades.length);
      allTrades.forEach(trade => {
        console.log(`  - ${trade.symbol} ${trade.direction} ${trade.amount} USDT -> ${trade.result} (${trade.payout} payout)`);
      });
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

createTestTrade();
