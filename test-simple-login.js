const https = require('https');
const http = require('http');

function testLogin() {
  console.log('Testing different passwords...');

  const passwords = ['password123', 'password', '123456', 'angela123', 'test123', 'admin123'];

  passwords.forEach((password, index) => {
    setTimeout(() => {
      testPassword(password);
    }, index * 1000);
  });
}

function testPassword(password) {
  console.log(`\nTrying password: ${password}`);

  const postData = JSON.stringify({
    username: 'angela.soenoko',
    password: password
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
    console.log(`Response status for password "${password}":`, res.statusCode);

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      if (res.statusCode === 200) {
        try {
          const parsed = JSON.parse(data);
          console.log(`✅ SUCCESS! Password "${password}" works!`);
          console.log('Login result:', parsed);
        } catch (e) {
          console.log('Failed to parse response');
        }
      } else {
        console.log(`❌ Password "${password}" failed:`, data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Error:', error.message);
  });

  req.write(postData);
  req.end();
}

testLogin();
