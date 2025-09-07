// Test script to verify deposit functionality
async function testDeposit() {
  try {
    console.log('🧪 Testing deposit functionality...');
    
    // First, login to get session
    const loginResponse = await fetch('http://127.0.0.1:5000/api/auth/user/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        username: 'trader1',
        password: 'password123'
      }),
    });
    
    if (!loginResponse.ok) {
      throw new Error('Login failed');
    }
    
    const loginData = await loginResponse.json();
    console.log('✅ Login successful:', loginData.user.username);
    
    // Test deposit
    const depositResponse = await fetch('http://127.0.0.1:5000/api/transactions/deposit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        amount: '100',
        currency: 'USDT',
        txHash: 'test_deposit_123',
        method: 'crypto'
      }),
    });
    
    if (!depositResponse.ok) {
      const errorData = await depositResponse.json();
      throw new Error(`Deposit failed: ${errorData.message}`);
    }
    
    const depositData = await depositResponse.json();
    console.log('✅ Deposit successful:', depositData);
    
    // Check updated balance
    const balanceResponse = await fetch('http://127.0.0.1:5000/api/balances', {
      method: 'GET',
      credentials: 'include',
    });
    
    if (balanceResponse.ok) {
      const balances = await balanceResponse.json();
      console.log('💰 Updated balances:', balances);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testDeposit();
