const http = require('http');

function testBalanceUpdate() {
  console.log('🧪 Testing balance update after trade...\n');
  
  // Step 1: Get current balance
  getCurrentBalance((initialBalance) => {
    console.log(`💰 Initial balance: $${initialBalance}`);
    
    // Step 2: Create a trade
    createTrade((tradeId) => {
      if (tradeId) {
        console.log(`✅ Trade created: ${tradeId}`);
        console.log('⏳ Waiting 35 seconds for trade completion...');
        
        // Step 3: Wait for trade completion and check balance
        setTimeout(() => {
          getCurrentBalance((finalBalance) => {
            console.log(`💰 Final balance: $${finalBalance}`);
            console.log(`📊 Balance change: $${finalBalance - initialBalance}`);
            
            if (finalBalance !== initialBalance) {
              console.log('✅ Balance update working!');
            } else {
              console.log('❌ Balance not updated');
              
              // Check if transaction was created
              checkTransactions();
            }
          });
        }, 35000);
      }
    });
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

function createTrade(callback) {
  const postData = JSON.stringify({
    userId: 'user-angela-1758195715',
    symbol: 'BTC/USDT',
    direction: 'up',
    amount: 100,
    duration: 30
  });
  
  const options = {
    hostname: 'localhost',
    port: 3005,
    path: '/api/trades/options',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      'Authorization': 'Bearer user-session-user-angela-1758195715-1758222430881'
    }
  };
  
  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      if (res.statusCode === 200) {
        const result = JSON.parse(data);
        if (result.success) {
          callback(result.trade.id);
        } else {
          console.log('❌ Trade creation failed:', result.message);
          callback(null);
        }
      } else {
        console.log('❌ Trade creation error:', data);
        callback(null);
      }
    });
  });
  
  req.on('error', (error) => console.error('Trade error:', error.message));
  req.write(postData);
  req.end();
}

function checkTransactions() {
  console.log('\n📊 Checking recent transactions...');
  
  const options = {
    hostname: 'localhost',
    port: 3005,
    path: '/api/users/user-angela-1758195715/transactions',
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
        const transactions = JSON.parse(data);
        console.log(`✅ Found ${transactions.length} transactions`);
        
        if (transactions.length > 0) {
          console.log('📋 Latest transaction:');
          const latest = transactions[0];
          console.log(`   Type: ${latest.type}`);
          console.log(`   Amount: $${latest.amount}`);
          console.log(`   Description: ${latest.description}`);
          console.log(`   Created: ${latest.created_at}`);
        }
      } else {
        console.log('❌ Failed to get transactions:', data);
      }
    });
  });
  
  req.on('error', (error) => console.error('Transaction error:', error.message));
  req.end();
}

testBalanceUpdate();
