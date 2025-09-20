#!/usr/bin/env node

/**
 * Test Supabase balance update directly
 */

async function testSupabaseBalanceUpdate() {
  console.log('🔧 TESTING SUPABASE BALANCE UPDATE');
  console.log('==================================');
  
  const baseUrl = 'https://metachrome-v2-production.up.railway.app';
  
  try {
    // Step 1: Register a new user
    console.log('\n🔧 STEP 1: Register New User');
    console.log('----------------------------');
    
    const uniqueUsername = `balancetest${Date.now()}`;
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
    const userId = registerResult.user.id;
    
    // Step 2: Check user data before redeem (direct API call)
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
    
    // Step 3: Test manual balance update (simulate what redeem should do)
    console.log('\n🔧 STEP 3: Test Manual Balance Update');
    console.log('------------------------------------');
    
    // This simulates what the redeem code should do
    const manualUpdateResponse = await fetch(`${baseUrl}/api/admin/users/${userId}/balance`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}` // This might not work for admin endpoint
      },
      body: JSON.stringify({
        newBalance: 100,
        reason: 'Test balance update'
      })
    });
    
    if (manualUpdateResponse.ok) {
      const updateResult = await manualUpdateResponse.json();
      console.log('✅ Manual balance update successful:', updateResult);
    } else {
      console.log('❌ Manual balance update failed (expected - admin endpoint)');
    }
    
    // Step 4: Try redeem code
    console.log('\n🔧 STEP 4: Try Redeem Code');
    console.log('--------------------------');
    
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
    } else {
      const redeemError = await redeemResponse.json();
      console.log('❌ Redeem failed:', redeemError.error);
    }
    
    // Step 5: Check user data after redeem (immediate)
    console.log('\n🔧 STEP 5: Check User Data After Redeem (Immediate)');
    console.log('---------------------------------------------------');
    
    const afterResponse = await fetch(`${baseUrl}/api/auth/user`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    
    if (afterResponse.ok) {
      const afterData = await afterResponse.json();
      console.log('✅ User data after redeem (immediate):');
      console.log(`   Balance: $${afterData.balance}`);
      console.log(`   User ID: ${afterData.id}`);
    } else {
      console.log('❌ Failed to get user data after redeem');
    }
    
    // Step 6: Wait and check again
    console.log('\n🔧 STEP 6: Wait 3 seconds and check again');
    console.log('-----------------------------------------');
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
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
    
    console.log('\n🎯 ANALYSIS');
    console.log('===========');
    console.log('');
    console.log('🔍 KEY QUESTIONS:');
    console.log('1. ❓ Is the redeem code API actually updating the balance in Supabase?');
    console.log('2. ❓ Is the /api/auth/user endpoint reading from the correct source?');
    console.log('3. ❓ Is there a caching issue preventing immediate updates?');
    console.log('4. ❓ Are there database permission issues?');
    console.log('');
    console.log('💡 NEXT STEPS:');
    console.log('• Check server logs for Supabase update errors');
    console.log('• Verify database permissions');
    console.log('• Test direct database queries');
    console.log('• Check if balance column exists and is writable');
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
  }
}

// Main execution
if (require.main === module) {
  testSupabaseBalanceUpdate().catch(console.error);
}

module.exports = { testSupabaseBalanceUpdate };
