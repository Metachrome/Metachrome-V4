const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function simpleTradeTest() {
  console.log('🚀 SIMPLE TRADE TEST STARTING...');
  
  try {
    // Check initial trade count
    console.log('📊 Checking initial trade count...');
    const initialResponse = await fetch('http://localhost:3005/api/users/user-angela-1758195715/trades');
    const initialTrades = await initialResponse.json();
    console.log(`📊 Initial trade count: ${initialTrades.length}`);
    
    // Place a trade
    const tradeData = {
      userId: 'user-angela-1758195715',
      symbol: 'BTCUSDT',
      direction: 'up',
      amount: 100,
      duration: 30,
      entryPrice: 65000
    };
    
    console.log('📈 Placing trade...');
    const tradeResponse = await fetch('http://localhost:3005/api/trades/options', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(tradeData)
    });
    
    const tradeResult = await tradeResponse.json();
    console.log('✅ Trade response:', JSON.stringify(tradeResult, null, 2));
    
    if (tradeResult.success && tradeResult.trade) {
      console.log(`✅ Trade placed successfully with ID: ${tradeResult.trade.id}`);
      
      // Check trade count after placement
      console.log('📊 Checking trade count after placement...');
      const afterPlacementResponse = await fetch('http://localhost:3005/api/users/user-angela-1758195715/trades');
      const afterPlacementTrades = await afterPlacementResponse.json();
      console.log(`📊 Trade count after placement: ${afterPlacementTrades.length}`);
      
      // Wait for completion
      console.log('⏳ Waiting 35 seconds for auto-completion...');
      await new Promise(resolve => setTimeout(resolve, 35000));
      
      // Check final trade count and status
      console.log('📊 Checking final trade count and status...');
      const finalResponse = await fetch('http://localhost:3005/api/users/user-angela-1758195715/trades');
      const finalTrades = await finalResponse.json();
      console.log(`📊 Final trade count: ${finalTrades.length}`);
      
      const completedTrade = finalTrades.find(t => t.id === tradeResult.trade.id);
      if (completedTrade) {
        console.log(`✅ Trade found in final results:`);
        console.log(`   ID: ${completedTrade.id}`);
        console.log(`   Result: ${completedTrade.result}`);
        console.log(`   Profit/Loss: ${completedTrade.profit_loss}`);
        console.log(`   Updated: ${completedTrade.updated_at}`);
        
        if (completedTrade.result !== 'pending') {
          console.log('🎉 SUCCESS! Trade was completed and updated!');
        } else {
          console.log('❌ FAILED! Trade is still pending');
        }
      } else {
        console.log('❌ Trade not found in final results');
      }
    } else {
      console.log('❌ Failed to place trade:', tradeResult);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

simpleTradeTest();
