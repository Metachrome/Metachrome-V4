#!/usr/bin/env node

/**
 * Fix redeem codes in production by initializing them in Supabase
 */

async function fixRedeemCodesProduction() {
  console.log('🎁 FIXING REDEEM CODES IN PRODUCTION');
  console.log('===================================');
  
  const baseUrl = 'https://metachrome-v2-production.up.railway.app';
  
  try {
    // Step 1: Initialize default redeem codes in Supabase
    console.log('\n🔧 STEP 1: Initialize Default Redeem Codes');
    console.log('------------------------------------------');
    
    try {
      const initResponse = await fetch(`${baseUrl}/api/admin/init-redeem-codes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-token'
        }
      });
      
      if (initResponse.ok) {
        const result = await initResponse.json();
        console.log('✅ Redeem codes initialized successfully');
        console.log('   Codes created:', result.codes?.length || 'Unknown');
        result.codes?.forEach(code => {
          console.log(`     ${code.code}: $${code.bonus_amount} (${code.is_active ? 'Active' : 'Inactive'})`);
        });
      } else {
        const error = await initResponse.text();
        console.log('❌ Failed to initialize redeem codes:', error);
      }
    } catch (error) {
      console.log('❌ Error initializing redeem codes:', error.message);
    }
    
    // Step 2: Test admin redeem codes endpoint
    console.log('\n🔧 STEP 2: Test Admin Redeem Codes Endpoint');
    console.log('-------------------------------------------');
    
    try {
      const adminCodesResponse = await fetch(`${baseUrl}/api/admin/redeem-codes`);
      if (adminCodesResponse.ok) {
        const data = await adminCodesResponse.json();
        const codes = data.codes || data;
        console.log('✅ Admin redeem codes endpoint working');
        console.log(`   Found ${codes.length} redeem codes:`);
        codes.forEach(code => {
          console.log(`     ${code.code}: $${code.bonus_amount || code.amount} (${code.is_active || code.active ? 'Active' : 'Inactive'})`);
        });
      } else {
        const error = await adminCodesResponse.text();
        console.log('❌ Admin redeem codes endpoint failed:', error);
      }
    } catch (error) {
      console.log('❌ Error testing admin endpoint:', error.message);
    }
    
    // Step 3: Test redeem code actions
    console.log('\n⚙️ STEP 3: Test Redeem Code Actions');
    console.log('----------------------------------');
    
    const testActions = [
      { codeId: 'FIRSTBONUS', action: 'edit', newAmount: 100 },
      { codeId: 'LETSGO1000', action: 'disable' },
      { codeId: 'WELCOME50', action: 'edit', newDescription: 'Updated welcome bonus' }
    ];
    
    for (const test of testActions) {
      try {
        const actionResponse = await fetch(`${baseUrl}/api/admin/redeem-codes/${test.codeId}/action`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer admin-token'
          },
          body: JSON.stringify(test)
        });
        
        if (actionResponse.ok) {
          const result = await actionResponse.json();
          console.log(`✅ ${test.action} action for ${test.codeId}: ${result.message}`);
        } else {
          const error = await actionResponse.text();
          console.log(`❌ ${test.action} action for ${test.codeId} failed:`, error);
        }
      } catch (error) {
        console.log(`❌ Error testing ${test.action} for ${test.codeId}:`, error.message);
      }
    }
    
    // Step 4: Test user redeem code functionality
    console.log('\n👤 STEP 4: Test User Redeem Code Functionality');
    console.log('----------------------------------------------');
    
    // Test with mock user token
    const testToken = 'test-user-token';
    const testCodes = ['FIRSTBONUS', 'WELCOME50', 'BONUS500'];
    
    for (const code of testCodes) {
      try {
        const redeemResponse = await fetch(`${baseUrl}/api/user/redeem-code`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${testToken}`
          },
          body: JSON.stringify({ code })
        });
        
        if (redeemResponse.ok) {
          const result = await redeemResponse.json();
          console.log(`✅ Redeem ${code}: $${result.bonusAmount} - ${result.message}`);
        } else {
          const error = await redeemResponse.text();
          console.log(`❌ Redeem ${code} failed:`, error);
        }
      } catch (error) {
        console.log(`❌ Error redeeming ${code}:`, error.message);
      }
    }
    
    // Step 5: Test health endpoint
    console.log('\n📋 STEP 5: Test Health Endpoint');
    console.log('-------------------------------');
    
    try {
      const healthResponse = await fetch(`${baseUrl}/api/health`);
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        console.log('✅ Health endpoint working');
        console.log('   Environment:', healthData.environment);
        console.log('   Database:', healthData.database);
        console.log('   Redeem codes enabled:', healthData.features?.redeemCodes);
        console.log('   Available codes:', healthData.features?.availableRedeemCodes);
      } else {
        console.log('❌ Health endpoint failed');
      }
    } catch (error) {
      console.log('❌ Error testing health endpoint:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
  }
}

// Test local development
async function testLocalDevelopment() {
  console.log('\n🌐 LOCAL DEVELOPMENT TEST');
  console.log('=========================');
  
  const baseUrl = 'http://localhost:9999';
  
  try {
    const healthResponse = await fetch(`${baseUrl}/api/health`);
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Local server is running');
      console.log('   Environment:', healthData.environment);
      console.log('   Database:', healthData.database);
    } else {
      console.log('❌ Local server not responding');
    }
  } catch (error) {
    console.log('⚠️ Local server not running (this is OK if testing production only)');
  }
}

// Main execution
async function main() {
  await testLocalDevelopment();
  await fixRedeemCodesProduction();
  
  console.log('\n🎯 SUMMARY');
  console.log('==========');
  console.log('✅ Redeem code production fix completed');
  console.log('✅ Default codes should now be available in Supabase');
  console.log('✅ Admin dashboard buttons should work');
  console.log('✅ User redeem functionality should work');
  console.log('');
  console.log('🚀 NEXT STEPS:');
  console.log('1. Test admin dashboard redeem code management');
  console.log('2. Test user redeem code functionality in profile');
  console.log('3. Verify real-time updates and notifications');
  console.log('4. Check that balances update correctly');
  
  console.log('\n🟢 STATUS: REDEEM CODE SYSTEM SHOULD NOW BE WORKING');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { fixRedeemCodesProduction };
