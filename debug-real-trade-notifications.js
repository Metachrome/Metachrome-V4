// Debug Real Trade Notifications
console.log('🔍 DEBUGGING REAL TRADE NOTIFICATIONS');
console.log('====================================');

// Check WebSocket connection status
function checkWebSocketConnection() {
  console.log('🔌 WEBSOCKET CONNECTION CHECK:');
  
  // Check if useWebSocket hook is working
  const wsElements = document.querySelectorAll('[data-websocket]');
  console.log('  WebSocket elements found:', wsElements.length);
  
  // Check for WebSocket in global scope
  const hasWebSocket = typeof WebSocket !== 'undefined';
  console.log('  WebSocket API available:', hasWebSocket);
  
  // Check for active WebSocket connections
  if (window.performance && window.performance.getEntriesByType) {
    const resources = window.performance.getEntriesByType('resource');
    const wsResources = resources.filter(r => r.name.includes('ws://') || r.name.includes('wss://'));
    console.log('  WebSocket resources:', wsResources.length);
  }
  
  return hasWebSocket;
}

// Check user authentication and ID
function checkUserAuth() {
  console.log('👤 USER AUTHENTICATION CHECK:');
  
  // Check localStorage for auth token
  const authToken = localStorage.getItem('authToken');
  console.log('  Auth token exists:', !!authToken);
  if (authToken) {
    console.log('  Auth token preview:', authToken.substring(0, 20) + '...');
  }
  
  // Check for user data in localStorage
  const userData = localStorage.getItem('user');
  if (userData) {
    try {
      const user = JSON.parse(userData);
      console.log('  User ID:', user.id);
      console.log('  Username:', user.username);
      console.log('  Email:', user.email);
      return user;
    } catch (e) {
      console.log('  User data parse error:', e.message);
    }
  } else {
    console.log('  No user data in localStorage');
  }
  
  return null;
}

// Check active trades
function checkActiveTrades() {
  console.log('📊 ACTIVE TRADES CHECK:');
  
  // Look for active trades in React state (if accessible)
  const tradeElements = document.querySelectorAll('[data-trade-id]');
  console.log('  Trade elements in DOM:', tradeElements.length);
  
  tradeElements.forEach((el, index) => {
    const tradeId = el.getAttribute('data-trade-id');
    console.log(`  Trade ${index + 1}: ${tradeId}`);
  });
  
  // Check localStorage for trade data
  const completedTrade = localStorage.getItem('completedTrade');
  if (completedTrade) {
    try {
      const trade = JSON.parse(completedTrade);
      console.log('  Last completed trade:', trade.id, trade.status);
    } catch (e) {
      console.log('  Completed trade parse error:', e.message);
    }
  }
}

// Monitor WebSocket messages
function monitorWebSocketMessages() {
  console.log('📡 MONITORING WEBSOCKET MESSAGES:');
  
  // Override WebSocket constructor to monitor messages
  const originalWebSocket = window.WebSocket;
  let messageCount = 0;
  
  window.WebSocket = function(url, protocols) {
    console.log('🔌 New WebSocket connection:', url);
    const ws = new originalWebSocket(url, protocols);
    
    const originalOnMessage = ws.onmessage;
    ws.onmessage = function(event) {
      messageCount++;
      console.log(`📨 WebSocket Message #${messageCount}:`, event.data);
      
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'trade_completed') {
          console.log('🎯 TRADE COMPLETION MESSAGE DETECTED:', data);
        }
      } catch (e) {
        console.log('📨 Non-JSON message:', event.data);
      }
      
      if (originalOnMessage) {
        originalOnMessage.call(this, event);
      }
    };
    
    return ws;
  };
  
  console.log('✅ WebSocket monitoring enabled');
}

// Test notification trigger manually
function testNotificationTrigger() {
  console.log('🧪 TESTING NOTIFICATION TRIGGER:');
  
  // Check if triggerNotification function is available
  if (typeof window.testDirectNotification === 'function') {
    console.log('  Using testDirectNotification...');
    window.testDirectNotification();
    return true;
  }
  
  if (typeof window.testMobileNotificationNow === 'function') {
    console.log('  Using testMobileNotificationNow...');
    window.testMobileNotificationNow();
    return true;
  }
  
  if (typeof window.forceMobileNotification === 'function') {
    console.log('  Using forceMobileNotification...');
    window.forceMobileNotification();
    return true;
  }
  
  console.log('  No test functions available');
  return false;
}

// Simulate a trade completion message
function simulateTradeCompletion() {
  console.log('🎭 SIMULATING TRADE COMPLETION MESSAGE:');
  
  const user = checkUserAuth();
  if (!user) {
    console.log('  ❌ Cannot simulate - no user data');
    return;
  }
  
  // Create a mock trade completion message
  const mockMessage = {
    type: 'trade_completed',
    data: {
      tradeId: 'debug-trade-' + Date.now(),
      userId: user.id,
      result: 'win',
      exitPrice: 51000,
      profitAmount: 10,
      newBalance: 1000,
      timestamp: new Date().toISOString()
    }
  };
  
  console.log('  Mock message:', mockMessage);
  
  // Try to trigger the message handler directly
  try {
    // Dispatch a custom event
    const event = new CustomEvent('websocket-message', {
      detail: mockMessage
    });
    document.dispatchEvent(event);
    console.log('  ✅ Custom event dispatched');
  } catch (e) {
    console.log('  ❌ Event dispatch error:', e.message);
  }
}

// Check for console errors
function checkConsoleErrors() {
  console.log('🚨 CONSOLE ERROR CHECK:');
  
  // Override console.error to catch errors
  const originalError = console.error;
  let errorCount = 0;
  
  console.error = function(...args) {
    errorCount++;
    console.log(`❌ Error #${errorCount}:`, ...args);
    originalError.apply(console, args);
  };
  
  console.log('✅ Error monitoring enabled');
}

// Run all checks
function runAllChecks() {
  console.log('\n🔍 RUNNING ALL DIAGNOSTIC CHECKS...\n');
  
  checkWebSocketConnection();
  console.log('\n');
  
  const user = checkUserAuth();
  console.log('\n');
  
  checkActiveTrades();
  console.log('\n');
  
  monitorWebSocketMessages();
  console.log('\n');
  
  checkConsoleErrors();
  console.log('\n');
  
  const testWorked = testNotificationTrigger();
  console.log('\n');
  
  if (user) {
    simulateTradeCompletion();
  }
  
  console.log('\n✅ DIAGNOSTIC COMPLETE');
  console.log('💡 Now place a real trade and watch the console for messages');
  console.log('💡 Look for "📨 WebSocket Message" and "🎯 TRADE COMPLETION MESSAGE DETECTED"');
}

// Make functions available globally
window.debugTradeNotifications = {
  runAllChecks,
  checkWebSocketConnection,
  checkUserAuth,
  checkActiveTrades,
  monitorWebSocketMessages,
  testNotificationTrigger,
  simulateTradeCompletion,
  checkConsoleErrors
};

// Run the checks
runAllChecks();
