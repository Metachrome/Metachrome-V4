const http = require('http');

function testAllAuthEndpoints() {
  console.log('🔐 Testing all auth endpoints...\n');
  
  const endpoints = [
    '/api/auth',
    '/api/auth/login', 
    '/api/auth/user/login'
  ];
  
  const credentials = {
    username: 'angela.soenoko',
    password: 'newpass123'
  };
  
  endpoints.forEach((endpoint, index) => {
    setTimeout(() => {
      testEndpoint(endpoint, credentials);
    }, index * 2000);
  });
}

function testEndpoint(endpoint, credentials) {
  console.log(`\n🔐 Testing ${endpoint}...`);
  
  const postData = JSON.stringify(credentials);
  
  const options = {
    hostname: 'localhost',
    port: 3005,
    path: endpoint,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  
  const req = http.request(options, (res) => {
    console.log(`${endpoint} - Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      if (res.statusCode === 200) {
        try {
          const result = JSON.parse(data);
          console.log(`✅ ${endpoint} - SUCCESS!`);
          console.log(`   Token: ${result.token?.substring(0, 30)}...`);
          console.log(`   User: ${result.user?.username} (${result.user?.email})`);
          console.log(`   Balance: $${result.user?.balance}`);
        } catch (e) {
          console.log(`✅ ${endpoint} - SUCCESS (non-JSON response)`);
          console.log(`   Response: ${data}`);
        }
      } else {
        console.log(`❌ ${endpoint} - FAILED`);
        console.log(`   Response: ${data}`);
      }
    });
  });
  
  req.on('error', (error) => {
    console.error(`❌ ${endpoint} - Connection error:`, error.message);
  });
  
  req.write(postData);
  req.end();
}

testAllAuthEndpoints();
