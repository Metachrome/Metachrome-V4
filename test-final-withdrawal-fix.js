const axios = require('axios');

const BASE_URL = 'https://metachrome-v2-production.up.railway.app';

async function testFinalWithdrawalFix() {
  try {
    console.log('🧪 Testing FINAL withdrawal fix...');
    console.log('📋 Expected behavior:');
    console.log('   1. Withdrawal request → Balance stays the same');
    console.log('   2. Withdrawal approval → Balance is deducted');
    console.log('   3. Withdrawal rejection → Balance stays the same');
    console.log('');
    
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
    const withdrawalAmount = 30;
    
    const withdrawalResponse = await axios.post(`${BASE_URL}/api/withdrawals`, {
      amount: withdrawalAmount.toString(),
      currency: 'USDT',
      address: 'test-final-fix-' + Date.now(),
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
    
    // 3. Check balance after withdrawal request (should be unchanged)
    console.log('3️⃣ Checking balance after withdrawal request...');
    
    // Wait a moment for any async operations
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
      console.log('❌ ISSUE: Balance changed after withdrawal request');
      console.log(`   Expected: ${initialBalance}, Actual: ${balanceAfterRequest}`);
      console.log('   Note: This means production server still has old logic');
    }
    
    // 4. Check if withdrawal appears in admin dashboard
    console.log('4️⃣ Checking admin dashboard...');
    
    const pendingResponse = await axios.get(`${BASE_URL}/api/admin/pending-requests`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    const withdrawals = pendingResponse.data.withdrawals || [];
    const ourWithdrawal = withdrawals.find(w => w.id === withdrawalResponse.data.withdrawalId);
    
    if (ourWithdrawal) {
      console.log('✅ SUCCESS: Withdrawal appears in admin dashboard!');
      console.log(`   Withdrawal: ${ourWithdrawal.amount} ${ourWithdrawal.currency} - ${ourWithdrawal.status}`);
      
      // 5. Test approval (this should deduct the balance)
      console.log('5️⃣ Testing withdrawal approval (should deduct balance)...');
      
      const approvalResponse = await axios.post(`${BASE_URL}/api/admin/withdrawals/${ourWithdrawal.id}/action`, {
        action: 'approve',
        reason: 'Test approval - final fix verification'
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (approvalResponse.data.success) {
        console.log('✅ Withdrawal approved successfully');
        
        // 6. Check final balance after approval (should be deducted now)
        console.log('6️⃣ Checking final balance after approval...');
        
        // Wait a moment for balance update
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const finalBalanceResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
          username: 'angela.soenoko',
          password: 'newpass123'
        });
        
        const finalBalance = parseFloat(finalBalanceResponse.data.user.balance);
        console.log(`💰 Final balance after approval: ${finalBalance} USDT`);
        
        // Calculate expected balance based on what actually happened during request
        const expectedFinalBalance = balanceAfterRequest - withdrawalAmount;
        const actualDeduction = balanceAfterRequest - finalBalance;
        
        console.log(`📊 Balance Analysis:`);
        console.log(`   Initial balance: ${initialBalance} USDT`);
        console.log(`   After request: ${balanceAfterRequest} USDT`);
        console.log(`   After approval: ${finalBalance} USDT`);
        console.log(`   Expected deduction on approval: ${withdrawalAmount} USDT`);
        console.log(`   Actual deduction on approval: ${actualDeduction} USDT`);
        
        if (Math.abs(actualDeduction - withdrawalAmount) < 0.01) {
          console.log('✅ SUCCESS: Balance correctly deducted on approval!');
          console.log('🎉 WITHDRAWAL APPROVAL BALANCE DEDUCTION IS NOW WORKING!');
        } else {
          console.log('❌ PROBLEM: Balance not deducted correctly on approval');
          console.log('   The fix still needs to be deployed to production');
        }
        
      } else {
        console.error('❌ Withdrawal approval failed:', approvalResponse.data);
      }
      
    } else {
      console.log('❌ PROBLEM: Withdrawal does not appear in admin dashboard');
    }
    
    console.log('\n🎉 Final withdrawal fix test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testFinalWithdrawalFix();
