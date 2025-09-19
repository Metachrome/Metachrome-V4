const http = require('http');

function createTradeAndWaitForCompletion() {
  console.log('🧪 Creating trade and waiting for completion...');
  
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
      console.log('✅ Trade created:', data);
      const response = JSON.parse(data);
      if (response.success && response.trade) {
        console.log('⏰ Waiting 35 seconds for trade completion...');
        setTimeout(() => {
          checkTradeHistory();
        }, 35000); // Wait 35 seconds for 30-second trade to complete
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
  console.log('🧪 Checking trade history after completion...');
  
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
        console.log('🎉 SUCCESS! Trade history is working! Trades are being saved.');
        trades.forEach((trade, index) => {
          console.log(`📈 Trade ${index + 1}:`, {
            id: trade.id,
            status: trade.status,
            result: trade.result,
            amount: trade.amount,
            created_at: trade.created_at
          });
        });
      } else {
        console.log('❌ ISSUE: No trades found in history after completion.');
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ Trade history error:', e.message);
  });

  req.end();
}

// Start the test
console.log('🚀 Starting trade completion test...');
createTradeAndWaitForCompletion();
