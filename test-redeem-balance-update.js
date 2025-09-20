#!/usr/bin/env node

/**
 * Test redeem code balance update and duplicate prevention
 */

async function testRedeemCodeIssues() {
  console.log('🔧 TESTING REDEEM CODE ISSUES');
  console.log('=============================');
  
  const baseUrl = 'https://metachrome-v2-production.up.railway.app';
  
  try {
    // Step 1: User Login
    console.log('\n🔧 STEP 1: User Login');
    console.log('---------------------');
    
    const userLoginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'amdsnk',
        password: 'password123'
      })
    });
    
    if (!userLoginResponse.ok) {
      console.log('❌ User login failed');
      return;
    }
    
    const userLoginResult = await userLoginResponse.json();
    console.log('✅ User login successful');
    console.log(`   User: ${userLoginResult.user.username}`);
    console.log(`   Initial Balance: $${userLoginResult.user.balance}`);
    
    const userToken = userLoginResult.token;
    const initialBalance = parseFloat(userLoginResult.user.balance || '0');
    
    // Step 2: Test Redeem Code (First Time)
    console.log('\n🔧 STEP 2: Test Redeem Code (First Time)');
    console.log('----------------------------------------');
    
    const firstRedeemResponse = await fetch(`${baseUrl}/api/user/redeem-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({ code: 'FIRSTBONUS' })
    });
    
    if (firstRedeemResponse.ok) {
      const firstRedeemResult = await firstRedeemResponse.json();
      console.log('✅ First redemption successful');
      console.log(`   Message: ${firstRedeemResult.message}`);
      console.log(`   Bonus Amount: $${firstRedeemResult.bonusAmount}`);
      console.log(`   Expected New Balance: $${initialBalance + firstRedeemResult.bonusAmount}`);
    } else {
      const firstRedeemError = await firstRedeemResponse.json();
      console.log('❌ First redemption failed:', firstRedeemError.error);
    }
    
    // Step 3: Check Updated Balance
    console.log('\n🔧 STEP 3: Check Updated Balance');
    console.log('--------------------------------');
    
    const userDataResponse = await fetch(`${baseUrl}/api/auth/user`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    
    if (userDataResponse.ok) {
      const userData = await userDataResponse.json();
      console.log('✅ User data retrieved');
      console.log(`   Current Balance: $${userData.user.balance}`);
      console.log(`   Balance Updated: ${parseFloat(userData.user.balance) > initialBalance ? '✅ YES' : '❌ NO'}`);
    } else {
      console.log('❌ Failed to get user data');
    }
    
    // Step 4: Test Duplicate Redemption
    console.log('\n🔧 STEP 4: Test Duplicate Redemption');
    console.log('------------------------------------');
    
    const duplicateRedeemResponse = await fetch(`${baseUrl}/api/user/redeem-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({ code: 'FIRSTBONUS' })
    });
    
    if (duplicateRedeemResponse.ok) {
      const duplicateResult = await duplicateRedeemResponse.json();
      console.log('❌ Duplicate redemption allowed (THIS IS A BUG!)');
      console.log(`   Message: ${duplicateResult.message}`);
      console.log(`   Bonus Amount: $${duplicateResult.bonusAmount}`);
    } else {
      const duplicateError = await duplicateRedeemResponse.json();
      console.log('✅ Duplicate redemption prevented');
      console.log(`   Error: ${duplicateError.error}`);
    }
    
    // Step 5: Test Different Code
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
      console.log('✅ Different code redemption successful');
      console.log(`   Message: ${differentCodeResult.message}`);
      console.log(`   Bonus Amount: $${differentCodeResult.bonusAmount}`);
    } else {
      const differentCodeError = await differentCodeResponse.json();
      console.log('❌ Different code redemption failed:', differentCodeError.error);
    }
    
    // Step 6: Final Balance Check
    console.log('\n🔧 STEP 6: Final Balance Check');
    console.log('------------------------------');
    
    const finalUserDataResponse = await fetch(`${baseUrl}/api/auth/user`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    
    if (finalUserDataResponse.ok) {
      const finalUserData = await finalUserDataResponse.json();
      console.log('✅ Final user data retrieved');
      console.log(`   Final Balance: $${finalUserData.user.balance}`);
      console.log(`   Initial Balance: $${initialBalance}`);
      console.log(`   Balance Change: $${parseFloat(finalUserData.user.balance) - initialBalance}`);
    } else {
      console.log('❌ Failed to get final user data');
    }
    
    console.log('\n🎯 ISSUE ANALYSIS');
    console.log('==================');
    console.log('');
    console.log('🔍 ISSUES TO CHECK:');
    console.log('1. ❓ Balance Update: Does the balance actually increase after redemption?');
    console.log('2. ❓ Duplicate Prevention: Can the same user redeem the same code multiple times?');
    console.log('3. ❓ Frontend Refresh: Does the frontend show the updated balance?');
    console.log('');
    console.log('🔧 POTENTIAL CAUSES:');
    console.log('• Database tables missing (redeem_codes, user_redeem_history)');
    console.log('• Balance update logic not working properly');
    console.log('• Duplicate check logic not working');
    console.log('• Frontend not refreshing user data correctly');
    console.log('');
    console.log('💡 SOLUTIONS:');
    console.log('1. Create database tables using SUPABASE_SETUP.sql');
    console.log('2. Fix balance update logic in server');
    console.log('3. Fix duplicate prevention logic');
    console.log('4. Ensure frontend refreshes properly');
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
  }
}

// Main execution
if (require.main === module) {
  testRedeemCodeIssues().catch(console.error);
}

module.exports = { testRedeemCodeIssues };
