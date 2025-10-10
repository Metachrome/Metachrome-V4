const axios = require('axios');

const BASE_URL = 'https://metachrome-v2-production.up.railway.app';

async function testRealWithdrawalIssue() {
  try {
    console.log('🔍 TESTING REAL WITHDRAWAL ISSUE');
    console.log('================================');
    
    // 1. Check server status
    console.log('\n1️⃣ Checking server status...');
    try {
      const statusResponse = await axios.get(`${BASE_URL}/api/test/server-status`);
      console.log('✅ Server is running');
    } catch (error) {
      console.log('❌ Server is not running on port 3005');
      console.log('Please start the server with: node working-server.js');
      return;
    }
    
    // 2. Login to get auth token
    console.log('\n2️⃣ Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: 'angela.soenoko',
      password: 'newpass123'
    });
    
    if (!loginResponse.data.success) {
      throw new Error('Login failed: ' + JSON.stringify(loginResponse.data));
    }
    
    const authToken = loginResponse.data.token;
    console.log('✅ Login successful');
    
    // 3. Check current balance
    console.log('\n3️⃣ Checking current balance...');
    const userResponse = await axios.get(`${BASE_URL}/api/user/data`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    const currentBalance = parseFloat(userResponse.data.balance);
    console.log('💰 Current balance:', currentBalance);
    
    // 4. Check existing withdrawals in admin dashboard
    console.log('\n4️⃣ Checking existing withdrawals in admin...');
    const beforeWithdrawals = await axios.get(`${BASE_URL}/api/admin/withdrawals`);
    console.log(`📋 Withdrawals in admin dashboard: ${beforeWithdrawals.data.withdrawals.length}`);
    
    if (beforeWithdrawals.data.withdrawals.length > 0) {
      console.log('Recent withdrawals:');
      beforeWithdrawals.data.withdrawals.slice(0, 3).forEach(w => {
        console.log(`  - ${w.amount} ${w.currency} (${w.status}) - ${w.created_at}`);
      });
    }
    
    // 5. Create a new withdrawal request
    console.log('\n5️⃣ Creating NEW withdrawal request...');
    const withdrawalAmount = 25; // Small amount for testing
    const withdrawalResponse = await axios.post(`${BASE_URL}/api/withdrawals`, {
      amount: withdrawalAmount.toString(),
      currency: 'BTC',
      address: 'test-real-withdrawal-' + Date.now(),
      password: 'newpass123'
    }, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    if (!withdrawalResponse.data.success) {
      throw new Error('Withdrawal request failed: ' + JSON.stringify(withdrawalResponse.data));
    }
    
    console.log('✅ Withdrawal request created:', withdrawalResponse.data.withdrawal.id);
    
    // 6. Wait a moment for database sync
    console.log('\n6️⃣ Waiting for database sync...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 7. Check if withdrawal appears in admin dashboard
    console.log('\n7️⃣ Checking if withdrawal appears in admin dashboard...');
    const afterWithdrawals = await axios.get(`${BASE_URL}/api/admin/withdrawals`);
    console.log(`📋 Withdrawals in admin dashboard after: ${afterWithdrawals.data.withdrawals.length}`);
    
    const newWithdrawal = afterWithdrawals.data.withdrawals.find(w => 
      w.id === withdrawalResponse.data.withdrawal.id
    );
    
    if (newWithdrawal) {
      console.log('✅ SUCCESS: New withdrawal appears in admin dashboard!');
      console.log(`   Amount: ${newWithdrawal.amount} ${newWithdrawal.currency}`);
      console.log(`   Status: ${newWithdrawal.status}`);
      console.log(`   Address: ${newWithdrawal.wallet_address}`);
    } else {
      console.log('❌ PROBLEM: New withdrawal does NOT appear in admin dashboard');
      console.log('This indicates the database sync is not working properly');
    }
    
    // 8. Check updated balance
    console.log('\n8️⃣ Checking updated balance...');
    const updatedUserResponse = await axios.get(`${BASE_URL}/api/user/data`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    const updatedBalance = parseFloat(updatedUserResponse.data.balance);
    console.log('💰 Updated balance:', updatedBalance);
    console.log('💰 Balance change:', updatedBalance - currentBalance);
    
    if (updatedBalance === currentBalance - withdrawalAmount) {
      console.log('✅ Balance deduction is correct');
    } else {
      console.log('❌ Balance deduction is incorrect');
    }
    
    console.log('\n🎯 SUMMARY:');
    console.log('===========');
    console.log(`Withdrawal created: ${withdrawalResponse.data.withdrawal.id}`);
    console.log(`Appears in admin: ${newWithdrawal ? 'YES' : 'NO'}`);
    console.log(`Balance deducted: ${updatedBalance === currentBalance - withdrawalAmount ? 'YES' : 'NO'}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

testRealWithdrawalIssue();
