// Test the transaction system
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

async function runTests() {
  console.log('🧪 Testing Transaction System...\n');

  try {
    // Test 1: Get current transactions
    console.log('1️⃣ Testing: Get current transactions');
    const transactionsResult = await testAPI('/api/admin/transactions');
    console.log(`   Status: ${transactionsResult.status}`);
    console.log(`   Transactions count: ${transactionsResult.data.length}`);
    console.log(`   Sample transaction:`, transactionsResult.data[0]);
    console.log('');

    // Test 2: Test admin balance update (should create transaction)
    console.log('2️⃣ Testing: Admin balance update');
    const balanceUpdate = await testAPI('/api/admin/balances/demo-user-1', 'PUT', {
      balance: 500,
      action: 'add',
      note: 'Test deposit via admin'
    });
    console.log(`   Status: ${balanceUpdate.status}`);
    console.log(`   Result:`, balanceUpdate.data);
    console.log('');

    // Test 3: Check transactions after balance update
    console.log('3️⃣ Testing: Check transactions after balance update');
    const newTransactionsResult = await testAPI('/api/admin/transactions');
    console.log(`   Status: ${newTransactionsResult.status}`);
    console.log(`   New transactions count: ${newTransactionsResult.data.length}`);
    const latestTransaction = newTransactionsResult.data[newTransactionsResult.data.length - 1];
    console.log(`   Latest transaction:`, latestTransaction);
    console.log('');

    console.log('✅ All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Wait a moment for server to start, then run tests
setTimeout(runTests, 3000);
