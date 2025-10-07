const http = require('http');

// Test the /api/trades endpoint
function testTradesEndpoint() {
  console.log('🧪 Testing /api/trades endpoint...\n');
  
  const postData = JSON.stringify({
    symbol: 'BTCUSDT',
    type: 'options',
    direction: 'up',
    amount: '100',
    duration: 30,
    userId: 'test-user-123'
  });

  const options = {
    hostname: 'localhost',
    port: 3005,
    path: '/api/trades',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers: ${JSON.stringify(res.headers)}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('\nResponse:');
      try {
        const parsed = JSON.parse(data);
        console.log(JSON.stringify(parsed, null, 2));
      } catch (e) {
        console.log(data);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
  });

  req.write(postData);
  req.end();
}

// Test the /api/trades/options endpoint for comparison
function testOptionsEndpoint() {
  console.log('\n🧪 Testing /api/trades/options endpoint...\n');
  
  const postData = JSON.stringify({
    userId: 'test-user-123',
    symbol: 'BTCUSDT',
    direction: 'up',
    amount: '100',
    duration: 30
  });

  const options = {
    hostname: 'localhost',
    port: 3005,
    path: '/api/trades/options',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers: ${JSON.stringify(res.headers)}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('\nResponse:');
      try {
        const parsed = JSON.parse(data);
        console.log(JSON.stringify(parsed, null, 2));
      } catch (e) {
        console.log(data);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
  });

  req.write(postData);
  req.end();
}

// Run tests
console.log('🚀 Starting endpoint tests...\n');
testTradesEndpoint();

setTimeout(() => {
  testOptionsEndpoint();
}, 2000);
