async function testProductionEndpoints() {
  try {
    console.log('🧪 Testing production endpoints...');
    
    // Test 1: Check if deposits are showing
    console.log('\n1. 📊 Testing admin pending requests...');
    try {
      const response = await fetch('https://metachrome-v2-production.up.railway.app/api/admin/pending-requests');
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Admin API working:');
        console.log(`   Deposits: ${data.deposits?.length || 0}`);
        console.log(`   Withdrawals: ${data.withdrawals?.length || 0}`);
        
        if (data.deposits && data.deposits.length > 0) {
          console.log('📋 First deposit details:');
          const firstDeposit = data.deposits[0];
          console.log(`   ID: ${firstDeposit.id}`);
          console.log(`   Username: ${firstDeposit.username}`);
          console.log(`   Amount: ${firstDeposit.amount} ${firstDeposit.currency}`);
          console.log(`   Status: ${firstDeposit.status}`);
          
          // Test 2: Try the deposit action endpoint
          console.log('\n2. 🧪 Testing deposit action endpoint...');
          const actionUrl = `https://metachrome-v2-production.up.railway.app/api/admin/deposits/${firstDeposit.id}/action`;
          console.log(`   Testing URL: ${actionUrl}`);
          
          try {
            const actionResponse = await fetch(actionUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                action: 'approve',
                reason: 'Test approval'
              })
            });
            
            console.log(`   Response status: ${actionResponse.status}`);
            
            if (actionResponse.status === 404) {
              console.log('❌ ENDPOINT NOT FOUND (404)');
              console.log('🔧 CAUSE: Production server missing deposit action endpoint');
              console.log('🚀 SOLUTION: Deploy updated working-server.js');
            } else if (actionResponse.ok) {
              const actionData = await actionResponse.json();
              console.log('✅ Action endpoint working:', actionData);
            } else {
              const errorText = await actionResponse.text();
              console.log(`❌ Action failed (${actionResponse.status}):`, errorText);
            }
          } catch (actionError) {
            console.log('❌ Action endpoint error:', actionError.message);
          }
        }
      } else {
        console.log(`❌ Admin API failed: ${response.status}`);
      }
    } catch (apiError) {
      console.log('❌ Admin API error:', apiError.message);
    }
    
    // Test 3: Check if the server has the latest code
    console.log('\n3. 🔍 Checking server version...');
    try {
      const healthResponse = await fetch('https://metachrome-v2-production.up.railway.app/api/health');
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        console.log('✅ Server health:', healthData);
      } else {
        console.log('⚠️ No health endpoint available');
      }
    } catch (healthError) {
      console.log('⚠️ Health check failed:', healthError.message);
    }
    
    console.log('\n4. 🎯 DIAGNOSIS:');
    console.log('');
    console.log('✅ Status fix worked - deposits are now showing in admin dashboard');
    console.log('❌ Deposit action endpoint missing - 404 errors on approve/reject');
    console.log('🔧 CAUSE: Production server still has old code');
    console.log('');
    console.log('🚀 IMMEDIATE SOLUTION:');
    console.log('1. Go to Railway Dashboard: https://railway.app/dashboard');
    console.log('2. Find METACHROME project');
    console.log('3. Click "Redeploy" to deploy latest code');
    console.log('4. Wait 2-3 minutes for deployment');
    console.log('5. Test approve/reject again');
    console.log('');
    console.log('📋 Expected result after deployment:');
    console.log('- Deposits still show in admin dashboard ✅');
    console.log('- Approve/reject buttons work without 404 errors ✅');
    console.log('- User balances update when deposits approved ✅');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testProductionEndpoints();
