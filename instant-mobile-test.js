// INSTANT MOBILE NOTIFICATION TEST
// This bypasses all React logic and creates a mobile notification directly

console.log('🚀 INSTANT MOBILE NOTIFICATION TEST LOADED');

function createInstantMobileNotification() {
  console.log('🧪 CREATING: Instant mobile notification...');
  
  // Remove any existing notifications first
  const existing = document.querySelectorAll('[data-mobile-notification="true"]');
  existing.forEach(el => {
    console.log('🧹 REMOVING: Existing notification');
    el.remove();
  });
  
  // Create the notification container
  const container = document.createElement('div');
  container.id = 'instant-mobile-notification';
  container.setAttribute('data-mobile-notification', 'true');
  
  // Apply maximum visibility styles
  container.style.cssText = `
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    z-index: 2147483647 !important;
    background-color: rgba(0, 0, 0, 0.95) !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 16px !important;
    backdrop-filter: blur(4px) !important;
    -webkit-backdrop-filter: blur(4px) !important;
    visibility: visible !important;
    opacity: 1 !important;
    pointer-events: auto !important;
    transform: translateZ(0) !important;
    will-change: transform, opacity !important;
  `;
  
  // Create the notification card
  const card = document.createElement('div');
  card.style.cssText = `
    background-color: #1a1b3a !important;
    border-radius: 16px !important;
    padding: 20px !important;
    max-width: 320px !important;
    width: 90% !important;
    border: 3px solid #10b981 !important;
    color: white !important;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8), 0 0 20px rgba(16, 185, 129, 0.5) !important;
    position: relative !important;
    pointer-events: auto !important;
    animation: slideInUp 0.3s ease-out !important;
    text-align: left !important;
    font-size: 14px !important;
    line-height: 1.4 !important;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
  `;
  
  // Create the content
  card.innerHTML = `
    <div style="text-align: center !important; margin-bottom: 16px !important;">
      <div style="font-size: 20px !important; font-weight: bold !important; color: #10b981 !important; margin-bottom: 8px !important;">
        🎉 TEST NOTIFICATION
      </div>
      <div style="font-size: 12px !important; color: #9ca3af !important;">
        This is a test mobile notification
      </div>
    </div>
    
    <div style="background-color: rgba(255, 255, 255, 0.1) !important; border-radius: 8px !important; padding: 12px !important; margin-bottom: 16px !important;">
      <div style="display: flex !important; justify-content: space-between !important; margin-bottom: 8px !important;">
        <span style="color: #9ca3af !important;">Market:</span>
        <span style="font-weight: bold !important;">BTC/USDT</span>
      </div>
      <div style="display: flex !important; justify-content: space-between !important; margin-bottom: 8px !important;">
        <span style="color: #9ca3af !important;">Trade:</span>
        <span style="font-weight: bold !important;">BUY UP</span>
      </div>
      <div style="display: flex !important; justify-content: space-between !important; margin-bottom: 8px !important;">
        <span style="color: #9ca3af !important;">Amount:</span>
        <span style="font-weight: bold !important;">100 USDT</span>
      </div>
      <div style="display: flex !important; justify-content: space-between !important; margin-bottom: 8px !important;">
        <span style="color: #9ca3af !important;">Profit:</span>
        <span style="font-weight: bold !important; color: #10b981 !important;">+10 USDT</span>
      </div>
    </div>
    
    <button onclick="this.closest('[data-mobile-notification=\\"true\\"]').remove()" style="
      width: 100% !important;
      background: linear-gradient(135deg, #10b981, #059669) !important;
      color: white !important;
      border: none !important;
      border-radius: 8px !important;
      padding: 12px !important;
      font-size: 14px !important;
      font-weight: bold !important;
      cursor: pointer !important;
      transition: opacity 0.2s !important;
    " onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
      Close Notification
    </button>
  `;
  
  // Add the card to the container
  container.appendChild(card);
  
  // Add to the page
  document.body.appendChild(container);
  
  console.log('✅ CREATED: Instant mobile notification added to DOM');
  console.log('📱 CHECK: You should see a full-screen notification overlay');
  
  // Auto-remove after 10 seconds
  setTimeout(() => {
    if (container.parentNode) {
      container.remove();
      console.log('🕐 AUTO-REMOVED: Notification after 10 seconds');
    }
  }, 10000);
  
  return container;
}

// Test device detection
function testCurrentDetection() {
  console.log('🔍 DEVICE DETECTION TEST');
  console.log('========================');
  
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const isSmallScreen = screenWidth < 768;
  const isTouchDevice = 'ontouchstart' in window;
  const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  console.log('📱 CURRENT DEVICE INFO:');
  console.log('  Screen Width:', screenWidth + 'px');
  console.log('  Screen Height:', screenHeight + 'px');
  console.log('  Is Small Screen (<768px):', isSmallScreen);
  console.log('  Has Touch Support:', isTouchDevice);
  console.log('  Mobile User Agent:', isMobileUserAgent);
  console.log('  User Agent:', navigator.userAgent);
  
  const shouldUseMobile = isSmallScreen || isMobileUserAgent;
  console.log('');
  console.log('🎯 DETECTION RESULT:', shouldUseMobile ? 'MOBILE' : 'DESKTOP');
  
  return shouldUseMobile;
}

// Check if mobile notification functions are available
function checkNotificationFunctions() {
  console.log('🔍 FUNCTION AVAILABILITY CHECK');
  console.log('==============================');
  
  const functions = [
    'testMobileNotification',
    'forceMobileNotification', 
    'testMobileDetection',
    'testDirectNotification'
  ];
  
  functions.forEach(funcName => {
    const available = typeof window[funcName] === 'function';
    console.log(`  ${funcName}:`, available ? '✅ Available' : '❌ Not Available');
  });
  
  // Check if we're on the right page
  const isOptionsPage = window.location.pathname.includes('/trade/options');
  console.log('');
  console.log('📄 Current Page:', window.location.pathname);
  console.log('📄 Is Options Page:', isOptionsPage ? '✅ Yes' : '❌ No');
  
  if (!isOptionsPage) {
    console.log('💡 TIP: Navigate to /trade/options for full testing');
  }
}

// Comprehensive test
function runFullTest() {
  console.log('🚀 FULL MOBILE NOTIFICATION TEST');
  console.log('================================');
  
  // Step 1: Check device detection
  console.log('📱 STEP 1: Device Detection');
  const shouldUseMobile = testCurrentDetection();
  
  // Step 2: Check function availability
  console.log('\n🔍 STEP 2: Function Availability');
  checkNotificationFunctions();
  
  // Step 3: Create instant notification
  console.log('\n🧪 STEP 3: Creating Instant Notification');
  createInstantMobileNotification();
  
  // Step 4: Test existing functions if available
  console.log('\n🧪 STEP 4: Testing Existing Functions');
  if (typeof window.forceMobileNotification === 'function') {
    console.log('🧪 TESTING: forceMobileNotification()');
    setTimeout(() => {
      window.forceMobileNotification();
    }, 2000);
  } else {
    console.log('⚠️ SKIP: forceMobileNotification not available');
  }
}

// Add functions to window
window.createInstantMobileNotification = createInstantMobileNotification;
window.testCurrentDetection = testCurrentDetection;
window.checkNotificationFunctions = checkNotificationFunctions;
window.runFullTest = runFullTest;

console.log('🧪 AVAILABLE FUNCTIONS:');
console.log('  - createInstantMobileNotification() - Create notification directly');
console.log('  - testCurrentDetection() - Test device detection');
console.log('  - checkNotificationFunctions() - Check function availability');
console.log('  - runFullTest() - Run complete test sequence');
console.log('');
console.log('🚀 QUICK START: createInstantMobileNotification()');
console.log('🔍 FULL TEST: runFullTest()');
