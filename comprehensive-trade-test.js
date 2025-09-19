const https = require('https');
const http = require('http');

function fetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;

    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          json: () => Promise.resolve(JSON.parse(data)),
          text: () => Promise.resolve(data),
          status: res.statusCode
        });
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

async function runComprehensiveTest() {
  console.log('🚀 COMPREHENSIVE TRADE TEST STARTING...');
  
  try {
    // Step 1: Check initial trade count
    console.log('\n📊 Step 1: Checking initial trade count...');
    const initialResponse = await fetch('http://localhost:3005/api/users/user-angela-1758195715/trades');
    const initialTrades = await initialResponse.json();
    console.log(`📊 Initial trade count: ${initialTrades.length}`);
    
    // Step 2: Place a new trade
    console.log('\n📈 Step 2: Placing new trade...');
    const tradeData = {
      userId: 'user-angela-1758195715',
      symbol: 'BTCUSDT',
      direction: 'up',
      amount: 100,
      duration: 30
    };
    
    const tradeResponse = await fetch('http://localhost:3005/api/trades/place', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tradeData)
    });
    
    const tradeResult = await tradeResponse.json();
    console.log('✅ Trade response:', JSON.stringify(tradeResult, null, 2));
    
    if (!tradeResult.success) {
      console.log('❌ Trade placement failed!');
      return;
    }
    
    const tradeId = tradeResult.trade.id;
    console.log(`✅ Trade placed successfully with ID: ${tradeId}`);
    
    // Step 3: Check trade count after placement
    console.log('\n📊 Step 3: Checking trade count after placement...');
    const afterPlacementResponse = await fetch('http://localhost:3005/api/users/user-angela-1758195715/trades');
    const afterPlacementTrades = await afterPlacementResponse.json();
    console.log(`📊 Trade count after placement: ${afterPlacementTrades.length}`);
    
    // Find the new trade
    const newTrade = afterPlacementTrades.find(t => t.id === tradeId);
    if (newTrade) {
      console.log('✅ New trade found in database:');
      console.log(`   ID: ${newTrade.id}`);
      console.log(`   Result: ${newTrade.result}`);
      console.log(`   Entry Price: ${newTrade.entry_price}`);
      console.log(`   Amount: ${newTrade.amount}`);
      console.log(`   Created: ${newTrade.created_at}`);
    } else {
      console.log('❌ New trade NOT found in database!');
      return;
    }
    
    // Step 4: Wait for automatic completion
    console.log('\n⏳ Step 4: Waiting 35 seconds for automatic completion...');
    await new Promise(resolve => setTimeout(resolve, 35000));
    
    // Step 5: Check final trade status
    console.log('\n📊 Step 5: Checking final trade status...');
    const finalResponse = await fetch('http://localhost:3005/api/users/user-angela-1758195715/trades');
    const finalTrades = await finalResponse.json();
    console.log(`📊 Final trade count: ${finalTrades.length}`);
    
    const finalTrade = finalTrades.find(t => t.id === tradeId);
    if (finalTrade) {
      console.log('✅ Trade found in final results:');
      console.log(`   ID: ${finalTrade.id}`);
      console.log(`   Result: ${finalTrade.result}`);
      console.log(`   Entry Price: ${finalTrade.entry_price}`);
      console.log(`   Exit Price: ${finalTrade.exit_price}`);
      console.log(`   Profit/Loss: ${finalTrade.profit_loss}`);
      console.log(`   Updated: ${finalTrade.updated_at}`);
      
      if (finalTrade.result === 'pending') {
        console.log('❌ FAILED! Trade is still pending after 35 seconds');
        
        // Step 6: Try manual completion
        console.log('\n🔧 Step 6: Attempting manual completion...');
        const completionData = {
          tradeId: tradeId,
          userId: 'user-angela-1758195715',
          won: false,
          amount: 100,
          payout: 0
        };
        
        const completionResponse = await fetch('http://localhost:3005/api/trades/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(completionData)
        });
        
        const completionResult = await completionResponse.json();
        console.log('🔧 Manual completion response:', JSON.stringify(completionResult, null, 2));
        
        // Check trade status after manual completion
        console.log('\n📊 Step 7: Checking trade status after manual completion...');
        const manualResponse = await fetch('http://localhost:3005/api/users/user-angela-1758195715/trades');
        const manualTrades = await manualResponse.json();
        const manualTrade = manualTrades.find(t => t.id === tradeId);
        
        if (manualTrade) {
          console.log('✅ Trade after manual completion:');
          console.log(`   ID: ${manualTrade.id}`);
          console.log(`   Result: ${manualTrade.result}`);
          console.log(`   Exit Price: ${manualTrade.exit_price}`);
          console.log(`   Profit/Loss: ${manualTrade.profit_loss}`);
          console.log(`   Updated: ${manualTrade.updated_at}`);
          
          if (manualTrade.result !== 'pending') {
            console.log('✅ SUCCESS! Manual completion worked');
          } else {
            console.log('❌ FAILED! Manual completion did not update trade');
          }
        }
      } else {
        console.log('✅ SUCCESS! Trade was automatically completed');
      }
    } else {
      console.log('❌ Trade not found in final results');
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

runComprehensiveTest();
