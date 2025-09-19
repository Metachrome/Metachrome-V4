const http = require('http');

// Test functions
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
      console.log('✅ Trade creation response:', data);
      testDepositApproval();
    });
  });

  req.on('error', (e) => {
    console.error('❌ Trade creation error:', e.message);
    testDepositApproval();
  });

  req.write(postData);
  req.end();
}

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
      console.log('✅ Deposit approval response:', data);
      testReceiptViewing();
    });
  });

  req.on('error', (e) => {
    console.error('❌ Deposit approval error:', e.message);
    testReceiptViewing();
  });

  req.write(postData);
  req.end();
}

function testReceiptViewing() {
  console.log('🧪 Testing receipt viewing...');
  
  const options = {
    hostname: 'localhost',
    port: 3005,
    path: '/api/admin/receipt/verification-1758204548183-381658643.png',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log('✅ Receipt viewing response status:', res.statusCode);
    if (res.statusCode === 200) {
      console.log('✅ Receipt file served successfully');
    } else {
      console.log('❌ Receipt file not found');
    }
    testWithdrawalCreation();
  });

  req.on('error', (e) => {
    console.error('❌ Receipt viewing error:', e.message);
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

// Wait for server to be ready, then start tests
setTimeout(() => {
  console.log('🚀 Starting comprehensive tests...');
  testTradeCreation();
}, 2000);
