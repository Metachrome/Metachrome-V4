const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testActualSchema() {
  console.log('🔍 Testing actual database schema...');

  try {
    // Try to insert a minimal trade to see what fields are required/available
    console.log('🧪 Testing minimal trade insertion...');
    
    const testTrade = {
      user_id: 'user-angela-1758195715',
      symbol: 'BTCUSDT',
      direction: 'up',
      amount: 100,
      duration: 30,
      entry_price: 65000
    };

    const { data: trade, error: tradeError } = await supabase
      .from('trades')
      .insert([testTrade])
      .select()
      .single();

    if (tradeError) {
      console.log('❌ Error with minimal trade:', tradeError.message);
      
      // Try with even more minimal data
      console.log('🧪 Testing ultra-minimal trade...');
      const ultraMinimal = {
        user_id: 'user-angela-1758195715',
        symbol: 'BTCUSDT',
        amount: 100,
        direction: 'up'
      };

      const { data: trade2, error: tradeError2 } = await supabase
        .from('trades')
        .insert([ultraMinimal])
        .select()
        .single();

      if (tradeError2) {
        console.log('❌ Error with ultra-minimal trade:', tradeError2.message);
      } else {
        console.log('✅ Ultra-minimal trade created:', trade2.id);
        console.log('📋 Trade structure:', trade2);
        
        // Clean up
        await supabase.from('trades').delete().eq('id', trade2.id);
        console.log('🧹 Cleaned up test trade');
      }
    } else {
      console.log('✅ Minimal trade created:', trade.id);
      console.log('📋 Trade structure:', trade);
      
      // Clean up
      await supabase.from('trades').delete().eq('id', trade.id);
      console.log('🧹 Cleaned up test trade');
    }

  } catch (error) {
    console.error('❌ Schema test failed:', error);
  }
}

testActualSchema();
