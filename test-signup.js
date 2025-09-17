const http = require('http');

async function testSignup() {
  console.log('🧪 Testing signup functionality...');
  
  const testUser = {
    username: 'testuser_' + Date.now(),
    email: 'test' + Date.now() + '@example.com',
    password: 'testpassword123',
    firstName: 'Test',
    lastName: 'User'
  };
  
  console.log('📝 Test user data:', testUser);
  
  try {
    // Test the main /api/auth endpoint
    console.log('🔄 Testing /api/auth endpoint...');
    const response1 = await fetch('http://localhost:3001/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser)
    });
    
    if (response1.ok) {
      const result1 = await response1.json();
      console.log('✅ /api/auth endpoint success:', result1);
      return;
    } else {
      console.log('❌ /api/auth endpoint failed:', response1.status, await response1.text());
    }
    
    // Test the fallback /api/auth/user/register endpoint
    console.log('🔄 Testing /api/auth/user/register endpoint...');
    const response2 = await fetch('http://localhost:3001/api/auth/user/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser)
    });
    
    if (response2.ok) {
      const result2 = await response2.json();
      console.log('✅ /api/auth/user/register endpoint success:', result2);
    } else {
      console.log('❌ /api/auth/user/register endpoint failed:', response2.status, await response2.text());
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Test server status first
async function testServerStatus() {
  try {
    console.log('🔍 Testing server status...');
    const response = await fetch('http://localhost:3001/api/status');
    if (response.ok) {
      const status = await response.json();
      console.log('✅ Server status:', status);
      return true;
    } else {
      console.log('❌ Server not responding on port 3001');
      return false;
    }
  } catch (error) {
    console.log('❌ Server connection failed:', error.message);
    return false;
  }
}

async function main() {
  const serverRunning = await testServerStatus();
  if (serverRunning) {
    await testSignup();
  } else {
    console.log('🔄 Trying port 3000...');
    try {
      const response = await fetch('http://localhost:3000/api/status');
      if (response.ok) {
        console.log('✅ Server found on port 3000');
        // Update the test to use port 3000
        await testSignup();
      } else {
        console.log('❌ Server not found on either port');
      }
    } catch (error) {
      console.log('❌ No server found on common ports');
    }
  }
}

main();
