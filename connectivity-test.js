// Connectivity Test Script
// Run this in browser console to diagnose connection issues

console.log('🔍 METACHROME Connectivity Test Starting...');

// Test 1: Check if server is reachable
async function testServerConnection() {
  console.log('📡 Testing server connection...');
  
  try {
    const response = await fetch('/api/health', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      console.log('✅ Server connection: OK');
      return true;
    } else {
      console.log('❌ Server connection: Failed -', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Server connection: Error -', error.message);
    return false;
  }
}

// Test 2: Check WebSocket connection
function testWebSocketConnection() {
  console.log('🔌 Testing WebSocket connection...');
  
  try {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('✅ WebSocket connection: OK');
      ws.close();
    };
    
    ws.onerror = (error) => {
      console.log('❌ WebSocket connection: Error -', error);
    };
    
    ws.onclose = () => {
      console.log('🔌 WebSocket connection: Closed');
    };
    
    // Timeout after 5 seconds
    setTimeout(() => {
      if (ws.readyState === WebSocket.CONNECTING) {
        console.log('⏰ WebSocket connection: Timeout');
        ws.close();
      }
    }, 5000);
    
  } catch (error) {
    console.log('❌ WebSocket connection: Error -', error.message);
  }
}

// Test 3: Check for browser extension conflicts
function testExtensionConflicts() {
  console.log('🧩 Checking for extension conflicts...');
  
  // Check for common extension indicators
  const extensionIndicators = [
    'chrome-extension://',
    'moz-extension://',
    'safari-extension://',
    'edge-extension://'
  ];
  
  let conflictsFound = 0;
  
  // Check for extension scripts in DOM
  const scripts = document.querySelectorAll('script');
  scripts.forEach(script => {
    if (script.src) {
      extensionIndicators.forEach(indicator => {
        if (script.src.includes(indicator)) {
          console.log('🧩 Extension script found:', script.src);
          conflictsFound++;
        }
      });
    }
  });
  
  // Check for extension-injected elements
  const extensionElements = document.querySelectorAll('[id*="extension"], [class*="extension"]');
  if (extensionElements.length > 0) {
    console.log('🧩 Extension elements found:', extensionElements.length);
    conflictsFound += extensionElements.length;
  }
  
  if (conflictsFound === 0) {
    console.log('✅ Extension conflicts: None detected');
  } else {
    console.log(`⚠️ Extension conflicts: ${conflictsFound} potential conflicts found`);
  }
  
  return conflictsFound;
}

// Test 4: Check TradingView widget connectivity
function testTradingViewWidget() {
  console.log('📈 Testing TradingView widget...');
  
  try {
    // Check if TradingView script is loaded
    const tvScript = document.querySelector('script[src*="tradingview"]');
    if (tvScript) {
      console.log('✅ TradingView script: Loaded');
    } else {
      console.log('❌ TradingView script: Not found');
    }
    
    // Check if TradingView widget container exists
    const tvContainer = document.querySelector('#tradingview_widget, [id*="tradingview"]');
    if (tvContainer) {
      console.log('✅ TradingView container: Found');
    } else {
      console.log('❌ TradingView container: Not found');
    }
    
    // Check for TradingView errors in console
    const errors = [];
    const originalError = console.error;
    console.error = function(...args) {
      if (args.some(arg => String(arg).toLowerCase().includes('tradingview'))) {
        errors.push(args.join(' '));
      }
      originalError.apply(console, args);
    };
    
    setTimeout(() => {
      console.error = originalError;
      if (errors.length > 0) {
        console.log('❌ TradingView errors:', errors);
      } else {
        console.log('✅ TradingView errors: None detected');
      }
    }, 3000);
    
  } catch (error) {
    console.log('❌ TradingView test: Error -', error.message);
  }
}

// Test 5: Check notification system
function testNotificationSystem() {
  console.log('🔔 Testing notification system...');
  
  try {
    // Check if TradeNotification component is available
    const notificationElements = document.querySelectorAll('[class*="trade-notification"], [class*="notification"]');
    console.log('🔔 Notification elements found:', notificationElements.length);
    
    // Test mobile detection
    const isMobileWidth = window.innerWidth < 768;
    console.log('📱 Mobile detection (width):', isMobileWidth);
    console.log('📱 Current width:', window.innerWidth);
    
    // Check for mobile elements
    const mobileElements = document.querySelectorAll('[class*="mobile"]');
    console.log('📱 Mobile elements found:', mobileElements.length);
    
    console.log('✅ Notification system: Ready for testing');
    
  } catch (error) {
    console.log('❌ Notification system: Error -', error.message);
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Running all connectivity tests...');
  console.log('');
  
  await testServerConnection();
  testWebSocketConnection();
  testExtensionConflicts();
  testTradingViewWidget();
  testNotificationSystem();
  
  console.log('');
  console.log('✅ Connectivity test completed!');
  console.log('');
  console.log('🛠️ If you see errors above:');
  console.log('   1. Try disabling browser extensions');
  console.log('   2. Check your internet connection');
  console.log('   3. Refresh the page');
  console.log('   4. Try incognito/private mode');
}

// Auto-run tests
setTimeout(runAllTests, 1000);

// Export functions for manual testing
window.testServerConnection = testServerConnection;
window.testWebSocketConnection = testWebSocketConnection;
window.testExtensionConflicts = testExtensionConflicts;
window.testTradingViewWidget = testTradingViewWidget;
window.testNotificationSystem = testNotificationSystem;
window.runAllTests = runAllTests;

console.log('🛠️ Manual test functions available:');
console.log('   testServerConnection() - Test API connectivity');
console.log('   testWebSocketConnection() - Test WebSocket');
console.log('   testExtensionConflicts() - Check for extension issues');
console.log('   testTradingViewWidget() - Test TradingView connectivity');
console.log('   testNotificationSystem() - Test notification system');
console.log('   runAllTests() - Run all tests');
