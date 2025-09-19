const http = require('http');

function testLoginEndpoints() {
  console.log('🔐 Testing login endpoints...\n');
  
  // Test 1: User login
  console.log('1. Testing user login...');
  testUserLogin(() => {
    
    // Test 2: Admin login  
    console.log('\n2. Testing admin login...');
    testAdminLogin(() => {
      
      // Test 3: Check if endpoints exist
      console.log('\n3. Testing endpoint availability...');
      testEndpointAvailability();
    });
  });
}

function testUserLogin(callback) {
  const postData = JSON.stringify({
    username: 'angela.soenoko',
    password: 'newpass123'
  });
  
  makeRequest('POST', '/api/auth/user/login', postData, (result, statusCode) => {
    console.log(`   User login status: ${statusCode}`);
    if (statusCode === 200 && result) {
      console.log('   ✅ User login successful');
      console.log('   User:', result.user?.username);
      console.log('   Token:', result.token?.substring(0, 30) + '...');
    } else {
      console.log('   ❌ User login failed:', result);
    }
    callback();
  });
}

function testAdminLogin(callback) {
  const postData = JSON.stringify({
    username: 'superadmin',
    password: 'superadmin123'
  });
  
  makeRequest('POST', '/api/admin/login', postData, (result, statusCode) => {
    console.log(`   Admin login status: ${statusCode}`);
    if (statusCode === 200 && result) {
      console.log('   ✅ Admin login successful');
      console.log('   Admin:', result.admin?.username);
      console.log('   Token:', result.token?.substring(0, 30) + '...');
    } else {
      console.log('   ❌ Admin login failed:', result);
    }
    callback();
  });
}

function testEndpointAvailability() {
  const endpoints = [
    '/api/auth/user/login',
    '/api/admin/login',
    '/api/admin/users',
    '/api/users/user-angela-1758195715/balance'
  ];
  
  console.log('   Testing endpoint availability:');
  
  endpoints.forEach((endpoint, index) => {
    setTimeout(() => {
      makeRequest('GET', endpoint, null, (result, statusCode) => {
        if (statusCode === 404) {
          console.log(`   ❌ ${endpoint} - Not Found (404)`);
        } else if (statusCode === 405) {
          console.log(`   ✅ ${endpoint} - Method Not Allowed (405) - Endpoint exists`);
        } else if (statusCode === 200) {
          console.log(`   ✅ ${endpoint} - OK (200)`);
        } else {
          console.log(`   ⚠️ ${endpoint} - Status: ${statusCode}`);
        }
        
        if (index === endpoints.length - 1) {
          console.log('\n🔍 Checking server logs for more details...');
        }
      });
    }, index * 500);
  });
}

function makeRequest(method, path, postData, callback) {
  const options = {
    hostname: 'localhost',
    port: 3005,
    path: path,
    method: method,
    headers: {}
  };
  
  if (postData) {
    options.headers['Content-Type'] = 'application/json';
    options.headers['Content-Length'] = Buffer.byteLength(postData);
  }
  
  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      try {
        const result = JSON.parse(data);
        callback(result, res.statusCode);
      } catch (e) {
        callback(data, res.statusCode);
      }
    });
  });
  
  req.on('error', (error) => {
    console.error(`   ❌ Connection error for ${path}:`, error.message);
    callback(null, 0);
  });
  
  if (postData) {
    req.write(postData);
  }
  req.end();
}

testLoginEndpoints();
