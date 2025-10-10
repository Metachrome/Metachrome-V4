const axios = require('axios');

const BASE_URL = 'https://metachrome-v2-production.up.railway.app';

async function testWithdrawalSubmission() {
  try {
    console.log('🧪 Testing withdrawal submission...');
    
    // 1. Login first
    console.log('1️⃣ Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: 'angela.soenoko',
      password: 'newpass123'
    });
    
    if (!loginResponse.data.success) {
      console.error('❌ Login failed:', loginResponse.data);
      return;
    }
    
    const authToken = loginResponse.data.token;
    console.log('✅ Login successful');
    
    // 2. Submit withdrawal
    console.log('2️⃣ Submitting withdrawal...');
    const withdrawalResponse = await axios.post(`${BASE_URL}/api/withdrawals`, {
      amount: '25',
      currency: 'USDT',
      address: 'test-address-' + Date.now(),
      password: 'newpass123'
    }, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Withdrawal response:', withdrawalResponse.data);
    
    // 3. Wait a moment then check admin dashboard
    console.log('3️⃣ Waiting 2 seconds then checking admin dashboard...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const pendingResponse = await axios.get(`${BASE_URL}/api/admin/pending-requests`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    console.log('📊 Admin dashboard response:', pendingResponse.data);
    
    const withdrawals = pendingResponse.data.withdrawals || [];
    console.log(`💸 Pending withdrawals in admin dashboard: ${withdrawals.length}`);
    
    if (withdrawals.length > 0) {
      console.log('✅ SUCCESS: Withdrawal appears in admin dashboard!');
      withdrawals.forEach((w, i) => {
        console.log(`   ${i+1}. ${w.id}: ${w.amount} ${w.currency} - ${w.username} (${w.status})`);
      });
    } else {
      console.log('❌ PROBLEM: Withdrawal does not appear in admin dashboard');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testWithdrawalSubmission();
