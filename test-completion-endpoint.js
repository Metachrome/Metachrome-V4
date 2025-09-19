const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testCompletionEndpoint() {
  console.log('🧪 TESTING COMPLETION ENDPOINT...');
  
  try {
    // Get a pending trade
    const tradesResponse = await fetch('http://localhost:3005/api/users/user-angela-1758195715/trades');
    const trades = await tradesResponse.json();
    
    const pendingTrade = trades.find(t => t.result === 'pending');
    if (!pendingTrade) {
      console.log('❌ No pending trades found');
      return;
    }
    
    console.log(`✅ Found pending trade: ${pendingTrade.id}`);
    console.log(`   Amount: ${pendingTrade.amount}`);
    console.log(`   Current result: ${pendingTrade.result}`);
    
    // Test the completion endpoint directly
    const completionData = {
      tradeId: pendingTrade.id,
      userId: pendingTrade.user_id,
      won: false, // Force a loss
      amount: pendingTrade.amount,
      payout: 0
    };
    
    console.log('\n📞 Calling completion endpoint...');
    console.log('Request data:', JSON.stringify(completionData, null, 2));
    
    const completionResponse = await fetch('http://localhost:3005/api/trades/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(completionData)
    });
    
    const completionResult = await completionResponse.json();
    console.log('Response status:', completionResponse.status);
    console.log('Response:', JSON.stringify(completionResult, null, 2));
    
    // Check if the trade was updated
    console.log('\n🔍 Checking if trade was updated...');
    const updatedTradesResponse = await fetch('http://localhost:3005/api/users/user-angela-1758195715/trades');
    const updatedTrades = await updatedTradesResponse.json();
    
    const updatedTrade = updatedTrades.find(t => t.id === pendingTrade.id);
    if (updatedTrade) {
      console.log(`✅ Trade found after completion:`);
      console.log(`   Result: ${updatedTrade.result}`);
      console.log(`   Profit/Loss: ${updatedTrade.profit_loss}`);
      console.log(`   Exit Price: ${updatedTrade.exit_price}`);
      console.log(`   Updated At: ${updatedTrade.updated_at}`);
      
      if (updatedTrade.result !== 'pending') {
        console.log('🎉 SUCCESS! Trade was updated properly');
      } else {
        console.log('❌ FAILED! Trade is still pending');
      }
    } else {
      console.log('❌ Trade not found after completion');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testCompletionEndpoint();
