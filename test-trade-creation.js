const http = require('http');

function testTradeCreation() {
  console.log('🧪 Testing trade creation...');
  
  const postData = JSON.stringify({
    userId: 'user-angela-1758195715',
    symbol: 'BTCUSDT',
    direction: 'up',
    amount: 100,
    duration: 30
  });

  const options = {
    hostname: 'localhost',
    port: 3005,
    path: '/api/trades/options',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log('✅ Trade creation response status:', res.statusCode);
      console.log('✅ Trade creation response:', data);
      
      if (res.statusCode === 200) {
        const response = JSON.parse(data);
        if (response.success && response.trade) {
          console.log('🎉 Trade created successfully!');
          console.log('📋 Trade ID:', response.trade.id);
          console.log('📋 Trade Status:', response.trade.status);
          
          // Wait for completion and check history
          setTimeout(() => {
            checkTradeHistory();
          }, 35000);
        } else {
          console.log('❌ Trade creation failed:', response.message);
        }
      } else {
        console.log('❌ Trade creation failed with status:', res.statusCode);
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ Trade creation error:', e.message);
  });

  req.write(postData);
  req.end();
}

function checkTradeHistory() {
  console.log('🧪 Checking trade history...');
  
  const options = {
    hostname: 'localhost',
    port: 3005,
    path: '/api/users/user-angela-1758195715/trades',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log('✅ Trade history response:', data);
      const trades = JSON.parse(data);
      console.log('📊 Number of trades found:', trades.length || 0);
      
      if (trades.length > 0) {
        console.log('🎉 SUCCESS! Trade history is working!');
        trades.forEach((trade, index) => {
          console.log(`📈 Trade ${index + 1}:`, {
            id: trade.id,
            status: trade.status,
            result: trade.result,
            amount: trade.amount,
            direction: trade.direction
          });
        });
      } else {
        console.log('❌ No trades found in history');
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ Trade history error:', e.message);
  });

  req.end();
}

// Wait for server to be ready, then test
setTimeout(() => {
  console.log('🚀 Starting trade creation test...');
  testTradeCreation();
}, 3000);
