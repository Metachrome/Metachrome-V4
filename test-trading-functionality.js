const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testTradingFunctionality() {
  try {
    console.log('🎯 Testing trading functionality with controls...');

    // Get angela.soenoko user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('username', 'angela.soenoko')
      .single();

    if (userError || !user) {
      console.error('❌ Error finding user:', userError);
      return;
    }

    console.log(`👤 Testing with user: ${user.username} (${user.id})`);
    console.log(`💰 Current balance: $${user.balance}`);
    console.log(`🎯 Current trading mode: ${user.trading_mode || 'normal'}`);

    // Test 1: Set trading mode to WIN
    console.log('\n🧪 Test 1: Setting trading mode to WIN...');
    const winResponse = await fetch('http://localhost:3333/api/admin/trading-controls', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user.id,
        controlType: 'win'
      })
    });

    if (winResponse.ok) {
      const winResult = await winResponse.json();
      console.log('✅ Trading mode set to WIN:', winResult.message);
    } else {
      console.error('❌ Failed to set WIN mode:', await winResponse.text());
    }

    // Test 2: Place a trade that should WIN
    console.log('\n🧪 Test 2: Placing a trade (should WIN)...');
    const tradeResponse = await fetch('http://localhost:3333/api/trades/options', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user.id,
        symbol: 'BTCUSDT',
        direction: 'up',
        amount: 100,
        duration: 30
      })
    });

    if (tradeResponse.ok) {
      const tradeResult = await tradeResponse.json();
      console.log('✅ Trade placed successfully:', tradeResult);
      
      // Wait for trade to complete (30 seconds + buffer)
      console.log('⏳ Waiting for trade to complete (35 seconds)...');
      await new Promise(resolve => setTimeout(resolve, 35000));
      
      // Check user balance after trade
      const { data: updatedUser } = await supabase
        .from('users')
        .select('balance')
        .eq('id', user.id)
        .single();
      
      console.log(`💰 Balance after WIN trade: $${updatedUser.balance}`);
      
      if (parseFloat(updatedUser.balance) > parseFloat(user.balance)) {
        console.log('✅ WIN mode working - balance increased!');
      } else {
        console.log('❌ WIN mode not working - balance did not increase');
      }
    } else {
      console.error('❌ Failed to place trade:', await tradeResponse.text());
    }

    // Test 3: Set trading mode to LOSE
    console.log('\n🧪 Test 3: Setting trading mode to LOSE...');
    const loseResponse = await fetch('http://localhost:3333/api/admin/trading-controls', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user.id,
        controlType: 'lose'
      })
    });

    if (loseResponse.ok) {
      const loseResult = await loseResponse.json();
      console.log('✅ Trading mode set to LOSE:', loseResult.message);
    } else {
      console.error('❌ Failed to set LOSE mode:', await loseResponse.text());
    }

    // Test 4: Place a trade that should LOSE
    console.log('\n🧪 Test 4: Placing a trade (should LOSE)...');
    const { data: currentUser } = await supabase
      .from('users')
      .select('balance')
      .eq('id', user.id)
      .single();

    const loseTrade = await fetch('http://localhost:3333/api/trades/options', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user.id,
        symbol: 'BTCUSDT',
        direction: 'up',
        amount: 100,
        duration: 30
      })
    });

    if (loseTrade.ok) {
      const loseTradeResult = await loseTrade.json();
      console.log('✅ LOSE trade placed successfully:', loseTradeResult);
      
      // Wait for trade to complete
      console.log('⏳ Waiting for trade to complete (35 seconds)...');
      await new Promise(resolve => setTimeout(resolve, 35000));
      
      // Check user balance after trade
      const { data: finalUser } = await supabase
        .from('users')
        .select('balance')
        .eq('id', user.id)
        .single();
      
      console.log(`💰 Balance after LOSE trade: $${finalUser.balance}`);
      
      if (parseFloat(finalUser.balance) === parseFloat(currentUser.balance)) {
        console.log('✅ LOSE mode working - balance stayed the same (lost the trade amount)!');
      } else {
        console.log('❌ LOSE mode not working - balance changed unexpectedly');
      }
    } else {
      console.error('❌ Failed to place LOSE trade:', await loseTrade.text());
    }

    // Reset to normal mode
    console.log('\n🔄 Resetting trading mode to NORMAL...');
    await fetch('http://localhost:3333/api/admin/trading-controls', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user.id,
        controlType: 'normal'
      })
    });

    console.log('🎉 Trading functionality test completed!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Only run if called directly (not imported)
if (require.main === module) {
  console.log('⚠️ This test will take about 2 minutes to complete (waiting for trades to execute)');
  console.log('⚠️ Make sure the server is running on localhost:3333');
  console.log('⚠️ Press Ctrl+C to cancel, or wait 10 seconds to start...');
  
  setTimeout(() => {
    testTradingFunctionality();
  }, 10000);
}
