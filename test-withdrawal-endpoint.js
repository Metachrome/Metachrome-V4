const fetch = require('node-fetch');

async function testWithdrawalEndpoint() {
  try {
    console.log('🧪 Testing withdrawal endpoint...');
    
    const response = await fetch('http://localhost:3005/api/transactions/withdrawal-request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer user-session-test-user-123'
      },
      body: JSON.stringify({
        amount: '100',
        currency: 'BTC',
        address: 'test-wallet-address-123'
      })
    });

    const result = await response.json();
    
    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Data:', JSON.stringify(result, null, 2));
    
    if (response.ok) {
      console.log('✅ Withdrawal endpoint is working!');
    } else {
      console.log('❌ Withdrawal endpoint failed:', result.error || result.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testWithdrawalEndpoint();
