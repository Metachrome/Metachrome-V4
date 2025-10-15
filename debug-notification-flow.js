// Debug Notification Flow - Run in Browser Console
console.log('🔍 DEBUGGING NOTIFICATION FLOW');
console.log('==============================');

function debugNotificationFlow() {
  console.log('🧪 STEP 1: Testing notification functions availability...');
  
  // Check what notification functions are available
  const functions = {
    testMobileNotificationNow: typeof window.testMobileNotificationNow === 'function',
    simulateRealTradeCompletion: typeof window.simulateRealTradeCompletion === 'function',
    forceMobileNotification: typeof window.forceMobileNotification === 'function',
    testDirectNotification: typeof window.testDirectNotification === 'function',
    showMobileTradeNotification: typeof window.showMobileTradeNotification === 'function'
  };
  
  console.log('Available functions:', functions);
  
  // Test each function
  if (functions.testMobileNotificationNow) {
    console.log('\n🧪 STEP 2: Testing testMobileNotificationNow...');
    try {
      window.testMobileNotificationNow();
      console.log('✅ testMobileNotificationNow called successfully');
    } catch (error) {
      console.log('❌ testMobileNotificationNow error:', error);
    }
  }
  
  if (functions.simulateRealTradeCompletion) {
    console.log('\n🧪 STEP 3: Testing simulateRealTradeCompletion...');
    try {
      window.simulateRealTradeCompletion();
      console.log('✅ simulateRealTradeCompletion called successfully');
    } catch (error) {
      console.log('❌ simulateRealTradeCompletion error:', error);
    }
  }
  
  // Test direct DOM manipulation
  console.log('\n🧪 STEP 4: Testing direct DOM notification...');
  createDirectNotification();
  
  // Check for existing notifications
  console.log('\n🔍 STEP 5: Checking for existing notifications...');
  const existingNotifications = document.querySelectorAll('[data-mobile-notification="true"]');
  console.log('Existing notifications found:', existingNotifications.length);
  
  existingNotifications.forEach((notif, index) => {
    console.log(`Notification ${index + 1}:`, {
      id: notif.id,
      visible: notif.offsetWidth > 0 && notif.offsetHeight > 0,
      display: window.getComputedStyle(notif).display,
      zIndex: window.getComputedStyle(notif).zIndex,
      position: window.getComputedStyle(notif).position
    });
  });
}

function createDirectNotification() {
  console.log('🛠️ Creating direct DOM notification...');
  
  // Remove any existing notifications
  const existing = document.querySelectorAll('[data-mobile-notification="true"]');
  existing.forEach(el => el.remove());
  
  // Create notification container
  const notification = document.createElement('div');
  notification.setAttribute('data-mobile-notification', 'true');
  notification.id = 'debug-notification-' + Date.now();
  
  // Apply maximum priority styles
  const styles = {
    position: 'fixed',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    width: '100vw',
    height: '100vh',
    zIndex: '2147483647',
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    fontFamily: 'Arial, sans-serif',
    pointerEvents: 'auto'
  };
  
  Object.keys(styles).forEach(key => {
    notification.style.setProperty(key, styles[key], 'important');
  });
  
  // Create notification content
  notification.innerHTML = `
    <div style="
      background-color: #1a1b3a !important;
      border-radius: 16px !important;
      padding: 24px !important;
      max-width: 350px !important;
      width: 90% !important;
      border: 3px solid #10b981 !important;
      color: white !important;
      text-align: center !important;
      box-shadow: 0 20px 40px rgba(0,0,0,0.8) !important;
    ">
      <div style="font-size: 24px !important; font-weight: bold !important; color: #10b981 !important; margin-bottom: 16px !important;">
        🎉 DEBUG NOTIFICATION
      </div>
      <div style="margin-bottom: 16px !important; font-size: 16px !important;">
        This is a direct DOM notification test.<br>
        If you can see this, the notification system works!
      </div>
      <div style="margin-bottom: 20px !important; font-size: 14px !important; color: #9ca3af !important;">
        Screen: ${window.innerWidth}x${window.innerHeight}<br>
        Time: ${new Date().toLocaleTimeString()}
      </div>
      <button id="close-debug-btn" style="
        background-color: #10b981 !important;
        color: white !important;
        border: none !important;
        border-radius: 8px !important;
        padding: 12px 24px !important;
        font-size: 16px !important;
        cursor: pointer !important;
        width: 100% !important;
        font-weight: bold !important;
      ">
        Close Debug Notification
      </button>
    </div>
  `;
  
  // Add close functionality
  const closeBtn = notification.querySelector('#close-debug-btn');
  closeBtn.addEventListener('click', () => {
    notification.remove();
    console.log('✅ Debug notification closed');
  });
  
  // Close on background click
  notification.addEventListener('click', (e) => {
    if (e.target === notification) {
      notification.remove();
      console.log('✅ Debug notification closed by background click');
    }
  });
  
  // Add to DOM
  document.body.appendChild(notification);
  
  console.log('✅ Debug notification created and added to DOM');
  console.log('📏 Notification dimensions:', notification.getBoundingClientRect());
  console.log('🔍 In DOM?', document.body.contains(notification));
  console.log('🔍 Visible?', notification.offsetWidth > 0 && notification.offsetHeight > 0);
  
  // Force focus and bring to front
  notification.focus();
  
  return notification;
}

// Test if showMobileTradeNotification function exists and works
function testShowMobileTradeNotification() {
  console.log('\n🧪 STEP 6: Testing showMobileTradeNotification function...');
  
  if (typeof window.showMobileTradeNotification === 'function') {
    console.log('✅ showMobileTradeNotification function found');
    
    const testTrade = {
      id: 'debug-test-' + Date.now(),
      direction: 'up',
      amount: 100,
      entryPrice: 50000,
      currentPrice: 51000,
      status: 'won',
      profitPercentage: 10,
      symbol: 'BTC/USDT',
      duration: 30,
      payout: 110
    };
    
    try {
      window.showMobileTradeNotification(testTrade);
      console.log('✅ showMobileTradeNotification called with test trade');
    } catch (error) {
      console.log('❌ showMobileTradeNotification error:', error);
    }
  } else {
    console.log('❌ showMobileTradeNotification function not found');
    console.log('💡 This might be why notifications aren\'t working');
  }
}

// Check CSS and styling issues
function checkStylingIssues() {
  console.log('\n🎨 STEP 7: Checking for styling issues...');
  
  // Check for CSS that might hide notifications
  const bodyStyles = window.getComputedStyle(document.body);
  console.log('Body styles:', {
    overflow: bodyStyles.overflow,
    position: bodyStyles.position,
    zIndex: bodyStyles.zIndex
  });
  
  // Check for elements with very high z-index
  const allElements = document.querySelectorAll('*');
  const highZIndexElements = [];
  
  allElements.forEach(el => {
    const zIndex = window.getComputedStyle(el).zIndex;
    if (zIndex && parseInt(zIndex) > 1000000) {
      highZIndexElements.push({
        element: el.tagName,
        id: el.id,
        class: el.className,
        zIndex: zIndex
      });
    }
  });
  
  if (highZIndexElements.length > 0) {
    console.log('⚠️ Elements with very high z-index found:', highZIndexElements);
  } else {
    console.log('✅ No conflicting high z-index elements found');
  }
}

// Run all debug steps
debugNotificationFlow();
testShowMobileTradeNotification();
checkStylingIssues();

console.log('\n📋 SUMMARY:');
console.log('1. Check if debug notification appeared');
console.log('2. Look for any error messages above');
console.log('3. Check if showMobileTradeNotification function exists');
console.log('4. Look for styling conflicts');

// Make function available for manual testing
window.createDirectNotification = createDirectNotification;
