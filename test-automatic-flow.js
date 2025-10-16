// Test Automatic Notification Flow
console.log('🔍 TESTING AUTOMATIC NOTIFICATION FLOW');
console.log('====================================');

async function testAutomaticFlow() {
  try {
    // Get user data
    const userData = localStorage.getItem('user');
    const user = JSON.parse(userData);
    const authToken = localStorage.getItem('authToken');
    
    console.log('👤 User ID:', user.id);
    console.log('🔑 Auth token exists:', !!authToken);
    
    // Step 1: Create a real trade
    console.log('\n💰 STEP 1: Creating a real trade...');
    
    const tradeData = {
      userId: user.id,
      symbol: 'BTCUSDT',
      direction: 'up',
      amount: 1, // $1 test trade
      duration: 30 // 30 seconds
    };
    
    console.log('📊 Trade data:', tradeData);
    
    const tradeResponse = await fetch('/api/trades/options', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(tradeData)
    });
    
    if (!tradeResponse.ok) {
      const error = await tradeResponse.text();
      console.log('❌ Trade creation failed:', tradeResponse.status, error);
      return;
    }
    
    const tradeResult = await tradeResponse.json();
    console.log('✅ Trade created successfully:', tradeResult);
    console.log('🆔 Trade ID:', tradeResult.id);
    
    // Step 2: Monitor WebSocket messages for 35 seconds
    console.log('\n📡 STEP 2: Monitoring WebSocket messages for 35 seconds...');
    console.log('👀 Watch for trade_completed messages...');
    
    let messageCount = 0;
    let tradeCompletionCount = 0;
    
    // Override WebSocket to monitor messages
    const originalWebSocket = window.WebSocket;
    
    window.WebSocket = function(url, protocols) {
      console.log('🔌 WebSocket connection detected:', url);
      const ws = new originalWebSocket(url, protocols);
      
      ws.addEventListener('message', (event) => {
        messageCount++;
        console.log(`📨 WebSocket Message #${messageCount}:`, event.data);
        
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'trade_completed') {
            tradeCompletionCount++;
            console.log(`🎯 TRADE COMPLETION MESSAGE #${tradeCompletionCount}:`, data);
            console.log('🎯 Trade ID:', data.data?.tradeId);
            console.log('🎯 User ID:', data.data?.userId);
            console.log('🎯 Result:', data.data?.result);
            
            if (data.data?.tradeId === tradeResult.id) {
              console.log('✅ FOUND OUR TRADE COMPLETION MESSAGE!');
            }
          }
        } catch (e) {
          // Non-JSON message
        }
      });
      
      return ws;
    };
    
    // Set up countdown timer
    let countdown = 35;
    const countdownInterval = setInterval(() => {
      countdown--;
      console.log(`⏰ ${countdown} seconds remaining... (Messages: ${messageCount}, Completions: ${tradeCompletionCount})`);
      
      if (countdown <= 0) {
        clearInterval(countdownInterval);
        window.WebSocket = originalWebSocket; // Restore original
        
        console.log('\n📊 MONITORING COMPLETE:');
        console.log(`📨 Total WebSocket messages: ${messageCount}`);
        console.log(`🎯 Trade completion messages: ${tradeCompletionCount}`);
        
        if (tradeCompletionCount === 0) {
          console.log('❌ NO TRADE COMPLETION MESSAGES RECEIVED');
          console.log('💡 This is why automatic notifications don\'t work');
          console.log('💡 The server is not sending trade_completed messages');
          
          // Try manual completion as fallback
          console.log('\n🔧 TRYING MANUAL COMPLETION...');
          testManualCompletion(tradeResult.id, user.id, authToken);
        } else {
          console.log('✅ Trade completion messages are being sent');
          console.log('💡 Check if notifications appeared on screen');
        }
      }
    }, 1000);
    
  } catch (error) {
    console.log('❌ Test error:', error);
  }
}

async function testManualCompletion(tradeId, userId, authToken) {
  try {
    console.log('🔧 Manually completing trade:', tradeId);
    
    const completionResponse = await fetch('/api/trades/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        tradeId: tradeId,
        userId: userId,
        won: true,
        amount: 1,
        payout: 1.1
      })
    });
    
    if (completionResponse.ok) {
      const result = await completionResponse.json();
      console.log('✅ Manual completion successful:', result);
      console.log('👀 Watch for WebSocket message and notification!');
    } else {
      const error = await completionResponse.text();
      console.log('❌ Manual completion failed:', completionResponse.status, error);
    }
  } catch (error) {
    console.log('❌ Manual completion error:', error);
  }
}

// Also test if the server is running and responding
async function testServerStatus() {
  try {
    console.log('\n🌐 TESTING SERVER STATUS...');
    
    const healthResponse = await fetch('/api/balances');
    console.log('Server health check:', healthResponse.status);
    
    if (healthResponse.ok) {
      console.log('✅ Server is responding');
    } else {
      console.log('❌ Server health check failed');
    }
  } catch (error) {
    console.log('❌ Server connection error:', error);
  }
}

// Run the tests
testServerStatus();
testAutomaticFlow();

console.log('\n📋 WHAT THIS TEST WILL SHOW:');
console.log('1. Whether real trades are created successfully');
console.log('2. Whether trade_completed WebSocket messages are sent');
console.log('3. Whether the server-side completion logic is working');
console.log('4. Whether manual completion triggers notifications');
console.log('\n💡 If no trade_completed messages appear:');
console.log('   - The server setTimeout completion is not working');
console.log('   - The completeTradeDirectly function is not being called');
console.log('   - There may be an error in the server-side trade completion logic');
