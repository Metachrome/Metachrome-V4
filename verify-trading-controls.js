const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function verifyTradingControls() {
  console.log('🔍 VERIFYING TRADING CONTROLS...');
  
  try {
    // Get user data
    const usersResponse = await fetch('http://localhost:3005/api/admin/users');
    const users = await usersResponse.json();
    
    const testUser = users.find(u => u.username === 'angela.soenoko');
    if (!testUser) {
      console.error('❌ Test user not found!');
      return;
    }
    
    console.log(`\n👤 User: ${testUser.username}`);
    console.log(`🎯 Trading Mode: ${testUser.trading_mode}`);
    console.log(`💰 Current Balance: ${testUser.balance}`);
    
    const initialBalance = parseFloat(testUser.balance);
    
    // Place a trade
    console.log('\n📈 Placing test trade...');
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
    
    // Wait for completion
    console.log('⏳ Waiting 35 seconds for trade completion...');
    await new Promise(resolve => setTimeout(resolve, 35000));
    
    // Check final balance
    const finalUsersResponse = await fetch('http://localhost:3005/api/admin/users');
    const finalUsers = await finalUsersResponse.json();
    
    const finalUser = finalUsers.find(u => u.username === 'angela.soenoko');
    const finalBalance = parseFloat(finalUser.balance);
    
    console.log(`\n💰 Final Balance: ${finalBalance}`);
    console.log(`📊 Balance Change: ${finalBalance - initialBalance}`);
    
    // Analyze result based on trading mode
    if (testUser.trading_mode === 'lose') {
      if (finalBalance < initialBalance) {
        console.log('✅ TRADING CONTROLS WORKING! User in LOSE mode and balance decreased (trade lost)');
      } else {
        console.log('❌ TRADING CONTROLS NOT WORKING! User in LOSE mode but balance increased (trade won)');
      }
    } else if (testUser.trading_mode === 'win') {
      if (finalBalance > initialBalance) {
        console.log('✅ TRADING CONTROLS WORKING! User in WIN mode and balance increased (trade won)');
      } else {
        console.log('❌ TRADING CONTROLS NOT WORKING! User in WIN mode but balance decreased (trade lost)');
      }
    } else {
      console.log('ℹ️ User in NORMAL mode - outcome based on market conditions');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

verifyTradingControls();
