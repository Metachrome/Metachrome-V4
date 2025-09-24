// DIRECT NOTIFICATION TEST - Bypass all checks
// Copy and paste this into browser console

console.log('🚀 DIRECT NOTIFICATION TEST STARTING...');

// Step 1: Clear any existing data
function clearExistingData() {
  console.log('🧹 CLEARING EXISTING DATA:');
  localStorage.removeItem('completedTrade');
  console.log('✅ Cleared localStorage');
}

// Step 2: Create test data with ALL required fields
function createCompleteTestData() {
  console.log('📝 CREATING COMPLETE TEST DATA:');
  
  const now = new Date();
  const testTrade = {
    id: 'direct-test-' + Date.now(),
    direction: 'up',
    amount: 1600,
    entryPrice: 116944.00,
    currentPrice: 116946.98,
    finalPrice: 116946.98,
    status: 'won',
    payout: 1760,
    profitPercentage: 10,
    completedAt: now.toISOString(),
    // Add any other fields that might be needed
    duration: '30',
    symbol: 'BTC/USDT',
    timestamp: now.getTime()
  };
  
  console.log('📊 Complete test trade data:', testTrade);
  return testTrade;
}

// Step 3: Force set the React state directly (if possible)
function forceReactState() {
  console.log('⚛️ ATTEMPTING TO FORCE REACT STATE:');
  
  try {
    // Look for React fiber nodes
    const rootElement = document.getElementById('root');
    if (rootElement && rootElement._reactInternalFiber) {
      console.log('✅ Found React fiber');
    } else if (rootElement && rootElement._reactInternalInstance) {
      console.log('✅ Found React instance');
    } else {
      console.log('⚠️ React instance not found in standard locations');
    }
    
    // Try to find any React components
    const allElements = document.querySelectorAll('*');
    let reactElements = 0;
    for (let element of allElements) {
      if (element._reactInternalFiber || element._reactInternalInstance) {
        reactElements++;
      }
    }
    console.log('📊 React elements found:', reactElements);
    
  } catch (error) {
    console.log('❌ React state access failed:', error.message);
  }
}

// Step 4: Check current page state
function checkPageState() {
  console.log('🔍 CHECKING PAGE STATE:');
  
  // Check URL
  console.log('Current URL:', window.location.href);
  
  // Check for OptionsPage indicators
  const optionsIndicators = [
    'BTC/USDT',
    'options',
    'trade',
    'TradingView'
  ];
  
  let foundIndicators = 0;
  optionsIndicators.forEach(indicator => {
    if (document.body.textContent.includes(indicator)) {
      foundIndicators++;
      console.log('✅ Found indicator:', indicator);
    }
  });
  
  console.log('📊 Page indicators found:', foundIndicators, '/', optionsIndicators.length);
  
  // Check for any existing notifications
  const existingNotifications = document.querySelectorAll('[class*="notification"], [class*="modal"], [class*="overlay"]');
  console.log('📊 Existing notifications/modals:', existingNotifications.length);
  
  return foundIndicators >= 2;
}

// Step 5: Manual DOM injection (fallback)
function injectManualNotification() {
  console.log('💉 INJECTING MANUAL NOTIFICATION:');
  
  // Remove any existing manual notifications
  const existing = document.getElementById('manual-notification');
  if (existing) existing.remove();
  
  // Create manual notification that matches the design
  const notification = document.createElement('div');
  notification.id = 'manual-notification';
  notification.style.cssText = `
    position: fixed;
    inset: 0;
    z-index: 99999;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
  `;
  
  notification.innerHTML = `
    <div style="
      background: #374151;
      border-radius: 16px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      width: 100%;
      max-width: 320px;
      overflow: hidden;
    ">
      <!-- Header -->
      <div style="
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 20px 20px 16px 20px;
      ">
        <h3 style="
          color: white;
          font-weight: bold;
          font-size: 18px;
          margin: 0;
        ">BTC/USDT</h3>
        <button onclick="document.getElementById('manual-notification').remove()" style="
          color: #9ca3af;
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">×</button>
      </div>
      
      <!-- Content -->
      <div style="
        padding: 0 20px 20px 20px;
        display: flex;
        flex-direction: column;
        gap: 20px;
      ">
        <!-- P&L Display -->
        <div style="text-align: center; padding: 8px 0;">
          <div style="
            font-size: 36px;
            font-weight: bold;
            margin-bottom: 4px;
            color: #10b981;
          ">
            +1600 <span style="color: #9ca3af; font-size: 18px; font-weight: normal;">USDT</span>
          </div>
          <div style="
            color: #9ca3af;
            font-size: 16px;
          ">Settlement completed</div>
        </div>
        
        <!-- Trade Details -->
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: #9ca3af; font-size: 14px;">Current price :</span>
            <span style="color: white; font-weight: 500; font-size: 14px;">116946.98</span>
          </div>
          
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: #9ca3af; font-size: 14px;">Time :</span>
            <span style="color: white; font-weight: 500; font-size: 14px;">30s</span>
          </div>
          
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: #9ca3af; font-size: 14px;">Side :</span>
            <span style="color: #10b981; font-weight: 500; font-size: 14px;">Buy Up</span>
          </div>
          
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: #9ca3af; font-size: 14px;">Amount :</span>
            <span style="color: white; font-weight: 500; font-size: 14px;">1600 USDT</span>
          </div>
          
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: #9ca3af; font-size: 14px;">Price :</span>
            <span style="color: white; font-weight: 500; font-size: 14px;">116944.00 USDT</span>
          </div>
        </div>
        
        <!-- Footer Text -->
        <div style="
          color: #9ca3af;
          font-size: 12px;
          line-height: 1.5;
          padding-top: 12px;
        ">
          The ultimate price for each option contract is determined by the system's settlement process.
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(notification);
  console.log('✅ Manual notification injected');
  
  // Auto-remove after 25 seconds
  setTimeout(() => {
    if (document.getElementById('manual-notification')) {
      document.getElementById('manual-notification').remove();
      console.log('🕐 Manual notification auto-removed after 25s');
    }
  }, 25000);
}

// Step 6: Test localStorage and page refresh method
function testLocalStorageMethod() {
  console.log('💾 TESTING LOCALSTORAGE METHOD:');
  
  clearExistingData();
  const testData = createCompleteTestData();
  
  // Store with extra debugging
  localStorage.setItem('completedTrade', JSON.stringify(testData));
  console.log('✅ Stored test data in localStorage');
  
  // Verify storage
  const stored = localStorage.getItem('completedTrade');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      console.log('✅ Verified stored data:', parsed);
      
      // Check timestamp validity
      const notificationTime = new Date(parsed.completedAt).getTime();
      const now = Date.now();
      const timeDiff = now - notificationTime;
      console.log('⏰ Time difference:', timeDiff, 'ms (should be < 45000)');
      
      if (timeDiff < 45000) {
        console.log('✅ Timestamp is valid');
        
        // Force page refresh
        console.log('🔄 Refreshing page in 2 seconds...');
        setTimeout(() => {
          window.location.reload();
        }, 2000);
        
      } else {
        console.log('❌ Timestamp is too old');
      }
      
    } catch (error) {
      console.log('❌ Failed to parse stored data:', error);
    }
  } else {
    console.log('❌ No data found in localStorage');
  }
}

// Main test function
function runDirectNotificationTest() {
  console.log('🚀 RUNNING DIRECT NOTIFICATION TEST');
  console.log('===================================');
  
  const isValidPage = checkPageState();
  if (!isValidPage) {
    console.log('⚠️ This might not be the correct page for testing');
  }
  
  forceReactState();
  
  console.log('');
  console.log('🎯 TESTING METHODS:');
  console.log('1. Manual DOM injection (immediate)');
  console.log('2. localStorage + refresh (React method)');
  console.log('');
  
  // Method 1: Manual injection (immediate)
  console.log('📱 Method 1: Manual DOM injection...');
  injectManualNotification();
  
  // Method 2: localStorage + refresh (after 5 seconds)
  setTimeout(() => {
    console.log('📱 Method 2: localStorage + refresh...');
    testLocalStorageMethod();
  }, 5000);
}

// Export functions
window.runDirectNotificationTest = runDirectNotificationTest;
window.injectManualNotification = injectManualNotification;
window.testLocalStorageMethod = testLocalStorageMethod;
window.clearExistingData = clearExistingData;

// Auto-run
console.log('🛠️ Available functions:');
console.log('- runDirectNotificationTest() - Run complete test');
console.log('- injectManualNotification() - Show manual notification immediately');
console.log('- testLocalStorageMethod() - Test localStorage + refresh');
console.log('- clearExistingData() - Clear localStorage');
console.log('');

console.log('🚀 Auto-running in 2 seconds...');
setTimeout(runDirectNotificationTest, 2000);
