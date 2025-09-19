const http = require('http');

function testDirectBalanceUpdate() {
  console.log('🔧 Testing direct balance update via superadmin...');
  
  // Use the superadmin deposit endpoint to update balance
  const postData = JSON.stringify({
    userId: 'user-angela-1758195715',
    amount: 100
  });
  
  const options = {
    hostname: 'localhost',
    port: 3005,
    path: '/api/superadmin/deposit',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  
  const req = http.request(options, (res) => {
    console.log('Deposit response status:', res.statusCode);
    
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      console.log('Deposit response:', data);
      
      if (res.statusCode === 200) {
        console.log('✅ Deposit successful!');
        
        // Check balance after deposit
        setTimeout(() => {
          checkBalance();
        }, 2000);
      } else {
        console.log('❌ Deposit failed');
      }
    });
  });
  
  req.on('error', (error) => console.error('Deposit error:', error.message));
  req.write(postData);
  req.end();
}

function checkBalance() {
  console.log('\n💰 Checking balance after deposit...');
  
  const options = {
    hostname: 'localhost',
    port: 3005,
    path: '/api/admin/users',
    method: 'GET'
  };
  
  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      if (res.statusCode === 200) {
        const users = JSON.parse(data);
        const angela = users.find(u => u.username === 'angela.soenoko');
        if (angela) {
          console.log('✅ Current balance:', angela.balance);
          console.log('✅ Last updated:', angela.updated_at);
          
          if (angela.balance > 37400) {
            console.log('✅ Direct balance update works!');
            console.log('The issue is specifically with the trade completion balance update.');
          } else {
            console.log('❌ Even direct balance update is not working');
          }
        }
      }
    });
  });
  
  req.on('error', (error) => console.error('Balance check error:', error.message));
  req.end();
}

testDirectBalanceUpdate();
