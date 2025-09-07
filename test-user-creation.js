// Test script to verify user creation endpoint
const http = require('http');

async function testUserCreation() {
  const testUser = {
    username: 'testuser123',
    email: 'testuser123@metachrome.io',
    password: 'testpassword123',
    balance: 5000,
    role: 'user',
    trading_mode: 'normal'
  };

  const postData = JSON.stringify(testUser);

  const options = {
    hostname: 'localhost',
    port: 9000,
    path: '/api/admin/users',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  return new Promise((resolve, reject) => {
    console.log('🧪 Testing user creation...');
    console.log('📤 Sending:', testUser);

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('📥 Response status:', res.statusCode);
          console.log('📥 Response:', result);

          if (res.statusCode === 200) {
            console.log('✅ User creation successful!');
            resolve(result);
          } else {
            console.log('❌ User creation failed:', result.message || result.error);
            reject(new Error(result.message || result.error));
          }
        } catch (error) {
          console.error('❌ Error parsing response:', error.message);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request error:', error.message);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

testUserCreation().catch(console.error);
