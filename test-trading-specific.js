// Specific test for trading functionality
const fetch = globalThis.fetch || require('node-fetch');

async function testTradingFunctionality() {
  console.log('🎯 TESTING TRADING FUNCTIONALITY...\n');

  try {
    // Step 1: Login as user
    console.log('🔐 Step 1: User login...');
    const loginResponse = await fetch('http://localhost:3005/api/auth/user/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'angela.soenoko',
        password: 'newpass123'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const loginResult = await loginResponse.json();
    if (!loginResult.success) {
      throw new Error(`Login failed: ${loginResult.message}`);
    }

    const authToken = loginResult.token;
    const userId = loginResult.user.id;
    console.log(`✅ Login successful: ${loginResult.user.username}, Balance: $${loginResult.user.balance}`);

    // Step 2: Get initial balance
    const initialBalanceResponse = await fetch(`http://localhost:3005/api/users/${userId}/balance`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const initialBalanceData = await initialBalanceResponse.json();
    const initialBalance = parseFloat(initialBalanceData.balance);
    console.log(`💰 Initial balance: $${initialBalance}`);

    // Step 3: Set trading mode to LOSE
    console.log('\n🎯 Step 3: Setting trading mode to LOSE...');
    const tradingControlResponse = await fetch('http://localhost:3005/api/admin/trading-controls', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: userId,
        controlType: 'lose'
      })
    });

    if (tradingControlResponse.ok) {
      const tradingResult = await tradingControlResponse.json();
      console.log(`✅ Trading mode set to LOSE: ${tradingResult.message || 'Success'}`);
    } else {
      console.log('⚠️ Trading control failed, but continuing test...');
    }

    // Step 4: Create a trade that should lose
    console.log('\n📉 Step 4: Creating trade (should LOSE)...');
    const tradeAmount = 100;
    const tradeDuration = 30;

    const tradeResponse = await fetch('http://localhost:3005/api/trades/options', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        userId: userId,
        symbol: 'BTC/USDT',
        direction: 'up',
        amount: tradeAmount,
        duration: tradeDuration
      })
    });

    if (!tradeResponse.ok) {
      throw new Error(`Trade creation failed: ${tradeResponse.status}`);
    }

    const tradeResult = await tradeResponse.json();
    if (!tradeResult.success) {
      throw new Error(`Trade creation failed: ${tradeResult.message}`);
    }

    const tradeId = tradeResult.trade.id;
    console.log(`✅ Trade created: ${tradeId}`);

    // Step 5: Wait for trade completion
    console.log(`⏳ Waiting ${tradeDuration + 5} seconds for trade completion...`);
    await new Promise(resolve => setTimeout(resolve, (tradeDuration + 5) * 1000));

    // Step 6: Check trade result and balance
    const tradesResponse = await fetch(`http://localhost:3005/api/users/${userId}/trades`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const trades = await tradesResponse.json();
    const completedTrade = trades.find(t => t.id === tradeId);

    if (completedTrade) {
      console.log(`🏁 Trade completed: ${completedTrade.result || 'unknown'}`);
    } else {
      console.log('⚠️ Trade not found in history');
    }

    // Check balance after LOSE trade
    const balanceAfterLoseResponse = await fetch(`http://localhost:3005/api/users/${userId}/balance`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const balanceAfterLoseData = await balanceAfterLoseResponse.json();
    const balanceAfterLose = parseFloat(balanceAfterLoseData.balance);
    console.log(`💰 Balance after LOSE trade: $${balanceAfterLose}`);

    if (balanceAfterLose < initialBalance) {
      console.log('✅ LOSE mode working correctly - balance decreased!');
    } else {
      console.log('❌ LOSE mode not working - balance did not decrease');
    }

    // Step 7: Set trading mode to WIN
    console.log('\n🎯 Step 7: Setting trading mode to WIN...');
    const winControlResponse = await fetch('http://localhost:3005/api/admin/trading-controls', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: userId,
        controlType: 'win'
      })
    });

    if (winControlResponse.ok) {
      const winResult = await winControlResponse.json();
      console.log(`✅ Trading mode set to WIN: ${winResult.message || 'Success'}`);
    } else {
      console.log('⚠️ WIN trading control failed, but continuing test...');
    }

    // Step 8: Create a trade that should win
    console.log('\n📈 Step 8: Creating trade (should WIN)...');
    const winTradeResponse = await fetch('http://localhost:3005/api/trades/options', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        userId: userId,
        symbol: 'BTC/USDT',
        direction: 'up',
        amount: tradeAmount,
        duration: tradeDuration
      })
    });

    if (!winTradeResponse.ok) {
      throw new Error(`WIN trade creation failed: ${winTradeResponse.status}`);
    }

    const winTradeResult = await winTradeResponse.json();
    if (!winTradeResult.success) {
      throw new Error(`WIN trade creation failed: ${winTradeResult.message}`);
    }

    const winTradeId = winTradeResult.trade.id;
    console.log(`✅ WIN trade created: ${winTradeId}`);

    // Step 9: Wait for WIN trade completion
    console.log(`⏳ Waiting ${tradeDuration + 5} seconds for WIN trade completion...`);
    await new Promise(resolve => setTimeout(resolve, (tradeDuration + 5) * 1000));

    // Step 10: Check WIN trade result and balance
    const winTradesResponse = await fetch(`http://localhost:3005/api/users/${userId}/trades`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const winTrades = await winTradesResponse.json();
    const completedWinTrade = winTrades.find(t => t.id === winTradeId);

    if (completedWinTrade) {
      console.log(`🏁 WIN trade completed: ${completedWinTrade.result || 'unknown'}`);
    } else {
      console.log('⚠️ WIN trade not found in history');
    }

    // Check final balance
    const finalBalanceResponse = await fetch(`http://localhost:3005/api/users/${userId}/balance`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const finalBalanceData = await finalBalanceResponse.json();
    const finalBalance = parseFloat(finalBalanceData.balance);
    console.log(`💰 Final balance: $${finalBalance}`);

    if (finalBalance > balanceAfterLose) {
      console.log('✅ WIN mode working correctly - balance increased!');
    } else {
      console.log('❌ WIN mode not working - balance did not increase');
    }

    // Step 11: Check transaction history
    console.log('\n📊 Step 11: Checking transaction history...');
    const transactionsResponse = await fetch(`http://localhost:3005/api/users/${userId}/transactions`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (transactionsResponse.ok) {
      const transactions = await transactionsResponse.json();
      console.log(`✅ Found ${transactions.length} transactions`);
      
      if (transactions.length > 0) {
        console.log('📋 Recent transactions:');
        transactions.slice(0, 3).forEach((txn, index) => {
          console.log(`   ${index + 1}. ${txn.type}: $${txn.amount} - ${txn.description}`);
        });
      }
    } else {
      console.log('❌ Failed to get transaction history');
    }

    console.log('\n🎉 TRADING FUNCTIONALITY TEST COMPLETED!');
    console.log(`📊 Summary:`);
    console.log(`   Initial Balance: $${initialBalance}`);
    console.log(`   After LOSE trade: $${balanceAfterLose}`);
    console.log(`   Final Balance: $${finalBalance}`);
    console.log(`   Net Change: $${finalBalance - initialBalance}`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testTradingFunctionality();
