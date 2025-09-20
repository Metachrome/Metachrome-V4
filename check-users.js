#!/usr/bin/env node

/**
 * Check what users exist in the system
 */

async function checkUsers() {
  console.log('👥 CHECKING AVAILABLE USERS');
  console.log('===========================');
  
  const baseUrl = 'https://metachrome-v2-production.up.railway.app';
  
  try {
    // Login as admin first
    console.log('\n🔧 STEP 1: Admin Login');
    console.log('----------------------');
    
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
    
    if (!adminLoginResponse.ok) {
      console.log('❌ Admin login failed');
      return;
    }
    
    const adminLoginResult = await adminLoginResponse.json();
    console.log('✅ Admin login successful');
    const adminToken = adminLoginResult.token;
    
    // Get all users
    console.log('\n🔧 STEP 2: Get All Users');
    console.log('------------------------');
    
    const usersResponse = await fetch(`${baseUrl}/api/admin/users`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    if (usersResponse.ok) {
      const users = await usersResponse.json();
      console.log('✅ Users retrieved successfully');
      console.log(`   Total users: ${users.length}`);
      console.log('');
      
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.username}`);
        console.log(`      ID: ${user.id}`);
        console.log(`      Email: ${user.email || 'N/A'}`);
        console.log(`      Role: ${user.role}`);
        console.log(`      Balance: $${user.balance || '0'}`);
        console.log(`      Status: ${user.status || 'active'}`);
        console.log('');
      });
      
      // Find regular users (non-admin)
      const regularUsers = users.filter(u => u.role === 'user');
      if (regularUsers.length > 0) {
        console.log('🎯 REGULAR USERS FOR TESTING:');
        console.log('=============================');
        regularUsers.forEach(user => {
          console.log(`   Username: ${user.username}`);
          console.log(`   Suggested password: testpass123 or password123`);
          console.log(`   Balance: $${user.balance || '0'}`);
          console.log('');
        });
      }
      
    } else {
      const error = await usersResponse.json();
      console.log('❌ Failed to get users:', error);
    }
    
    // Test creating a new user for testing
    console.log('\n🔧 STEP 3: Create Test User');
    console.log('---------------------------');
    
    const testUserData = {
      username: 'testuser2025',
      email: 'test@metachrome.io',
      password: 'testpass123',
      firstName: 'Test',
      lastName: 'User'
    };
    
    const createUserResponse = await fetch(`${baseUrl}/api/auth/user/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUserData)
    });
    
    if (createUserResponse.ok) {
      const createResult = await createUserResponse.json();
      console.log('✅ Test user created successfully');
      console.log(`   Username: ${createResult.user.username}`);
      console.log(`   ID: ${createResult.user.id}`);
      console.log(`   Balance: $${createResult.user.balance}`);
      console.log('');
      console.log('🎯 USE THESE CREDENTIALS FOR TESTING:');
      console.log(`   Username: ${testUserData.username}`);
      console.log(`   Password: ${testUserData.password}`);
      
      // Test login with new user
      console.log('\n🔧 STEP 4: Test New User Login');
      console.log('------------------------------');
      
      const testLoginResponse = await fetch(`${baseUrl}/api/auth/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: testUserData.username,
          password: testUserData.password
        })
      });
      
      if (testLoginResponse.ok) {
        const testLoginResult = await testLoginResponse.json();
        console.log('✅ Test user login successful');
        console.log(`   Token: ${testLoginResult.token.substring(0, 30)}...`);
        console.log(`   Balance: $${testLoginResult.user.balance}`);
        
        // Test /api/auth/user endpoint
        const authUserResponse = await fetch(`${baseUrl}/api/auth/user`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${testLoginResult.token}`
          }
        });
        
        if (authUserResponse.ok) {
          const authUserData = await authUserResponse.json();
          console.log('✅ /api/auth/user endpoint working');
          console.log(`   Fresh balance: $${authUserData.balance}`);
        } else {
          console.log('❌ /api/auth/user endpoint failed');
        }
        
      } else {
        const error = await testLoginResponse.json();
        console.log('❌ Test user login failed:', error);
      }
      
    } else {
      const error = await createUserResponse.json();
      console.log('⚠️ Test user creation failed (might already exist):', error.error || error.message);
      
      // Try to login with existing test user
      console.log('\n🔧 Trying to login with existing test user...');
      const existingLoginResponse = await fetch(`${baseUrl}/api/auth/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: testUserData.username,
          password: testUserData.password
        })
      });
      
      if (existingLoginResponse.ok) {
        const existingLoginResult = await existingLoginResponse.json();
        console.log('✅ Existing test user login successful');
        console.log(`   Username: ${existingLoginResult.user.username}`);
        console.log(`   Balance: $${existingLoginResult.user.balance}`);
        console.log('');
        console.log('🎯 USE THESE CREDENTIALS FOR TESTING:');
        console.log(`   Username: ${testUserData.username}`);
        console.log(`   Password: ${testUserData.password}`);
      } else {
        console.log('❌ Existing test user login also failed');
      }
    }
    
  } catch (error) {
    console.error('❌ Error during user check:', error);
  }
}

// Main execution
if (require.main === module) {
  checkUsers().catch(console.error);
}

module.exports = { checkUsers };
