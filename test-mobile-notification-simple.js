// Simple Mobile Notification Test Script
// Copy and paste this into the browser console on the mobile trading page

console.log('🧪 MOBILE NOTIFICATION TEST: Starting simple test...');

// Test 1: Check if the test button exists
const testButton = document.querySelector('button[style*="position: fixed"][style*="top: 10px"]');
if (testButton) {
  console.log('✅ Test button found:', testButton);
  console.log('🧪 Clicking test button...');
  testButton.click();
} else {
  console.log('❌ Test button not found. Creating manual test...');
  
  // Test 2: Manual notification trigger
  try {
    // Find the React component instance
    const reactRoot = document.querySelector('#root');
    if (reactRoot && reactRoot._reactInternalInstance) {
      console.log('✅ React root found');
    }
    
    // Try to trigger via localStorage (the notification system listens for this)
    const testTrade = {
      id: 'manual-mobile-test-' + Date.now(),
      direction: 'up',
      amount: 100,
      entryPrice: 50000,
      currentPrice: 51000,
      status: 'won',
      payout: 110,
      profitPercentage: 10,
      symbol: 'BTC/USDT',
      duration: 30
    };
    
    console.log('🧪 Setting test trade in localStorage:', testTrade);
    localStorage.setItem('completedTrade', JSON.stringify(testTrade));
    
    // Dispatch custom event
    const event = new CustomEvent('tradeCompleted', {
      detail: testTrade,
      bubbles: true
    });
    
    console.log('🧪 Dispatching tradeCompleted event...');
    document.dispatchEvent(event);
    window.dispatchEvent(event);
    
    // Try to trigger React state update via DOM manipulation
    setTimeout(() => {
      console.log('🧪 Checking if notification appeared...');
      const notification = document.querySelector('[data-mobile-notification="true"]');
      if (notification) {
        console.log('✅ Mobile notification found!', notification);
      } else {
        console.log('❌ Mobile notification not found');
        
        // Check for any notification elements
        const anyNotification = document.querySelector('div[style*="position: fixed"][style*="z-index"]');
        if (anyNotification) {
          console.log('⚠️ Found some fixed positioned element:', anyNotification);
        } else {
          console.log('❌ No fixed positioned elements found');
        }
      }
    }, 1000);
    
  } catch (error) {
    console.error('❌ Manual test failed:', error);
  }
}

// Test 3: Check current page state
console.log('🔍 Current page info:');
console.log('- URL:', window.location.href);
console.log('- User agent:', navigator.userAgent);
console.log('- Screen width:', window.innerWidth);
console.log('- Screen height:', window.innerHeight);
console.log('- Is mobile detected:', window.innerWidth < 768);

// Test 4: Check for React components
setTimeout(() => {
  console.log('🔍 Checking for React components...');
  
  // Look for TradeNotification component
  const tradeNotificationElements = document.querySelectorAll('*');
  let foundReactComponents = 0;
  
  tradeNotificationElements.forEach(el => {
    if (el._reactInternalFiber || el._reactInternalInstance || el.__reactInternalInstance) {
      foundReactComponents++;
    }
  });
  
  console.log('🔍 Found React components:', foundReactComponents);
  
  // Check for notification-related elements
  const notificationElements = document.querySelectorAll('[class*="notification"], [id*="notification"], [data-testid*="notification"]');
  console.log('🔍 Found notification elements:', notificationElements.length, notificationElements);
  
}, 2000);

console.log('🧪 MOBILE NOTIFICATION TEST: Test script completed. Check console for results.');
