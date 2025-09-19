const http = require('http');

function testServerLogs() {
  console.log('🔍 Testing server response and logs...');
  
  // Test a simple endpoint to see if server is responding
  const options = {
    hostname: 'localhost',
    port: 3005,
    path: '/api/admin/users',
    method: 'GET'
  };
  
  const req = http.request(options, (res) => {
    console.log('Server response status:', res.statusCode);
    
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      if (res.statusCode === 200) {
        const users = JSON.parse(data);
        const angela = users.find(u => u.username === 'angela.soenoko');
        if (angela) {
          console.log('✅ Server is responding');
          console.log('Current balance in database:', angela.balance);
          console.log('Trading mode:', angela.trading_mode);
          console.log('Last updated:', angela.updated_at);
        }
      } else {
        console.log('❌ Server error:', data);
      }
    });
  });
  
  req.on('error', (error) => {
    console.error('❌ Connection error:', error.message);
  });
  
  req.end();
}

testServerLogs();
