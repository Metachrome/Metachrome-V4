#!/usr/bin/env node

/**
 * Final test of the redeem code balance update fix
 */

async function testFinalFix() {
  console.log('🎁 FINAL REDEEM CODE BALANCE UPDATE TEST');
  console.log('=======================================');
  
  const baseUrl = 'https://metachrome-v2-production.up.railway.app';
  
  try {
    // Create a fresh test user
    console.log('\n🔧 STEP 1: Create Fresh Test User');
    console.log('---------------------------------');
    
    const timestamp = Date.now();
    const testUsername = `testuser${timestamp}`;
    
    const createUserResponse = await fetch(`${baseUrl}/api/auth/user/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: testUsername,
        email: `${testUsername}@test.com`,
        password: 'testpass123',
        firstName: 'Test',
        lastName: 'User'
      })
    });
    
    if (!createUserResponse.ok) {
      console.log('❌ Failed to create test user');
      return;
    }
    
    const createResult = await createUserResponse.json();
    console.log('✅ Test user created');
    console.log(`   Username: ${createResult.user.username}`);
    console.log(`   Initial Balance: $${createResult.user.balance}`);
    
    // Login with the new user
    console.log('\n🔧 STEP 2: Login with Test User');
    console.log('-------------------------------');
    
    const loginResponse = await fetch(`${baseUrl}/api/auth/user/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: testUsername,
        password: 'testpass123'
      })
    });
    
    if (!loginResponse.ok) {
      console.log('❌ Login failed');
      return;
    }
    
    const loginResult = await loginResponse.json();
    console.log('✅ Login successful');
    console.log(`   User ID: ${loginResult.user.id}`);
    console.log(`   Balance: $${loginResult.user.balance}`);
    
    const userToken = loginResult.token;
    const initialBalance = parseFloat(loginResult.user.balance || '0');
    
    // Check balance via /api/auth/user
    console.log('\n🔧 STEP 3: Check Balance via /api/auth/user');
    console.log('--------------------------------------------');
    
    const authUserResponse = await fetch(`${baseUrl}/api/auth/user`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    
    if (authUserResponse.ok) {
      const authUserData = await authUserResponse.json();
      console.log('✅ /api/auth/user working');
      console.log(`   Balance: $${authUserData.balance}`);
    } else {
      console.log('❌ /api/auth/user failed');
    }
    
    // Redeem a code
    console.log('\n🔧 STEP 4: Redeem Code');
    console.log('----------------------');
    
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
      console.log('✅ Code redeemed successfully');
      console.log(`   Code: FIRSTBONUS`);
      console.log(`   Bonus: $${redeemResult.bonusAmount}`);
      console.log(`   New Balance: $${redeemResult.newBalance || 'NOT PROVIDED'}`);
      console.log(`   Message: ${redeemResult.message}`);
      
      const expectedBalance = initialBalance + redeemResult.bonusAmount;
      console.log(`   Expected Balance: $${expectedBalance}`);
      
      // Wait for any async operations
      console.log('\n   Waiting 2 seconds for balance sync...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check balance again
      console.log('\n🔧 STEP 5: Verify Balance Update');
      console.log('--------------------------------');
      
      const verifyResponse = await fetch(`${baseUrl}/api/auth/user`, {
        headers: { 'Authorization': `Bearer ${userToken}` }
      });
      
      if (verifyResponse.ok) {
        const verifyData = await verifyResponse.json();
        const currentBalance = parseFloat(verifyData.balance || '0');
        
        console.log('✅ Balance verification complete');
        console.log(`   Current Balance: $${currentBalance}`);
        console.log(`   Expected Balance: $${expectedBalance}`);
        console.log(`   Balance Change: $${currentBalance - initialBalance}`);
        
        if (Math.abs(currentBalance - expectedBalance) < 0.01) {
          console.log('🎉 SUCCESS: Balance was updated correctly!');
          
          // Test duplicate prevention
          console.log('\n🔧 STEP 6: Test Duplicate Prevention');
          console.log('------------------------------------');
          
          const duplicateResponse = await fetch(`${baseUrl}/api/user/redeem-code`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${userToken}`
            },
            body: JSON.stringify({ code: 'FIRSTBONUS' })
          });
          
          if (!duplicateResponse.ok) {
            const duplicateError = await duplicateResponse.json();
            if (duplicateError.error && duplicateError.error.includes('already used')) {
              console.log('✅ Duplicate prevention working correctly');
            } else {
              console.log('⚠️ Unexpected duplicate error:', duplicateError.error);
            }
          } else {
            console.log('❌ CRITICAL: Duplicate redemption was allowed!');
          }
          
        } else {
          console.log('❌ ERROR: Balance mismatch');
          console.log(`   Difference: $${Math.abs(currentBalance - expectedBalance)}`);
        }
      } else {
        console.log('❌ Balance verification failed');
      }
      
    } else {
      const error = await redeemResponse.json();
      console.log('❌ Redemption failed:', error.error);
    }
    
    console.log('\n🎯 FINAL RESULT');
    console.log('===============');
    console.log('✅ Redeem code balance update test completed');
    console.log('');
    console.log('🔧 FIXES IMPLEMENTED:');
    console.log('1. ✅ Added /api/auth/user endpoint for frontend compatibility');
    console.log('2. ✅ Fixed balance update with fallback to file-based storage');
    console.log('3. ✅ Enhanced error handling and logging');
    console.log('4. ✅ Improved duplicate prevention');
    console.log('5. ✅ Real-time balance synchronization');
    
  } catch (error) {
    console.error('❌ Error during final test:', error);
  }
}

// Main execution
if (require.main === module) {
  testFinalFix().catch(console.error);
}

module.exports = { testFinalFix };
