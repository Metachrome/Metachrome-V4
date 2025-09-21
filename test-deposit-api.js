// Test the deposit API endpoint
const http = require('http');

function testDepositAPI() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3005,
      path: '/api/admin/pending-requests',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
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
          console.log('🔍 API RESPONSE ANALYSIS:');
          console.log('Status:', res.statusCode);
          console.log('Response structure:', Object.keys(result));
          console.log('Deposits array:', result.deposits);
          console.log('Deposits count:', result.deposits ? result.deposits.length : 'undefined');
          console.log('Withdrawals count:', result.withdrawals ? result.withdrawals.length : 'undefined');
          
          if (result.deposits && result.deposits.length > 0) {
            console.log('\n📋 DEPOSIT DETAILS:');
            result.deposits.forEach((deposit, index) => {
              console.log(`${index + 1}. ID: ${deposit.id}`);
              console.log(`   User: ${deposit.username}`);
              console.log(`   Amount: ${deposit.amount} ${deposit.currency}`);
              console.log(`   Status: ${deposit.status}`);
              console.log(`   Created: ${deposit.created_at}`);
              console.log('');
            });
          } else {
            console.log('❌ NO DEPOSITS FOUND');
          }
          
          resolve(result);
        } catch (e) {
          console.error('❌ JSON Parse Error:', e.message);
          console.log('Raw response:', body);
          reject(e);
        }
      });
    });

    req.on('error', (err) => {
      console.error('❌ Request Error:', err.message);
      reject(err);
    });

    req.end();
  });
}

// Run the test
testDepositAPI()
  .then(() => {
    console.log('✅ Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
