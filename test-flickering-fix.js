// TEST SCRIPT FOR DESKTOP NOTIFICATION FLICKERING FIX
// Copy and paste this into the browser console to test the fix

console.log('🧪 FLICKERING FIX TEST SCRIPT LOADED');

// Test function to verify the flickering is fixed
function testFlickeringFix() {
  console.log('🧪 TESTING: Starting flickering fix verification...');
  
  // Check if we're on desktop
  const isDesktop = window.innerWidth >= 768;
  if (!isDesktop) {
    console.warn('⚠️ WARNING: This test is for desktop flickering. Current width:', window.innerWidth);
    console.log('💡 TIP: Resize window to >= 768px width for desktop testing');
  }
  
  console.log('🧪 DEVICE INFO:', {
    width: window.innerWidth,
    isDesktop,
    expectedNotificationType: isDesktop ? 'DESKTOP (top-right, no flickering)' : 'MOBILE (full-screen)'
  });
  
  // Clear any existing notifications
  const existingNotifications = document.querySelectorAll('[data-mobile-notification="true"], .trade-notification');
  existingNotifications.forEach(el => el.remove());
  console.log('🧪 CLEARED:', existingNotifications.length, 'existing notifications');
  
  // Test multiple rapid notifications to check for flickering
  console.log('🧪 TESTING: Rapid notification sequence to test for flickering...');
  
  let testCount = 0;
  const maxTests = 3;
  
  function triggerTestNotification() {
    testCount++;
    console.log(`🧪 TEST ${testCount}/${maxTests}: Triggering notification...`);
    
    // Check if we're on the options page and have the test function
    if (typeof window.testDirectNotification === 'function') {
      window.testDirectNotification();
    } else if (typeof window.testMobileNotification === 'function') {
      window.testMobileNotification();
    } else {
      console.log('🧪 MANUAL TEST: No test functions available');
      console.log('💡 TIP: Navigate to /trade/options and place a test trade');
    }
    
    // Schedule next test
    if (testCount < maxTests) {
      setTimeout(triggerTestNotification, 2000); // 2 second delay between tests
    } else {
      console.log('✅ FLICKERING TEST COMPLETE');
      setTimeout(analyzeResults, 1000);
    }
  }
  
  // Start the test sequence
  triggerTestNotification();
}

// Analyze results for flickering
function analyzeResults() {
  console.log('🧪 ANALYZING: Checking for flickering indicators...');
  
  const notifications = document.querySelectorAll('.trade-notification');
  const mobileNotifications = document.querySelectorAll('[data-mobile-notification="true"]');
  
  console.log('🧪 RESULTS:', {
    desktopNotifications: notifications.length,
    mobileNotifications: mobileNotifications.length,
    totalNotifications: notifications.length + mobileNotifications.length
  });
  
  // Check for multiple notifications (sign of flickering/conflicts)
  if (notifications.length > 1) {
    console.error('❌ ISSUE: Multiple desktop notifications detected! This indicates flickering.');
    notifications.forEach((notif, index) => {
      console.log(`📍 Notification ${index + 1}:`, notif);
    });
  } else if (notifications.length === 1) {
    console.log('✅ SUCCESS: Single desktop notification found (no flickering)');
    
    // Check for smooth transitions
    const notification = notifications[0];
    const hasTransition = notification.classList.contains('transition-all');
    console.log('🎨 TRANSITION CHECK:', hasTransition ? 'Has smooth transitions' : 'No transitions detected');
  } else {
    console.log('ℹ️ INFO: No desktop notifications currently visible');
  }
  
  // Check for conflicts between mobile and desktop
  if (notifications.length > 0 && mobileNotifications.length > 0) {
    console.error('❌ CONFLICT: Both desktop and mobile notifications detected!');
  }
  
  // Performance check
  console.log('🧪 PERFORMANCE: Checking for excessive re-renders...');
  console.log('💡 TIP: Watch the console during notification display for excessive logging');
}

// Test notification stability
function testNotificationStability() {
  console.log('🧪 STABILITY TEST: Testing notification persistence...');
  
  if (typeof window.testDirectNotification === 'function') {
    window.testDirectNotification();
    
    // Check notification after 1 second
    setTimeout(() => {
      const notifications = document.querySelectorAll('.trade-notification');
      if (notifications.length === 1) {
        console.log('✅ STABILITY: Notification persists correctly');
        
        // Check if it's still visible after 5 seconds
        setTimeout(() => {
          const stillVisible = document.querySelectorAll('.trade-notification');
          console.log('⏱️ PERSISTENCE:', stillVisible.length > 0 ? 'Still visible after 5s' : 'Auto-closed as expected');
        }, 5000);
      } else {
        console.error('❌ STABILITY: Notification disappeared or multiplied');
      }
    }, 1000);
  } else {
    console.log('💡 TIP: Navigate to /trade/options for full stability testing');
  }
}

// Add functions to window for easy access
window.testFlickeringFix = testFlickeringFix;
window.testNotificationStability = testNotificationStability;
window.analyzeResults = analyzeResults;

console.log('🧪 AVAILABLE FUNCTIONS:');
console.log('  - testFlickeringFix() - Test for flickering issues');
console.log('  - testNotificationStability() - Test notification persistence');
console.log('  - analyzeResults() - Analyze current notification state');
console.log('');
console.log('🚀 RUN: testFlickeringFix()');
console.log('📋 EXPECTED: Smooth, non-flickering desktop notifications');
