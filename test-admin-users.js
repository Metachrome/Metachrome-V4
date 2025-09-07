import fetch from 'node-fetch';

async function testAdminUsers() {
  try {
    console.log('🧪 Testing admin users endpoint...');
    
    // Test the admin users endpoint
    const response = await fetch('http://localhost:4000/api/admin/users', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // Add a test token
      }
    });

    const data = await response.json();
    console.log('📝 Admin users response:', JSON.stringify(data, null, 2));
    console.log('📊 Status:', response.status);
    console.log('🔢 Number of users:', data.length);
    
    if (response.ok) {
      console.log('✅ Admin users endpoint working!');
      
      // Check if we have real users vs demo users
      const hasRealUsers = data.some(user => 
        user.username !== 'trader1' && 
        user.username !== 'trader2' && 
        user.username !== 'admin'
      );
      
      if (hasRealUsers) {
        console.log('✅ Real users found in admin endpoint!');
      } else {
        console.log('⚠️ Only demo users found - database might not be connected');
      }
    } else {
      console.log('❌ Admin users endpoint failed');
    }
  } catch (error) {
    console.error('❌ Error testing admin users:', error.message);
  }
}

testAdminUsers();
