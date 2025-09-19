const http = require('http');

function testManualCompletion() {
  console.log('🧪 Testing manual trade completion...\n');
  
  // Step 1: Get current balance
  getCurrentBalance((initialBalance) => {
    console.log(`💰 Initial balance: $${initialBalance}`);
    
    // Step 2: Manually complete a trade
    manuallyCompleteTrade(initialBalance);
  });
}

function getCurrentBalance(callback) {
  const options = {
    hostname: 'localhost',
    port: 3005,
    path: '/api/users/user-angela-1758195715/balance',
    method: 'GET',
    headers: {
      'Authorization': 'Bearer user-session-user-angela-1758195715-1758222430881'
    }
  };
  
  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      if (res.statusCode === 200) {
        const result = JSON.parse(data);
        callback(parseFloat(result.balance));
      } else {
        console.log('❌ Failed to get balance:', data);
        callback(0);
      }
    });
  });
  
  req.on('error', (error) => console.error('Balance error:', error.message));
  req.end();
}

function manuallyCompleteTrade(initialBalance) {
  console.log('🎯 Manually completing a trade...');
  
  const postData = JSON.stringify({
    tradeId: 'manual-test-trade-' + Date.now(),
    userId: 'user-angela-1758195715',
    won: false, // Force a loss
    amount: 100,
    payout: 0
  });
  
  const options = {
    hostname: 'localhost',
    port: 3005,
    path: '/api/trades/complete',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      'Authorization': 'Bearer user-session-user-angela-1758195715-1758222430881'
    }
  };
  
  const req = http.request(options, (res) => {
    console.log('Trade completion response status:', res.statusCode);
    
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      console.log('Trade completion response:', data);
      
      if (res.statusCode === 200) {
        try {
          const result = JSON.parse(data);
          console.log('✅ Trade completion successful!');
          console.log('   Won:', result.won);
          console.log('   Balance Change:', result.balanceChange);
          console.log('   New Balance:', result.newBalance);
          console.log('   Trading Mode:', result.tradingMode);
          
          // Wait a moment then check balance
          setTimeout(() => {
            getCurrentBalance((finalBalance) => {
              console.log(`\n💰 Final balance: $${finalBalance}`);
              console.log(`📊 Expected balance: $${initialBalance + result.balanceChange}`);
              console.log(`📊 Actual change: $${finalBalance - initialBalance}`);
              
              if (Math.abs(finalBalance - (initialBalance + result.balanceChange)) < 0.01) {
                console.log('✅ Balance update working correctly!');
              } else {
                console.log('❌ Balance update not working');
              }
            });
          }, 2000);
          
        } catch (e) {
          console.log('Failed to parse completion response');
        }
      } else {
        console.log('❌ Trade completion failed');
      }
    });
  });
  
  req.on('error', (error) => console.error('Completion error:', error.message));
  req.write(postData);
  req.end();
}

testManualCompletion();
