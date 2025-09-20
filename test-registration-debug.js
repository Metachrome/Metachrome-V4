#!/usr/bin/env node

/**
 * Debug user registration issue
 */

const fs = require('fs');
const path = require('path');

async function testRegistrationDebug() {
  console.log('🔧 DEBUGGING USER REGISTRATION');
  console.log('==============================');
  
  const baseUrl = 'https://metachrome-v2-production.up.railway.app';
  
  try {
    // Step 1: Check current users in file
    console.log('\n🔧 STEP 1: Check Current Users in File');
    console.log('--------------------------------------');
    
    const usersFile = path.join(__dirname, 'users-data.json');
    
    try {
      const usersData = fs.readFileSync(usersFile, 'utf8');
      const users = JSON.parse(usersData);
      
      console.log('✅ Found users-data.json');
      console.log(`   Total users: ${users.length}`);
      
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.username} (ID: ${user.id}) - Balance: $${user.balance}`);
      });
      
      // Check if testuser123 exists
      const testUser = users.find(u => u.username === 'testuser123');
      if (testUser) {
        console.log('\n✅ testuser123 found in file:');
        console.log(`   ID: ${testUser.id}`);
        console.log(`   Balance: $${testUser.balance}`);
        console.log(`   Redeem History: ${testUser.redeem_history ? testUser.redeem_history.length : 0} entries`);
      } else {
        console.log('\n❌ testuser123 NOT found in file');
      }
      
    } catch (fileError) {
      console.log('❌ Error reading users-data.json:', fileError.message);
    }
    
    // Step 2: Try to register a new user
    console.log('\n🔧 STEP 2: Try to Register New User');
    console.log('-----------------------------------');
    
    const registerResponse = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'debuguser123',
        email: 'debuguser123@example.com',
        password: 'password123'
      })
    });
    
    if (registerResponse.ok) {
      const registerResult = await registerResponse.json();
      console.log('✅ Registration successful:');
      console.log(`   User ID: ${registerResult.user.id}`);
      console.log(`   Username: ${registerResult.user.username}`);
      console.log(`   Balance: $${registerResult.user.balance}`);
      console.log(`   Token: ${registerResult.token ? 'PROVIDED' : 'MISSING'}`);
    } else {
      const registerError = await registerResponse.json();
      console.log('❌ Registration failed:', registerError.message || registerError.error);
    }
    
    // Step 3: Check file again after registration
    console.log('\n🔧 STEP 3: Check File After Registration');
    console.log('----------------------------------------');
    
    try {
      const usersData = fs.readFileSync(usersFile, 'utf8');
      const users = JSON.parse(usersData);
      
      console.log('✅ File read after registration');
      console.log(`   Total users: ${users.length}`);
      
      const debugUser = users.find(u => u.username === 'debuguser123');
      if (debugUser) {
        console.log('✅ debuguser123 found in file after registration');
        console.log(`   ID: ${debugUser.id}`);
        console.log(`   Balance: $${debugUser.balance}`);
      } else {
        console.log('❌ debuguser123 NOT found in file after registration');
      }
      
    } catch (fileError) {
      console.log('❌ Error reading file after registration:', fileError.message);
    }
    
    // Step 4: Try to login with existing user
    console.log('\n🔧 STEP 4: Try to Login with Existing User');
    console.log('------------------------------------------');
    
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'angela.soenoko',
        password: 'password123'
      })
    });
    
    if (loginResponse.ok) {
      const loginResult = await loginResponse.json();
      console.log('✅ Login with existing user successful:');
      console.log(`   User ID: ${loginResult.user.id}`);
      console.log(`   Username: ${loginResult.user.username}`);
      console.log(`   Balance: $${loginResult.user.balance}`);
      
      // Test redeem with existing user
      console.log('\n🔧 Testing redeem with existing user...');
      
      const redeemResponse = await fetch(`${baseUrl}/api/user/redeem-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${loginResult.token}`
        },
        body: JSON.stringify({ code: 'BONUS500' })
      });
      
      if (redeemResponse.ok) {
        const redeemResult = await redeemResponse.json();
        console.log('✅ Redeem successful with existing user:');
        console.log(`   Message: ${redeemResult.message}`);
        console.log(`   Bonus: $${redeemResult.bonusAmount}`);
      } else {
        const redeemError = await redeemResponse.json();
        console.log('❌ Redeem failed with existing user:', redeemError.error);
      }
      
    } else {
      const loginError = await loginResponse.json();
      console.log('❌ Login with existing user failed:', loginError.message || loginError.error);
    }
    
    console.log('\n🎯 ANALYSIS');
    console.log('===========');
    console.log('');
    console.log('🔍 CHECKING:');
    console.log('1. ❓ Are new users being saved to the correct file?');
    console.log('2. ❓ Is the registration endpoint working properly?');
    console.log('3. ❓ Are existing users able to redeem codes?');
    console.log('4. ❓ Is the balance update working for existing users?');
    
  } catch (error) {
    console.error('❌ Error during debugging:', error);
  }
}

// Main execution
if (require.main === module) {
  testRegistrationDebug().catch(console.error);
}

module.exports = { testRegistrationDebug };
