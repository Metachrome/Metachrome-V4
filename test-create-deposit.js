// Test creating a new deposit request
const http = require('http');

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
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

async function testDepositFlow() {
  try {
    console.log('🧪 TESTING DEPOSIT FLOW:');
    
    // 1. First, check current deposits
    console.log('\n1️⃣ Checking current deposits...');
    const checkOptions = {
      hostname: 'localhost',
      port: 3005,
      path: '/api/admin/pending-requests',
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    };
    
    const currentDeposits = await makeRequest(checkOptions);
    console.log('Current deposits count:', currentDeposits.data.deposits?.length || 0);
    
    // 2. Create a new deposit request
    console.log('\n2️⃣ Creating new deposit request...');
    const depositOptions = {
      hostname: 'localhost',
      port: 3005,
      path: '/api/transactions/deposit-request',
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-user-token' // You might need a real token
      }
    };
    
    const depositData = {
      amount: 250,
      currency: 'USDT-TRC20'
    };
    
    const depositResult = await makeRequest(depositOptions, depositData);
    console.log('Deposit creation status:', depositResult.status);
    console.log('Deposit creation response:', depositResult.data);
    
    // 3. Check deposits again
    console.log('\n3️⃣ Checking deposits after creation...');
    const newDeposits = await makeRequest(checkOptions);
    console.log('New deposits count:', newDeposits.data.deposits?.length || 0);
    
    if (newDeposits.data.deposits && newDeposits.data.deposits.length > 0) {
      console.log('\n📋 ALL DEPOSITS:');
      newDeposits.data.deposits.forEach((deposit, index) => {
        console.log(`${index + 1}. ID: ${deposit.id}`);
        console.log(`   User: ${deposit.username}`);
        console.log(`   Amount: ${deposit.amount} ${deposit.currency}`);
        console.log(`   Status: ${deposit.status}`);
        console.log('');
      });
    }
    
    console.log('✅ Deposit flow test completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testDepositFlow();
