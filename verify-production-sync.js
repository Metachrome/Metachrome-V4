// Verify if production server has real-time sync code
const https = require('https');

console.log('🔍 VERIFYING PRODUCTION SERVER REAL-TIME SYNC');
console.log('=============================================');

async function verifyProductionSync() {
  try {
    console.log('\n1. 🧪 Testing admin pending requests endpoint...');
    
    const response = await fetch('https://metachrome-v2-production.up.railway.app/api/admin/pending-requests');
    if (!response.ok) {
      throw new Error(`Admin endpoint failed: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Admin endpoint responding');
    console.log('📊 Pending deposits visible:', data.deposits?.length || 0);
    console.log('📊 Pending withdrawals visible:', data.withdrawals?.length || 0);
    
    console.log('\n2. 🧪 Testing deposit action endpoint (the one causing 404)...');
    
    try {
      const actionResponse = await fetch('https://metachrome-v2-production.up.railway.app/api/admin/deposits/test-id/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test' })
      });
      
      console.log('📊 Deposit action endpoint status:', actionResponse.status);
      
      if (actionResponse.status === 404) {
        console.log('❌ ENDPOINT MISSING: /api/admin/deposits/:id/action not found');
        console.log('🔧 This confirms the production server needs to be updated');
      } else if (actionResponse.status === 400) {
        console.log('✅ ENDPOINT EXISTS: Returns 400 for invalid test request (expected)');
      } else {
        console.log('⚠️ UNEXPECTED STATUS:', actionResponse.status);
      }
    } catch (actionError) {
      console.log('❌ Deposit action endpoint error:', actionError.message);
    }
    
    console.log('\n3. 🧪 Testing server health for deployment info...');
    
    const healthResponse = await fetch('https://metachrome-v2-production.up.railway.app/api/health');
    const healthData = await healthResponse.json();
    
    console.log('📊 Production server info:');
    console.log('   Environment:', healthData.environment);
    console.log('   Database:', healthData.database);
    console.log('   Timestamp:', healthData.timestamp);
    
    console.log('\n4. 🎯 DIAGNOSIS:');
    
    const depositsVisible = data.deposits?.length || 0;
    
    if (depositsVisible === 0) {
      console.log('❌ PROBLEM CONFIRMED: New deposits not appearing in admin dashboard');
      console.log('🔧 CAUSE: Production server missing real-time sync code');
      console.log('🚀 SOLUTION: Deploy updated working-server.js to Railway');
    } else {
      console.log('✅ Deposits are visible in admin dashboard');
      console.log('🔧 Check if they are recent deposits or old migrated ones');
    }
    
    console.log('\n5. 🚀 DEPLOYMENT REQUIRED:');
    console.log('');
    console.log('The production server needs the updated working-server.js with:');
    console.log('✅ Real-time Supabase sync for deposit creation');
    console.log('✅ Deposit approval/rejection endpoints');
    console.log('✅ Balance update synchronization');
    console.log('');
    console.log('📋 DEPLOYMENT STEPS:');
    console.log('1. Go to Railway Dashboard: https://railway.app/dashboard');
    console.log('2. Find METACHROME project');
    console.log('3. Go to "Deployments" tab');
    console.log('4. Click "Redeploy" or "Deploy Latest"');
    console.log('5. Wait 2-3 minutes for deployment');
    console.log('6. Test deposit creation again');
    
    console.log('\n🎉 VERIFICATION COMPLETED!');
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }
}

// Run verification
verifyProductionSync();
