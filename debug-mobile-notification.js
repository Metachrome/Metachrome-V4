// Debug Mobile Notification Script
// Copy and paste this entire script into the browser console

console.log('🔍 MOBILE NOTIFICATION DEBUG SCRIPT LOADED');
console.log('==========================================');

// Step 1: Check current environment
function checkEnvironment() {
  console.log('📊 ENVIRONMENT CHECK:');
  console.log('Window width:', window.innerWidth);
  console.log('Window height:', window.innerHeight);
  console.log('User agent:', navigator.userAgent);
  console.log('Touch points:', navigator.maxTouchPoints || 0);
  console.log('Touch support:', 'ontouchstart' in window);
  console.log('Mobile detection (width < 768):', window.innerWidth < 768);
  console.log('');
}

// Step 2: Check if components exist
function checkComponents() {
  console.log('🔍 COMPONENT CHECK:');
  
  // Check for TradeNotification component
  const tradeNotifications = document.querySelectorAll('[class*="trade-notification"], [data-testid*="notification"]');
  console.log('TradeNotification elements found:', tradeNotifications.length);
  
  // Check for mobile elements
  const mobileElements = document.querySelectorAll('[class*="mobile"]');
  console.log('Mobile elements found:', mobileElements.length);
  
  // Check for debug components
  const debugElements = document.querySelectorAll('[class*="debug"]');
  console.log('Debug elements found:', debugElements.length);
  
  // Check for notification test buttons
  const testButtons = document.querySelectorAll('button[class*="bg-green-500"], button[class*="bg-red-500"]');
  console.log('Test buttons found:', testButtons.length);
  
  console.log('');
}

// Step 3: Force mobile mode
function forceMobileMode() {
  console.log('📱 FORCING MOBILE MODE:');
  
  // Resize window if possible
  if (window.resizeTo) {
    try {
      window.resizeTo(375, 812);
      console.log('✅ Window resized to mobile size');
    } catch (e) {
      console.log('⚠️ Cannot resize window (browser restriction)');
    }
  }
  
  // Trigger resize event
  window.dispatchEvent(new Event('resize'));
  console.log('✅ Resize event dispatched');
  
  // Wait a moment then check again
  setTimeout(() => {
    console.log('📱 After resize - Width:', window.innerWidth, 'Mobile:', window.innerWidth < 768);
  }, 500);
  
  console.log('');
}

// Step 4: Create test trade data
function createTestTrade() {
  const testTrade = {
    id: 'debug-mobile-' + Date.now(),
    direction: 'up',
    amount: 1600,
    entryPrice: 116944.00,
    currentPrice: 116946.98,
    finalPrice: 116946.98,
    status: 'won',
    payout: 1760,
    profitPercentage: 10
  };
  
  console.log('🎯 CREATING TEST TRADE:');
  console.log('Test trade data:', testTrade);
  
  // Store in localStorage
  localStorage.setItem('completedTrade', JSON.stringify(testTrade));
  console.log('✅ Test trade stored in localStorage');
  
  // Also try to trigger any custom events
  try {
    const event = new CustomEvent('forceTradeNotification', { detail: testTrade });
    window.dispatchEvent(event);
    console.log('✅ Custom event dispatched');
  } catch (e) {
    console.log('⚠️ Custom event failed:', e.message);
  }
  
  console.log('');
  return testTrade;
}

// Step 5: Check localStorage
function checkLocalStorage() {
  console.log('💾 LOCALSTORAGE CHECK:');
  
  const completedTrade = localStorage.getItem('completedTrade');
  if (completedTrade) {
    console.log('✅ completedTrade found in localStorage');
    try {
      const parsed = JSON.parse(completedTrade);
      console.log('Trade data:', parsed);
    } catch (e) {
      console.log('❌ Failed to parse completedTrade:', e.message);
    }
  } else {
    console.log('❌ No completedTrade in localStorage');
  }
  
  console.log('');
}

// Step 6: Force page refresh
function forceRefresh() {
  console.log('🔄 FORCING PAGE REFRESH...');
  setTimeout(() => {
    window.location.reload();
  }, 2000);
}

// Step 7: Click test buttons if they exist
function clickTestButtons() {
  console.log('🖱️ LOOKING FOR TEST BUTTONS:');
  
  const testButtons = document.querySelectorAll('button');
  let foundTestButton = false;
  
  testButtons.forEach((button, index) => {
    const text = button.textContent || '';
    if (text.includes('Test Win') || text.includes('Test Lose') || text.includes('Notification')) {
      console.log(`✅ Found test button ${index + 1}: "${text}"`);
      foundTestButton = true;
      
      // Click the first test button found
      if (text.includes('Test Win')) {
        console.log('🖱️ Clicking test win button...');
        button.click();
      }
    }
  });
  
  if (!foundTestButton) {
    console.log('❌ No test buttons found');
  }
  
  console.log('');
}

// Main debug function
function runMobileNotificationDebug() {
  console.log('🚀 STARTING MOBILE NOTIFICATION DEBUG');
  console.log('=====================================');
  
  checkEnvironment();
  checkComponents();
  forceMobileMode();
  
  setTimeout(() => {
    checkLocalStorage();
    createTestTrade();
    clickTestButtons();
    
    console.log('🎯 DEBUG COMPLETE - Check for notifications now');
    console.log('If no notification appears, try:');
    console.log('1. Refresh the page');
    console.log('2. Check browser console for errors');
    console.log('3. Look for test buttons on the page');
    console.log('4. Try forceRefresh() to reload with test data');
    
  }, 1000);
}

// Export functions to window for manual use
window.checkEnvironment = checkEnvironment;
window.checkComponents = checkComponents;
window.forceMobileMode = forceMobileMode;
window.createTestTrade = createTestTrade;
window.checkLocalStorage = checkLocalStorage;
window.forceRefresh = forceRefresh;
window.clickTestButtons = clickTestButtons;
window.runMobileNotificationDebug = runMobileNotificationDebug;

// Auto-run the debug
console.log('🛠️ Available functions:');
console.log('- runMobileNotificationDebug() - Run full debug');
console.log('- checkEnvironment() - Check mobile detection');
console.log('- forceMobileMode() - Force mobile mode');
console.log('- createTestTrade() - Create test trade data');
console.log('- clickTestButtons() - Click test buttons');
console.log('- forceRefresh() - Refresh with test data');
console.log('');

// Auto-run in 2 seconds
console.log('🚀 Auto-running debug in 2 seconds...');
setTimeout(runMobileNotificationDebug, 2000);
