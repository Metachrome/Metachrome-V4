#!/usr/bin/env node

/**
 * Debug balance update issue
 */

async function debugBalanceIssue() {
  console.log('🔧 DEBUGGING BALANCE UPDATE ISSUE');
  console.log('=================================');
  
  const baseUrl = 'https://metachrome-v2-production.up.railway.app';
  
  try {
    // Step 1: Login
    console.log('\n🔧 STEP 1: Login');
    console.log('----------------');
    
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'testuser123',
        password: 'password123'
      })
    });
    
    if (!loginResponse.ok) {
      console.log('❌ Login failed');
      return;
    }
    
    const loginResult = await loginResponse.json();
    console.log('✅ Login successful');
    console.log(`   User ID: ${loginResult.user.id}`);
    console.log(`   Username: ${loginResult.user.username}`);
    console.log(`   Initial Balance: $${loginResult.user.balance}`);
    
    const userToken = loginResult.token;
    const userId = loginResult.user.id;
    
    // Step 2: Check user data before redeem
    console.log('\n🔧 STEP 2: Check User Data Before Redeem');
    console.log('----------------------------------------');
    
    const beforeResponse = await fetch(`${baseUrl}/api/auth/user`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    
    if (beforeResponse.ok) {
      const beforeData = await beforeResponse.json();
      console.log('✅ User data before redeem:');
      console.log(`   Balance: $${beforeData.balance}`);
      console.log(`   User ID: ${beforeData.id}`);
    } else {
      console.log('❌ Failed to get user data before redeem');
    }
    
    // Step 3: Redeem code with detailed logging
    console.log('\n🔧 STEP 3: Redeem Code');
    console.log('----------------------');
    
    const redeemResponse = await fetch(`${baseUrl}/api/user/redeem-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({ code: 'WELCOME50' })
    });
    
    if (redeemResponse.ok) {
      const redeemResult = await redeemResponse.json();
      console.log('✅ Redeem successful:');
      console.log(`   Message: ${redeemResult.message}`);
      console.log(`   Bonus Amount: $${redeemResult.bonusAmount}`);
      console.log(`   New Balance (from response): $${redeemResult.newBalance || 'NOT PROVIDED'}`);
    } else {
      const redeemError = await redeemResponse.json();
      console.log('❌ Redeem failed:', redeemError.error);
      return;
    }
    
    // Step 4: Check user data after redeem (immediate)
    console.log('\n🔧 STEP 4: Check User Data After Redeem (Immediate)');
    console.log('---------------------------------------------------');
    
    const afterResponse = await fetch(`${baseUrl}/api/auth/user`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    
    if (afterResponse.ok) {
      const afterData = await afterResponse.json();
      console.log('✅ User data after redeem (immediate):');
      console.log(`   Balance: $${afterData.balance}`);
      console.log(`   User ID: ${afterData.id}`);
      console.log(`   Full data:`, JSON.stringify(afterData, null, 2));
    } else {
      console.log('❌ Failed to get user data after redeem');
    }
    
    // Step 5: Wait and check again
    console.log('\n🔧 STEP 5: Wait 2 seconds and check again');
    console.log('-----------------------------------------');
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const delayedResponse = await fetch(`${baseUrl}/api/auth/user`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    
    if (delayedResponse.ok) {
      const delayedData = await delayedResponse.json();
      console.log('✅ User data after delay:');
      console.log(`   Balance: $${delayedData.balance}`);
      console.log(`   User ID: ${delayedData.id}`);
    } else {
      console.log('❌ Failed to get delayed user data');
    }
    
    // Step 6: Test duplicate redeem
    console.log('\n🔧 STEP 6: Test Duplicate Redeem');
    console.log('--------------------------------');
    
    const duplicateResponse = await fetch(`${baseUrl}/api/user/redeem-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({ code: 'WELCOME50' })
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
    
    console.log('\n🎯 ANALYSIS');
    console.log('===========');
    console.log('');
    console.log('🔍 ISSUES IDENTIFIED:');
    console.log('1. Balance update: Check if balance actually changes');
    console.log('2. Duplicate prevention: Check if same code can be used multiple times');
    console.log('3. Data persistence: Check if changes persist across API calls');
    console.log('');
    console.log('💡 POTENTIAL CAUSES:');
    console.log('• Balance update logic not working properly');
    console.log('• User data not being refreshed from correct source');
    console.log('• Duplicate check logic not working');
    console.log('• File storage vs Supabase synchronization issues');
    
  } catch (error) {
    console.error('❌ Error during debugging:', error);
  }
}

// Main execution
if (require.main === module) {
  debugBalanceIssue().catch(console.error);
}

module.exports = { debugBalanceIssue };
