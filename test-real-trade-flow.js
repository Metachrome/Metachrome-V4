// Test Real Trade Notification Flow
console.log('🧪 TESTING REAL TRADE NOTIFICATION FLOW');
console.log('======================================');

// Step 1: Check if we're on the right page
function checkCurrentPage() {
  console.log('📍 PAGE CHECK:');
  console.log('  Current URL:', window.location.href);
  console.log('  Is options page:', window.location.pathname.includes('/trade/options'));
  
  if (!window.location.pathname.includes('/trade/options')) {
    console.log('⚠️ You need to be on the /trade/options page for this test');
    return false;
  }
  return true;
}

// Step 2: Check user authentication
function checkUserAuth() {
  console.log('👤 USER AUTH CHECK:');
  
  const authToken = localStorage.getItem('authToken');
  console.log('  Auth token exists:', !!authToken);
  
  const userData = localStorage.getItem('user');
  if (userData) {
    try {
      const user = JSON.parse(userData);
      console.log('  User ID:', user.id);
      console.log('  Username:', user.username);
      return user;
    } catch (e) {
      console.log('  User data parse error:', e.message);
    }
  }
  
  console.log('❌ No valid user authentication found');
  return null;
}

// Step 3: Test notification functions
function testNotificationFunctions() {
  console.log('🔧 NOTIFICATION FUNCTIONS TEST:');
  
  const functions = {
    simulateRealTradeCompletion: typeof window.simulateRealTradeCompletion === 'function',
    testMobileNotificationNow: typeof window.testMobileNotificationNow === 'function',
    forceMobileNotification: typeof window.forceMobileNotification === 'function',
    testDirectNotification: typeof window.testDirectNotification === 'function'
  };
  
  console.log('  Available functions:', functions);
  
  // Test the simulate function first
  if (functions.simulateRealTradeCompletion) {
    console.log('🧪 Testing simulateRealTradeCompletion...');
    window.simulateRealTradeCompletion();
    return true;
  }
  
  // Fallback to other test functions
  if (functions.testMobileNotificationNow) {
    console.log('🧪 Testing testMobileNotificationNow...');
    window.testMobileNotificationNow();
    return true;
  }
  
  if (functions.forceMobileNotification) {
    console.log('🧪 Testing forceMobileNotification...');
    window.forceMobileNotification();
    return true;
  }
  
  console.log('❌ No test functions available');
  return false;
}

// Step 4: Monitor WebSocket messages
function monitorWebSocketMessages() {
  console.log('📡 WEBSOCKET MONITORING:');
  
  // Check if WebSocket monitoring is already active
  if (window._wsMonitoringActive) {
    console.log('  WebSocket monitoring already active');
    return;
  }
  
  // Set up WebSocket message monitoring
  const originalWebSocket = window.WebSocket;
  let messageCount = 0;
  
  window.WebSocket = function(url, protocols) {
    console.log('🔌 New WebSocket connection to:', url);
    const ws = new originalWebSocket(url, protocols);
    
    // Monitor connection events
    ws.addEventListener('open', () => {
      console.log('✅ WebSocket connected');
    });
    
    ws.addEventListener('close', () => {
      console.log('❌ WebSocket disconnected');
    });
    
    ws.addEventListener('error', (error) => {
      console.log('❌ WebSocket error:', error);
    });
    
    // Monitor messages
    ws.addEventListener('message', (event) => {
      messageCount++;
      console.log(`📨 WebSocket Message #${messageCount}:`, event.data);
      
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'trade_completed') {
          console.log('🎯 TRADE COMPLETION MESSAGE DETECTED!');
          console.log('🎯 Trade ID:', data.data?.tradeId);
          console.log('🎯 User ID:', data.data?.userId);
          console.log('🎯 Result:', data.data?.result);
          console.log('🎯 This should trigger a notification...');
        }
      } catch (e) {
        console.log('📨 Non-JSON message received');
      }
    });
    
    return ws;
  };
  
  window._wsMonitoringActive = true;
  console.log('✅ WebSocket monitoring enabled');
}

// Step 5: Create a test trade
function createTestTrade() {
  console.log('💰 CREATING TEST TRADE:');
  
  // Look for trade creation elements
  const buyButtons = document.querySelectorAll('button[class*="buy"], button[class*="BUY"]');
  console.log('  Buy buttons found:', buyButtons.length);
  
  buyButtons.forEach((btn, index) => {
    console.log(`  Button ${index + 1}:`, btn.textContent?.trim());
  });
  
  if (buyButtons.length > 0) {
    console.log('💡 To create a test trade:');
    console.log('  1. Set a small amount (like $1)');
    console.log('  2. Choose 30s duration');
    console.log('  3. Click BUY UP or BUY DOWN');
    console.log('  4. Watch the console for WebSocket messages');
  } else {
    console.log('❌ No buy buttons found - make sure you\'re on the trading page');
  }
}

// Step 6: Check for existing active trades
function checkActiveTrades() {
  console.log('📊 ACTIVE TRADES CHECK:');
  
  // Look for trade elements in the DOM
  const tradeElements = document.querySelectorAll('[data-trade-id], .trade-item, .active-trade');
  console.log('  Trade elements found:', tradeElements.length);
  
  // Check localStorage for trade data
  const completedTrade = localStorage.getItem('completedTrade');
  if (completedTrade) {
    try {
      const trade = JSON.parse(completedTrade);
      console.log('  Last completed trade:', trade.id, trade.status);
    } catch (e) {
      console.log('  Completed trade parse error');
    }
  } else {
    console.log('  No completed trade in localStorage');
  }
}

// Main test function
function runCompleteTest() {
  console.log('\n🧪 RUNNING COMPLETE TRADE NOTIFICATION TEST...\n');
  
  // Step 1: Check page
  if (!checkCurrentPage()) {
    console.log('❌ Test aborted - wrong page');
    return;
  }
  console.log('\n');
  
  // Step 2: Check auth
  const user = checkUserAuth();
  if (!user) {
    console.log('❌ Test aborted - no authentication');
    return;
  }
  console.log('\n');
  
  // Step 3: Test notification functions
  testNotificationFunctions();
  console.log('\n');
  
  // Step 4: Set up monitoring
  monitorWebSocketMessages();
  console.log('\n');
  
  // Step 5: Check active trades
  checkActiveTrades();
  console.log('\n');
  
  // Step 6: Guide for creating test trade
  createTestTrade();
  
  console.log('\n✅ TEST SETUP COMPLETE');
  console.log('📋 NEXT STEPS:');
  console.log('  1. Create a small test trade ($1, 30s duration)');
  console.log('  2. Watch console for "📨 WebSocket Message" logs');
  console.log('  3. Look for "🎯 TRADE COMPLETION MESSAGE DETECTED"');
  console.log('  4. Check if notification appears after trade completes');
  console.log('\n💡 If no WebSocket messages appear, there may be a connection issue');
  console.log('💡 If messages appear but no notification, there may be a handler issue');
}

// Make functions available globally
window.testRealTradeFlow = {
  runCompleteTest,
  checkCurrentPage,
  checkUserAuth,
  testNotificationFunctions,
  monitorWebSocketMessages,
  createTestTrade,
  checkActiveTrades
};

// Run the test
runCompleteTest();
