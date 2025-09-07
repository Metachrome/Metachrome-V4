// Simple test script to verify authentication endpoints
async function testAuth(baseUrl) {
  console.log(`🧪 Testing authentication on ${baseUrl}`);
  
  try {
    // Test user login
    console.log('\n👤 Testing user login...');
    const userLoginResponse = await fetch(`${baseUrl}/api/auth/user/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'trader1',
        password: 'password123'
      })
    });
    
    const userLoginResult = await userLoginResponse.json();
    console.log('User login status:', userLoginResponse.status);
    console.log('User login response:', userLoginResult);
    
    // Test admin login
    console.log('\n🔐 Testing admin login...');
    const adminLoginResponse = await fetch(`${baseUrl}/api/auth/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });
    
    const adminLoginResult = await adminLoginResponse.json();
    console.log('Admin login status:', adminLoginResponse.status);
    console.log('Admin login response:', adminLoginResult);
    
    // Test API health
    console.log('\n🏥 Testing API health...');
    const healthResponse = await fetch(`${baseUrl}/api/auth/user`);
    console.log('Health check status:', healthResponse.status);
    
    if (userLoginResponse.status === 200 && adminLoginResponse.status === 200) {
      console.log('\n✅ All authentication tests passed!');
    } else {
      console.log('\n❌ Some authentication tests failed');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Get URL from command line argument or use default
const url = process.argv[2] || 'http://localhost:5000';
testAuth(url);
