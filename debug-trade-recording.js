const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function debugTradeRecording() {
  console.log('🔍 DEBUGGING TRADE RECORDING...');
  
  try {
    // 1. Check initial trade count
    console.log('\n1️⃣ Checking initial trade count...');
    const initialTradesResponse = await fetch('http://localhost:3005/api/users/user-angela-1758195715/trades');
    const initialTrades = await initialTradesResponse.json();
    console.log(`📊 Initial trade count: ${initialTrades.length}`);
    
    // 2. Get user balance
    const usersResponse = await fetch('http://localhost:3005/api/admin/users');
    const users = await usersResponse.json();
    const testUser = users.find(u => u.username === 'angela.soenoko');
    const initialBalance = parseFloat(testUser.balance);
    console.log(`💰 Initial balance: ${initialBalance}`);
    
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
    console.log('📈 Trade response:', JSON.stringify(tradeResult, null, 2));
    
    if (!tradeResult.success) {
      console.error('❌ Failed to place trade:', tradeResult.message);
      return;
    }
    
    // 4. Check if trade was created in database immediately
    console.log('\n3️⃣ Checking if trade was created immediately...');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
    
    const afterCreateResponse = await fetch('http://localhost:3005/api/users/user-angela-1758195715/trades');
    const afterCreateTrades = await afterCreateResponse.json();
    console.log(`📊 Trade count after creation: ${afterCreateTrades.length}`);
    
    if (afterCreateTrades.length > initialTrades.length) {
      console.log('✅ Trade was created in database');
      const newTrade = afterCreateTrades.find(t => !initialTrades.some(it => it.id === t.id));
      if (newTrade) {
        console.log('🆔 New trade ID:', newTrade.id);
        console.log('📋 New trade status:', newTrade.status);
        console.log('📋 New trade result:', newTrade.result);
      }
    } else {
      console.log('❌ Trade was NOT created in database');
    }
    
    // 5. Wait for completion
    console.log('\n4️⃣ Waiting for trade completion (35 seconds)...');
    await new Promise(resolve => setTimeout(resolve, 35000));
    
    // 6. Check final state
    console.log('\n5️⃣ Checking final state...');
    const finalTradesResponse = await fetch('http://localhost:3005/api/users/user-angela-1758195715/trades');
    const finalTrades = await finalTradesResponse.json();
    console.log(`📊 Final trade count: ${finalTrades.length}`);
    
    const finalUsersResponse = await fetch('http://localhost:3005/api/admin/users');
    const finalUsers = await finalUsersResponse.json();
    const finalUser = finalUsers.find(u => u.username === 'angela.soenoko');
    const finalBalance = parseFloat(finalUser.balance);
    console.log(`💰 Final balance: ${finalBalance}`);
    console.log(`📊 Balance change: ${finalBalance - initialBalance}`);
    
    // 7. Check if the trade was updated
    if (finalTrades.length > initialTrades.length) {
      const completedTrade = finalTrades.find(t => !initialTrades.some(it => it.id === t.id));
      if (completedTrade) {
        console.log('✅ Trade found in final results:');
        console.log(`   ID: ${completedTrade.id}`);
        console.log(`   Status: ${completedTrade.status}`);
        console.log(`   Result: ${completedTrade.result}`);
        console.log(`   Profit/Loss: ${completedTrade.profit_loss}`);
        console.log(`   Created: ${completedTrade.created_at}`);
        console.log(`   Updated: ${completedTrade.updated_at}`);
      }
    } else {
      console.log('❌ Trade is missing from final results');
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

debugTradeRecording();
