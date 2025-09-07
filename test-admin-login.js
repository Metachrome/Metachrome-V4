// Test admin login endpoint
import http from 'http';

const postData = JSON.stringify({
  username: 'admin',
  password: 'admin123'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/admin/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('🧪 Testing admin login endpoint...');
console.log('📡 Request:', options);
console.log('📦 Data:', postData);

const req = http.request(options, (res) => {
  console.log(`📊 Status: ${res.statusCode}`);
  console.log(`📋 Headers:`, res.headers);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('📥 Response:', data);
    
    try {
      const parsed = JSON.parse(data);
      console.log('✅ Valid JSON response:', parsed);
    } catch (error) {
      console.log('❌ Invalid JSON response');
      console.log('🔍 Raw response:', data.substring(0, 200) + '...');
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request error:', error.message);
});

req.write(postData);
req.end();
