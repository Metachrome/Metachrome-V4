// TEST SCRIPT FOR NOTIFICATION FIX
// Copy and paste this into the browser console to test the fix

console.log('🧪 NOTIFICATION FIX TEST SCRIPT LOADED');

// Test function to verify the fix
function testNotificationFix() {
  console.log('🧪 TESTING: Starting notification fix verification...');
  
  // Check current device type
  const currentWidth = window.innerWidth;
  const isMobileWidth = currentWidth < 768;
  const isTouchDevice = 'ontouchstart' in window;
  const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  console.log('🧪 DEVICE INFO:', {
    width: currentWidth,
    isMobileWidth,
    isTouchDevice,
    isMobileUserAgent,
    expectedNotificationType: isMobileWidth ? 'MOBILE (full-screen)' : 'DESKTOP (top-right corner)'
  });
  
  // Clear any existing notifications first
  const existingNotifications = document.querySelectorAll('[data-mobile-notification="true"]');
  existingNotifications.forEach(el => el.remove());
  console.log('🧪 CLEARED:', existingNotifications.length, 'existing notifications');
  
  // Create a test trade
  const testTrade = {
    id: 'test-fix-' + Date.now(),
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
  
  console.log('🧪 TEST TRADE:', testTrade);
  
  // Check if we're on the options page
  const isOptionsPage = window.location.pathname.includes('/trade/options');
  if (!isOptionsPage) {
    console.warn('⚠️ WARNING: Not on options page. Navigate to /trade/options for full testing.');
  }
  
  // Test the notification system
  if (typeof window.testDirectNotification === 'function') {
    console.log('🧪 TESTING: Using testDirectNotification function');
    window.testDirectNotification();
  } else if (typeof window.testMobileNotification === 'function') {
    console.log('🧪 TESTING: Using testMobileNotification function');
    window.testMobileNotification();
  } else {
    console.log('🧪 TESTING: Creating manual test notification');
    
    // Manual test - simulate what the fixed system should do
    if (isMobileWidth) {
      console.log('🧪 MOBILE TEST: Should show full-screen mobile notification');
      // This would normally be handled by the TradeNotification component
      console.log('✅ EXPECTED: Full-screen modal notification');
    } else {
      console.log('🧪 DESKTOP TEST: Should show top-right desktop notification');
      console.log('✅ EXPECTED: Top-right corner notification');
    }
  }
  
  // Check for notification conflicts
  setTimeout(() => {
    const mobileNotifications = document.querySelectorAll('[data-mobile-notification="true"]');
    const reactNotifications = document.querySelectorAll('[class*="notification"], [class*="toast"]');
    
    console.log('🧪 CONFLICT CHECK:', {
      mobileNotifications: mobileNotifications.length,
      reactNotifications: reactNotifications.length,
      total: mobileNotifications.length + reactNotifications.length
    });
    
    if (mobileNotifications.length > 1) {
      console.error('❌ ISSUE: Multiple mobile notifications detected!');
    } else if (mobileNotifications.length === 1 && reactNotifications.length > 0) {
      console.error('❌ ISSUE: Both mobile and desktop notifications detected!');
    } else {
      console.log('✅ SUCCESS: No notification conflicts detected');
    }
  }, 1000);
}

// Test device detection specifically
function testDeviceDetection() {
  console.log('🧪 DEVICE DETECTION TEST');
  
  const tests = [
    { width: 320, expected: 'mobile' },
    { width: 768, expected: 'desktop' },
    { width: 1024, expected: 'desktop' },
    { width: 1920, expected: 'desktop' }
  ];
  
  tests.forEach(test => {
    const isMobile = test.width < 768;
    console.log(`📱 Width ${test.width}px: ${isMobile ? 'MOBILE' : 'DESKTOP'} (expected: ${test.expected})`);
  });
}

// Add functions to window for easy access
window.testNotificationFix = testNotificationFix;
window.testDeviceDetection = testDeviceDetection;

console.log('🧪 AVAILABLE FUNCTIONS:');
console.log('  - testNotificationFix() - Test the notification fix');
console.log('  - testDeviceDetection() - Test device detection logic');
console.log('');
console.log('🚀 RUN: testNotificationFix()');
