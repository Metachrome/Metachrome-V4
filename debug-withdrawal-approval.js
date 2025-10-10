const axios = require('axios');

const BASE_URL = 'https://metachrome-v2-production.up.railway.app';

async function debugWithdrawalApproval() {
  try {
    console.log('🔍 Debugging withdrawal approval process...');
    
    // 1. Login
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
    const initialBalance = parseFloat(loginResponse.data.user.balance);
    console.log('✅ Login successful');
    console.log(`💰 Current balance: ${initialBalance} USDT`);
    
    // 2. Check pending withdrawals
    console.log('2️⃣ Checking pending withdrawals...');
    const pendingResponse = await axios.get(`${BASE_URL}/api/admin/pending-requests`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    const withdrawals = pendingResponse.data.withdrawals || [];
    console.log(`📋 Found ${withdrawals.length} pending withdrawals`);
    
    if (withdrawals.length === 0) {
      console.log('⚠️ No pending withdrawals found. Creating a test withdrawal...');
      
      // Create a test withdrawal
      const withdrawalResponse = await axios.post(`${BASE_URL}/api/withdrawals`, {
        amount: '15',
        currency: 'USDT',
        address: 'debug-test-' + Date.now(),
        password: 'newpass123'
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (withdrawalResponse.data.success) {
        console.log('✅ Test withdrawal created:', withdrawalResponse.data.withdrawalId);
        
        // Wait and check again
        await new Promise(resolve => setTimeout(resolve, 2000));
        const newPendingResponse = await axios.get(`${BASE_URL}/api/admin/pending-requests`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const newWithdrawals = newPendingResponse.data.withdrawals || [];
        if (newWithdrawals.length > 0) {
          console.log('✅ Test withdrawal appears in pending list');
        }
      }
    }
    
    // 3. Get the first pending withdrawal
    const finalPendingResponse = await axios.get(`${BASE_URL}/api/admin/pending-requests`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    const finalWithdrawals = finalPendingResponse.data.withdrawals || [];
    
    if (finalWithdrawals.length === 0) {
      console.log('❌ No withdrawals available for testing');
      return;
    }
    
    const testWithdrawal = finalWithdrawals[0];
    console.log('3️⃣ Testing withdrawal approval...');
    console.log(`📋 Withdrawal details:`, {
      id: testWithdrawal.id,
      amount: testWithdrawal.amount,
      currency: testWithdrawal.currency,
      username: testWithdrawal.username,
      status: testWithdrawal.status
    });
    
    // 4. Check balance before approval
    console.log('4️⃣ Checking balance before approval...');
    const beforeApprovalResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: 'angela.soenoko',
      password: 'newpass123'
    });
    const balanceBeforeApproval = parseFloat(beforeApprovalResponse.data.user.balance);
    console.log(`💰 Balance before approval: ${balanceBeforeApproval} USDT`);
    
    // 5. Approve the withdrawal with detailed logging
    console.log('5️⃣ Approving withdrawal...');
    console.log(`🔄 Sending approval request for withdrawal: ${testWithdrawal.id}`);
    
    const approvalResponse = await axios.post(`${BASE_URL}/api/admin/withdrawals/${testWithdrawal.id}/action`, {
      action: 'approve',
      reason: 'Debug test - checking balance deduction'
    }, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📤 Approval response:', {
      success: approvalResponse.data.success,
      message: approvalResponse.data.message,
      status: approvalResponse.status
    });
    
    if (approvalResponse.data.success) {
      console.log('✅ Withdrawal approval request successful');
      
      // 6. Wait and check balance after approval
      console.log('6️⃣ Waiting 5 seconds for balance update...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      console.log('7️⃣ Checking balance after approval...');
      const afterApprovalResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
        username: 'angela.soenoko',
        password: 'newpass123'
      });
      const balanceAfterApproval = parseFloat(afterApprovalResponse.data.user.balance);
      console.log(`💰 Balance after approval: ${balanceAfterApproval} USDT`);
      
      // 7. Analyze the results
      const expectedDeduction = parseFloat(testWithdrawal.amount);
      const actualDeduction = balanceBeforeApproval - balanceAfterApproval;
      
      console.log('\n📊 ANALYSIS:');
      console.log(`💰 Balance before approval: ${balanceBeforeApproval} USDT`);
      console.log(`💰 Balance after approval: ${balanceAfterApproval} USDT`);
      console.log(`💸 Expected deduction: ${expectedDeduction} USDT`);
      console.log(`💸 Actual deduction: ${actualDeduction} USDT`);
      
      if (Math.abs(actualDeduction - expectedDeduction) < 0.01) {
        console.log('✅ SUCCESS: Balance correctly deducted on approval!');
        console.log('🎉 WITHDRAWAL APPROVAL IS WORKING CORRECTLY!');
      } else if (actualDeduction === 0) {
        console.log('❌ PROBLEM: No balance deduction occurred');
        console.log('🔧 This means the production server still has the old approval logic');
        console.log('📝 The updated code needs to be deployed to Railway');
      } else {
        console.log('⚠️ UNEXPECTED: Partial or incorrect deduction occurred');
        console.log(`   Expected: ${expectedDeduction}, Actual: ${actualDeduction}`);
      }
      
    } else {
      console.error('❌ Withdrawal approval failed:', approvalResponse.data);
    }
    
    console.log('\n🎉 Debug test completed!');
    
  } catch (error) {
    console.error('❌ Debug test failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    }
  }
}

debugWithdrawalApproval();
