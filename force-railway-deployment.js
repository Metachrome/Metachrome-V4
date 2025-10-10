const axios = require('axios');

async function forceRailwayDeployment() {
  console.log('🚀 FORCING RAILWAY DEPLOYMENT CHECK');
  console.log('===================================');
  
  try {
    // Check current production status
    console.log('\n1️⃣ Checking production server status...');
    const statusResponse = await axios.get('https://metachrome-v2-production.up.railway.app/api/test/server-status', {
      timeout: 10000
    });
    
    console.log('✅ Production server is running');
    console.log('Server info:', statusResponse.data);
    
    // Check if withdrawal endpoint has the fix
    console.log('\n2️⃣ Testing withdrawal endpoint for database sync...');
    
    // Try to create a test withdrawal to see if it syncs to database
    const testWithdrawal = {
      amount: '1',
      currency: 'USDT',
      address: 'test-deployment-check-' + Date.now(),
      password: 'testpass123'
    };
    
    try {
      const withdrawalResponse = await axios.post('https://metachrome-v2-production.up.railway.app/api/withdrawals', testWithdrawal, {
        headers: {
          'Authorization': 'Bearer test-token',
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      console.log('✅ Withdrawal endpoint responded:', withdrawalResponse.data);
      
      // Wait a moment for database sync
      console.log('\n3️⃣ Waiting for database sync...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Check admin withdrawals
      console.log('\n4️⃣ Checking admin withdrawals...');
      const adminResponse = await axios.get('https://metachrome-v2-production.up.railway.app/api/admin/withdrawals', {
        timeout: 10000
      });
      
      const withdrawals = adminResponse.data.withdrawals || [];
      console.log(`📋 Admin withdrawals count: ${withdrawals.length}`);
      
      if (withdrawals.length > 0) {
        console.log('✅ SUCCESS: Database sync is working!');
        console.log('Recent withdrawals:');
        withdrawals.slice(0, 3).forEach((w, i) => {
          console.log(`  ${i + 1}. ${w.amount} ${w.currency} - ${w.status} (${w.created_at?.substring(0, 19)})`);
        });
      } else {
        console.log('❌ PROBLEM: Database sync is NOT working');
        console.log('This means Railway has not deployed the latest code');
      }
      
    } catch (withdrawalError) {
      console.log('❌ Withdrawal test failed:', withdrawalError.message);
      if (withdrawalError.response) {
        console.log('Response:', withdrawalError.response.data);
      }
    }
    
  } catch (error) {
    console.error('❌ Production server check failed:', error.message);
  }
  
  console.log('\n🎯 NEXT STEPS:');
  console.log('==============');
  console.log('1. Go to Railway Dashboard: https://railway.app/dashboard');
  console.log('2. Find your METACHROME project');
  console.log('3. Click "Deploy" or "Redeploy"');
  console.log('4. Wait 2-3 minutes for deployment');
  console.log('5. Test again with a real withdrawal');
}

forceRailwayDeployment().catch(console.error);
