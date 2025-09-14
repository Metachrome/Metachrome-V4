// Test real-time transaction updates
const http = require('http');
const WebSocket = require('ws');

function testAPI(endpoint, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 9999,
      path: endpoint,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve({ status: res.statusCode, data: result });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testRealTime() {
  console.log('🔄 TESTING REAL-TIME TRANSACTION UPDATES\n');

  // Connect to WebSocket
  const ws = new WebSocket('ws://localhost:9999/ws');
  let transactionReceived = false;

  ws.on('open', () => {
    console.log('✅ WebSocket connected');
  });

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      if (message.type === 'transaction_created' || message.type === 'admin_transaction_update') {
        console.log('🎉 REAL-TIME TRANSACTION UPDATE RECEIVED!');
        console.log('   Type:', message.type);
        console.log('   Data:', message.data);
        transactionReceived = true;
      }
    } catch (e) {
      // Ignore parsing errors
    }
  });

  // Wait for connection
  await new Promise(resolve => setTimeout(resolve, 1000));

  try {
    // Get users first
    const usersResult = await testAPI('/api/admin/users');
    const user = usersResult.data.find(u => u.username !== 'superadmin');
    
    console.log(`📊 Testing with user: ${user.username} (Balance: $${user.balance})`);
    console.log('🔄 Creating transaction and waiting for real-time update...\n');

    // Create a transaction
    const result = await testAPI(`/api/admin/balances/${user.id}`, 'PUT', {
      balance: 100,
      action: 'add',
      note: 'Real-time test deposit'
    });

    console.log('✅ Transaction created via API');
    console.log('   New balance:', result.data.newBalance);

    // Wait for WebSocket message
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (transactionReceived) {
      console.log('\n🎉 SUCCESS: Real-time transaction update working!');
    } else {
      console.log('\n❌ FAILED: No real-time update received');
    }

    ws.close();

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    ws.close();
  }
}

// Wait for server to start
setTimeout(testRealTime, 2000);
