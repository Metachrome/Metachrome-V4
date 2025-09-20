#!/usr/bin/env node

/**
 * Test final redeem fix with existing user
 */

async function testFinalRedeemFix() {
  console.log('🔧 TESTING FINAL REDEEM FIX');
  console.log('===========================');
  
  const baseUrl = 'https://metachrome-v2-production.up.railway.app';
  
  try {
    // Step 1: Register a completely new user
    console.log('\n🔧 STEP 1: Register New User');
    console.log('----------------------------');
    
    const uniqueUsername = `testuser${Date.now()}`;
    const registerResponse = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: uniqueUsername,
        email: `${uniqueUsername}@example.com`,
        password: 'password123'
      })
    });
    
    if (!registerResponse.ok) {
      const registerError = await registerResponse.json();
      console.log('❌ Registration failed:', registerError.message || registerError.error);
      return;
    }
    
    const registerResult = await registerResponse.json();
    console.log('✅ Registration successful:');
    console.log(`   User ID: ${registerResult.user.id}`);
    console.log(`   Username: ${registerResult.user.username}`);
    console.log(`   Initial Balance: $${registerResult.user.balance}`);
    
    const userToken = registerResult.token;
    const initialBalance = parseFloat(registerResult.user.balance || '0');
    
    // Step 2: Test redeem code immediately
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
      console.log('✅ Redeem successful:');
      console.log(`   Message: ${redeemResult.message}`);
      console.log(`   Bonus Amount: $${redeemResult.bonusAmount}`);
      console.log(`   Expected New Balance: $${initialBalance + redeemResult.bonusAmount}`);
    } else {
      const redeemError = await redeemResponse.json();
      console.log('❌ Redeem failed:', redeemError.error);
    }
    
    // Step 3: Check balance after redeem
    console.log('\n🔧 STEP 3: Check Balance After Redeem');
    console.log('------------------------------------');
    
    const userDataResponse = await fetch(`${baseUrl}/api/auth/user`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    
    if (userDataResponse.ok) {
      const userData = await userDataResponse.json();
      console.log('✅ User data retrieved:');
      console.log(`   Current Balance: $${userData.balance}`);
      console.log(`   Balance Updated: ${parseFloat(userData.balance) > initialBalance ? '✅ YES' : '❌ NO'}`);
      console.log(`   Balance Change: $${parseFloat(userData.balance) - initialBalance}`);
    } else {
      console.log('❌ Failed to get user data after redeem');
    }
    
    // Step 4: Test duplicate redeem
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
      console.log('❌ DUPLICATE REDEMPTION ALLOWED (BUG!):');
      console.log(`   Message: ${duplicateResult.message}`);
      console.log(`   Bonus Amount: $${duplicateResult.bonusAmount}`);
    } else {
      const duplicateError = await duplicateResponse.json();
      console.log('✅ Duplicate redemption prevented:');
      console.log(`   Error: ${duplicateError.error}`);
    }
    
    // Step 5: Test different code
    console.log('\n🔧 STEP 5: Test Different Code');
    console.log('------------------------------');
    
    const differentCodeResponse = await fetch(`${baseUrl}/api/user/redeem-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({ code: 'WELCOME50' })
    });
    
    if (differentCodeResponse.ok) {
      const differentCodeResult = await differentCodeResponse.json();
      console.log('✅ Different code redemption successful:');
      console.log(`   Message: ${differentCodeResult.message}`);
      console.log(`   Bonus Amount: $${differentCodeResult.bonusAmount}`);
    } else {
      const differentCodeError = await differentCodeResponse.json();
      console.log('❌ Different code redemption failed:', differentCodeError.error);
    }
    
    // Step 6: Final balance check
    console.log('\n🔧 STEP 6: Final Balance Check');
    console.log('------------------------------');
    
    const finalResponse = await fetch(`${baseUrl}/api/auth/user`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    
    if (finalResponse.ok) {
      const finalData = await finalResponse.json();
      console.log('✅ Final balance check:');
      console.log(`   Final Balance: $${finalData.balance}`);
      console.log(`   Initial Balance: $${initialBalance}`);
      console.log(`   Total Change: $${parseFloat(finalData.balance) - initialBalance}`);
    } else {
      console.log('❌ Failed to get final balance');
    }
    
    console.log('\n🎯 SUMMARY');
    console.log('==========');
    console.log('');
    console.log('✅ TESTING COMPLETE');
    console.log('');
    console.log('🔍 RESULTS:');
    console.log('1. User registration: ✅ Working');
    console.log('2. Redeem code functionality: ❓ Testing');
    console.log('3. Balance updates: ❓ Testing');
    console.log('4. Duplicate prevention: ❓ Testing');
    console.log('5. Multiple code redemption: ❓ Testing');
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
  }
}

// Main execution
if (require.main === module) {
  testFinalRedeemFix().catch(console.error);
}

module.exports = { testFinalRedeemFix };
