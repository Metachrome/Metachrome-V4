// Direct test of the trade completion endpoint
const http = require('http');

function testCompletion() {
  console.log('🎯 DIRECT TRADE COMPLETION TEST');
  console.log('='.repeat(50));
  
  const postData = JSON.stringify({
    tradeId: 'test-trade-' + Date.now(),
    userId: 'user-angela-1758195715', // Angela's ID with "lose" mode
    won: true, // This should be overridden to false
    amount: 100,
    payout: 180
  });

  const options = {
    hostname: 'localhost',
    port: 3005,
    path: '/api/trades/complete',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  console.log('📞 Making request to:', `http://${options.hostname}:${options.port}${options.path}`);
  console.log('📦 Request data:', postData);
  console.log('⏳ Waiting for response...\n');

  const req = http.request(options, (res) => {
    console.log(`📊 Response status: ${res.statusCode}`);
    console.log(`📊 Response headers:`, res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('\n📋 Response body:');
      try {
        const response = JSON.parse(data);
        console.log(JSON.stringify(response, null, 2));
        
        console.log('\n🔍 Analysis:');
        console.log(`   Success: ${response.success}`);
        console.log(`   Original Won: true`);
        console.log(`   Final Won: ${response.won}`);
        console.log(`   Trading Mode: ${response.tradingMode}`);
        console.log(`   Override Applied: ${response.overrideApplied}`);
        console.log(`   Balance Change: ${response.balanceChange}`);
        
        if (response.won === false && response.overrideApplied === true) {
          console.log('\n✅ SUCCESS! Trade control is working - trade was forced to lose');
        } else if (response.won === true) {
          console.log('\n❌ FAILURE! Trade control is NOT working - trade won when it should have lost');
        } else {
          console.log('\n⚠️ UNCLEAR RESULT - check the logs above');
        }
        
      } catch (parseError) {
        console.log('Raw response:', data);
        console.log('Parse error:', parseError.message);
      }
      
      console.log('\n' + '='.repeat(50));
      console.log('🎯 TEST COMPLETE');
    });
  });

  req.on('error', (e) => {
    console.error(`❌ Request error: ${e.message}`);
    console.log('\n💡 Make sure the server is running on port 3005');
    console.log('   Run: node working-server.js');
  });

  req.write(postData);
  req.end();
}

// Run the test
testCompletion();
