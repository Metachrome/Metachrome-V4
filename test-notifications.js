// Test script to demonstrate mobile and desktop notifications
// Run this in the browser console to test both notification types

console.log('🧪 Testing Mobile and Desktop Trade Notifications');

// Test data for winning trade
const winningTrade = {
  id: 'test-win-' + Date.now(),
  direction: 'up',
  amount: 1600,
  entryPrice: 116944.00,
  finalPrice: 116946.98,
  status: 'won',
  payout: 1760,
  profitPercentage: 10
};

// Test data for losing trade
const losingTrade = {
  id: 'test-lose-' + Date.now(),
  direction: 'down',
  amount: 500,
  entryPrice: 116944.00,
  finalPrice: 116946.98,
  status: 'lost',
  payout: 0,
  profitPercentage: 10
};

// Function to test mobile notification
function testMobileNotification() {
  console.log('📱 Testing Mobile Notification (Full Screen Modal)');
  
  // Store winning trade for mobile test
  localStorage.setItem('completedTrade', JSON.stringify(winningTrade));
  
  // Dispatch custom event
  const event = new CustomEvent('forceTradeNotification', {
    detail: winningTrade
  });
  window.dispatchEvent(event);
  
  console.log('✅ Mobile notification test triggered');
  console.log('📊 Trade data:', winningTrade);
}

// Function to test desktop notification
function testDesktopNotification() {
  console.log('🖥️ Testing Desktop Notification (Top-right Corner)');
  
  // Store losing trade for desktop test
  localStorage.setItem('completedTrade', JSON.stringify(losingTrade));
  
  // Dispatch custom event
  const event = new CustomEvent('forceTradeNotification', {
    detail: losingTrade
  });
  window.dispatchEvent(event);
  
  console.log('✅ Desktop notification test triggered');
  console.log('📊 Trade data:', losingTrade);
}

// Function to simulate mobile device
function simulateMobile() {
  console.log('📱 Simulating mobile device...');

  // Resize window to mobile size first
  if (window.resizeTo) {
    window.resizeTo(375, 812);
  }

  // Force mobile detection by triggering resize event
  window.dispatchEvent(new Event('resize'));

  console.log('✅ Mobile simulation active');
  console.log('📱 Window size:', window.innerWidth, 'x', window.innerHeight);
  console.log('📱 User agent:', navigator.userAgent);
  console.log('📱 Touch points:', navigator.maxTouchPoints || 0);

  // Check if mobile hook detects mobile
  setTimeout(() => {
    console.log('📱 Mobile detection check after resize...');
    console.log('📱 Current window width:', window.innerWidth);
    console.log('📱 Should be mobile (width < 768):', window.innerWidth < 768);
  }, 500);
}

// Function to simulate desktop device
function simulateDesktop() {
  console.log('🖥️ Simulating desktop device...');
  
  // Override user agent
  Object.defineProperty(navigator, 'userAgent', {
    value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    writable: false
  });
  
  // Resize window to desktop size
  window.resizeTo(1920, 1080);
  
  // Remove touch support
  Object.defineProperty(navigator, 'maxTouchPoints', {
    value: 0,
    writable: false
  });
  
  console.log('✅ Desktop simulation active');
  console.log('🖥️ Window size:', window.innerWidth, 'x', window.innerHeight);
  console.log('🖥️ User agent:', navigator.userAgent);
  console.log('🖥️ Touch points:', navigator.maxTouchPoints);
}

// Function to force mobile notification (bypass detection)
function forceMobileNotification() {
  console.log('🔧 Force testing mobile notification...');

  // Create a test trade
  const testTrade = {
    id: 'force-mobile-' + Date.now(),
    direction: 'up',
    amount: 1600,
    entryPrice: 116944.00,
    finalPrice: 116946.98,
    status: 'won',
    payout: 1760,
    profitPercentage: 10
  };

  // Store in localStorage
  localStorage.setItem('completedTrade', JSON.stringify(testTrade));

  // Force page refresh to trigger notification
  console.log('🔄 Refreshing page to trigger mobile notification...');
  setTimeout(() => {
    window.location.reload();
  }, 1000);
}

// Function to check current mobile detection status
function checkMobileDetection() {
  console.log('🔍 Current Mobile Detection Status:');
  console.log('📱 Window width:', window.innerWidth);
  console.log('📱 Window height:', window.innerHeight);
  console.log('📱 User agent:', navigator.userAgent);
  console.log('📱 Max touch points:', navigator.maxTouchPoints || 0);
  console.log('📱 Touch start support:', 'ontouchstart' in window);
  console.log('📱 Should be mobile (width < 768):', window.innerWidth < 768);

  // Check if mobile elements exist
  const mobileElements = document.querySelectorAll('[class*="mobile"]');
  console.log('📱 Mobile elements found:', mobileElements.length);

  // Check for mobile layout
  const mobileLayout = document.querySelector('.mobile-layout, [class*="mobile-layout"]');
  console.log('📱 Mobile layout detected:', !!mobileLayout);
}

// Main test function
function runNotificationTests() {
  console.log('🚀 Starting Notification Tests...');
  console.log('');
  
  // Test 1: Mobile notification
  console.log('=== TEST 1: MOBILE NOTIFICATION ===');
  simulateMobile();
  setTimeout(() => {
    testMobileNotification();
    
    // Test 2: Desktop notification after 5 seconds
    setTimeout(() => {
      console.log('');
      console.log('=== TEST 2: DESKTOP NOTIFICATION ===');
      simulateDesktop();
      setTimeout(() => {
        testDesktopNotification();
        
        console.log('');
        console.log('✅ All notification tests completed!');
        console.log('📝 Check the UI to see both notification styles:');
        console.log('   📱 Mobile: Full-screen modal with dark theme');
        console.log('   🖥️ Desktop: Top-right corner with gradient background');
      }, 1000);
    }, 5000);
  }, 1000);
}

// Auto-run tests
console.log('🎯 Auto-running notification tests in 2 seconds...');
setTimeout(runNotificationTests, 2000);

// Export functions for manual testing
window.testMobileNotification = testMobileNotification;
window.testDesktopNotification = testDesktopNotification;
window.simulateMobile = simulateMobile;
window.simulateDesktop = simulateDesktop;
window.runNotificationTests = runNotificationTests;
window.forceMobileNotification = forceMobileNotification;
window.checkMobileDetection = checkMobileDetection;

console.log('');
console.log('🛠️ Manual test functions available:');
console.log('   testMobileNotification() - Test mobile notification');
console.log('   testDesktopNotification() - Test desktop notification');
console.log('   simulateMobile() - Switch to mobile mode');
console.log('   simulateDesktop() - Switch to desktop mode');
console.log('   runNotificationTests() - Run all tests');
console.log('   forceMobileNotification() - Force mobile notification');
console.log('   checkMobileDetection() - Check current mobile detection status');
