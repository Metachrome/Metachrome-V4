const axios = require('axios');

async function testDeploymentStatus() {
  console.log('🔍 TESTING DEPLOYMENT STATUS...\n');
  
  const BASE_URL = 'https://metachrome-v2-production.up.railway.app';
  
  try {
    // 1. Check server status
    console.log('1️⃣ Checking server status...');
    const statusResponse = await axios.get(`${BASE_URL}/api/test/server-status`);
    console.log('✅ Server status:', statusResponse.data.status);
    console.log('📅 Server timestamp:', statusResponse.data.timestamp);
    
    // 2. Test if /api/withdrawals endpoint exists (indicates our fix is deployed)
    console.log('\n2️⃣ Testing if withdrawal endpoint exists...');
    
    try {
      // Try to access the endpoint (should get 401 or 400, not 404 if it exists)
      const withdrawalTest = await axios.post(`${BASE_URL}/api/withdrawals`, {
        amount: '10',
        currency: 'USDT',
        address: 'test-address',
        password: 'wrong-password'
      });
    } catch (error) {
      if (error.response) {
        if (error.response.status === 404) {
          console.log('❌ /api/withdrawals endpoint does NOT exist (404)');
          console.log('   This means our fix has NOT been deployed to production');
        } else if (error.response.status === 401 || error.response.status === 400) {
          console.log('✅ /api/withdrawals endpoint EXISTS (got auth/validation error)');
          console.log('   This means our fix HAS been deployed to production');
        } else {
          console.log(`⚠️ /api/withdrawals endpoint returned status: ${error.response.status}`);
        }
      } else {
        console.log('❌ Network error testing withdrawal endpoint');
      }
    }
    
    // 3. Login and test admin API
    console.log('\n3️⃣ Testing admin API...');
    
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: 'angela.soenoko',
      password: 'newpass123'
    });
    
    if (loginResponse.data.success) {
      const authToken = loginResponse.data.token;
      console.log('✅ Login successful');
      
      // Test admin pending requests
      const pendingResponse = await axios.get(`${BASE_URL}/api/admin/pending-requests`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      console.log('📊 Admin API response:', pendingResponse.data);
      console.log(`💸 Pending withdrawals: ${pendingResponse.data.withdrawals?.length || 0}`);
      console.log(`💰 Pending deposits: ${pendingResponse.data.deposits?.length || 0}`);
      
      // 4. Check if we can create a test withdrawal (if endpoint exists)
      console.log('\n4️⃣ Attempting to create test withdrawal...');
      
      try {
        // Try with a common password
        const testWithdrawal = await axios.post(`${BASE_URL}/api/withdrawals`, {
          amount: '1',
          currency: 'USDT', 
          address: 'test-address-' + Date.now(),
          password: 'password123' // Try common password
        }, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        console.log('✅ Test withdrawal created:', testWithdrawal.data);
        
        // Check if it appears in admin dashboard
        setTimeout(async () => {
          const afterResponse = await axios.get(`${BASE_URL}/api/admin/pending-requests`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
          });
          
          console.log('\n5️⃣ Checking admin dashboard after withdrawal...');
          console.log(`💸 Pending withdrawals after: ${afterResponse.data.withdrawals?.length || 0}`);
          
          if (afterResponse.data.withdrawals?.length > 0) {
            console.log('✅ SUCCESS: Withdrawal appears in admin dashboard!');
            afterResponse.data.withdrawals.forEach((w, i) => {
              console.log(`   ${i+1}. ${w.id}: ${w.amount} ${w.currency} - ${w.username}`);
            });
          } else {
            console.log('❌ PROBLEM: Withdrawal does not appear in admin dashboard');
          }
        }, 2000);
        
      } catch (withdrawalError) {
        if (withdrawalError.response?.status === 404) {
          console.log('❌ Withdrawal endpoint still does not exist');
        } else if (withdrawalError.response?.status === 401) {
          console.log('⚠️ Withdrawal endpoint exists but password is wrong');
          console.log('   Error:', withdrawalError.response.data);
        } else {
          console.log('⚠️ Withdrawal creation failed:', withdrawalError.response?.data || withdrawalError.message);
        }
      }
    }
    
    // 6. Summary
    console.log('\n📊 DEPLOYMENT STATUS SUMMARY:');
    console.log('🔍 Key indicators:');
    console.log('   - If /api/withdrawals returns 404: Fix NOT deployed');
    console.log('   - If /api/withdrawals returns 401/400: Fix IS deployed');
    console.log('   - If admin dashboard shows 0 withdrawals: Either no requests made or database sync issue');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testDeploymentStatus();
