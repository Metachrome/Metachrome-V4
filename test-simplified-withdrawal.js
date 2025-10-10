const axios = require('axios');

const BASE_URL = 'https://metachrome-v2-production.up.railway.app';

async function testSimplifiedWithdrawal() {
  try {
    console.log('🧪 Testing simplified withdrawal endpoint...');
    
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
    console.log(`💰 Initial balance: ${initialBalance} USDT`);
    
    // 2. Create a test withdrawal
    console.log('2️⃣ Creating test withdrawal...');
    const withdrawalAmount = 10;
    
    const withdrawalResponse = await axios.post(`${BASE_URL}/api/withdrawals`, {
      amount: withdrawalAmount.toString(),
      currency: 'USDT',
      address: 'test-simplified-' + Date.now(),
      password: 'newpass123'
    }, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!withdrawalResponse.data.success) {
      console.error('❌ Withdrawal creation failed:', withdrawalResponse.data);
      return;
    }
    
    console.log('✅ Test withdrawal created:', withdrawalResponse.data.withdrawalId);
    
    // 3. Check balance after withdrawal request (should be unchanged)
    console.log('3️⃣ Checking balance after withdrawal request...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const balanceAfterRequestResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: 'angela.soenoko',
      password: 'newpass123'
    });
    
    const balanceAfterRequest = parseFloat(balanceAfterRequestResponse.data.user.balance);
    console.log(`💰 Balance after withdrawal request: ${balanceAfterRequest} USDT`);
    
    if (Math.abs(balanceAfterRequest - initialBalance) < 0.01) {
      console.log('✅ SUCCESS: Balance unchanged after withdrawal request!');
    } else {
      console.log('⚠️ NOTE: Balance changed after withdrawal request');
      console.log(`   Expected: ${initialBalance}, Actual: ${balanceAfterRequest}`);
    }
    
    // 4. Get the withdrawal from admin dashboard
    console.log('4️⃣ Getting withdrawal from admin dashboard...');
    
    const pendingResponse = await axios.get(`${BASE_URL}/api/admin/pending-requests`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    const withdrawals = pendingResponse.data.withdrawals || [];
    const ourWithdrawal = withdrawals.find(w => w.id === withdrawalResponse.data.withdrawalId);
    
    if (!ourWithdrawal) {
      console.error('❌ Withdrawal not found in admin dashboard');
      return;
    }
    
    console.log('✅ Withdrawal found in admin dashboard');
    console.log(`📋 Withdrawal: ${ourWithdrawal.amount} ${ourWithdrawal.currency} - ${ourWithdrawal.status}`);
    
    // 5. Test the simplified approval endpoint
    console.log('5️⃣ Testing simplified withdrawal approval...');
    
    const approvalResponse = await axios.post(`${BASE_URL}/api/admin/withdrawals/${ourWithdrawal.id}/action`, {
      action: 'approve',
      reason: 'Test approval - simplified endpoint'
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
      
      // 6. Check final balance after approval
      console.log('6️⃣ Checking final balance after approval...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const finalBalanceResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
        username: 'angela.soenoko',
        password: 'newpass123'
      });
      
      const finalBalance = parseFloat(finalBalanceResponse.data.user.balance);
      console.log(`💰 Final balance after approval: ${finalBalance} USDT`);
      
      // Calculate expected and actual deduction
      const expectedDeduction = withdrawalAmount;
      const actualDeduction = balanceAfterRequest - finalBalance;
      
      console.log('\n📊 FINAL ANALYSIS:');
      console.log(`💰 Balance after request: ${balanceAfterRequest} USDT`);
      console.log(`💰 Balance after approval: ${finalBalance} USDT`);
      console.log(`💸 Expected deduction: ${expectedDeduction} USDT`);
      console.log(`💸 Actual deduction: ${actualDeduction} USDT`);
      
      if (Math.abs(actualDeduction - expectedDeduction) < 0.01) {
        console.log('✅ SUCCESS: Balance correctly deducted on approval!');
        console.log('🎉 SIMPLIFIED WITHDRAWAL ENDPOINT IS WORKING!');
      } else if (actualDeduction === 0) {
        console.log('❌ PROBLEM: No balance deduction occurred');
        console.log('🔧 The production server still needs the updated code');
      } else {
        console.log('⚠️ PARTIAL: Unexpected deduction amount');
        console.log(`   Difference: ${Math.abs(actualDeduction - expectedDeduction)} USDT`);
      }
      
    } else {
      console.error('❌ Withdrawal approval failed:', approvalResponse.data);
    }
    
    console.log('\n🎉 Simplified withdrawal test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
    }
  }
}

testSimplifiedWithdrawal();
