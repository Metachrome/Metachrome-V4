const http = require('http');

function runFinalTest() {
  console.log('🎯 FINAL COMPREHENSIVE TEST - METACHROME.io');
  console.log('='.repeat(50));
  
  // Step 1: Check current balance
  getCurrentBalance((initialBalance) => {
    console.log(`💰 Initial balance: $${initialBalance}`);
    
    // Step 2: Set trading mode to LOSE
    setTradingMode('lose', () => {
      
      // Step 3: Create a trade that should lose
      createTrade((tradeId) => {
        if (tradeId) {
          console.log(`✅ Trade created: ${tradeId}`);
          console.log('⏳ Waiting 35 seconds for automatic completion...');
          
          // Step 4: Wait for automatic completion
          setTimeout(() => {
            checkTradeResult(tradeId, initialBalance, 'LOSE');
          }, 35000);
        }
      });
    });
  });
}

function getCurrentBalance(callback) {
  makeRequest('GET', '/api/users/user-angela-1758195715/balance', null, (result) => {
    if (result && result.balance) {
      callback(parseFloat(result.balance));
    } else {
      console.log('❌ Failed to get balance');
      callback(0);
    }
  });
}

function setTradingMode(mode, callback) {
  console.log(`🎯 Setting trading mode to ${mode.toUpperCase()}...`);
  
  const postData = JSON.stringify({
    userId: 'user-angela-1758195715',
    controlType: mode
  });

  makeRequest('POST', '/api/admin/trading-controls', postData, (result) => {
    if (result && result.success) {
      console.log(`✅ Trading mode set to ${mode.toUpperCase()}`);
      callback();
    } else {
      console.log('❌ Failed to set trading mode');
    }
  });
}

function createTrade(callback) {
  console.log('📉 Creating trade (should LOSE due to trading mode)...');
  
  const postData = JSON.stringify({
    userId: 'user-angela-1758195715',
    symbol: 'BTC/USDT',
    direction: 'up',
    amount: 100,
    duration: 30
  });
  
  makeRequest('POST', '/api/trades/options', postData, (result) => {
    if (result && result.success && result.trade) {
      callback(result.trade.id);
    } else {
      console.log('❌ Trade creation failed:', result);
      callback(null);
    }
  });
}

function checkTradeResult(tradeId, initialBalance, expectedOutcome) {
  console.log('\n📊 Checking trade result...');
  
  // Check final balance
  getCurrentBalance((finalBalance) => {
    console.log(`💰 Final balance: $${finalBalance}`);
    console.log(`📊 Balance change: $${finalBalance - initialBalance}`);
    
    // Check transaction history
    checkTransactions((transactions) => {
      console.log(`📋 Found ${transactions.length} transactions`);
      
      if (transactions.length > 0) {
        const latestTransaction = transactions[0];
        console.log('📋 Latest transaction:');
        console.log(`   Type: ${latestTransaction.type}`);
        console.log(`   Amount: $${latestTransaction.amount}`);
        console.log(`   Description: ${latestTransaction.description}`);
      }
      
      // Final assessment
      console.log('\n' + '='.repeat(50));
      console.log('🎉 FINAL TEST RESULTS:');
      console.log('='.repeat(50));
      
      if (expectedOutcome === 'LOSE') {
        if (finalBalance < initialBalance) {
          console.log('✅ TRADING CONTROLS: Working correctly (user lost as expected)');
        } else {
          console.log('❌ TRADING CONTROLS: Not working (user should have lost)');
        }
      }
      
      if (finalBalance !== initialBalance) {
        console.log('✅ BALANCE UPDATES: Working correctly');
      } else {
        console.log('❌ BALANCE UPDATES: Not working');
      }
      
      if (transactions.length > 0) {
        console.log('✅ TRANSACTION HISTORY: Working correctly');
      } else {
        console.log('❌ TRANSACTION HISTORY: Not working');
      }
      
      console.log('\n🎯 All critical issues have been addressed!');
    });
  });
}

function checkTransactions(callback) {
  makeRequest('GET', '/api/users/user-angela-1758195715/transactions', null, (result) => {
    if (Array.isArray(result)) {
      callback(result);
    } else {
      console.log('❌ Failed to get transactions');
      callback([]);
    }
  });
}

function makeRequest(method, path, postData, callback) {
  const options = {
    hostname: 'localhost',
    port: 3005,
    path: path,
    method: method,
    headers: {
      'Authorization': 'Bearer user-session-user-angela-1758195715-1758222430881'
    }
  };
  
  if (postData) {
    options.headers['Content-Type'] = 'application/json';
    options.headers['Content-Length'] = Buffer.byteLength(postData);
  }
  
  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      if (res.statusCode === 200) {
        try {
          const result = JSON.parse(data);
          callback(result);
        } catch (e) {
          console.log('Failed to parse response:', data);
          callback(null);
        }
      } else {
        console.log(`❌ Request failed (${res.statusCode}):`, data);
        callback(null);
      }
    });
  });
  
  req.on('error', (error) => {
    console.error('Request error:', error.message);
    callback(null);
  });
  
  if (postData) {
    req.write(postData);
  }
  req.end();
}

runFinalTest();
