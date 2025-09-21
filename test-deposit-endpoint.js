const http = require('http');
const fs = require('fs');
const path = require('path');

console.log('🧪 TESTING DEPOSIT ENDPOINT FUNCTIONALITY');
console.log('==========================================');

// Test configuration
const SERVER_HOST = 'localhost';
const SERVER_PORT = 3005;
const TEST_TOKEN = 'test-jwt-token-123'; // We'll need to create a valid token

// Test data
const testDepositData = {
  amount: 100,
  currency: 'USDT-ERC'
};

// Function to make HTTP requests
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = {
            statusCode: res.statusCode,
            headers: res.headers,
            body: body,
            data: body ? JSON.parse(body) : null
          };
          resolve(response);
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body,
            data: null,
            parseError: error.message
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Test 1: Check if server is running
async function testServerConnection() {
  console.log('\n🔌 Test 1: Checking server connection...');
  
  try {
    const options = {
      hostname: SERVER_HOST,
      port: SERVER_PORT,
      path: '/api/test',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const response = await makeRequest(options);
    
    if (response.statusCode === 200) {
      console.log('✅ Server is running and responding');
      return true;
    } else {
      console.log(`⚠️ Server responded with status: ${response.statusCode}`);
      console.log('Response:', response.body);
      return false;
    }
  } catch (error) {
    console.log('❌ Server connection failed:', error.message);
    return false;
  }
}

// Test 2: Test deposit endpoint
async function testDepositEndpoint() {
  console.log('\n💰 Test 2: Testing deposit endpoint...');
  
  try {
    const options = {
      hostname: SERVER_HOST,
      port: SERVER_PORT,
      path: '/api/transactions/deposit-request',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_TOKEN}`
      }
    };
    
    const response = await makeRequest(options, testDepositData);
    
    console.log(`📊 Response Status: ${response.statusCode}`);
    console.log('📋 Response Body:', response.body);
    
    if (response.data) {
      console.log('📄 Parsed Data:', response.data);
      
      if (response.data.success) {
        console.log('✅ Deposit request created successfully!');
        return response.data.depositId;
      } else {
        console.log('❌ Deposit request failed:', response.data.message);
        return null;
      }
    } else {
      console.log('❌ Could not parse response data');
      return null;
    }
  } catch (error) {
    console.log('❌ Deposit endpoint test failed:', error.message);
    return null;
  }
}

// Test 3: Test admin pending requests endpoint
async function testAdminEndpoint() {
  console.log('\n🔔 Test 3: Testing admin pending requests endpoint...');
  
  try {
    const options = {
      hostname: SERVER_HOST,
      port: SERVER_PORT,
      path: '/api/admin/pending-requests',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_TOKEN}`
      }
    };
    
    const response = await makeRequest(options);
    
    console.log(`📊 Response Status: ${response.statusCode}`);
    
    if (response.data) {
      console.log('📄 Admin Response Data:');
      console.log('  - Deposits:', response.data.deposits?.length || 0);
      console.log('  - Withdrawals:', response.data.withdrawals?.length || 0);
      
      if (response.data.deposits && response.data.deposits.length > 0) {
        console.log('📋 Found deposits:');
        response.data.deposits.forEach((deposit, index) => {
          console.log(`    ${index + 1}. ID: ${deposit.id}, User: ${deposit.username}, Amount: ${deposit.amount} ${deposit.currency}`);
        });
        return true;
      } else {
        console.log('⚠️ No deposits found in admin response');
        return false;
      }
    } else {
      console.log('❌ Could not parse admin response data');
      console.log('Raw response:', response.body);
      return false;
    }
  } catch (error) {
    console.log('❌ Admin endpoint test failed:', error.message);
    return false;
  }
}

// Test 4: Check pending-data.json file directly
function testPendingDataFile() {
  console.log('\n📁 Test 4: Checking pending-data.json file...');
  
  try {
    const dataFile = path.join(__dirname, 'pending-data.json');
    const data = fs.readFileSync(dataFile, 'utf8');
    const pendingData = JSON.parse(data);
    
    console.log('✅ File read successfully');
    console.log('📊 Deposits in file:', pendingData.deposits.length);
    console.log('📊 Withdrawals in file:', pendingData.withdrawals.length);
    
    if (pendingData.deposits.length > 0) {
      console.log('📋 Deposits in file:');
      pendingData.deposits.forEach((deposit, index) => {
        console.log(`    ${index + 1}. ID: ${deposit.id}, User: ${deposit.username}, Amount: ${deposit.amount} ${deposit.currency}, Status: ${deposit.status}`);
      });
      return true;
    } else {
      console.log('⚠️ No deposits found in file');
      return false;
    }
  } catch (error) {
    console.log('❌ Error reading pending-data.json:', error.message);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting deposit functionality tests...\n');
  
  // Test file first (doesn't require server)
  const fileTest = testPendingDataFile();
  
  // Test server connection
  const serverRunning = await testServerConnection();
  
  if (!serverRunning) {
    console.log('\n❌ Server is not running. Please start the server first.');
    console.log('💡 Run: node working-server.js');
    return;
  }
  
  // Test deposit creation
  const depositId = await testDepositEndpoint();
  
  // Test admin endpoint
  const adminWorking = await testAdminEndpoint();
  
  // Summary
  console.log('\n🎉 TEST SUMMARY');
  console.log('================');
  console.log('📁 File operations:', fileTest ? '✅ Working' : '❌ Failed');
  console.log('🔌 Server connection:', serverRunning ? '✅ Working' : '❌ Failed');
  console.log('💰 Deposit creation:', depositId ? '✅ Working' : '❌ Failed');
  console.log('🔔 Admin endpoint:', adminWorking ? '✅ Working' : '❌ Failed');
  
  if (fileTest && !adminWorking) {
    console.log('\n🔍 DIAGNOSIS: File has deposits but admin endpoint doesn\'t show them');
    console.log('💡 Possible issues:');
    console.log('   - Server not reading file correctly');
    console.log('   - Admin endpoint filtering incorrectly');
    console.log('   - Authentication issues');
  } else if (!fileTest && !adminWorking) {
    console.log('\n🔍 DIAGNOSIS: No deposits in file and admin endpoint shows none');
    console.log('💡 Possible issues:');
    console.log('   - Deposit creation not working');
    console.log('   - File not being written correctly');
    console.log('   - Authentication preventing deposit creation');
  }
}

// Run the tests
runTests().catch(error => {
  console.error('❌ Test execution failed:', error);
});
