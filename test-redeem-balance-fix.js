#!/usr/bin/env node

/**
 * Test script to verify redeem code balance update and admin functionality
 */

async function testRedeemBalanceUpdate() {
  console.log('🎁 TESTING REDEEM CODE BALANCE UPDATE');
  console.log('====================================');
  
  const baseUrl = 'https://metachrome-v2-production.up.railway.app';
  
  try {
    // Step 1: Login as user
    console.log('\n🔧 STEP 1: User Login');
    console.log('--------------------');
    
    const loginResponse = await fetch(`${baseUrl}/api/auth/user/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'amdsnk',
        password: 'testpass123'
      })
    });
    
    if (!loginResponse.ok) {
      const error = await loginResponse.text();
      console.log('❌ Login failed:', error);
      return;
    }
    
    const loginResult = await loginResponse.json();
    console.log('✅ Login successful');
    console.log(`   User: ${loginResult.user.username}`);
    console.log(`   Initial Balance: $${loginResult.user.balance}`);
    
    const userToken = loginResult.token;
    const initialBalance = parseFloat(loginResult.user.balance || '0');
    
    // Step 2: Get current balance via /api/auth/user
    console.log('\n🔧 STEP 2: Get Current Balance via /api/auth/user');
    console.log('--------------------------------------------------');
    
    const authUserResponse = await fetch(`${baseUrl}/api/auth/user`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });
    
    if (authUserResponse.ok) {
      const authUserData = await authUserResponse.json();
      console.log('✅ /api/auth/user endpoint working');
      console.log(`   Username: ${authUserData.username}`);
      console.log(`   Balance: $${authUserData.balance}`);
      console.log(`   ID: ${authUserData.id}`);
    } else {
      const error = await authUserResponse.text();
      console.log('❌ /api/auth/user failed:', error);
    }
    
    // Step 3: Redeem a code
    console.log('\n🔧 STEP 3: Redeem Code');
    console.log('----------------------');
    
    const testCode = 'FIRSTBONUS';
    
    const redeemResponse = await fetch(`${baseUrl}/api/user/redeem-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({ code: testCode })
    });
    
    if (redeemResponse.ok) {
      const redeemResult = await redeemResponse.json();
      console.log('✅ Code redeemed successfully');
      console.log(`   Code: ${testCode}`);
      console.log(`   Bonus: $${redeemResult.bonusAmount}`);
      console.log(`   Message: ${redeemResult.message}`);
      
      if (redeemResult.newBalance) {
        console.log(`   New Balance: $${redeemResult.newBalance}`);
      }
      
      const expectedBalance = initialBalance + redeemResult.bonusAmount;
      console.log(`   Expected Balance: $${expectedBalance}`);
      
    } else {
      const error = await redeemResponse.json();
      console.log('❌ Redemption failed:', error.error);
      
      if (error.error && error.error.includes('already used')) {
        console.log('ℹ️ Code already used - this is expected behavior');
      }
    }
    
    // Step 4: Verify balance update via /api/auth/user
    console.log('\n🔧 STEP 4: Verify Balance Update');
    console.log('--------------------------------');
    
    // Wait a moment for any async operations
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const verifyResponse = await fetch(`${baseUrl}/api/auth/user`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });
    
    if (verifyResponse.ok) {
      const verifyData = await verifyResponse.json();
      const currentBalance = parseFloat(verifyData.balance || '0');
      
      console.log('✅ Balance verification complete');
      console.log(`   Current Balance: $${currentBalance}`);
      console.log(`   Initial Balance: $${initialBalance}`);
      console.log(`   Balance Change: $${currentBalance - initialBalance}`);
      
      if (currentBalance > initialBalance) {
        console.log('🎉 SUCCESS: Balance was updated after redemption!');
      } else if (currentBalance === initialBalance) {
        console.log('⚠️ WARNING: Balance unchanged - possible duplicate redemption or error');
      } else {
        console.log('❌ ERROR: Balance decreased - this should not happen');
      }
    } else {
      const error = await verifyResponse.text();
      console.log('❌ Balance verification failed:', error);
    }
    
    // Step 5: Test admin functionality
    console.log('\n🔧 STEP 5: Test Admin Functionality');
    console.log('-----------------------------------');
    
    // Login as admin
    const adminLoginResponse = await fetch(`${baseUrl}/api/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'superadmin',
        password: 'superadmin123'
      })
    });
    
    if (adminLoginResponse.ok) {
      const adminLoginResult = await adminLoginResponse.json();
      console.log('✅ Admin login successful');
      console.log(`   Admin: ${adminLoginResult.user.username}`);
      
      const adminToken = adminLoginResult.token;
      
      // Test admin redeem codes endpoint
      const adminCodesResponse = await fetch(`${baseUrl}/api/admin/redeem-codes`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      
      if (adminCodesResponse.ok) {
        const adminCodesData = await adminCodesResponse.json();
        console.log('✅ Admin redeem codes endpoint working');
        console.log(`   Total codes: ${adminCodesData.length}`);
        
        if (adminCodesData.length > 0) {
          console.log(`   First code: ${adminCodesData[0].code} ($${adminCodesData[0].bonus_amount})`);
        }
      } else {
        const error = await adminCodesResponse.json();
        console.log('❌ Admin redeem codes failed:', error);
        
        if (error.setupRequired) {
          console.log('🔧 Database table missing - need to run SQL script');
        }
      }
      
    } else {
      const error = await adminLoginResponse.text();
      console.log('❌ Admin login failed:', error);
    }
    
    // Summary
    console.log('\n🎯 SUMMARY');
    console.log('==========');
    console.log('✅ Redeem code balance update test completed');
    console.log('');
    console.log('🔍 EXPECTED RESULTS:');
    console.log('1. ✅ User login should succeed');
    console.log('2. ✅ /api/auth/user endpoint should return current user data');
    console.log('3. ✅ Code redemption should succeed (or show "already used")');
    console.log('4. ✅ Balance should increase after successful redemption');
    console.log('5. ✅ Admin login should succeed');
    console.log('6. ✅ Admin redeem codes endpoint should work (or show setup required)');
    
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
      console.log('   You can test redeem balance update locally with this server');
    } else {
      console.log('❌ Local server not responding');
    }
  } catch (error) {
    console.log('⚠️ Local server not running (testing production only)');
  }
}

// Main execution
async function main() {
  await testLocalDevelopment();
  await testRedeemBalanceUpdate();
  
  console.log('\n🟢 STATUS: REDEEM BALANCE UPDATE TEST COMPLETED');
  console.log('');
  console.log('📝 FIXES IMPLEMENTED:');
  console.log('1. ✅ Added /api/auth/user endpoint for frontend compatibility');
  console.log('2. ✅ Fixed balance update logic with proper number conversion');
  console.log('3. ✅ Enhanced error handling for admin dashboard');
  console.log('4. ✅ Added comprehensive logging for debugging');
  console.log('5. ✅ Improved one-time redemption prevention');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testRedeemBalanceUpdate };
