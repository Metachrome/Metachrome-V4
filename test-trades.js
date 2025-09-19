const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testTrades() {
  console.log('🧪 Testing trades data...');

  try {
    // Check trades table
    console.log('📈 Checking trades...');
    const { data: trades, error: tradesError } = await supabase
      .from('trades')
      .select('*')
      .limit(10);
    
    if (tradesError) {
      console.log('❌ Error getting trades:', tradesError.message);
    } else {
      console.log('📈 Found trades:', trades.length);
      if (trades.length > 0) {
        console.log('📈 Sample trade:', trades[0]);
        console.log('📈 All trades for user-angela-1758195715:');
        const angelaTrades = trades.filter(t => t.user_id === 'user-angela-1758195715');
        console.log('📈 Angela trades count:', angelaTrades.length);
        angelaTrades.forEach(trade => {
          console.log(`  - ${trade.id}: ${trade.symbol} ${trade.direction} ${trade.amount} ${trade.result} (${trade.created_at})`);
        });
      }
    }

    // Check users
    console.log('👥 Checking users...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, username, balance')
      .limit(5);
    
    if (usersError) {
      console.log('❌ Error getting users:', usersError.message);
    } else {
      console.log('👥 Found users:', users.map(u => ({ id: u.id, username: u.username, balance: u.balance })));
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testTrades();
