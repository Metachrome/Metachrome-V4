import fetch from 'node-fetch';

async function testRegistrationFlow() {
  console.log('🧪 Testing Registration Flow...\n');
  
  const testUser = {
    username: 'testuser456',
    email: 'testuser456@example.com',
    password: 'password123',
    firstName: 'Test',
    lastName: 'User'
  };
  
  console.log('📝 Test user data:', testUser);
  
  // Test 1: Local server registration
  console.log('\n🔍 Test 1: Local server (/api/auth)');
  try {
    const response = await fetch('http://localhost:4000/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser)
    });
    
    const data = await response.json();
    console.log('✅ Local server response:', response.status, data);
  } catch (error) {
    console.log('❌ Local server error:', error.message);
  }
  
  // Test 2: Check if user was created in database
  console.log('\n🔍 Test 2: Check database for new user');
  try {
    const response = await fetch('http://localhost:4000/api/admin/users');
    const users = await response.json();
    console.log('📊 Users in database:', users.length);
    
    const newUser = users.find(u => u.username === testUser.username);
    if (newUser) {
      console.log('✅ User found in database:', {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      });
    } else {
      console.log('❌ User NOT found in database');
    }
  } catch (error) {
    console.log('❌ Database check error:', error.message);
  }
  
  // Test 3: Try login with new user
  console.log('\n🔍 Test 3: Try login with new user');
  try {
    const response = await fetch('http://localhost:4000/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: testUser.username,
        password: testUser.password
      })
    });
    
    const data = await response.json();
    console.log('✅ Login response:', response.status, data);
  } catch (error) {
    console.log('❌ Login error:', error.message);
  }
}

testRegistrationFlow();
