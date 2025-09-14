// Quick test to verify the system
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

async function quickTest() {
  console.log('🧪 Quick System Test\n');

  try {
    // Test transactions endpoint
    console.log('1️⃣ Testing transactions endpoint...');
    const transactionsResult = await testAPI('/api/admin/transactions');
    console.log(`   Status: ${transactionsResult.status}`);
    console.log(`   Transactions: ${transactionsResult.data.length}`);
    
    if (transactionsResult.data.length === 0) {
      console.log('   ✅ SUCCESS: No mock data - clean slate!');
    } else {
      console.log('   📋 Current transactions:');
      transactionsResult.data.forEach((tx, i) => {
        console.log(`      ${i+1}. ${tx.type}: $${tx.amount} - ${tx.description}`);
      });
    }

    // Test users endpoint
    console.log('\n2️⃣ Testing users endpoint...');
    const usersResult = await testAPI('/api/admin/users');
    console.log(`   Status: ${usersResult.status}`);
    console.log(`   Users: ${usersResult.data.length}`);
    
    if (usersResult.data.length > 0) {
      const user = usersResult.data.find(u => u.username !== 'superadmin');
      console.log(`   Test user: ${user.username} - Balance: $${user.balance}`);
      
      // Test creating a transaction
      console.log('\n3️⃣ Testing transaction creation...');
      const beforeCount = transactionsResult.data.length;
      
      const depositResult = await testAPI(`/api/admin/balances/${user.id}`, 'PUT', {
        balance: 50,
        action: 'add',
        note: 'Quick test deposit'
      });
      
      console.log(`   Deposit status: ${depositResult.status}`);
      if (depositResult.status === 200) {
        console.log(`   ✅ New balance: $${depositResult.data.newBalance}`);
        
        // Check if transaction was created
        const newTransactionsResult = await testAPI('/api/admin/transactions');
        const afterCount = newTransactionsResult.data.length;
        
        console.log(`   Transactions before: ${beforeCount}`);
        console.log(`   Transactions after: ${afterCount}`);
        
        if (afterCount > beforeCount) {
          console.log('   ✅ SUCCESS: Transaction created!');
          const latestTx = newTransactionsResult.data[afterCount - 1];
          console.log(`   Latest: ${latestTx.type} - $${latestTx.amount} - ${latestTx.description}`);
        } else {
          console.log('   ❌ FAILED: No new transaction created');
        }
      }
    }

    console.log('\n🎉 Quick test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

setTimeout(quickTest, 1000);
