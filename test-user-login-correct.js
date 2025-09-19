const http = require('http');

function testUserLogin() {
  console.log('🔐 Testing user login with correct password...');
  
  const postData = JSON.stringify({
    username: 'angela.soenoko',
    password: 'newpass123'  // Correct password
  });
  
  const options = {
    hostname: 'localhost',
    port: 3005,
    path: '/api/auth/user/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  
  console.log('Request details:', {
    url: `http://${options.hostname}:${options.port}${options.path}`,
    method: options.method,
    credentials: { username: 'angela.soenoko', password: 'newpass123' }
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
          console.log('✅ User login successful!');
          console.log('Token:', result.token);
          console.log('User:', result.user);
        } catch (e) {
          console.log('Failed to parse response');
        }
      } else {
        console.log('❌ User login failed');
      }
    });
  });
  
  req.on('error', (error) => {
    console.error('❌ Connection error:', error.message);
  });
  
  req.write(postData);
  req.end();
}

testUserLogin();
