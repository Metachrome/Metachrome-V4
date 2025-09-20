// Test script to verify superadmin trading fixes
console.log('🧪 Testing superadmin trading fixes...');

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testSuperadminTrading() {
  const baseUrl = 'https://metachrome-v2-production.up.railway.app'; // Use Railway URL
  
  try {
    console.log('1️⃣ Testing superadmin login...');
    
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'superadmin',
        password: 'superadmin123'
      })
    });
    
    if (!loginResponse.ok) {
      console.log('❌ Login failed');
      return;
    }
    
    const loginResult = await loginResponse.json();
    console.log('✅ Login successful:', {
      username: loginResult.user.username,
      id: loginResult.user.id,
      role: loginResult.user.role
    });
    
    const token = loginResult.token;
    const userId = loginResult.user.id;
    
    console.log('2️⃣ Testing trade creation...');
    
    const tradeResponse = await fetch(`${baseUrl}/api/trades/options`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        userId: userId,
        symbol: 'BTCUSDT',
        direction: 'up',
        amount: '100',
        duration: 30
      })
    });
    
    if (tradeResponse.ok) {
      const tradeResult = await tradeResponse.json();
      console.log('✅ Trade created successfully:', tradeResult.tradeId);
      
      console.log('3️⃣ Testing trade history...');
      
      const historyResponse = await fetch(`${baseUrl}/api/users/${userId}/trades`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (historyResponse.ok) {
        const trades = await historyResponse.json();
        console.log('✅ Trade history loaded:', trades.length, 'trades');
        
        if (trades.length > 0) {
          console.log('📈 Latest trade:', {
            id: trades[trades.length - 1].id,
            amount: trades[trades.length - 1].amount,
            direction: trades[trades.length - 1].direction,
            status: trades[trades.length - 1].status
          });
        }
      } else {
        console.log('❌ Failed to load trade history');
      }
      
    } else {
      const error = await tradeResponse.text();
      console.log('❌ Trade creation failed:', error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testSuperadminTrading();
