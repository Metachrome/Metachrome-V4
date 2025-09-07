// Test the complete auth flow
import http from 'http';

async function testAuthFlow() {
  console.log('🧪 Testing complete authentication flow...');
  
  // Step 1: Login
  console.log('\n1️⃣ Testing admin login...');
  const loginData = JSON.stringify({
    username: 'admin',
    password: 'admin123'
  });

  const loginOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/admin/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginData)
    }
  };

  const loginResponse = await new Promise((resolve, reject) => {
    const req = http.request(loginOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (error) {
          reject(error);
        }
      });
    });
    req.on('error', reject);
    req.write(loginData);
    req.end();
  });

  console.log('📊 Login Status:', loginResponse.status);
  console.log('📦 Login Response:', loginResponse.data);

  if (loginResponse.status !== 200) {
    console.log('❌ Login failed');
    return;
  }

  const token = loginResponse.data.token;
  console.log('🔑 Token received:', token);

  // Step 2: Test auth endpoint with token
  console.log('\n2️⃣ Testing auth endpoint with token...');
  
  const authOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };

  const authResponse = await new Promise((resolve, reject) => {
    const req = http.request(authOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (error) {
          reject(error);
        }
      });
    });
    req.on('error', reject);
    req.end();
  });

  console.log('📊 Auth Status:', authResponse.status);
  console.log('📦 Auth Response:', authResponse.data);

  if (authResponse.status === 200) {
    console.log('✅ Authentication flow working correctly!');
  } else {
    console.log('❌ Authentication verification failed');
  }
}

testAuthFlow().catch(console.error);
