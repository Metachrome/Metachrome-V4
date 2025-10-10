const axios = require('axios');

const BASE_URL = 'https://metachrome-v2-production.up.railway.app';

async function testWithdrawalBalanceFix() {
  try {
    console.log('🧪 Testing withdrawal balance fix...');
    
    // 1. Login and check initial balance
    console.log('1️⃣ Logging in and checking initial balance...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: 'angela.soenoko',
      password: 'newpass123'
    });
    
    if (!loginResponse.data.success) {
      console.error('❌ Login failed:', loginResponse.data);
      return;
    }
    
    const authToken = loginResponse.data.token;
    const initialBalance = parseFloat(loginResponse.data.user.balance);
    console.log('✅ Login successful');
    console.log(`💰 Initial balance: ${initialBalance} USDT`);
    
    // 2. Submit withdrawal request
    console.log('2️⃣ Submitting withdrawal request...');
    const withdrawalAmount = 50;
    
    const withdrawalResponse = await axios.post(`${BASE_URL}/api/withdrawals`, {
      amount: withdrawalAmount.toString(),
      currency: 'USDT',
      address: 'test-address-balance-fix-' + Date.now(),
      password: 'newpass123'
    }, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!withdrawalResponse.data.success) {
      console.error('❌ Withdrawal submission failed:', withdrawalResponse.data);
      return;
    }
    
    console.log('✅ Withdrawal submitted:', withdrawalResponse.data.withdrawalId);
    
    // 3. Check balance after withdrawal request
    console.log('3️⃣ Checking balance after withdrawal request...');
    
    const balanceResponse = await axios.get(`${BASE_URL}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    const balanceAfterRequest = parseFloat(balanceResponse.data.user.balance);
    console.log(`💰 Balance after withdrawal request: ${balanceAfterRequest} USDT`);
    
    const expectedBalanceAfterRequest = initialBalance - withdrawalAmount;
    if (Math.abs(balanceAfterRequest - expectedBalanceAfterRequest) < 0.01) {
      console.log('✅ SUCCESS: Balance correctly deducted during withdrawal request!');
      console.log(`   Expected: ${expectedBalanceAfterRequest}, Actual: ${balanceAfterRequest}`);
    } else {
      console.log('❌ PROBLEM: Balance not deducted correctly during withdrawal request');
      console.log(`   Expected: ${expectedBalanceAfterRequest}, Actual: ${balanceAfterRequest}`);
      console.log('   This means the production server still has the old code');
    }
    
    console.log('\n🎉 Test completed! The fix needs to be deployed to production.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testWithdrawalBalanceFix();
