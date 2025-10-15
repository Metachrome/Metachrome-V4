// DEBUG AUTOMATIC MOBILE NOTIFICATIONS
// This script helps debug why automatic mobile notifications aren't working

console.log('🔍 AUTOMATIC NOTIFICATION DEBUG SCRIPT LOADED');

// Test the automatic notification flow
function debugAutomaticNotifications() {
  console.log('🔍 DEBUGGING AUTOMATIC NOTIFICATIONS');
  console.log('====================================');
  
  // Step 1: Check current device detection
  console.log('📱 STEP 1: Device Detection');
  const screenWidth = window.innerWidth;
  const isSmallScreen = screenWidth < 768;
  const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const shouldUseMobile = isSmallScreen || isMobileUserAgent;
  
  console.log('  Screen Width:', screenWidth + 'px');
  console.log('  Is Small Screen (<768px):', isSmallScreen);
  console.log('  Mobile User Agent:', isMobileUserAgent);
  console.log('  Should Use Mobile:', shouldUseMobile);
  
  // Step 2: Check if we're on the right page
  console.log('\n📄 STEP 2: Page Check');
  const isOptionsPage = window.location.pathname.includes('/trade/options');
  console.log('  Current URL:', window.location.href);
  console.log('  Is Options Page:', isOptionsPage);
  
  if (!isOptionsPage) {
    console.warn('⚠️ WARNING: Not on options page. Navigate to /trade/options for testing.');
    return false;
  }
  
  // Step 3: Check React component state
  console.log('\n⚛️ STEP 3: React Component Check');
  
  // Look for the TradeNotification component in the DOM
  const tradeNotifications = document.querySelectorAll('[class*="trade-notification"]');
  console.log('  Trade Notification Elements:', tradeNotifications.length);
  
  // Step 4: Test the triggerNotification function
  console.log('\n🧪 STEP 4: Testing triggerNotification Function');
  
  // Create a test trade
  const testTrade = {
    id: 'debug-test-' + Date.now(),
    direction: 'up',
    amount: 100,
    entryPrice: 50000,
    currentPrice: 51000,
    status: 'won',
    duration: 30,
    profitPercentage: 10,
    payout: 110,
    profit: 10,
    symbol: 'BTC/USDT'
  };
  
  console.log('  Test Trade Created:', testTrade);
  
  // Try to find and call the triggerNotification function
  // This function should be available in the OptionsPage component
  if (typeof window.triggerNotification === 'function') {
    console.log('  ✅ triggerNotification function found');
    console.log('  🧪 Calling triggerNotification...');
    window.triggerNotification(testTrade);
  } else {
    console.log('  ❌ triggerNotification function not found in global scope');
    console.log('  💡 This is normal - the function is inside the React component');
  }
  
  // Step 5: Simulate the notification trigger manually
  console.log('\n🔧 STEP 5: Manual Notification Simulation');
  
  // Try to trigger a notification by simulating what happens when a trade completes
  console.log('  🧪 Simulating trade completion...');
  
  // Check if there are any active trades we can complete
  const activeTradesElements = document.querySelectorAll('[class*="active-trade"], [data-trade-id]');
  console.log('  Active Trade Elements Found:', activeTradesElements.length);
  
  // Step 6: Check console for React component logs
  console.log('\n📋 STEP 6: Console Log Instructions');
  console.log('  Watch the console for these logs when a trade completes:');
  console.log('  - "🔔 TRADE NOTIFICATION: New notification"');
  console.log('  - "🔔 SYSTEM CHECK:"');
  console.log('  - "🔔 BULLETPROOF EFFECT: Checking conditions"');
  console.log('  - "🔔 BULLETPROOF: Creating bulletproof mobile notification"');
  
  return true;
}

// Test by manually triggering the React component
function testReactComponent() {
  console.log('🧪 TESTING REACT COMPONENT DIRECTLY');
  console.log('===================================');
  
  // Create a test trade
  const testTrade = {
    id: 'react-test-' + Date.now(),
    direction: 'down',
    amount: 200,
    entryPrice: 45000,
    currentPrice: 44000,
    status: 'lost',
    duration: 60,
    profitPercentage: 15,
    payout: 0,
    profit: -200,
    symbol: 'ETH/USDT'
  };
  
  console.log('📊 Test Trade:', testTrade);
  
  // Try to find the React component and trigger it
  // We'll do this by dispatching a custom event that the component might listen to
  const event = new CustomEvent('testTradeNotification', {
    detail: testTrade
  });
  
  document.dispatchEvent(event);
  console.log('📡 Custom event dispatched');
  
  // Also try to set localStorage to trigger the component
  localStorage.setItem('completedTrade', JSON.stringify(testTrade));
  console.log('💾 Test trade saved to localStorage');
  
  // Trigger a storage event
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'completedTrade',
    newValue: JSON.stringify(testTrade)
  }));
  console.log('📡 Storage event dispatched');
  
  // Check if notification appeared
  setTimeout(() => {
    const mobileNotifications = document.querySelectorAll('[data-mobile-notification="true"]');
    const desktopNotifications = document.querySelectorAll('.trade-notification');
    
    console.log('🔍 RESULT CHECK:');
    console.log('  Mobile Notifications:', mobileNotifications.length);
    console.log('  Desktop Notifications:', desktopNotifications.length);
    
    if (mobileNotifications.length > 0) {
      console.log('✅ SUCCESS: Mobile notification appeared!');
    } else if (desktopNotifications.length > 0) {
      console.log('⚠️ PARTIAL: Desktop notification appeared (should be mobile)');
    } else {
      console.log('❌ FAILED: No notifications appeared');
    }
  }, 1000);
}

// Monitor for automatic notifications
function monitorNotifications() {
  console.log('👁️ MONITORING NOTIFICATIONS');
  console.log('============================');
  
  // Set up a mutation observer to watch for notification elements
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          
          // Check for mobile notifications
          if (element.getAttribute && element.getAttribute('data-mobile-notification') === 'true') {
            console.log('👁️ DETECTED: Mobile notification added to DOM!', element);
          }
          
          // Check for desktop notifications
          if (element.classList && element.classList.contains('trade-notification')) {
            console.log('👁️ DETECTED: Desktop notification added to DOM!', element);
          }
          
          // Check for any notification-related elements
          if (element.id && element.id.includes('notification')) {
            console.log('👁️ DETECTED: Notification element added:', element.id, element);
          }
        }
      });
    });
  });
  
  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  console.log('👁️ MONITORING: Started watching for notification elements');
  console.log('💡 TIP: Complete a trade and watch the console for detection logs');
  
  // Stop monitoring after 60 seconds
  setTimeout(() => {
    observer.disconnect();
    console.log('👁️ MONITORING: Stopped after 60 seconds');
  }, 60000);
  
  return observer;
}

// Add functions to window
window.debugAutomaticNotifications = debugAutomaticNotifications;
window.testReactComponent = testReactComponent;
window.monitorNotifications = monitorNotifications;

console.log('🧪 AVAILABLE DEBUG FUNCTIONS:');
console.log('  - debugAutomaticNotifications() - Full debug analysis');
console.log('  - testReactComponent() - Test React component directly');
console.log('  - monitorNotifications() - Monitor for notification creation');
console.log('');
console.log('🚀 RECOMMENDED: debugAutomaticNotifications()');
console.log('👁️ THEN RUN: monitorNotifications()');
console.log('🧪 THEN COMPLETE A TRADE TO SEE WHAT HAPPENS');
