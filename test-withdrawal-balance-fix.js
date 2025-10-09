const axios = require('axios');

async function testWithdrawalBalanceFix() {
  console.log('🧪 Testing Withdrawal Balance Deduction Fix...\n');
  
  const BASE_URL = 'http://localhost:3005';
  
  try {
    // 1. Check server status
    console.log('1️⃣ Checking server status...');
    const statusResponse = await axios.get(`${BASE_URL}/api/test/server-status`);
    console.log('✅ Server is running:', statusResponse.data.status);
    
    // 2. Login as test user
    console.log('\n2️⃣ Logging in as test user...');
    const loginResponse = await axios.post(`${BASE_URL}/api/login`, {
      username: 'angela.soenoko',
      password: 'newpass123'
    });
    
    if (!loginResponse.data.success) {
      throw new Error('Login failed: ' + JSON.stringify(loginResponse.data));
    }
    
    const authToken = loginResponse.data.token;
    const user = loginResponse.data.user;
    console.log('✅ Login successful:', user.username);
    console.log('💰 Initial balance:', user.balance);
    
    // 3. Get current user data
    console.log('\n3️⃣ Getting current user data...');
    const userResponse = await axios.get(`${BASE_URL}/api/user/data`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    const initialBalance = parseFloat(userResponse.data.balance);
    console.log('💰 Current balance from API:', initialBalance);
    
    // 4. Create withdrawal request
    console.log('\n4️⃣ Creating withdrawal request...');
    const withdrawalAmount = 100;
    const withdrawalResponse = await axios.post(`${BASE_URL}/api/withdrawals`, {
      amount: withdrawalAmount.toString(),
      currency: 'USDT',
      address: 'test-wallet-address-123',
      password: 'newpass123'
    }, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    if (!withdrawalResponse.data.success) {
      throw new Error('Withdrawal request failed: ' + JSON.stringify(withdrawalResponse.data));
    }
    
    console.log('✅ Withdrawal request created:', withdrawalResponse.data.message);
    
    // 5. Check balance after withdrawal request
    console.log('\n5️⃣ Checking balance after withdrawal request...');
    const balanceAfterRequest = await axios.get(`${BASE_URL}/api/user/data`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    const balanceAfterWithdrawal = parseFloat(balanceAfterRequest.data.balance);
    console.log('💰 Balance after withdrawal request:', balanceAfterWithdrawal);
    console.log('💰 Expected balance after deduction:', initialBalance - withdrawalAmount);
    console.log('💰 Balance was deducted:', balanceAfterWithdrawal < initialBalance ? '✅ YES' : '❌ NO');
    
    // 6. Get pending withdrawals (admin view)
    console.log('\n6️⃣ Getting pending withdrawals...');
    const pendingResponse = await axios.get(`${BASE_URL}/api/admin/pending-requests`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    const pendingWithdrawals = pendingResponse.data.withdrawals || [];
    console.log('📋 Pending withdrawals:', pendingWithdrawals.length);
    
    if (pendingWithdrawals.length === 0) {
      console.log('⚠️ No pending withdrawals found');
      return;
    }
    
    const latestWithdrawal = pendingWithdrawals[pendingWithdrawals.length - 1];
    console.log('💸 Latest withdrawal:', {
      id: latestWithdrawal.id,
      amount: latestWithdrawal.amount,
      status: latestWithdrawal.status,
      user_balance: latestWithdrawal.user_balance
    });
    
    // 7. Approve the withdrawal
    console.log('\n7️⃣ Approving withdrawal...');
    const approvalResponse = await axios.post(`${BASE_URL}/api/admin/withdrawals/${latestWithdrawal.id}`, {
      action: 'approve'
    }, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    if (!approvalResponse.data.success) {
      throw new Error('Withdrawal approval failed: ' + JSON.stringify(approvalResponse.data));
    }
    
    console.log('✅ Withdrawal approved:', approvalResponse.data.message);
    
    // 8. Check final balance
    console.log('\n8️⃣ Checking final balance after approval...');
    const finalBalanceResponse = await axios.get(`${BASE_URL}/api/user/data`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    const finalBalance = parseFloat(finalBalanceResponse.data.balance);
    console.log('💰 Final balance:', finalBalance);
    console.log('💰 Expected final balance:', initialBalance - withdrawalAmount);
    console.log('💰 Balance difference from expected:', Math.abs(finalBalance - (initialBalance - withdrawalAmount)));
    
    // 9. Analysis
    console.log('\n📊 ANALYSIS:');
    console.log('💰 Initial balance:', initialBalance);
    console.log('💰 Withdrawal amount:', withdrawalAmount);
    console.log('💰 Balance after request:', balanceAfterWithdrawal);
    console.log('💰 Final balance after approval:', finalBalance);
    console.log('💰 Total deducted:', initialBalance - finalBalance);
    
    if (Math.abs(finalBalance - (initialBalance - withdrawalAmount)) < 0.01) {
      console.log('✅ SUCCESS: Balance correctly deducted exactly once');
    } else if (finalBalance === initialBalance) {
      console.log('❌ PROBLEM: No balance deduction occurred');
    } else if (Math.abs(finalBalance - (initialBalance - (withdrawalAmount * 2))) < 0.01) {
      console.log('❌ PROBLEM: Double deduction occurred');
    } else {
      console.log('⚠️ UNEXPECTED: Unusual balance behavior');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testWithdrawalBalanceFix();
