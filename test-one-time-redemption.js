#!/usr/bin/env node

/**
 * Test script to verify one-time redemption functionality
 */

async function testOneTimeRedemption() {
  console.log('🎁 TESTING ONE-TIME REDEMPTION FUNCTIONALITY');
  console.log('============================================');
  
  const baseUrl = 'https://metachrome-v2-production.up.railway.app';
  
  // Test user credentials (you'll need to use a real user token)
  const testUserToken = 'test-user-token'; // Replace with actual user token
  
  try {
    // Step 1: Test first redemption (should succeed)
    console.log('\n🔧 STEP 1: Test First Redemption (Should Succeed)');
    console.log('--------------------------------------------------');
    
    const testCode = 'FIRSTBONUS';
    
    try {
      const firstRedemption = await fetch(`${baseUrl}/api/user/redeem-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${testUserToken}`
        },
        body: JSON.stringify({ code: testCode })
      });
      
      if (firstRedemption.ok) {
        const result = await firstRedemption.json();
        console.log('✅ First redemption successful');
        console.log(`   Code: ${testCode}`);
        console.log(`   Bonus: $${result.bonusAmount}`);
        console.log(`   Message: ${result.message}`);
      } else {
        const error = await firstRedemption.text();
        console.log('❌ First redemption failed:', error);
      }
    } catch (error) {
      console.log('❌ Error during first redemption:', error.message);
    }
    
    // Step 2: Test duplicate redemption (should fail)
    console.log('\n🔧 STEP 2: Test Duplicate Redemption (Should Fail)');
    console.log('--------------------------------------------------');
    
    try {
      const duplicateRedemption = await fetch(`${baseUrl}/api/user/redeem-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${testUserToken}`
        },
        body: JSON.stringify({ code: testCode })
      });
      
      if (duplicateRedemption.ok) {
        const result = await duplicateRedemption.json();
        console.log('❌ DUPLICATE REDEMPTION SUCCEEDED (THIS IS A BUG!)');
        console.log(`   Code: ${testCode}`);
        console.log(`   Bonus: $${result.bonusAmount}`);
        console.log('🚨 The one-time redemption logic is NOT working!');
      } else {
        const error = await duplicateRedemption.json();
        if (error.error && error.error.includes('already used')) {
          console.log('✅ Duplicate redemption correctly blocked');
          console.log(`   Error: ${error.error}`);
        } else {
          console.log('⚠️ Duplicate redemption failed for different reason:', error.error);
        }
      }
    } catch (error) {
      console.log('❌ Error during duplicate redemption test:', error.message);
    }
    
    // Step 3: Test redemption history
    console.log('\n🔧 STEP 3: Test Redemption History');
    console.log('----------------------------------');
    
    try {
      const historyResponse = await fetch(`${baseUrl}/api/user/redeem-history`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${testUserToken}`
        }
      });
      
      if (historyResponse.ok) {
        const history = await historyResponse.json();
        console.log('✅ Redemption history retrieved');
        console.log(`   Total redemptions: ${history.length}`);
        history.forEach((entry, index) => {
          console.log(`   ${index + 1}. ${entry.code}: $${entry.bonus_amount} (${entry.redeemed_at})`);
        });
        
        // Check if the test code is in history
        const testCodeInHistory = history.some(entry => entry.code === testCode);
        if (testCodeInHistory) {
          console.log('✅ Test code found in redemption history');
        } else {
          console.log('❌ Test code NOT found in redemption history');
        }
      } else {
        const error = await historyResponse.text();
        console.log('❌ Failed to get redemption history:', error);
      }
    } catch (error) {
      console.log('❌ Error getting redemption history:', error.message);
    }
    
    // Step 4: Test different code redemption (should succeed)
    console.log('\n🔧 STEP 4: Test Different Code Redemption (Should Succeed)');
    console.log('-----------------------------------------------------------');
    
    const differentCode = 'WELCOME50';
    
    try {
      const differentRedemption = await fetch(`${baseUrl}/api/user/redeem-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${testUserToken}`
        },
        body: JSON.stringify({ code: differentCode })
      });
      
      if (differentRedemption.ok) {
        const result = await differentRedemption.json();
        console.log('✅ Different code redemption successful');
        console.log(`   Code: ${differentCode}`);
        console.log(`   Bonus: $${result.bonusAmount}`);
        console.log(`   Message: ${result.message}`);
      } else {
        const error = await differentRedemption.text();
        console.log('❌ Different code redemption failed:', error);
      }
    } catch (error) {
      console.log('❌ Error during different code redemption:', error.message);
    }
    
    // Step 5: Test invalid code (should fail)
    console.log('\n🔧 STEP 5: Test Invalid Code (Should Fail)');
    console.log('-------------------------------------------');
    
    const invalidCode = 'INVALID123';
    
    try {
      const invalidRedemption = await fetch(`${baseUrl}/api/user/redeem-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${testUserToken}`
        },
        body: JSON.stringify({ code: invalidCode })
      });
      
      if (invalidRedemption.ok) {
        const result = await invalidRedemption.json();
        console.log('❌ INVALID CODE REDEMPTION SUCCEEDED (THIS IS A BUG!)');
        console.log(`   Code: ${invalidCode}`);
        console.log(`   Bonus: $${result.bonusAmount}`);
      } else {
        const error = await invalidRedemption.json();
        if (error.error && (error.error.includes('Invalid') || error.error.includes('expired'))) {
          console.log('✅ Invalid code correctly rejected');
          console.log(`   Error: ${error.error}`);
        } else {
          console.log('⚠️ Invalid code failed for different reason:', error.error);
        }
      }
    } catch (error) {
      console.log('❌ Error during invalid code test:', error.message);
    }
    
    // Summary
    console.log('\n🎯 SUMMARY');
    console.log('==========');
    console.log('✅ One-time redemption test completed');
    console.log('');
    console.log('🔍 EXPECTED RESULTS:');
    console.log('1. ✅ First redemption should succeed');
    console.log('2. ✅ Duplicate redemption should be blocked with "already used" error');
    console.log('3. ✅ Redemption history should show redeemed codes');
    console.log('4. ✅ Different codes should still be redeemable');
    console.log('5. ✅ Invalid codes should be rejected');
    console.log('');
    console.log('🚀 NEXT STEPS:');
    console.log('1. Replace testUserToken with a real user authentication token');
    console.log('2. Run this test with different user accounts');
    console.log('3. Verify the behavior in both development and production modes');
    
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
      console.log('   You can test one-time redemption locally with this server');
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
  await testOneTimeRedemption();
  
  console.log('\n🟢 STATUS: ONE-TIME REDEMPTION TEST COMPLETED');
  console.log('');
  console.log('📝 NOTE: To properly test this functionality:');
  console.log('1. Get a real user authentication token from the login process');
  console.log('2. Replace the testUserToken variable with the real token');
  console.log('3. Run the test to verify one-time redemption works correctly');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testOneTimeRedemption };
