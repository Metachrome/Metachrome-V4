// Test WebSocket real-time updates
const WebSocket = require('ws');
const http = require('http');

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

async function testWebSocketRealTime() {
  console.log('🔄 TESTING REAL-TIME WEBSOCKET UPDATES\n');

  // Connect to WebSocket
  const ws = new WebSocket('ws://localhost:9999/ws');
  let transactionReceived = false;
  let balanceReceived = false;

  ws.on('open', () => {
    console.log('✅ WebSocket connected to ws://localhost:9999/ws');
  });

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      console.log(`📨 WebSocket message received:`, message.type);
      
      if (message.type === 'transaction_created') {
        console.log('   🎉 TRANSACTION UPDATE:', message.data);
        transactionReceived = true;
      }
      
      if (message.type === 'admin_transaction_update') {
        console.log('   🎉 ADMIN TRANSACTION UPDATE:', message.data);
        transactionReceived = true;
      }
      
      if (message.type === 'balance_update') {
        console.log('   💰 BALANCE UPDATE:', message.data);
        balanceReceived = true;
      }

      if (message.type === 'admin_balance_monitor') {
        console.log('   👑 ADMIN BALANCE MONITOR:', message.data);
        balanceReceived = true;
      }
    } catch (e) {
      console.log('   📨 Raw message:', data.toString());
    }
  });

  ws.on('error', (error) => {
    console.error('❌ WebSocket error:', error);
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
      note: 'WebSocket real-time test'
    });

    console.log('✅ Transaction created via API');
    console.log('   New balance:', result.data.newBalance);
    console.log('   Waiting for WebSocket updates...\n');

    // Wait for WebSocket messages
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('\n📊 RESULTS:');
    console.log(`   Transaction update received: ${transactionReceived ? '✅ YES' : '❌ NO'}`);
    console.log(`   Balance update received: ${balanceReceived ? '✅ YES' : '❌ NO'}`);

    if (transactionReceived && balanceReceived) {
      console.log('\n🎉 SUCCESS: Real-time WebSocket updates working perfectly!');
    } else if (transactionReceived || balanceReceived) {
      console.log('\n⚠️ PARTIAL: Some real-time updates working');
    } else {
      console.log('\n❌ FAILED: No real-time updates received');
    }

    ws.close();

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    ws.close();
  }
}

// Wait for server to be ready
setTimeout(testWebSocketRealTime, 2000);
