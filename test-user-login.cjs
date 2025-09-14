// Test user login functionality
const http = require('http');

function testAPI(endpoint, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 9999,
      path: endpoint,
      method: method,
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

async function testUserLogin() {
  console.log('🧪 TESTING USER LOGIN FUNCTIONALITY\n');

  try {
    // Step 1: Try to register a new user
    console.log('1️⃣ Registering a new user...');
    const registerResult = await testAPI('/api/auth', 'POST', {
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'testpass123',
      firstName: 'Test',
      lastName: 'User'
    });
    
    if (registerResult.status === 200) {
      console.log('   ✅ User registered successfully!');
      console.log('   📋 User ID:', registerResult.data.user?.id);
      console.log('   🎫 Token:', registerResult.data.token?.substring(0, 20) + '...');
    } else {
      console.log('   ⚠️ Registration response:', registerResult.status, registerResult.data);
    }

    // Step 2: Try to login with the user
    console.log('\n2️⃣ Testing user login...');
    const loginResult = await testAPI('/api/auth', 'POST', {
      username: 'testuser',
      password: 'testpass123'
    });
    
    if (loginResult.status === 200) {
      console.log('   ✅ User login successful!');
      console.log('   👤 Username:', loginResult.data.user?.username);
      console.log('   💰 Balance:', loginResult.data.user?.balance);
      console.log('   🎫 Token:', loginResult.data.token?.substring(0, 20) + '...');
      
      // Step 3: Test deposit request with the user token
      console.log('\n3️⃣ Testing deposit request with user token...');
      const depositResult = await testAPI('/api/transactions/deposit-request', 'POST', {
        amount: '50',
        currency: 'USDT'
      });
      
      // Add authorization header
      const depositOptions = {
        hostname: 'localhost',
        port: 9999,
        path: '/api/transactions/deposit-request',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${loginResult.data.token}`
        }
      };

      const depositRequest = new Promise((resolve, reject) => {
        const req = http.request(depositOptions, (res) => {
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

        req.write(JSON.stringify({
          amount: '50',
          currency: 'USDT'
        }));
        req.end();
      });

      const depositResponse = await depositRequest;
      
      if (depositResponse.status === 200) {
        console.log('   ✅ Deposit request successful!');
        console.log('   📋 Deposit ID:', depositResponse.data.depositId);
        console.log('   💰 Amount:', depositResponse.data.amount, depositResponse.data.currency);
      } else {
        console.log('   ❌ Deposit request failed:', depositResponse.status, depositResponse.data);
      }
      
    } else {
      console.log('   ❌ User login failed:', loginResult.status, loginResult.data);
    }

    // Step 4: Test with existing admin user
    console.log('\n4️⃣ Testing with existing admin user...');
    const adminLoginResult = await testAPI('/api/auth', 'POST', {
      username: 'admin',
      password: 'anypassword'
    });
    
    if (adminLoginResult.status === 200) {
      console.log('   ✅ Admin user login successful!');
      console.log('   👤 Username:', adminLoginResult.data.user?.username);
      console.log('   💰 Balance:', adminLoginResult.data.user?.balance);
      console.log('   🎫 Token:', adminLoginResult.data.token?.substring(0, 20) + '...');
    } else {
      console.log('   ⚠️ Admin login response:', adminLoginResult.status, adminLoginResult.data);
    }

    console.log('\n🎉 USER LOGIN TEST COMPLETED!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testUserLogin();
