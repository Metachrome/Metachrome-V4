#!/usr/bin/env node

/**
 * Simple test for redeem code functionality
 */

async function testUserRedeem() {
  console.log('🔧 TESTING USER REDEEM FUNCTIONALITY');
  console.log('====================================');
  
  const baseUrl = 'https://metachrome-v2-production.up.railway.app';
  
  try {
    // Step 1: Try to register a test user first
    console.log('\n🔧 STEP 1: Register Test User');
    console.log('-----------------------------');
    
    const registerResponse = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'testuser123',
        email: 'testuser123@example.com',
        password: 'password123'
      })
    });
    
    let userToken = null;
    let username = null;
    
    if (registerResponse.ok) {
      const registerResult = await registerResponse.json();
      console.log('✅ User registration successful');
      console.log(`   User: ${registerResult.user.username}`);
      console.log(`   Initial Balance: $${registerResult.user.balance}`);
      userToken = registerResult.token;
      username = registerResult.user.username;
    } else {
      console.log('❌ Registration failed, trying login...');
      
      // Try login instead
      const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'testuser123',
          password: 'password123'
        })
      });
      
      if (loginResponse.ok) {
        const loginResult = await loginResponse.json();
        console.log('✅ User login successful');
        console.log(`   User: ${loginResult.user.username}`);
        console.log(`   Initial Balance: $${loginResult.user.balance}`);
        userToken = loginResult.token;
        username = loginResult.user.username;
      } else {
        console.log('❌ Both registration and login failed');
        return;
      }
    }
    
    // Step 2: Test Redeem Code
    console.log('\n🔧 STEP 2: Test Redeem Code');
    console.log('---------------------------');
    
    const redeemResponse = await fetch(`${baseUrl}/api/user/redeem-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({ code: 'FIRSTBONUS' })
    });
    
    if (redeemResponse.ok) {
      const redeemResult = await redeemResponse.json();
      console.log('✅ Redeem code successful');
      console.log(`   Message: ${redeemResult.message}`);
      console.log(`   Bonus Amount: $${redeemResult.bonusAmount}`);
      console.log(`   Trades Required: ${redeemResult.tradesRequired}`);
    } else {
      const redeemError = await redeemResponse.json();
      console.log('❌ Redeem code failed:', redeemError.error);
    }
    
    // Step 3: Check Balance After Redeem
    console.log('\n🔧 STEP 3: Check Balance After Redeem');
    console.log('------------------------------------');
    
    const userDataResponse = await fetch(`${baseUrl}/api/auth/user`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    
    if (userDataResponse.ok) {
      const userData = await userDataResponse.json();
      console.log('✅ User data retrieved');
      console.log('   Full user data:', JSON.stringify(userData, null, 2));
      console.log(`   Current Balance: $${userData.user?.balance || userData.balance || 'UNKNOWN'}`);
      console.log(`   Username: ${userData.user?.username || userData.username || 'UNKNOWN'}`);
    } else {
      console.log('❌ Failed to get user data');
    }
    
    // Step 4: Test Duplicate Redeem
    console.log('\n🔧 STEP 4: Test Duplicate Redeem');
    console.log('--------------------------------');
    
    const duplicateResponse = await fetch(`${baseUrl}/api/user/redeem-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({ code: 'FIRSTBONUS' })
    });
    
    if (duplicateResponse.ok) {
      const duplicateResult = await duplicateResponse.json();
      console.log('❌ DUPLICATE REDEMPTION ALLOWED (BUG!)');
      console.log(`   Message: ${duplicateResult.message}`);
      console.log(`   Bonus Amount: $${duplicateResult.bonusAmount}`);
    } else {
      const duplicateError = await duplicateResponse.json();
      console.log('✅ Duplicate redemption prevented');
      console.log(`   Error: ${duplicateError.error}`);
    }
    
    // Step 5: Final Balance Check
    console.log('\n🔧 STEP 5: Final Balance Check');
    console.log('------------------------------');
    
    const finalResponse = await fetch(`${baseUrl}/api/auth/user`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    
    if (finalResponse.ok) {
      const finalData = await finalResponse.json();
      console.log('✅ Final balance check');
      console.log(`   Final Balance: $${finalData.user?.balance || finalData.balance || 'UNKNOWN'}`);
    } else {
      console.log('❌ Failed to get final balance');
    }
    
    console.log('\n🎯 SUMMARY');
    console.log('==========');
    console.log('This test checks:');
    console.log('1. ✅ User can redeem codes');
    console.log('2. ❓ Balance updates correctly');
    console.log('3. ❓ Duplicate redemption is prevented');
    console.log('4. ❓ Frontend shows updated balance');
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
  }
}

// Main execution
if (require.main === module) {
  testUserRedeem().catch(console.error);
}

module.exports = { testUserRedeem };
