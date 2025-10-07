const https = require('https');
const http = require('http');

// Simple fetch replacement for Node.js
function fetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;

    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          ok: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          json: () => Promise.resolve(JSON.parse(data)),
          text: () => Promise.resolve(data)
        });
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

// Test the balance deduction fix
async function testBalanceFix() {
  console.log('🧪 Testing Balance Deduction Fix...\n');
  
  const baseURL = 'http://localhost:3005';
  
  try {
    // Test 1: Check if server is running
    console.log('1️⃣ Testing server health...');
    const healthResponse = await fetch(`${baseURL}/api/health`);
    if (healthResponse.ok) {
      console.log('✅ Server is running\n');
    } else {
      console.log('❌ Server is not running');
      return;
    }

    // Test 2: Create a test user
    console.log('2️⃣ Creating test user...');
    const userData = {
      username: `testuser_${Date.now()}`,
      email: `test${Date.now()}@example.com`,
      password: 'testpass123',
      firstName: 'Test',
      lastName: 'User'
    };

    const signupResponse = await fetch(`${baseURL}/api/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    if (!signupResponse.ok) {
      console.log('❌ Failed to create test user');
      return;
    }

    const signupResult = await signupResponse.json();
    console.log('✅ Test user created:', signupResult.user.username);
    console.log('💰 Initial balance:', signupResult.user.balance);

    const userId = signupResult.user.id;
    const token = signupResult.token;

    // Test 3: Add some balance to the user
    console.log('\n3️⃣ Adding balance to test user...');
    const balanceResponse = await fetch(`${baseURL}/api/admin/balance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: userId,
        action: 'add',
        balance: '1000'
      })
    });

    if (balanceResponse.ok) {
      console.log('✅ Added 1000 USDT to test user');
    }

    // Test 4: Get current balance before trade
    console.log('\n4️⃣ Getting balance before trade...');
    const userResponse = await fetch(`${baseURL}/api/auth/user`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (userResponse.ok) {
      const userData = await userResponse.json();
      console.log('💰 Balance before trade:', userData.balance);
      
      // Test 5: Place a trade using the generic /api/trades endpoint
      console.log('\n5️⃣ Placing trade to test immediate balance deduction...');
      const tradeResponse = await fetch(`${baseURL}/api/trades`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          symbol: 'BTCUSDT',
          type: 'options',
          direction: 'up',
          amount: '100',
          duration: 30
        })
      });

      if (tradeResponse.ok) {
        const tradeResult = await tradeResponse.json();
        console.log('✅ Trade placed successfully:', tradeResult.trade.id);
        
        // Test 6: Check balance immediately after trade
        console.log('\n6️⃣ Checking balance immediately after trade...');
        const afterTradeResponse = await fetch(`${baseURL}/api/auth/user`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (afterTradeResponse.ok) {
          const afterTradeData = await afterTradeResponse.json();
          console.log('💰 Balance after trade:', afterTradeData.balance);
          
          const balanceChange = userData.balance - afterTradeData.balance;
          console.log('💸 Balance deducted:', balanceChange);
          
          if (balanceChange === 100) {
            console.log('\n🎉 SUCCESS! Balance was immediately deducted when trade was placed!');
            console.log('✅ The fix is working correctly!');
          } else {
            console.log('\n❌ FAILED! Balance was not deducted immediately');
            console.log('❌ Expected deduction: 100, Actual deduction:', balanceChange);
          }
        }
      } else {
        const error = await tradeResponse.text();
        console.log('❌ Failed to place trade:', error);
      }
    }

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

// Run the test
testBalanceFix();
