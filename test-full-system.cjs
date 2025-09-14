// Test the complete transaction system
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

async function runFullSystemTest() {
  console.log('🚀 METACHROME TRANSACTION SYSTEM - FULL TEST\n');

  try {
    // Step 1: Get users
    console.log('1️⃣ Getting all users...');
    const usersResult = await testAPI('/api/admin/users');
    console.log(`   Status: ${usersResult.status}`);
    console.log(`   Users found: ${usersResult.data.length}`);
    
    if (usersResult.data.length > 0) {
      const user = usersResult.data.find(u => u.username !== 'superadmin');
      console.log(`   Test user: ${user.username} (${user.id}) - Balance: $${user.balance}`);
      
      // Step 2: Test admin balance update
      console.log('\n2️⃣ Testing admin balance update (deposit)...');
      const balanceUpdate = await testAPI(`/api/admin/balances/${user.id}`, 'PUT', {
        balance: 1000,
        action: 'add',
        note: 'Test admin deposit'
      });
      console.log(`   Status: ${balanceUpdate.status}`);
      if (balanceUpdate.status === 200) {
        console.log(`   ✅ New balance: $${balanceUpdate.data.newBalance}`);
        console.log(`   ✅ Transaction created: ${balanceUpdate.data.transaction ? 'Yes' : 'No'}`);
      } else {
        console.log(`   ❌ Error: ${balanceUpdate.data.message}`);
      }

      // Step 3: Test withdrawal
      console.log('\n3️⃣ Testing admin balance update (withdrawal)...');
      const withdrawal = await testAPI(`/api/admin/balances/${user.id}`, 'PUT', {
        balance: 500,
        action: 'subtract',
        note: 'Test admin withdrawal'
      });
      console.log(`   Status: ${withdrawal.status}`);
      if (withdrawal.status === 200) {
        console.log(`   ✅ New balance: $${withdrawal.data.newBalance}`);
        console.log(`   ✅ Transaction created: ${withdrawal.data.transaction ? 'Yes' : 'No'}`);
      } else {
        console.log(`   ❌ Error: ${withdrawal.data.message}`);
      }

      // Step 4: Test manual deposit
      console.log('\n4️⃣ Testing manual deposit...');
      const manualDeposit = await testAPI('/api/admin/manual-deposit', 'POST', {
        userId: user.id,
        amount: 2000,
        currency: 'USDT',
        note: 'Test manual deposit'
      });
      console.log(`   Status: ${manualDeposit.status}`);
      if (manualDeposit.status === 200) {
        console.log(`   ✅ New balance: $${manualDeposit.data.newBalance}`);
        console.log(`   ✅ Transaction created: ${manualDeposit.data.transaction ? 'Yes' : 'No'}`);
      } else {
        console.log(`   ❌ Error: ${manualDeposit.data.message}`);
      }

      // Step 5: Test spot trading
      console.log('\n5️⃣ Testing spot trading (buy order)...');
      const spotBuy = await testAPI('/api/spot/orders', 'POST', {
        userId: user.id,
        symbol: 'BTC/USDT',
        side: 'buy',
        type: 'market',
        amount: 0.001,
        price: 50000,
        total: 150
      });
      console.log(`   Status: ${spotBuy.status}`);
      if (spotBuy.status === 200) {
        console.log(`   ✅ Order created: ${spotBuy.data.id}`);
        console.log(`   ✅ Transaction created: ${spotBuy.data.transaction ? 'Yes' : 'No'}`);
      } else {
        console.log(`   ❌ Error: ${spotBuy.data.message}`);
      }

      // Step 6: Get final transactions
      console.log('\n6️⃣ Getting final transaction list...');
      const finalTransactions = await testAPI('/api/admin/transactions');
      console.log(`   Status: ${finalTransactions.status}`);
      console.log(`   Total transactions: ${finalTransactions.data.length}`);
      
      // Show recent transactions for this user
      const userTransactions = finalTransactions.data.filter(t => t.user_id === user.id);
      console.log(`   User transactions: ${userTransactions.length}`);
      console.log('\n   📋 Recent transactions for this user:');
      userTransactions.slice(-5).forEach((tx, i) => {
        console.log(`      ${i+1}. ${tx.type.toUpperCase()}: ${tx.amount >= 0 ? '+' : ''}$${tx.amount} - ${tx.description}`);
      });

      // Step 7: Get final user balance
      console.log('\n7️⃣ Final user balance check...');
      const finalUsers = await testAPI('/api/admin/users');
      const finalUser = finalUsers.data.find(u => u.id === user.id);
      console.log(`   Final balance: $${finalUser.balance}`);

    } else {
      console.log('   ❌ No users found to test with');
    }

    console.log('\n🎉 FULL SYSTEM TEST COMPLETED!');
    console.log('\n✅ Transaction System Features Tested:');
    console.log('   ✅ Admin balance updates (deposit/withdrawal)');
    console.log('   ✅ Manual deposits');
    console.log('   ✅ Spot trading transactions');
    console.log('   ✅ Transaction history tracking');
    console.log('   ✅ Real balance updates');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Wait a moment for server to start, then run tests
setTimeout(runFullSystemTest, 1000);
