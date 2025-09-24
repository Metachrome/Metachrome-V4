// Test script to verify trading controls are working correctly
console.log('🧪 Testing Trading Controls Fix...\n');

async function testTradingControls() {
  try {
    const userId = 'user-angela-1758195715'; // Test user
    
    console.log('1️⃣ Setting user to LOSE mode...');
    const setLoseResponse = await fetch('http://localhost:3005/api/admin/trading-controls', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: userId,
        controlType: 'lose'
      })
    });
    
    const loseResult = await setLoseResponse.json();
    console.log('✅ Trading mode set to LOSE:', loseResult.message);
    
    // Wait a moment for the change to propagate
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('\n2️⃣ Getting user balance before trade...');
    const balanceResponse = await fetch(`http://localhost:3005/api/user/balances?userId=${userId}`);
    const balanceData = await balanceResponse.json();
    const initialBalance = parseFloat(balanceData.balance);
    console.log(`💰 Initial balance: ${initialBalance} USDT`);
    
    console.log('\n3️⃣ Placing a test trade (should lose due to LOSE mode)...');
    const tradeResponse = await fetch('http://localhost:3005/api/trades/options', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: userId,
        symbol: 'BTCUSDT',
        direction: 'up',
        amount: 100,
        duration: 30
      })
    });
    
    const tradeResult = await tradeResponse.json();
    console.log('📈 Trade placed:', tradeResult.message);
    console.log('🆔 Trade ID:', tradeResult.tradeId);
    
    // Wait for trade to complete (30 seconds + buffer)
    console.log('\n⏳ Waiting for trade to complete (35 seconds)...');
    await new Promise(resolve => setTimeout(resolve, 35000));
    
    console.log('\n4️⃣ Checking final balance...');
    const finalBalanceResponse = await fetch(`http://localhost:3005/api/user/balances?userId=${userId}`);
    const finalBalanceData = await finalBalanceResponse.json();
    const finalBalance = parseFloat(finalBalanceData.balance);
    console.log(`💰 Final balance: ${finalBalance} USDT`);
    
    const balanceChange = finalBalance - initialBalance;
    console.log(`📊 Balance change: ${balanceChange > 0 ? '+' : ''}${balanceChange} USDT`);
    
    console.log('\n5️⃣ Analyzing results...');
    if (balanceChange < 0) {
      console.log('✅ SUCCESS! Trading controls are working correctly.');
      console.log('✅ User was in LOSE mode and the trade resulted in a loss.');
      console.log('✅ The server-side trading control logic is functioning properly.');
    } else {
      console.log('❌ FAILURE! Trading controls are NOT working.');
      console.log('❌ User was in LOSE mode but the trade resulted in a win or no change.');
      console.log('❌ The server-side trading control logic needs investigation.');
    }
    
    console.log('\n6️⃣ Resetting user to NORMAL mode...');
    const resetResponse = await fetch('http://localhost:3005/api/admin/trading-controls', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: userId,
        controlType: 'normal'
      })
    });
    
    const resetResult = await resetResponse.json();
    console.log('✅ Trading mode reset to NORMAL:', resetResult.message);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testTradingControls();
