const http = require('http');

function resetPassword() {
  console.log('Resetting password for angela.soenoko...');
  
  const postData = JSON.stringify({
    userId: 'user-angela-1758195715',
    newPassword: 'newpass123'
  });
  
  const options = {
    hostname: 'localhost',
    port: 3005,
    path: '/api/superadmin/change-password',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  
  const req = http.request(options, (res) => {
    console.log('Response status:', res.statusCode);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Response body:', data);
      
      if (res.statusCode === 200) {
        console.log('✅ Password reset successful! New password: newpass123');
        
        // Now test login with new password
        setTimeout(() => {
          testLogin();
        }, 1000);
      } else {
        console.log('❌ Password reset failed');
      }
    });
  });
  
  req.on('error', (error) => {
    console.error('Error:', error.message);
  });
  
  req.write(postData);
  req.end();
}

function testLogin() {
  console.log('\nTesting login with new password...');
  
  const postData = JSON.stringify({
    username: 'angela.soenoko',
    password: 'newpass123'
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
  
  const req = http.request(options, (res) => {
    console.log('Login response status:', res.statusCode);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Login response body:', data);
      
      if (res.statusCode === 200) {
        try {
          const parsed = JSON.parse(data);
          console.log('✅ LOGIN SUCCESSFUL!');
          console.log('User:', parsed.user);
          console.log('Token:', parsed.token);
        } catch (e) {
          console.log('Failed to parse login response');
        }
      } else {
        console.log('❌ Login still failed');
      }
    });
  });
  
  req.on('error', (error) => {
    console.error('Login error:', error.message);
  });
  
  req.write(postData);
  req.end();
}

resetPassword();
