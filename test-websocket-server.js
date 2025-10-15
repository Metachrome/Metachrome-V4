// Test WebSocket Server and Trade Completion
console.log('🧪 TESTING WEBSOCKET SERVER AND TRADE COMPLETION');
console.log('===============================================');

// Test 1: Check if server has WebSocket endpoint
async function testWebSocketEndpoint() {
  console.log('🔌 TESTING WEBSOCKET ENDPOINT:');
  
  try {
    // Test if the WebSocket endpoint exists
    const wsUrl = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = window.location.host;
    const testWsUrl = `${wsUrl}//${wsHost}/ws`;
    
    console.log('  Testing WebSocket URL:', testWsUrl);
    
    const testWs = new WebSocket(testWsUrl);
    
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        console.log('  ❌ WebSocket connection timeout');
        testWs.close();
        resolve(false);
      }, 5000);
      
      testWs.onopen = () => {
        console.log('  ✅ WebSocket connection successful');
        clearTimeout(timeout);
        testWs.close();
        resolve(true);
      };
      
      testWs.onerror = (error) => {
        console.log('  ❌ WebSocket connection error:', error);
        clearTimeout(timeout);
        resolve(false);
      };
    });
  } catch (error) {
    console.log('  ❌ WebSocket test error:', error);
    return false;
  }
}

// Test 2: Check if server has test notification endpoint
async function testNotificationEndpoint() {
  console.log('📡 TESTING NOTIFICATION ENDPOINT:');
  
  try {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      console.log('  ❌ No auth token found');
      return false;
    }
    
    const userData = localStorage.getItem('user');
    if (!userData) {
      console.log('  ❌ No user data found');
      return false;
    }
    
    const user = JSON.parse(userData);
    console.log('  Testing for user:', user.id);
    
    const response = await fetch('/api/test/websocket-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        userId: user.id
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('  ✅ Test notification endpoint response:', result);
      return true;
    } else {
      console.log('  ❌ Test notification endpoint failed:', response.status);
      return false;
    }
  } catch (error) {
    console.log('  ❌ Test notification endpoint error:', error);
    return false;
  }
}

// Test 3: Create a real test trade
async function createTestTrade() {
  console.log('💰 CREATING TEST TRADE:');
  
  try {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      console.log('  ❌ No auth token found');
      return false;
    }
    
    const userData = localStorage.getItem('user');
    if (!userData) {
      console.log('  ❌ No user data found');
      return false;
    }
    
    const user = JSON.parse(userData);
    console.log('  Creating test trade for user:', user.id);
    
    // Create a small test trade
    const tradeData = {
      userId: user.id,
      symbol: 'BTCUSDT',
      direction: 'up',
      amount: 1, // $1 test trade
      duration: 30, // 30 seconds
      entryPrice: 50000
    };
    
    console.log('  Trade data:', tradeData);
    
    const response = await fetch('/api/trades/options', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(tradeData)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('  ✅ Test trade created:', result);
      console.log('  🕐 Trade will complete in 30 seconds...');
      console.log('  👀 Watch console for WebSocket messages');
      return result;
    } else {
      const error = await response.text();
      console.log('  ❌ Test trade creation failed:', response.status, error);
      return false;
    }
  } catch (error) {
    console.log('  ❌ Test trade creation error:', error);
    return false;
  }
}

// Test 4: Manually trigger trade completion
async function triggerTradeCompletion(tradeId) {
  console.log('🏁 MANUALLY TRIGGERING TRADE COMPLETION:');
  
  try {
    const authToken = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');
    const user = JSON.parse(userData);
    
    const completionData = {
      tradeId: tradeId || 'manual-test-' + Date.now(),
      userId: user.id,
      won: true,
      amount: 1,
      payout: 1.1
    };
    
    console.log('  Completion data:', completionData);
    
    const response = await fetch('/api/trades/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(completionData)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('  ✅ Trade completion triggered:', result);
      console.log('  👀 Check console for WebSocket messages');
      return true;
    } else {
      const error = await response.text();
      console.log('  ❌ Trade completion failed:', response.status, error);
      return false;
    }
  } catch (error) {
    console.log('  ❌ Trade completion error:', error);
    return false;
  }
}

// Test 5: Monitor WebSocket messages for 30 seconds
function monitorWebSocketMessages(duration = 30000) {
  console.log('📡 MONITORING WEBSOCKET MESSAGES FOR', duration / 1000, 'SECONDS:');
  
  let messageCount = 0;
  let tradeCompletionCount = 0;
  
  // Override WebSocket to monitor messages
  const originalWebSocket = window.WebSocket;
  
  window.WebSocket = function(url, protocols) {
    console.log('🔌 New WebSocket connection:', url);
    const ws = new originalWebSocket(url, protocols);
    
    ws.addEventListener('message', (event) => {
      messageCount++;
      console.log(`📨 Message #${messageCount}:`, event.data);
      
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'trade_completed') {
          tradeCompletionCount++;
          console.log(`🎯 TRADE COMPLETION #${tradeCompletionCount}:`, data);
        }
      } catch (e) {
        // Non-JSON message
      }
    });
    
    return ws;
  };
  
  // Restore original WebSocket after monitoring period
  setTimeout(() => {
    window.WebSocket = originalWebSocket;
    console.log(`📊 MONITORING COMPLETE: ${messageCount} total messages, ${tradeCompletionCount} trade completions`);
  }, duration);
  
  console.log('✅ WebSocket monitoring active');
}

// Main test function
async function runCompleteTest() {
  console.log('\n🧪 RUNNING COMPLETE WEBSOCKET AND TRADE TEST...\n');
  
  // Start monitoring first
  monitorWebSocketMessages(60000); // Monitor for 1 minute
  
  // Test WebSocket connection
  const wsWorking = await testWebSocketEndpoint();
  console.log('\n');
  
  // Test notification endpoint
  const notificationWorking = await testNotificationEndpoint();
  console.log('\n');
  
  if (wsWorking && notificationWorking) {
    console.log('✅ Both WebSocket and notification endpoints are working');
    console.log('🧪 Creating test trade...');
    
    const trade = await createTestTrade();
    if (trade) {
      console.log('✅ Test trade created successfully');
      console.log('⏰ Waiting for automatic completion...');
    }
  } else {
    console.log('⚠️ Some endpoints are not working, trying manual completion...');
    await triggerTradeCompletion();
  }
  
  console.log('\n📋 WHAT TO WATCH FOR:');
  console.log('  1. 📨 WebSocket messages in console');
  console.log('  2. 🎯 Trade completion messages');
  console.log('  3. 🚨 TRADE COMPLETION MESSAGE RECEIVED! (from client)');
  console.log('  4. 🔔 Notification trigger messages');
  console.log('\n💡 If no messages appear, there may be a server-side issue');
}

// Make functions available globally
window.testWebSocketServer = {
  runCompleteTest,
  testWebSocketEndpoint,
  testNotificationEndpoint,
  createTestTrade,
  triggerTradeCompletion,
  monitorWebSocketMessages
};

// Run the test
runCompleteTest();
