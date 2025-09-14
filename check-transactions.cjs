// Check current transactions and pending deposits
const http = require('http');

function testAPI(endpoint) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 9999,
      path: endpoint,
      method: 'GET',
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

    req.end();
  });
}

async function checkSystem() {
  console.log('🔍 CHECKING CURRENT SYSTEM STATE\n');

  try {
    // Check transactions
    const transactionsResult = await testAPI('/api/admin/transactions');
    console.log('📊 TRANSACTIONS:');
    console.log(`   Total: ${transactionsResult.data.length}`);
    
    if (transactionsResult.data.length > 0) {
      console.log('   Recent transactions:');
      transactionsResult.data.slice(-5).forEach((tx, i) => {
        console.log(`   ${i+1}. ${tx.type} - $${tx.amount} - ${tx.username} - ${tx.description}`);
      });
    }

    // Check users
    const usersResult = await testAPI('/api/admin/users');
    console.log('\n👥 USERS:');
    usersResult.data.forEach(user => {
      console.log(`   ${user.username}: $${user.balance}`);
    });

    console.log('\n✅ System check complete');

  } catch (error) {
    console.error('❌ Error checking system:', error.message);
  }
}

checkSystem();
