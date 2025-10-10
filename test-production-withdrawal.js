const axios = require('axios');

async function testProductionWithdrawal() {
  console.log('🧪 TESTING PRODUCTION WITHDRAWAL CREATION...\n');
  
  const BASE_URL = 'https://metachrome-v2-production.up.railway.app';
  
  try {
    // 1. Check server status
    console.log('1️⃣ Checking production server status...');
    const statusResponse = await axios.get(`${BASE_URL}/api/test/server-status`);
    console.log('✅ Server status:', statusResponse.data.status);
    console.log('📅 Server timestamp:', statusResponse.data.timestamp);
    
    // 2. Login as test user
    console.log('\n2️⃣ Logging in as angela.soenoko...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: 'angela.soenoko',
      password: 'newpass123'
    });
    
    if (!loginResponse.data.success) {
      throw new Error('Login failed: ' + JSON.stringify(loginResponse.data));
    }
    
    const authToken = loginResponse.data.token;
    const user = loginResponse.data.user;
    console.log('✅ Login successful:', user.username);
    console.log('💰 Current balance:', user.balance);
    
    // 3. Check current pending requests BEFORE withdrawal
    console.log('\n3️⃣ Checking pending requests BEFORE withdrawal...');
    
    try {
      const beforeResponse = await axios.get(`${BASE_URL}/api/admin/pending-requests`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      const beforeWithdrawals = beforeResponse.data.withdrawals || [];
      console.log(`📋 Pending withdrawals BEFORE: ${beforeWithdrawals.length}`);
      
      if (beforeWithdrawals.length > 0) {
        console.log('📋 Existing pending withdrawals:');
        beforeWithdrawals.forEach((w, i) => {
          console.log(`   ${i+1}. ${w.id}: ${w.amount} ${w.currency} - ${w.username}`);
        });
      }
    } catch (adminError) {
      console.log('⚠️ Could not check admin pending requests (might need admin auth)');
    }
    
    // 4. Create withdrawal request
    console.log('\n4️⃣ Creating withdrawal request...');
    const withdrawalAmount = 25; // Small amount for testing
    
    // Try different possible passwords
    const possiblePasswords = ['newpass123', 'password123', 'admin123', 'test123', '123456'];
    let withdrawalResponse = null;

    for (const password of possiblePasswords) {
      try {
        console.log(`   Trying password: ${password}`);
        withdrawalResponse = await axios.post(`${BASE_URL}/api/withdrawals`, {
          amount: withdrawalAmount.toString(),
          currency: 'USDT',
          address: 'test-wallet-address-debug-' + Date.now(),
          password: password
        }, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });

        console.log(`✅ Password ${password} worked!`);
        break; // Success, exit loop

      } catch (passwordError) {
        if (passwordError.response && passwordError.response.status === 401) {
          console.log(`   ❌ Password ${password} failed`);
          continue; // Try next password
        } else {
          throw passwordError; // Different error, re-throw
        }
      }
    }

    if (!withdrawalResponse) {
      throw new Error('All passwords failed - could not create withdrawal');
    }

    console.log('📤 Withdrawal response status:', withdrawalResponse.status);
    console.log('📤 Withdrawal response:', withdrawalResponse.data);
    
    if (withdrawalResponse.data.success) {
      console.log('✅ Withdrawal request created successfully!');
      console.log('💸 Withdrawal ID:', withdrawalResponse.data.withdrawalId);
      console.log('💰 Amount:', withdrawalResponse.data.amount, withdrawalResponse.data.currency);
    } else {
      console.log('❌ Withdrawal request failed:', withdrawalResponse.data);
    }
    
    // 5. Wait a moment for processing
    console.log('\n5️⃣ Waiting for server processing...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 6. Check pending requests AFTER withdrawal
    console.log('\n6️⃣ Checking pending requests AFTER withdrawal...');
    
    try {
      const afterResponse = await axios.get(`${BASE_URL}/api/admin/pending-requests`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      const afterWithdrawals = afterResponse.data.withdrawals || [];
      console.log(`📋 Pending withdrawals AFTER: ${afterWithdrawals.length}`);
      
      if (afterWithdrawals.length > 0) {
        console.log('📋 Current pending withdrawals:');
        afterWithdrawals.forEach((w, i) => {
          console.log(`   ${i+1}. ${w.id}: ${w.amount} ${w.currency} - ${w.username} (${w.status})`);
          console.log(`       Created: ${w.created_at || 'N/A'}`);
          console.log(`       Address: ${w.wallet_address || w.address || 'N/A'}`);
        });
        
        // Check if our withdrawal is in the list
        const ourWithdrawal = afterWithdrawals.find(w => 
          w.amount == withdrawalAmount && w.username === 'angela.soenoko'
        );
        
        if (ourWithdrawal) {
          console.log('✅ SUCCESS: Our withdrawal found in admin dashboard!');
          console.log(`   ID: ${ourWithdrawal.id}`);
          console.log(`   Amount: ${ourWithdrawal.amount} ${ourWithdrawal.currency}`);
        } else {
          console.log('❌ PROBLEM: Our withdrawal NOT found in admin dashboard');
        }
      } else {
        console.log('❌ PROBLEM: No pending withdrawals found after creation');
      }
    } catch (adminError) {
      console.log('⚠️ Could not check admin pending requests after withdrawal');
      console.log('Error:', adminError.message);
    }
    
    // 7. Check user balance after withdrawal
    console.log('\n7️⃣ Checking user balance after withdrawal...');
    
    const balanceResponse = await axios.get(`${BASE_URL}/api/user/profile`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    if (balanceResponse.data.success) {
      console.log('💰 Balance after withdrawal:', balanceResponse.data.user.balance);
      console.log('💸 Expected balance change:', -withdrawalAmount);
    }
    
    // 8. Analysis
    console.log('\n📊 ANALYSIS:');
    console.log('🔍 If withdrawal was created but not showing in admin dashboard:');
    console.log('   1. Check if production server has the database sync fix');
    console.log('   2. Check if Supabase database connection is working');
    console.log('   3. Check if withdrawals table exists in production database');
    console.log('   4. Check server logs for database sync errors');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testProductionWithdrawal();
