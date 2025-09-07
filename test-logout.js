// Test logout functionality
const baseUrl = 'https://crypto-trade-x.vercel.app';

async function testLogout() {
  console.log('🧪 Testing Logout Functionality\n');
  
  try {
    // Step 1: Login first
    console.log('1️⃣ Logging in as user...');
    const loginResponse = await fetch(`${baseUrl}/api/auth/user/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important for session cookies
      body: JSON.stringify({
        username: 'trader1',
        password: 'password123'
      })
    });
    
    const loginResult = await loginResponse.json();
    console.log('Login status:', loginResponse.status);
    console.log('Login response:', loginResult);
    
    if (loginResponse.status !== 200) {
      console.log('❌ Login failed, cannot test logout');
      return;
    }
    
    // Step 2: Check if logged in
    console.log('\n2️⃣ Checking auth status...');
    const authResponse = await fetch(`${baseUrl}/api/auth/user`, {
      method: 'GET',
      credentials: 'include'
    });
    
    const authResult = await authResponse.json();
    console.log('Auth status:', authResponse.status);
    console.log('Auth response:', authResult);
    
    // Step 3: Logout
    console.log('\n3️⃣ Attempting logout...');
    const logoutResponse = await fetch(`${baseUrl}/api/auth/user/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });
    
    const logoutResult = await logoutResponse.json();
    console.log('Logout status:', logoutResponse.status);
    console.log('Logout response:', logoutResult);
    
    // Step 4: Check if logged out
    console.log('\n4️⃣ Checking auth status after logout...');
    const authAfterLogoutResponse = await fetch(`${baseUrl}/api/auth/user`, {
      method: 'GET',
      credentials: 'include'
    });
    
    const authAfterLogoutResult = await authAfterLogoutResponse.json();
    console.log('Auth after logout status:', authAfterLogoutResponse.status);
    console.log('Auth after logout response:', authAfterLogoutResult);
    
    // Results
    console.log('\n📊 RESULTS:');
    if (authAfterLogoutResult === null || !authAfterLogoutResult.id) {
      console.log('✅ LOGOUT WORKING: User is properly logged out');
    } else {
      console.log('❌ LOGOUT BROKEN: User is still logged in');
      console.log('   User data still present:', authAfterLogoutResult);
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testLogout();
