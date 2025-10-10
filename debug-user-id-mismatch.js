const axios = require('axios');

const BASE_URL = 'https://metachrome-v2-production.up.railway.app';

async function debugUserIdMismatch() {
  try {
    console.log('🔍 Debugging user ID mismatch in withdrawal approval...');
    
    // 1. Login and get user details
    console.log('1️⃣ Logging in to get user details...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: 'angela.soenoko',
      password: 'newpass123'
    });
    
    if (!loginResponse.data.success) {
      console.error('❌ Login failed:', loginResponse.data);
      return;
    }
    
    const authToken = loginResponse.data.token;
    const user = loginResponse.data.user;
    console.log('✅ Login successful');
    console.log('👤 User details from login:', {
      id: user.id,
      username: user.username,
      balance: user.balance
    });
    
    // 2. Create a test withdrawal to see what user_id gets stored
    console.log('2️⃣ Creating test withdrawal...');
    const withdrawalResponse = await axios.post(`${BASE_URL}/api/withdrawals`, {
      amount: '5',
      currency: 'USDT',
      address: 'debug-user-id-' + Date.now(),
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
    
    // 3. Check the withdrawal details in admin dashboard
    console.log('3️⃣ Checking withdrawal details in admin dashboard...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const pendingResponse = await axios.get(`${BASE_URL}/api/admin/pending-requests`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    const withdrawals = pendingResponse.data.withdrawals || [];
    const ourWithdrawal = withdrawals.find(w => w.id === withdrawalResponse.data.withdrawalId);
    
    if (!ourWithdrawal) {
      console.error('❌ Withdrawal not found in admin dashboard');
      return;
    }
    
    console.log('📋 Withdrawal details from admin dashboard:', {
      id: ourWithdrawal.id,
      user_id: ourWithdrawal.user_id,
      username: ourWithdrawal.username,
      amount: ourWithdrawal.amount,
      currency: ourWithdrawal.currency,
      status: ourWithdrawal.status
    });
    
    // 4. Compare user IDs
    console.log('4️⃣ Comparing user IDs...');
    console.log(`👤 User ID from login: "${user.id}" (type: ${typeof user.id})`);
    console.log(`💸 User ID from withdrawal: "${ourWithdrawal.user_id}" (type: ${typeof ourWithdrawal.user_id})`);
    
    if (user.id === ourWithdrawal.user_id) {
      console.log('✅ User IDs match exactly');
    } else if (user.id == ourWithdrawal.user_id) {
      console.log('⚠️ User IDs match with type coercion (string vs number issue)');
    } else {
      console.log('❌ User IDs do NOT match - this is the problem!');
    }
    
    // 5. Test direct database query to see what happens
    console.log('5️⃣ Testing withdrawal approval to see database query...');
    
    const approvalResponse = await axios.post(`${BASE_URL}/api/admin/withdrawals/${ourWithdrawal.id}/action`, {
      action: 'approve',
      reason: 'Debug test - checking user ID matching'
    }, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📤 Approval response:', {
      success: approvalResponse.data.success,
      message: approvalResponse.data.message
    });
    
    // 6. Check if balance changed
    console.log('6️⃣ Checking if balance changed...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const finalLoginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: 'angela.soenoko',
      password: 'newpass123'
    });
    
    const finalBalance = parseFloat(finalLoginResponse.data.user.balance);
    const initialBalance = parseFloat(user.balance);
    const expectedDeduction = parseFloat(ourWithdrawal.amount);
    const actualDeduction = initialBalance - finalBalance;
    
    console.log('\n📊 FINAL ANALYSIS:');
    console.log(`💰 Initial balance: ${initialBalance} USDT`);
    console.log(`💰 Final balance: ${finalBalance} USDT`);
    console.log(`💸 Expected deduction: ${expectedDeduction} USDT`);
    console.log(`💸 Actual deduction: ${actualDeduction} USDT`);
    
    if (Math.abs(actualDeduction - expectedDeduction) < 0.01) {
      console.log('✅ SUCCESS: Balance correctly deducted!');
    } else if (actualDeduction === 0) {
      console.log('❌ PROBLEM: No balance deduction occurred');
      console.log('🔧 Likely causes:');
      console.log('   1. User ID mismatch in database query');
      console.log('   2. Database update failing silently');
      console.log('   3. Wrong endpoint being called');
    } else {
      console.log('⚠️ PARTIAL: Unexpected deduction amount');
    }
    
    console.log('\n🎉 Debug completed!');
    
  } catch (error) {
    console.error('❌ Debug failed:', error.response?.data || error.message);
  }
}

debugUserIdMismatch();
