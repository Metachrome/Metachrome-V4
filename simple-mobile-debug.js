// SIMPLE MOBILE NOTIFICATION DEBUG - No React components needed
// Copy and paste this into browser console

console.log('🔍 SIMPLE MOBILE DEBUG STARTING...');

// Step 1: Check if we're on the right page
function checkPage() {
  console.log('📄 PAGE CHECK:');
  console.log('Current URL:', window.location.href);
  console.log('Page title:', document.title);
  
  // Check if we're on options page
  const isOptionsPage = window.location.href.includes('/options') || window.location.href.includes('/trade');
  console.log('Is options/trade page:', isOptionsPage);
  
  if (!isOptionsPage) {
    console.log('⚠️ Navigate to /options or /trade/options page first!');
    return false;
  }
  return true;
}

// Step 2: Force mobile detection
function forceMobileDetection() {
  console.log('📱 FORCING MOBILE DETECTION:');
  
  // Get current dimensions
  console.log('Current window:', window.innerWidth, 'x', window.innerHeight);
  
  // Try to resize (may not work in all browsers)
  try {
    window.resizeTo(375, 812);
    console.log('✅ Attempted window resize to 375x812');
  } catch (e) {
    console.log('⚠️ Cannot resize window:', e.message);
  }
  
  // Trigger resize event
  window.dispatchEvent(new Event('resize'));
  console.log('✅ Resize event triggered');
  
  // Check mobile detection
  const isMobile = window.innerWidth < 768;
  console.log('Mobile detection (width < 768):', isMobile);
  
  return isMobile;
}

// Step 3: Create test notification data
function createTestNotification() {
  console.log('🎯 CREATING TEST NOTIFICATION:');
  
  const testTrade = {
    id: 'simple-test-' + Date.now(),
    direction: 'up',
    amount: 1600,
    entryPrice: 116944.00,
    currentPrice: 116946.98,
    finalPrice: 116946.98,
    status: 'won',
    payout: 1760,
    profitPercentage: 10
  };
  
  console.log('Test trade created:', testTrade);
  
  // Store in localStorage
  localStorage.setItem('completedTrade', JSON.stringify(testTrade));
  console.log('✅ Stored in localStorage');
  
  return testTrade;
}

// Step 4: Check if TradeNotification component exists
function checkTradeNotification() {
  console.log('🔍 CHECKING TRADENOTIFICATION:');
  
  // Look for any notification-related elements
  const notificationElements = document.querySelectorAll(
    '[class*="notification"], [class*="trade"], [class*="modal"], [data-testid*="notification"]'
  );
  console.log('Notification-related elements found:', notificationElements.length);
  
  // Check for React components in DOM
  const reactElements = document.querySelectorAll('[data-reactroot], [id="root"]');
  console.log('React root elements found:', reactElements.length);
  
  // Check for any visible modals or overlays
  const modals = document.querySelectorAll('[class*="fixed"], [class*="absolute"], [style*="position: fixed"]');
  console.log('Fixed/absolute positioned elements:', modals.length);
  
  return notificationElements.length > 0;
}

// Step 5: Force notification by refreshing page
function forceNotificationRefresh() {
  console.log('🔄 FORCING NOTIFICATION VIA REFRESH:');
  console.log('Page will refresh in 3 seconds...');
  console.log('After refresh, check for mobile notification!');
  
  setTimeout(() => {
    window.location.reload();
  }, 3000);
}

// Step 6: Create visual debug overlay (pure JavaScript)
function createDebugOverlay() {
  console.log('🎨 CREATING DEBUG OVERLAY:');
  
  // Remove existing debug overlay
  const existing = document.getElementById('simple-debug-overlay');
  if (existing) existing.remove();
  
  // Create debug overlay
  const overlay = document.createElement('div');
  overlay.id = 'simple-debug-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: #1e40af;
    color: white;
    padding: 15px;
    border-radius: 8px;
    font-family: monospace;
    font-size: 12px;
    z-index: 99999;
    max-width: 300px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  `;
  
  const isMobile = window.innerWidth < 768;
  
  overlay.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 10px;">🔍 Mobile Debug</div>
    <div>Width: ${window.innerWidth}px</div>
    <div>Height: ${window.innerHeight}px</div>
    <div>Mobile: ${isMobile ? '📱 YES' : '🖥️ NO'}</div>
    <div>Expected: ${isMobile ? 'Mobile Modal' : 'Desktop Corner'}</div>
    <div style="margin-top: 10px;">
      <button onclick="testMobileNotification()" style="background: #10b981; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-right: 5px;">Test Win</button>
      <button onclick="testLoseNotification()" style="background: #ef4444; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Test Lose</button>
    </div>
    <div style="margin-top: 10px;">
      <button onclick="forceRefreshTest()" style="background: #8b5cf6; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Force Refresh</button>
    </div>
  `;
  
  document.body.appendChild(overlay);
  console.log('✅ Debug overlay created');
}

// Test functions for buttons
window.testMobileNotification = function() {
  console.log('🧪 Testing mobile notification (WIN)');
  const testTrade = {
    id: 'button-test-win-' + Date.now(),
    direction: 'up',
    amount: 1600,
    entryPrice: 116944.00,
    currentPrice: 116946.98,
    finalPrice: 116946.98,
    status: 'won',
    payout: 1760,
    profitPercentage: 10
  };
  localStorage.setItem('completedTrade', JSON.stringify(testTrade));
  window.location.reload();
};

window.testLoseNotification = function() {
  console.log('🧪 Testing mobile notification (LOSE)');
  const testTrade = {
    id: 'button-test-lose-' + Date.now(),
    direction: 'down',
    amount: 500,
    entryPrice: 116944.00,
    currentPrice: 116941.50,
    finalPrice: 116941.50,
    status: 'lost',
    payout: 0,
    profitPercentage: 10
  };
  localStorage.setItem('completedTrade', JSON.stringify(testTrade));
  window.location.reload();
};

window.forceRefreshTest = function() {
  console.log('🔄 Force refresh with test data');
  createTestNotification();
  setTimeout(() => window.location.reload(), 1000);
};

// Main debug function
function runSimpleMobileDebug() {
  console.log('🚀 RUNNING SIMPLE MOBILE DEBUG');
  console.log('================================');
  
  if (!checkPage()) return;
  
  const isMobile = forceMobileDetection();
  createTestNotification();
  checkTradeNotification();
  createDebugOverlay();
  
  console.log('');
  console.log('🎯 DEBUG SUMMARY:');
  console.log('- Mobile detection:', isMobile ? '📱 YES' : '🖥️ NO');
  console.log('- Test data created and stored');
  console.log('- Debug overlay added to page');
  console.log('');
  console.log('📋 NEXT STEPS:');
  console.log('1. Look for blue debug box in top-right corner');
  console.log('2. Click "Test Win" or "Test Lose" buttons');
  console.log('3. Page will refresh and show notification');
  console.log('4. If mobile (width < 768px), expect full-screen modal');
  console.log('5. If desktop (width >= 768px), expect corner notification');
}

// Export to window
window.runSimpleMobileDebug = runSimpleMobileDebug;
window.checkPage = checkPage;
window.forceMobileDetection = forceMobileDetection;
window.createTestNotification = createTestNotification;
window.createDebugOverlay = createDebugOverlay;

// Auto-run
console.log('🛠️ Functions available:');
console.log('- runSimpleMobileDebug() - Run complete debug');
console.log('- createDebugOverlay() - Add debug buttons to page');
console.log('- testMobileNotification() - Test win notification');
console.log('- testLoseNotification() - Test lose notification');
console.log('');

console.log('🚀 Auto-running in 2 seconds...');
setTimeout(runSimpleMobileDebug, 2000);
