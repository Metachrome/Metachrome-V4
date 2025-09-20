#!/usr/bin/env node

/**
 * Test environment and redeem code logic
 */

async function testEnvironment() {
  console.log('🔍 TESTING ENVIRONMENT AND REDEEM LOGIC');
  console.log('=======================================');
  
  const baseUrl = 'https://metachrome-v2-production.up.railway.app';
  
  try {
    // Check health endpoint for environment info
    console.log('\n🔧 STEP 1: Environment Check');
    console.log('----------------------------');
    
    const healthResponse = await fetch(`${baseUrl}/api/health`);
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log(`   Environment: ${healthData.environment}`);
      console.log(`   Database: ${healthData.database}`);
      console.log(`   Production Mode: ${healthData.environment === 'production'}`);
      console.log(`   Supabase Available: ${healthData.database === 'supabase'}`);
    }
    
    // Check if redeem codes table exists
    console.log('\n🔧 STEP 2: Check Redeem Codes Table');
    console.log('-----------------------------------');
    
    const adminLoginResponse = await fetch(`${baseUrl}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'superadmin', password: 'superadmin123' })
    });
    
    if (adminLoginResponse.ok) {
      const adminLoginResult = await adminLoginResponse.json();
      const adminToken = adminLoginResult.token;
      
      const redeemCodesResponse = await fetch(`${baseUrl}/api/admin/redeem-codes`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      
      if (redeemCodesResponse.ok) {
        const redeemCodes = await redeemCodesResponse.json();
        console.log('✅ Redeem codes table exists');
        console.log(`   Total codes: ${redeemCodes.length}`);
        
        if (redeemCodes.length > 0) {
          console.log('   Available codes:');
          redeemCodes.forEach(code => {
            console.log(`   - ${code.code}: $${code.bonus_amount} (${code.is_active ? 'active' : 'inactive'})`);
          });
        }
      } else {
        const error = await redeemCodesResponse.json();
        console.log('❌ Redeem codes table issue:', error.error || error.message);
        
        if (error.setupRequired) {
          console.log('🔧 Database tables need to be created');
        }
      }
    }
    
    // Test redeem code with detailed logging
    console.log('\n🔧 STEP 3: Test Redeem Code with Logging');
    console.log('----------------------------------------');
    
    const loginResponse = await fetch(`${baseUrl}/api/auth/user/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'testuser2025', password: 'testpass123' })
    });
    
    if (loginResponse.ok) {
      const loginResult = await loginResponse.json();
      const userToken = loginResult.token;
      
      console.log(`   User: ${loginResult.user.username}`);
      console.log(`   Initial Balance: $${loginResult.user.balance}`);
      
      // Try redeeming a code that should work
      const redeemResponse = await fetch(`${baseUrl}/api/user/redeem-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({ code: 'BONUS500' })
      });
      
      console.log(`   Redeem Response Status: ${redeemResponse.status}`);
      
      if (redeemResponse.ok) {
        const redeemResult = await redeemResponse.json();
        console.log('✅ Redemption Response:');
        console.log(`   Success: ${redeemResult.success}`);
        console.log(`   Bonus Amount: $${redeemResult.bonusAmount}`);
        console.log(`   New Balance: $${redeemResult.newBalance || 'NOT PROVIDED'}`);
        console.log(`   Message: ${redeemResult.message}`);
        
        if (!redeemResult.newBalance) {
          console.log('❌ ISSUE: newBalance not provided in response');
          console.log('   This suggests the balance update failed');
        }
        
      } else {
        const error = await redeemResponse.json();
        console.log('❌ Redemption Failed:');
        console.log(`   Error: ${error.error}`);
        console.log(`   Details: ${error.details || 'None'}`);
        
        if (error.error && error.error.includes('already used')) {
          console.log('ℹ️ Code already used - trying a different code');
          
          // Try LETSGO1000
          const redeemResponse2 = await fetch(`${baseUrl}/api/user/redeem-code`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${userToken}`
            },
            body: JSON.stringify({ code: 'LETSGO1000' })
          });
          
          if (redeemResponse2.ok) {
            const redeemResult2 = await redeemResponse2.json();
            console.log('✅ Second Redemption Response:');
            console.log(`   Success: ${redeemResult2.success}`);
            console.log(`   Bonus Amount: $${redeemResult2.bonusAmount}`);
            console.log(`   New Balance: $${redeemResult2.newBalance || 'NOT PROVIDED'}`);
          } else {
            const error2 = await redeemResponse2.json();
            console.log('❌ Second redemption also failed:', error2.error);
          }
        }
      }
    }
    
    console.log('\n🎯 ANALYSIS');
    console.log('===========');
    console.log('Key indicators:');
    console.log('1. Environment should be "production"');
    console.log('2. Database should be "supabase"');
    console.log('3. Redeem codes table should exist with codes');
    console.log('4. Redemption should return newBalance field');
    console.log('5. If newBalance is missing, the Supabase update failed');
    
  } catch (error) {
    console.error('❌ Error during environment test:', error);
  }
}

// Main execution
if (require.main === module) {
  testEnvironment().catch(console.error);
}

module.exports = { testEnvironment };
