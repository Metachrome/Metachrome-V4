#!/usr/bin/env node

/**
 * Debug balance update issue
 */

async function debugBalanceUpdate() {
  console.log('🔍 DEBUGGING BALANCE UPDATE ISSUE');
  console.log('=================================');
  
  const baseUrl = 'https://metachrome-v2-production.up.railway.app';
  
  try {
    // Login as test user
    console.log('\n🔧 STEP 1: Login');
    console.log('----------------');
    
    const loginResponse = await fetch(`${baseUrl}/api/auth/user/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'testuser2025',
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
    console.log(`   Initial Balance: $${loginResult.user.balance}`);
    
    const userToken = loginResult.token;
    const userId = loginResult.user.id;
    const initialBalance = parseFloat(loginResult.user.balance || '0');
    
    // Check balance via different endpoints
    console.log('\n🔧 STEP 2: Check Balance via Multiple Endpoints');
    console.log('-----------------------------------------------');
    
    // 1. /api/auth/user
    const authUserResponse = await fetch(`${baseUrl}/api/auth/user`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    
    if (authUserResponse.ok) {
      const authUserData = await authUserResponse.json();
      console.log(`   /api/auth/user: $${authUserData.balance}`);
    } else {
      console.log('   /api/auth/user: FAILED');
    }
    
    // 2. /api/user/balances
    const userBalancesResponse = await fetch(`${baseUrl}/api/user/balances?userId=${userId}`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    
    if (userBalancesResponse.ok) {
      const userBalancesData = await userBalancesResponse.json();
      console.log(`   /api/user/balances: $${userBalancesData[0]?.available || 'N/A'}`);
    } else {
      console.log('   /api/user/balances: FAILED');
    }
    
    // 3. Admin view of user
    console.log('\n🔧 STEP 3: Admin View of User');
    console.log('-----------------------------');
    
    const adminLoginResponse = await fetch(`${baseUrl}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'superadmin', password: 'superadmin123' })
    });
    
    let adminToken = null;
    if (adminLoginResponse.ok) {
      const adminLoginResult = await adminLoginResponse.json();
      adminToken = adminLoginResult.token;
      
      const adminUsersResponse = await fetch(`${baseUrl}/api/admin/users`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      
      if (adminUsersResponse.ok) {
        const users = await adminUsersResponse.json();
        const testUser = users.find(u => u.id === userId);
        if (testUser) {
          console.log(`   Admin view balance: $${testUser.balance}`);
        } else {
          console.log('   Admin view: User not found');
        }
      }
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
      body: JSON.stringify({ code: 'WELCOME50' })
    });
    
    if (redeemResponse.ok) {
      const redeemResult = await redeemResponse.json();
      console.log('✅ Code redeemed successfully');
      console.log(`   Bonus: $${redeemResult.bonusAmount}`);
      console.log(`   New Balance (from response): $${redeemResult.newBalance || 'Not provided'}`);
      
      // Wait a moment for database sync
      console.log('\n   Waiting 3 seconds for database sync...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Check balance again via all endpoints
      console.log('\n🔧 STEP 5: Check Balance After Redemption');
      console.log('-----------------------------------------');
      
      // 1. /api/auth/user
      const authUserResponse2 = await fetch(`${baseUrl}/api/auth/user`, {
        headers: { 'Authorization': `Bearer ${userToken}` }
      });
      
      if (authUserResponse2.ok) {
        const authUserData2 = await authUserResponse2.json();
        console.log(`   /api/auth/user: $${authUserData2.balance}`);
      } else {
        console.log('   /api/auth/user: FAILED');
      }
      
      // 2. /api/user/balances
      const userBalancesResponse2 = await fetch(`${baseUrl}/api/user/balances?userId=${userId}`, {
        headers: { 'Authorization': `Bearer ${userToken}` }
      });
      
      if (userBalancesResponse2.ok) {
        const userBalancesData2 = await userBalancesResponse2.json();
        console.log(`   /api/user/balances: $${userBalancesData2[0]?.available || 'N/A'}`);
      } else {
        console.log('   /api/user/balances: FAILED');
      }
      
      // 3. Admin view of user
      const adminUsersResponse2 = await fetch(`${baseUrl}/api/admin/users`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      
      if (adminUsersResponse2.ok) {
        const users2 = await adminUsersResponse2.json();
        const testUser2 = users2.find(u => u.id === userId);
        if (testUser2) {
          console.log(`   Admin view balance: $${testUser2.balance}`);
        } else {
          console.log('   Admin view: User not found');
        }
      }
      
      // 4. Fresh login to get updated data
      console.log('\n🔧 STEP 6: Fresh Login to Check Balance');
      console.log('---------------------------------------');
      
      const freshLoginResponse = await fetch(`${baseUrl}/api/auth/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'testuser2025',
          password: 'testpass123'
        })
      });
      
      if (freshLoginResponse.ok) {
        const freshLoginResult = await freshLoginResponse.json();
        console.log(`   Fresh login balance: $${freshLoginResult.user.balance}`);
        
        const freshToken = freshLoginResult.token;
        const freshAuthResponse = await fetch(`${baseUrl}/api/auth/user`, {
          headers: { 'Authorization': `Bearer ${freshToken}` }
        });
        
        if (freshAuthResponse.ok) {
          const freshAuthData = await freshAuthResponse.json();
          console.log(`   Fresh /api/auth/user: $${freshAuthData.balance}`);
        }
      }
      
    } else {
      const error = await redeemResponse.json();
      console.log('❌ Redemption failed:', error.error);
    }
    
    console.log('\n🎯 DIAGNOSIS');
    console.log('============');
    console.log('This test shows where the balance update is failing:');
    console.log('1. If admin view shows updated balance but user endpoints don\'t = endpoint issue');
    console.log('2. If fresh login shows updated balance but /api/auth/user doesn\'t = caching issue');
    console.log('3. If no endpoint shows updated balance = database update issue');
    
  } catch (error) {
    console.error('❌ Error during debugging:', error);
  }
}

// Main execution
if (require.main === module) {
  debugBalanceUpdate().catch(console.error);
}

module.exports = { debugBalanceUpdate };
