const fetch = require('node-fetch');

async function testTradeHistoryAPI() {
  console.log('🧪 Testing trade history API endpoint...');

  try {
    const response = await fetch('http://localhost:3005/api/users/user-angela-1758195715/trades', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('📡 Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Response successful');
      console.log('📈 Number of trades returned:', data.length);
      
      if (data.length > 0) {
        console.log('📋 Sample trade:');
        console.log(JSON.stringify(data[0], null, 2));
        
        console.log('\n📋 All trades summary:');
        data.forEach((trade, index) => {
          console.log(`  ${index + 1}. ${trade.symbol} ${trade.direction} ${trade.amount} USDT -> ${trade.result} (${trade.profit_loss} profit)`);
        });
      } else {
        console.log('⚠️ No trades returned from API');
      }
    } else {
      const errorText = await response.text();
      console.log('❌ API Error:', response.status, errorText);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testTradeHistoryAPI();
