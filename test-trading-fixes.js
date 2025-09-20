// Test script to verify trading fixes
console.log('🧪 Testing trading fixes...');

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testTradingFixes() {
  const baseUrl = 'https://metachrome-v2-production.up.railway.app';
  
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
    
    console.log('2️⃣ Testing options trade creation...');
    
    const optionsResponse = await fetch(`${baseUrl}/api/trades/options`, {
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
    
    if (optionsResponse.ok) {
      const optionsResult = await optionsResponse.json();
      console.log('✅ Options trade created:', optionsResult.tradeId);
    } else {
      const error = await optionsResponse.text();
      console.log('❌ Options trade failed:', error);
    }
    
    console.log('3️⃣ Testing spot trade creation...');
    
    const spotResponse = await fetch(`${baseUrl}/api/spot/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        userId: userId,
        symbol: 'BTCUSDT',
        side: 'buy',
        amount: '0.001',
        price: '65000',
        type: 'market'
      })
    });
    
    if (spotResponse.ok) {
      const spotResult = await spotResponse.json();
      console.log('✅ Spot order created:', spotResult.orderId);
    } else {
      const error = await spotResponse.text();
      console.log('❌ Spot order failed:', error);
    }
    
    console.log('4️⃣ Waiting 5 seconds for trade processing...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('5️⃣ Testing trade history...');
    
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
        console.log('📈 Recent trades:');
        trades.slice(0, 3).forEach((trade, index) => {
          console.log(`  ${index + 1}. ${trade.id} - ${trade.direction || trade.side} - ${trade.amount} - ${trade.result || trade.status}`);
        });
      }
    } else {
      console.log('❌ Failed to load trade history');
    }
    
    console.log('6️⃣ Testing Supabase connection...');
    
    const supabaseResponse = await fetch(`${baseUrl}/api/test/supabase`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (supabaseResponse.ok) {
      const supabaseResult = await supabaseResponse.json();
      console.log('✅ Supabase test:', supabaseResult.message, '- Data count:', supabaseResult.dataCount);
    } else {
      console.log('❌ Supabase test failed');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testTradingFixes();
