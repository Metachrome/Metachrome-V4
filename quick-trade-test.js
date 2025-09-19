const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function quickTradeTest() {
  console.log('🚀 QUICK TRADE TEST...');
  
  try {
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
    console.log('✅ Trade placed, ID:', tradeResult.trade?.id);
    
    // Wait for completion and check server logs
    console.log('⏳ Waiting 35 seconds for completion...');
    await new Promise(resolve => setTimeout(resolve, 35000));
    
    console.log('✅ Test completed - check server logs for trade completion details');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

quickTradeTest();
