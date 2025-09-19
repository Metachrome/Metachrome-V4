const http = require('http');

function testFrontendConnection() {
  console.log('🌐 Testing frontend connection to 127.0.0.1:3005...\n');
  
  // Test the exact same request the frontend makes
  testAdminLogin();
}

function testAdminLogin() {
  console.log('🔐 Testing admin login to 127.0.0.1:3005...');
  
  const postData = JSON.stringify({
    username: 'superadmin',
    password: 'superadmin123'
  });
  
  const options = {
    hostname: '127.0.0.1',  // Same as frontend
    port: 3005,
    path: '/api/admin/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  
  console.log('Request details:', {
    url: `http://${options.hostname}:${options.port}${options.path}`,
    method: options.method,
    headers: options.headers
  });
  
  const req = http.request(options, (res) => {
    console.log('Response status:', res.statusCode);
    console.log('Response headers:', res.headers);
    
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      console.log('Response body:', data);
      
      if (res.statusCode === 200) {
        try {
          const result = JSON.parse(data);
          console.log('✅ Admin login successful!');
          console.log('Token:', result.token);
          console.log('User:', result.user);
          
          // Test user login too
          setTimeout(() => {
            testUserLogin();
          }, 1000);
        } catch (e) {
          console.log('Failed to parse response');
        }
      } else {
        console.log('❌ Admin login failed');
      }
    });
  });
  
  req.on('error', (error) => {
    console.error('❌ Connection error:', error.message);
    console.error('Error details:', error);
  });
  
  req.write(postData);
  req.end();
}

function testUserLogin() {
  console.log('\n🔐 Testing user login to 127.0.0.1:3005...');
  
  const postData = JSON.stringify({
    username: 'angela.soenoko',
    password: 'newpass123'
  });
  
  const options = {
    hostname: '127.0.0.1',
    port: 3005,
    path: '/api/auth/user/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  
  const req = http.request(options, (res) => {
    console.log('User login status:', res.statusCode);
    
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      console.log('User login response:', data);
      
      if (res.statusCode === 200) {
        try {
          const result = JSON.parse(data);
          console.log('✅ User login successful!');
          console.log('Token:', result.token);
          console.log('User:', result.user);
        } catch (e) {
          console.log('Failed to parse user login response');
        }
      } else {
        console.log('❌ User login failed');
      }
    });
  });
  
  req.on('error', (error) => {
    console.error('❌ User login connection error:', error.message);
  });
  
  req.write(postData);
  req.end();
}

testFrontendConnection();
