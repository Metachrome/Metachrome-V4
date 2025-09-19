const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testWinMode() {
  console.log('🧪 TESTING WIN MODE...');
  
  try {
    // 1. Set user to WIN mode
    console.log('\n1️⃣ Setting user to WIN mode...');
    const setWinResponse = await fetch('http://localhost:3005/api/admin/trading-controls', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: 'user-angela-1758195715',
        controlType: 'win'
      })
    });
    
    const setWinResult = await setWinResponse.json();
    console.log('✅ Trading mode set to WIN:', setWinResult);
    
    // 2. Get user data to verify
    const usersResponse = await fetch('http://localhost:3005/api/admin/users');
    const users = await usersResponse.json();
    
    const testUser = users.find(u => u.username === 'angela.soenoko');
    console.log(`🎯 Verified Trading Mode: ${testUser.trading_mode}`);
    console.log(`💰 Current Balance: ${testUser.balance}`);
    
    const initialBalance = parseFloat(testUser.balance);
    
    // 3. Place a trade
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
    
    if (!tradeResult.success) {
      console.error('❌ Failed to place trade:', tradeResult.message);
      return;
    }
    
    console.log('✅ Trade placed successfully');
    
    // 4. Wait for completion
    console.log('⏳ Waiting 35 seconds for trade completion...');
    await new Promise(resolve => setTimeout(resolve, 35000));
    
    // 5. Check final balance
    const finalUsersResponse = await fetch('http://localhost:3005/api/admin/users');
    const finalUsers = await finalUsersResponse.json();
    
    const finalUser = finalUsers.find(u => u.username === 'angela.soenoko');
    const finalBalance = parseFloat(finalUser.balance);
    
    console.log(`\n💰 Final Balance: ${finalBalance}`);
    console.log(`📊 Balance Change: ${finalBalance - initialBalance}`);
    
    // 6. Analyze result
    if (finalBalance > initialBalance) {
      console.log('✅ TRADING CONTROLS WORKING! User in WIN mode and balance increased (trade won)');
    } else {
      console.log('❌ TRADING CONTROLS NOT WORKING! User in WIN mode but balance decreased (trade lost)');
    }
    
    // 7. Reset to LOSE mode for consistency
    console.log('\n3️⃣ Resetting user to LOSE mode...');
    const resetResponse = await fetch('http://localhost:3005/api/admin/trading-controls', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: 'user-angela-1758195715',
        controlType: 'lose'
      })
    });
    
    const resetResult = await resetResponse.json();
    console.log('✅ Trading mode reset to LOSE:', resetResult);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testWinMode();
