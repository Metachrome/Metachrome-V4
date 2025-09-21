const http = require('http');

console.log('🧪 TESTING DEPOSIT AUTHENTICATION FIX...');

// Use the actual user ID from users-data.json
const REAL_USER_ID = 'user-angela-1758195715';
const REAL_USERNAME = 'angela.soenoko';

// Create a proper authentication token in the format expected by getUserFromToken
const VALID_AUTH_TOKEN = `user-session-${REAL_USER_ID}-${Date.now()}`;

console.log('🔑 Using real user ID:', REAL_USER_ID);
console.log('🔑 Generated auth token:', VALID_AUTH_TOKEN);

// Test 1: Check if admin endpoint works
function testAdminEndpoint() {
  return new Promise((resolve, reject) => {
    console.log('\n1️⃣ Testing admin pending requests endpoint...');
    
    const options = {
      hostname: 'localhost',
      port: 3005,
      path: '/api/admin/pending-requests',
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('✅ Admin endpoint working!');
          console.log('📊 Current deposits:', response.deposits?.length || 0);
          console.log('📊 Current withdrawals:', response.withdrawals?.length || 0);
          
          if (response.deposits && response.deposits.length > 0) {
            console.log('📋 Existing deposits:');
            response.deposits.forEach(dep => {
              console.log(`   - ${dep.id}: $${dep.amount} ${dep.currency} (${dep.status}) - User: ${dep.username}`);
            });
          }
          resolve(response);
        } catch (e) {
          console.error('❌ Failed to parse admin response:', e.message);
          reject(e);
        }
      });
    });

    req.on('error', (err) => {
      console.error('❌ Admin endpoint failed:', err.message);
      reject(err);
    });

    req.setTimeout(5000, () => {
      console.error('❌ Admin endpoint timeout');
      req.destroy();
      reject(new Error('Timeout'));
    });

    req.end();
  });
}

// Test 2: Try to create a new deposit with PROPER authentication
function testDepositCreationWithAuth() {
  return new Promise((resolve, reject) => {
    console.log('\n2️⃣ Testing deposit creation with PROPER authentication...');
    console.log('🔑 Using token:', VALID_AUTH_TOKEN);
    
    const depositData = JSON.stringify({
      amount: 250,
      currency: 'USDT-ERC'
    });

    const options = {
      hostname: 'localhost',
      port: 3005,
      path: '/api/transactions/deposit-request',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(depositData),
        'Authorization': `Bearer ${VALID_AUTH_TOKEN}`
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log('📡 Response status:', res.statusCode);
        console.log('📡 Response data:', data);
        
        if (res.statusCode === 200 || res.statusCode === 201) {
          try {
            const response = JSON.parse(data);
            console.log('✅ Deposit creation successful!');
            console.log('💰 Deposit ID:', response.depositId);
            console.log('💰 Transaction ID:', response.transactionId);
            console.log('💰 Amount:', response.amount);
            console.log('💰 Currency:', response.currency);
            console.log('💰 Status:', response.status);
            resolve(response);
          } catch (e) {
            console.log('⚠️ Deposit created but response not JSON:', data);
            resolve({ success: true, raw: data });
          }
        } else {
          console.error('❌ Deposit creation failed with status:', res.statusCode);
          console.error('❌ Response:', data);
          
          // Parse error response if possible
          try {
            const errorResponse = JSON.parse(data);
            console.error('❌ Error details:', errorResponse);
          } catch (e) {
            console.error('❌ Raw error response:', data);
          }
          
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (err) => {
      console.error('❌ Deposit creation request failed:', err.message);
      reject(err);
    });

    req.setTimeout(5000, () => {
      console.error('❌ Deposit creation timeout');
      req.destroy();
      reject(new Error('Timeout'));
    });

    req.write(depositData);
    req.end();
  });
}

// Test 3: Check if new deposit appears in admin
function testAdminAfterDeposit() {
  return new Promise((resolve, reject) => {
    console.log('\n3️⃣ Checking admin endpoint after deposit creation...');
    
    // Wait a bit for the deposit to be processed
    setTimeout(() => {
      testAdminEndpoint().then(resolve).catch(reject);
    }, 1000);
  });
}

// Test 4: Test authentication endpoint directly
function testAuthEndpoint() {
  return new Promise((resolve, reject) => {
    console.log('\n4️⃣ Testing authentication endpoint directly...');
    
    const options = {
      hostname: 'localhost',
      port: 3005,
      path: '/api/auth/verify',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${VALID_AUTH_TOKEN}`
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log('🔐 Auth response status:', res.statusCode);
        console.log('🔐 Auth response data:', data);
        
        if (res.statusCode === 200) {
          try {
            const response = JSON.parse(data);
            console.log('✅ Authentication successful!');
            console.log('👤 User ID:', response.id);
            console.log('👤 Username:', response.username);
            console.log('👤 Balance:', response.balance);
            resolve(response);
          } catch (e) {
            console.log('⚠️ Auth successful but response not JSON:', data);
            resolve({ success: true, raw: data });
          }
        } else {
          console.error('❌ Authentication failed with status:', res.statusCode);
          console.error('❌ Response:', data);
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (err) => {
      console.error('❌ Auth request failed:', err.message);
      reject(err);
    });

    req.setTimeout(5000, () => {
      console.error('❌ Auth timeout');
      req.destroy();
      reject(new Error('Timeout'));
    });

    req.end();
  });
}

// Run all tests
async function runTests() {
  try {
    console.log('🚀 Starting deposit authentication tests...');
    console.log('🎯 Target: Fix deposit creation with proper user authentication');
    
    // Test 1: Check current state
    const initialState = await testAdminEndpoint();
    const initialDepositCount = initialState.deposits?.length || 0;
    
    // Test 4: Test authentication first
    try {
      await testAuthEndpoint();
      console.log('✅ Authentication token is valid!');
    } catch (authError) {
      console.log('⚠️ Authentication test failed:', authError.message);
      console.log('💡 This might be expected if the auth endpoint has different requirements');
    }
    
    // Test 2: Try to create deposit with proper auth
    try {
      const depositResult = await testDepositCreationWithAuth();
      
      // Test 3: Check if deposit was added
      const finalState = await testAdminAfterDeposit();
      const finalDepositCount = finalState.deposits?.length || 0;
      
      console.log('\n📊 SUMMARY:');
      console.log(`📈 Initial deposits: ${initialDepositCount}`);
      console.log(`📈 Final deposits: ${finalDepositCount}`);
      console.log(`🔑 Auth token used: ${VALID_AUTH_TOKEN.substring(0, 50)}...`);
      console.log(`👤 User ID: ${REAL_USER_ID}`);
      console.log(`👤 Username: ${REAL_USERNAME}`);
      
      if (finalDepositCount > initialDepositCount) {
        console.log('✅ SUCCESS: New deposit was created and appears in admin!');
        console.log('✅ DEPOSIT AUTHENTICATION FIX IS WORKING!');
      } else {
        console.log('⚠️ WARNING: Deposit creation may have failed - count unchanged');
        console.log('💡 Check server logs for more details');
      }
      
    } catch (depositError) {
      console.log('\n❌ DEPOSIT CREATION FAILED:');
      console.log('❌ Error:', depositError.message);
      
      if (depositError.message.includes('401')) {
        console.log('💡 ISSUE: Authentication still failing');
        console.log('💡 SOLUTION: Check getUserFromToken function and token format');
        console.log('💡 Expected format: user-session-{userId}-{timestamp}');
        console.log('💡 Actual token:', VALID_AUTH_TOKEN);
      } else if (depositError.message.includes('400')) {
        console.log('💡 ISSUE: Invalid request data');
        console.log('💡 SOLUTION: Check required fields and validation');
      } else if (depositError.message.includes('500')) {
        console.log('💡 ISSUE: Server error');
        console.log('💡 SOLUTION: Check server logs for details');
      }
    }
    
  } catch (error) {
    console.error('\n❌ CRITICAL ERROR:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 SOLUTION: Start the server with: node working-server.js');
    }
  }
}

// Start tests
runTests();
