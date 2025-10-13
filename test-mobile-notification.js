// MOBILE NOTIFICATION TEST SCRIPT
// Copy and paste this into the browser console to test mobile notifications

console.log('🧪 MOBILE NOTIFICATION TEST SCRIPT LOADED');

// Test function to trigger mobile notification
function testMobileNotification() {
  console.log('🧪 TESTING: Starting mobile notification test...');
  
  // Check if we're on the options page
  const currentPath = window.location.pathname;
  console.log('🧪 TESTING: Current path:', currentPath);
  
  // Check mobile detection
  const isMobileWidth = window.innerWidth < 768;
  const isTabletWidth = window.innerWidth < 1024;
  console.log('🧪 TESTING: Mobile detection:', {
    windowWidth: window.innerWidth,
    isMobileWidth,
    isTabletWidth,
    userAgent: navigator.userAgent
  });
  
  // Try to find the OptionsPage component and trigger a notification
  try {
    // Create a test trade completion event
    const testTrade = {
      id: 'test-mobile-' + Date.now(),
      direction: 'up',
      amount: 100,
      entryPrice: 50000,
      finalPrice: 51000,
      status: 'won',
      payout: 110,
      profitPercentage: 10,
      symbol: 'BTC/USDT',
      duration: 30,
      endTime: Date.now(),
      currentPrice: 51000
    };
    
    console.log('🧪 TESTING: Test trade object:', testTrade);
    
    // Try to trigger through localStorage (simulating trade completion)
    localStorage.setItem('completedTrade', JSON.stringify(testTrade));
    
    // Dispatch a custom event to trigger notification
    const event = new CustomEvent('tradeCompleted', {
      detail: testTrade
    });
    window.dispatchEvent(event);
    
    console.log('🧪 TESTING: Test trade completion event dispatched');
    
    // Also try to directly call the notification if available
    if (window.testMobileNotification) {
      window.testMobileNotification();
    }
    
  } catch (error) {
    console.error('🧪 TESTING: Error during test:', error);
  }
}

// Force mobile mode test
function forceMobileMode() {
  console.log('🧪 TESTING: Forcing mobile mode...');
  
  // Override window.innerWidth
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: 375
  });
  
  // Trigger resize event
  window.dispatchEvent(new Event('resize'));
  
  console.log('🧪 TESTING: Mobile mode forced (width: 375px)');
  console.log('🧪 TESTING: Now run testMobileNotification() again');
}

// Check notification system status
function checkNotificationSystem() {
  console.log('🧪 TESTING: Checking notification system...');
  
  // Check for notification elements
  const notificationElements = document.querySelectorAll('[data-mobile-notification], .trade-notification, [class*="notification"]');
  console.log('🧪 TESTING: Notification elements found:', notificationElements.length);
  
  // Check for mobile elements
  const mobileElements = document.querySelectorAll('[class*="mobile"]');
  console.log('🧪 TESTING: Mobile elements found:', mobileElements.length);
  
  // Check for React components
  const reactElements = document.querySelectorAll('[data-reactroot], #root');
  console.log('🧪 TESTING: React elements found:', reactElements.length);
  
  // Check localStorage
  const completedTrade = localStorage.getItem('completedTrade');
  console.log('🧪 TESTING: Completed trade in localStorage:', completedTrade);
  
  // Check current page
  console.log('🧪 TESTING: Current page:', window.location.pathname);
  console.log('🧪 TESTING: Page title:', document.title);
  
  return {
    notificationElements: notificationElements.length,
    mobileElements: mobileElements.length,
    reactElements: reactElements.length,
    hasCompletedTrade: !!completedTrade,
    currentPath: window.location.pathname
  };
}

// Create a visible test notification directly in DOM
function createDirectMobileNotification() {
  console.log('🧪 TESTING: Creating direct mobile notification...');
  
  // Remove any existing test notifications
  const existing = document.getElementById('direct-test-notification');
  if (existing) {
    existing.remove();
  }
  
  // Create notification HTML
  const notification = document.createElement('div');
  notification.id = 'direct-test-notification';
  notification.setAttribute('data-mobile-notification', 'true');
  notification.style.cssText = `
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    z-index: 2147483647 !important;
    background-color: rgba(0, 0, 0, 0.9) !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 16px !important;
    visibility: visible !important;
    opacity: 1 !important;
    pointer-events: auto !important;
  `;
  
  notification.innerHTML = `
    <div style="
      background-color: #1a1b3a;
      border-radius: 16px;
      padding: 20px;
      max-width: 320px;
      width: 100%;
      border: 2px solid #10b981;
      color: white;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);
      text-align: center;
    ">
      <h2 style="color: #10b981; margin-bottom: 16px; font-size: 20px; font-weight: bold;">
        🎉 Trade Won! (TEST)
      </h2>
      <p style="margin-bottom: 16px; color: #9ca3af;">
        This is a direct DOM test notification
      </p>
      <button onclick="document.getElementById('direct-test-notification').remove()" style="
        background-color: #10b981;
        color: white;
        border: none;
        border-radius: 8px;
        padding: 12px 24px;
        font-size: 14px;
        font-weight: bold;
        cursor: pointer;
        width: 100%;
      ">
        Close Test Notification
      </button>
    </div>
  `;
  
  // Add to body
  document.body.appendChild(notification);
  
  console.log('🧪 TESTING: Direct mobile notification created and added to DOM');
  
  // Auto-remove after 10 seconds
  setTimeout(() => {
    if (document.getElementById('direct-test-notification')) {
      notification.remove();
      console.log('🧪 TESTING: Direct notification auto-removed');
    }
  }, 10000);
}

// Make functions available globally
window.testMobileNotification = testMobileNotification;
window.forceMobileMode = forceMobileMode;
window.checkNotificationSystem = checkNotificationSystem;
window.createDirectMobileNotification = createDirectMobileNotification;

console.log('🧪 TESTING: Available functions:');
console.log('  - testMobileNotification() - Test the React notification system');
console.log('  - forceMobileMode() - Force mobile detection');
console.log('  - checkNotificationSystem() - Check system status');
console.log('  - createDirectMobileNotification() - Create direct DOM notification');
console.log('');
console.log('🧪 TESTING: Quick test: Run createDirectMobileNotification() first to verify DOM rendering works');
