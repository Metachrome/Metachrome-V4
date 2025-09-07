import fetch from 'node-fetch';

async function testNewUserRegistration() {
  console.log('🧪 Testing New User Registration...\n');
  
  const testUser = {
    username: 'newuser789',
    email: 'newuser789@example.com',
    password: 'password123',
    firstName: 'New',
    lastName: 'User'
  };
  
  console.log('📝 Test user data:', testUser);
  
  // Test 1: Register new user
  console.log('\n🔍 Test 1: Register new user');
  try {
    const response = await fetch('http://localhost:4000/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser)
    });
    
    const data = await response.json();
    console.log('✅ Registration response:', response.status, data);
  } catch (error) {
    console.log('❌ Registration error:', error.message);
    return;
  }
  
  // Test 2: Try to login with new user
  console.log('\n🔍 Test 2: Login with new user');
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
  
  // Test 3: Check admin dashboard
  console.log('\n🔍 Test 3: Check admin dashboard');
  try {
    const response = await fetch('http://localhost:4000/api/admin/users');
    const users = await response.json();
    console.log('📊 Total users in database:', users.length);
    
    const newUser = users.find(u => u.username === testUser.username);
    if (newUser) {
      console.log('✅ New user found in admin dashboard:', {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        firstName: newUser.firstName,
        lastName: newUser.lastName
      });
    } else {
      console.log('❌ New user NOT found in admin dashboard');
    }
  } catch (error) {
    console.log('❌ Admin dashboard error:', error.message);
  }
}

testNewUserRegistration();
