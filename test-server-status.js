#!/usr/bin/env node

/**
 * Quick test to check server status and available users
 */

async function testServerStatus() {
  console.log('🔍 TESTING SERVER STATUS');
  console.log('========================');
  
  const baseUrl = 'https://metachrome-v2-production.up.railway.app';
  
  try {
    // Test health endpoint
    console.log('\n🔧 STEP 1: Health Check');
    console.log('-----------------------');
    
    const healthResponse = await fetch(`${baseUrl}/api/health`);
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Server is running');
      console.log(`   Environment: ${healthData.environment}`);
      console.log(`   Database: ${healthData.database}`);
      console.log(`   Timestamp: ${healthData.timestamp}`);
    } else {
      console.log('❌ Health check failed');
      return;
    }
    
    // Test auth endpoint
    console.log('\n🔧 STEP 2: Test Auth Endpoint');
    console.log('-----------------------------');
    
    const authResponse = await fetch(`${baseUrl}/api/auth`);
    if (authResponse.ok) {
      const authData = await authResponse.json();
      console.log('✅ Auth endpoint working');
      console.log('   Available users:');
      if (authData.users && Array.isArray(authData.users)) {
        authData.users.forEach(user => {
          console.log(`   - ${user.username} (${user.role}) - Balance: $${user.balance}`);
        });
      }
    } else {
      console.log('⚠️ Auth endpoint returned error (this might be expected)');
    }
    
    // Test with common credentials
    console.log('\n🔧 STEP 3: Test Common Login Credentials');
    console.log('----------------------------------------');
    
    const testCredentials = [
      { username: 'amdsnk', password: 'testpass123' },
      { username: 'angela.soenoko', password: 'testpass123' },
      { username: 'user1', password: 'password123' },
      { username: 'testuser', password: 'testpass123' },
      { username: 'demo', password: 'demo123' }
    ];
    
    for (const creds of testCredentials) {
      console.log(`\n   Testing: ${creds.username} / ${creds.password}`);
      
      const loginResponse = await fetch(`${baseUrl}/api/auth/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(creds)
      });
      
      if (loginResponse.ok) {
        const loginResult = await loginResponse.json();
        console.log(`   ✅ SUCCESS: ${creds.username} logged in`);
        console.log(`      User ID: ${loginResult.user.id}`);
        console.log(`      Balance: $${loginResult.user.balance}`);
        console.log(`      Role: ${loginResult.user.role}`);
        
        // Test the /api/auth/user endpoint with this token
        const token = loginResult.token;
        const authUserResponse = await fetch(`${baseUrl}/api/auth/user`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (authUserResponse.ok) {
          const authUserData = await authUserResponse.json();
          console.log(`      ✅ /api/auth/user endpoint working`);
          console.log(`      Fresh balance: $${authUserData.balance}`);
        } else {
          console.log(`      ❌ /api/auth/user endpoint failed`);
        }
        
        break; // Stop after first successful login
      } else {
        const error = await loginResponse.json();
        console.log(`   ❌ FAILED: ${error.error || 'Unknown error'}`);
      }
    }
    
    // Test admin login
    console.log('\n🔧 STEP 4: Test Admin Login');
    console.log('---------------------------');
    
    const adminCredentials = [
      { username: 'superadmin', password: 'superadmin123' },
      { username: 'admin', password: 'admin123' }
    ];
    
    for (const creds of adminCredentials) {
      console.log(`\n   Testing admin: ${creds.username} / ${creds.password}`);
      
      const adminLoginResponse = await fetch(`${baseUrl}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(creds)
      });
      
      if (adminLoginResponse.ok) {
        const adminLoginResult = await adminLoginResponse.json();
        console.log(`   ✅ SUCCESS: ${creds.username} admin logged in`);
        console.log(`      Admin ID: ${adminLoginResult.user.id}`);
        console.log(`      Role: ${adminLoginResult.user.role}`);
        break;
      } else {
        const error = await adminLoginResponse.json();
        console.log(`   ❌ FAILED: ${error.error || 'Unknown error'}`);
      }
    }
    
    console.log('\n🎯 SUMMARY');
    console.log('==========');
    console.log('✅ Server status check completed');
    console.log('');
    console.log('🔍 NEXT STEPS:');
    console.log('1. Use the working credentials found above');
    console.log('2. Test redeem code functionality');
    console.log('3. Verify balance updates work correctly');
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
  }
}

// Main execution
if (require.main === module) {
  testServerStatus().catch(console.error);
}

module.exports = { testServerStatus };
