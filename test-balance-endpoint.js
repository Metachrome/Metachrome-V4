const fetch = require('node-fetch');

async function testBalanceEndpoint() {
  try {
    console.log('🧪 Testing balance endpoint...');
    
    const response = await fetch('http://localhost:3005/api/balances', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer user-session-test-user-123'
      }
    });

    const result = await response.json();
    
    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Data:', JSON.stringify(result, null, 2));
    
    if (response.ok) {
      console.log('✅ Balance endpoint is working!');
      
      // Check if BTC balance is available
      const btcBalance = result.find(b => b.symbol === 'BTC');
      if (btcBalance) {
        console.log('✅ BTC balance found:', btcBalance.available, 'BTC');
      } else {
        console.log('❌ BTC balance not found in response');
      }
    } else {
      console.log('❌ Balance endpoint failed:', result.error || result.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testBalanceEndpoint();
