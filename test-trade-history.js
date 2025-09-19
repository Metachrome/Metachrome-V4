const http = require('http');

function testTradeHistory() {
  console.log('🧪 Testing trade history retrieval...');
  
  const options = {
    hostname: 'localhost',
    port: 3005,
    path: '/api/users/user-angela-1758195715/trades',
    method: 'GET',
    headers: {
      'Authorization': 'Bearer user-session-user-angela-1758195715-1758225813616'
    }
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
        console.log('🎉 Trade history is working! Trades are being saved.');
      } else {
        console.log('❌ No trades found in history.');
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
  console.log('🚀 Testing trade history...');
  testTradeHistory();
}, 1000);
