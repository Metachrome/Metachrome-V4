// MOBILE NOTIFICATION DEBUG TEST SCRIPT
// Copy and paste this into the browser console to debug mobile notification issues

console.log('🧪 MOBILE NOTIFICATION DEBUG SCRIPT LOADED');

// Comprehensive mobile detection test
function debugMobileDetection() {
  console.log('🧪 MOBILE DETECTION DEBUG');
  console.log('========================');
  
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const isSmallScreen = screenWidth < 768;
  const isTouchDevice = 'ontouchstart' in window;
  const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isReallySmallScreen = screenWidth < 600;
  
  // Current logic from the component
  const currentLogic = isSmallScreen || isMobileUserAgent || (isSmallScreen && isTouchDevice);
  
  console.log('📱 DEVICE INFO:', {
    screenWidth,
    screenHeight,
    userAgent: navigator.userAgent,
    isSmallScreen: `${isSmallScreen} (width < 768)`,
    isTouchDevice: `${isTouchDevice} ('ontouchstart' in window)`,
    isMobileUserAgent: `${isMobileUserAgent} (regex test)`,
    isReallySmallScreen: `${isReallySmallScreen} (width < 600)`,
    currentLogic: `${currentLogic} (should use mobile)`
  });
  
  // Test different detection methods
  console.log('🔍 DETECTION METHODS:');
  console.log('  Method 1 (width only):', screenWidth < 768);
  console.log('  Method 2 (user agent only):', isMobileUserAgent);
  console.log('  Method 3 (touch only):', isTouchDevice);
  console.log('  Method 4 (width + touch):', isSmallScreen && isTouchDevice);
  console.log('  Method 5 (strict mobile):', isSmallScreen && isTouchDevice && isMobileUserAgent);
  console.log('  Current logic result:', currentLogic);
  
  return currentLogic;
}

// Test mobile notification display
function testMobileNotificationDisplay() {
  console.log('🧪 MOBILE NOTIFICATION DISPLAY TEST');
  console.log('===================================');
  
  // Check if mobile notification functions are available
  const hasMobileTest = typeof window.testMobileNotification === 'function';
  const hasForceTest = typeof window.forceMobileNotification === 'function';
  
  console.log('📋 AVAILABLE FUNCTIONS:', {
    testMobileNotification: hasMobileTest,
    forceMobileNotification: hasForceTest
  });
  
  if (!hasMobileTest && !hasForceTest) {
    console.error('❌ ERROR: Mobile notification test functions not found!');
    console.log('💡 TIP: Make sure you\'re on the options page (/trade/options)');
    return false;
  }
  
  // Clear any existing notifications
  const existing = document.querySelectorAll('[data-mobile-notification="true"]');
  existing.forEach(el => el.remove());
  console.log('🧹 CLEARED:', existing.length, 'existing notifications');
  
  // Test device detection first
  const shouldUseMobile = debugMobileDetection();
  
  if (shouldUseMobile) {
    console.log('✅ DEVICE DETECTION: Should use mobile notification');
    if (hasMobileTest) {
      console.log('🧪 TESTING: Calling testMobileNotification()...');
      window.testMobileNotification();
    }
  } else {
    console.log('⚠️ DEVICE DETECTION: Should use desktop notification');
    console.log('🧪 TESTING: Forcing mobile notification anyway...');
    if (hasForceTest) {
      window.forceMobileNotification();
    }
  }
  
  // Check if notification appeared
  setTimeout(() => {
    const mobileNotifications = document.querySelectorAll('[data-mobile-notification="true"]');
    console.log('🔍 RESULT CHECK:', {
      mobileNotificationsFound: mobileNotifications.length,
      success: mobileNotifications.length > 0
    });
    
    if (mobileNotifications.length > 0) {
      console.log('✅ SUCCESS: Mobile notification is visible!');
      mobileNotifications.forEach((notif, index) => {
        const styles = window.getComputedStyle(notif);
        console.log(`📍 Notification ${index + 1} styles:`, {
          display: styles.display,
          visibility: styles.visibility,
          opacity: styles.opacity,
          zIndex: styles.zIndex,
          position: styles.position
        });
      });
    } else {
      console.error('❌ FAILED: Mobile notification not visible');
      console.log('🔍 DEBUGGING: Checking for any notification elements...');
      
      // Check for any notification-related elements
      const allNotifications = document.querySelectorAll('[id*="notification"], [class*="notification"], [data-notification]');
      console.log('📋 ALL NOTIFICATIONS:', allNotifications.length);
      allNotifications.forEach((el, index) => {
        console.log(`  ${index + 1}:`, el.tagName, el.id, el.className);
      });
    }
  }, 500);
  
  return true;
}

// Test mobile notification creation manually
function manualMobileNotificationTest() {
  console.log('🧪 MANUAL MOBILE NOTIFICATION TEST');
  console.log('==================================');
  
  // Create test trade data
  const testTrade = {
    id: 'manual-test-' + Date.now(),
    direction: 'up',
    amount: 150,
    entryPrice: 48000,
    finalPrice: 49000,
    status: 'won',
    payout: 165,
    profitPercentage: 10,
    symbol: 'BTC/USDT',
    duration: 30
  };
  
  console.log('📊 TEST TRADE:', testTrade);
  
  // Try to call the mobile notification function directly
  try {
    // Check if the function is available
    if (typeof showMobileTradeNotification !== 'undefined') {
      console.log('🧪 CALLING: showMobileTradeNotification directly');
      showMobileTradeNotification(testTrade);
    } else {
      console.log('⚠️ WARNING: showMobileTradeNotification not in global scope');
      console.log('💡 TIP: This function is in a module, use the test functions instead');
    }
  } catch (error) {
    console.error('❌ ERROR calling showMobileTradeNotification:', error);
  }
  
  // Check result
  setTimeout(() => {
    const notifications = document.querySelectorAll('[data-mobile-notification="true"]');
    console.log('🔍 MANUAL TEST RESULT:', notifications.length > 0 ? 'SUCCESS' : 'FAILED');
  }, 300);
}

// Comprehensive mobile notification debug
function fullMobileNotificationDebug() {
  console.log('🚀 FULL MOBILE NOTIFICATION DEBUG');
  console.log('=================================');
  
  // Step 1: Device detection
  console.log('📱 STEP 1: Device Detection');
  const shouldUseMobile = debugMobileDetection();
  
  // Step 2: Function availability
  console.log('\n📋 STEP 2: Function Availability');
  console.log('testMobileNotification:', typeof window.testMobileNotification);
  console.log('forceMobileNotification:', typeof window.forceMobileNotification);
  
  // Step 3: Current page check
  console.log('\n📄 STEP 3: Current Page');
  console.log('URL:', window.location.href);
  console.log('Is Options Page:', window.location.pathname.includes('/trade/options'));
  
  // Step 4: Existing notifications
  console.log('\n🔍 STEP 4: Existing Notifications');
  const existing = document.querySelectorAll('[data-mobile-notification="true"]');
  console.log('Existing mobile notifications:', existing.length);
  
  // Step 5: Test notification
  console.log('\n🧪 STEP 5: Testing Notification');
  testMobileNotificationDisplay();
}

// Add functions to window for easy access
window.debugMobileDetection = debugMobileDetection;
window.testMobileNotificationDisplay = testMobileNotificationDisplay;
window.manualMobileNotificationTest = manualMobileNotificationTest;
window.fullMobileNotificationDebug = fullMobileNotificationDebug;

console.log('🧪 AVAILABLE DEBUG FUNCTIONS:');
console.log('  - debugMobileDetection() - Test device detection logic');
console.log('  - testMobileNotificationDisplay() - Test notification display');
console.log('  - manualMobileNotificationTest() - Manual notification test');
console.log('  - fullMobileNotificationDebug() - Complete debug sequence');
console.log('');
// Quick test for immediate mobile notification
function quickMobileTest() {
  console.log('🚀 QUICK MOBILE TEST');
  console.log('===================');

  // Force mobile notification regardless of detection
  if (typeof window.forceMobileNotification === 'function') {
    console.log('🧪 FORCING: Mobile notification...');
    window.forceMobileNotification();

    setTimeout(() => {
      const notifications = document.querySelectorAll('[data-mobile-notification="true"]');
      if (notifications.length > 0) {
        console.log('✅ SUCCESS: Mobile notification is visible!');
        console.log('📱 TIP: You should see a full-screen notification overlay');
      } else {
        console.error('❌ FAILED: Mobile notification not visible');
        console.log('🔍 DEBUG: Check browser console for errors');
      }
    }, 500);
  } else {
    console.error('❌ ERROR: forceMobileNotification function not available');
    console.log('💡 TIP: Navigate to /trade/options first');
  }
}

// Add quick test function
window.quickMobileTest = quickMobileTest;

console.log('🚀 QUICK START: quickMobileTest() - Immediate mobile notification test');
console.log('🔍 FULL DEBUG: fullMobileNotificationDebug() - Complete analysis');
console.log('📱 MOBILE TIP: Resize window to < 768px width or use mobile device');
