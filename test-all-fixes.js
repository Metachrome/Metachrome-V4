const http = require('http');

function testDepositApproval() {
  console.log('🧪 Testing deposit approval...');
  
  const postData = JSON.stringify({
    action: 'approve'
  });

  const options = {
    hostname: 'localhost',
    port: 3005,
    path: '/api/admin/deposits/dep_1758204548014_xhvid9rd7/action',
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
      console.log('✅ Deposit approval response status:', res.statusCode);
      console.log('✅ Deposit approval response:', data);
      testTradeCreationWithCompletion();
    });
  });

  req.on('error', (e) => {
    console.error('❌ Deposit approval error:', e.message);
    testTradeCreationWithCompletion();
  });

  req.write(postData);
  req.end();
}

function testTradeCreationWithCompletion() {
  console.log('🧪 Testing trade creation with completion tracking...');
  
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
      console.log('✅ Trade creation response:', data);
      const response = JSON.parse(data);
      if (response.success && response.trade) {
        console.log('⏰ Waiting 35 seconds for trade completion...');
        setTimeout(() => {
          checkTradeHistoryAfterCompletion();
        }, 35000);
      } else {
        testWithdrawalCreation();
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ Trade creation error:', e.message);
    testWithdrawalCreation();
  });

  req.write(postData);
  req.end();
}

function checkTradeHistoryAfterCompletion() {
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
        console.log('🎉 SUCCESS! Trade history is working!');
        trades.forEach((trade, index) => {
          console.log(`📈 Trade ${index + 1}:`, {
            id: trade.id,
            status: trade.status,
            result: trade.result,
            amount: trade.amount
          });
        });
      } else {
        console.log('❌ Trade history still not working');
      }
      testWithdrawalCreation();
    });
  });

  req.on('error', (e) => {
    console.error('❌ Trade history error:', e.message);
    testWithdrawalCreation();
  });

  req.end();
}

function testWithdrawalCreation() {
  console.log('🧪 Testing withdrawal creation...');
  
  const postData = JSON.stringify({
    amount: 1000,
    currency: 'BTC',
    walletAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'
  });

  const options = {
    hostname: 'localhost',
    port: 3005,
    path: '/api/user/withdraw',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      'Authorization': 'Bearer user-session-user-angela-1758195715-1758225813616'
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log('✅ Withdrawal creation response status:', res.statusCode);
      console.log('✅ Withdrawal creation response:', data);
      console.log('🎉 All tests completed!');
    });
  });

  req.on('error', (e) => {
    console.error('❌ Withdrawal creation error:', e.message);
    console.log('🎉 All tests completed!');
  });

  req.write(postData);
  req.end();
}

// Start tests
setTimeout(() => {
  console.log('🚀 Starting comprehensive fix tests...');
  testDepositApproval();
}, 2000);
