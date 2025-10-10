const axios = require('axios');

async function checkProductionAdminAPI() {
  console.log('🔍 CHECKING PRODUCTION ADMIN API...\n');
  
  const BASE_URL = 'https://metachrome-v2-production.up.railway.app';
  
  try {
    // 1. Login as user first
    console.log('1️⃣ Logging in as angela.soenoko...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: 'angela.soenoko',
      password: 'newpass123'
    });
    
    if (!loginResponse.data.success) {
      // Try different login endpoint
      console.log('   Trying alternative login...');
      const altLoginResponse = await axios.post(`${BASE_URL}/login`, {
        username: 'angela.soenoko',
        password: 'newpass123'
      });
      
      if (altLoginResponse.data.success) {
        console.log('✅ Alternative login successful');
      } else {
        throw new Error('Both login methods failed');
      }
    }
    
    const authToken = loginResponse.data.token;
    const user = loginResponse.data.user;
    console.log('✅ Login successful:', user.username);
    console.log('👤 User role:', user.role);
    
    // 2. Check admin pending requests API
    console.log('\n2️⃣ Checking admin pending requests API...');
    
    try {
      const pendingResponse = await axios.get(`${BASE_URL}/api/admin/pending-requests`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      console.log('✅ Admin API accessible');
      console.log('📊 Response status:', pendingResponse.status);
      console.log('📋 Response data:', JSON.stringify(pendingResponse.data, null, 2));
      
      const withdrawals = pendingResponse.data.withdrawals || [];
      const deposits = pendingResponse.data.deposits || [];
      
      console.log(`💸 Pending withdrawals: ${withdrawals.length}`);
      console.log(`💰 Pending deposits: ${deposits.length}`);
      
      if (withdrawals.length > 0) {
        console.log('\n📋 Withdrawal details:');
        withdrawals.forEach((w, i) => {
          console.log(`   ${i+1}. ID: ${w.id}`);
          console.log(`      User: ${w.username || w.user_id}`);
          console.log(`      Amount: ${w.amount} ${w.currency}`);
          console.log(`      Status: ${w.status}`);
          console.log(`      Created: ${w.created_at || 'N/A'}`);
          console.log('');
        });
      }
      
    } catch (adminError) {
      console.log('❌ Admin API error:', adminError.message);
      if (adminError.response) {
        console.log('   Status:', adminError.response.status);
        console.log('   Data:', adminError.response.data);
      }
    }
    
    // 3. Try to check if the endpoint exists with different methods
    console.log('\n3️⃣ Testing different admin endpoints...');
    
    const adminEndpoints = [
      '/api/admin/pending-requests',
      '/api/admin/withdrawals',
      '/api/admin/pending-withdrawals',
      '/admin/pending-requests',
      '/admin/withdrawals'
    ];
    
    for (const endpoint of adminEndpoints) {
      try {
        console.log(`   Testing: ${endpoint}`);
        const response = await axios.get(`${BASE_URL}${endpoint}`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        console.log(`   ✅ ${endpoint} - Status: ${response.status}`);
        
        if (response.data.withdrawals) {
          console.log(`      Withdrawals: ${response.data.withdrawals.length}`);
        }
        
      } catch (endpointError) {
        console.log(`   ❌ ${endpoint} - Status: ${endpointError.response?.status || 'Error'}`);
      }
    }
    
    // 4. Check if we can access any withdrawal-related endpoints
    console.log('\n4️⃣ Testing withdrawal endpoints...');
    
    const withdrawalEndpoints = [
      '/api/withdrawals',
      '/api/user/withdrawals',
      '/withdrawals'
    ];
    
    for (const endpoint of withdrawalEndpoints) {
      try {
        console.log(`   Testing GET: ${endpoint}`);
        const response = await axios.get(`${BASE_URL}${endpoint}`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        console.log(`   ✅ ${endpoint} - Status: ${response.status}`);
        console.log(`      Data:`, response.data);
        
      } catch (endpointError) {
        console.log(`   ❌ ${endpoint} - Status: ${endpointError.response?.status || 'Error'}`);
      }
    }
    
    // 5. Check server version/deployment info
    console.log('\n5️⃣ Checking server deployment info...');
    
    try {
      const deploymentResponse = await axios.get(`${BASE_URL}/api/test/deployment-info`);
      console.log('📦 Deployment info:', deploymentResponse.data);
    } catch (deployError) {
      console.log('⚠️ No deployment info endpoint available');
    }
    
    // 6. Summary
    console.log('\n📊 SUMMARY:');
    console.log('🔍 This test helps determine:');
    console.log('   1. Whether admin API endpoints exist and are accessible');
    console.log('   2. Whether the database sync fix has been deployed');
    console.log('   3. What the current state of pending requests is');
    console.log('   4. Whether the issue is with deployment or database connectivity');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
checkProductionAdminAPI();
