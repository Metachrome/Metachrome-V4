// Comprehensive Mobile Notification Debug Script
// Copy and paste this into the browser console on the mobile trading page

console.log('🔧 MOBILE NOTIFICATION DEBUG: Starting comprehensive debug...');

// Function to check DOM elements
function checkDOMElements() {
  console.log('🔍 DOM ELEMENTS CHECK:');
  
  // Check for root elements
  const root = document.getElementById('root');
  const mobileModalRoot = document.getElementById('mobile-modal-root');
  
  console.log('- Root element:', !!root, root);
  console.log('- Mobile modal root:', !!mobileModalRoot, mobileModalRoot);
  
  // Check for notification elements
  const notificationElements = document.querySelectorAll('[data-mobile-notification="true"]');
  console.log('- Mobile notification elements:', notificationElements.length, notificationElements);
  
  // Check for any fixed positioned elements
  const fixedElements = Array.from(document.querySelectorAll('*')).filter(el => {
    const style = window.getComputedStyle(el);
    return style.position === 'fixed';
  });
  console.log('- Fixed positioned elements:', fixedElements.length, fixedElements);
  
  // Check for high z-index elements
  const highZIndexElements = Array.from(document.querySelectorAll('*')).filter(el => {
    const style = window.getComputedStyle(el);
    const zIndex = parseInt(style.zIndex);
    return zIndex > 1000;
  });
  console.log('- High z-index elements:', highZIndexElements.length, highZIndexElements);
}

// Function to test notification trigger
function testNotificationTrigger() {
  console.log('🧪 NOTIFICATION TRIGGER TEST:');
  
  // Look for the test button
  const testButton = document.querySelector('button[style*="position: fixed"][style*="top: 10px"]');
  if (testButton) {
    console.log('✅ Found test button:', testButton);
    console.log('🧪 Clicking test button...');
    testButton.click();
    
    // Check if notification appeared after clicking
    setTimeout(() => {
      const notification = document.querySelector('[data-mobile-notification="true"]');
      if (notification) {
        console.log('✅ Notification appeared after button click!', notification);
      } else {
        console.log('❌ No notification appeared after button click');
      }
    }, 500);
  } else {
    console.log('❌ Test button not found');
    
    // Try manual trigger
    console.log('🧪 Attempting manual trigger...');
    
    // Create test trade data
    const testTrade = {
      id: 'debug-test-' + Date.now(),
      direction: 'up',
      amount: 100,
      entryPrice: 50000,
      finalPrice: 51000,
      status: 'won',
      payout: 110,
      profitPercentage: 10,
      symbol: 'BTC/USDT',
      duration: 30
    };
    
    // Try localStorage trigger
    localStorage.setItem('completedTrade', JSON.stringify(testTrade));
    
    // Try custom events
    const events = ['tradeCompleted', 'trade_completed', 'notificationTrigger'];
    events.forEach(eventName => {
      const event = new CustomEvent(eventName, {
        detail: testTrade,
        bubbles: true
      });
      document.dispatchEvent(event);
      window.dispatchEvent(event);
    });
    
    console.log('🧪 Manual triggers sent');
  }
}

// Function to create manual notification
function createManualNotification() {
  console.log('🛠️ MANUAL NOTIFICATION CREATION:');
  
  // Create notification element manually
  const notification = document.createElement('div');
  notification.setAttribute('data-mobile-notification', 'true');
  notification.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 999999999;
    background-color: rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    backdrop-filter: blur(4px);
    visibility: visible !important;
    opacity: 1 !important;
    pointer-events: auto;
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
      position: relative;
      pointer-events: auto;
    ">
      <div style="text-align: center; margin-bottom: 16px;">
        <div style="font-size: 20px; font-weight: bold; color: #10b981; margin-bottom: 8px;">
          🧪 DEBUG TEST NOTIFICATION
        </div>
        <div style="font-size: 12px; color: #9ca3af;">
          This is a manual test notification
        </div>
      </div>
      
      <div style="
        background-color: #2a2d47;
        border-radius: 8px;
        padding: 12px;
        margin-bottom: 16px;
        border: 1px solid #3a3d5a;
        font-size: 12px;
      ">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: #9ca3af;">Market :</span>
          <span style="color: white; font-weight: bold;">BTC/USDT</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: #9ca3af;">Trade :</span>
          <span style="color: #10b981; font-weight: bold;">BUY UP</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: #9ca3af;">Amount :</span>
          <span style="color: white; font-weight: bold;">100 USDT</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #9ca3af;">Status :</span>
          <span style="color: #10b981; font-weight: bold;">TEST SUCCESS</span>
        </div>
      </div>
      
      <div style="text-align: center;">
        <button onclick="this.closest('[data-mobile-notification]').remove()" style="
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
    </div>
  `;
  
  // Add to body
  document.body.appendChild(notification);
  
  console.log('✅ Manual notification created and added to DOM:', notification);
  
  // Auto-remove after 10 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
      console.log('🗑️ Manual notification auto-removed');
    }
  }, 10000);
}

// Function to check React state
function checkReactState() {
  console.log('⚛️ REACT STATE CHECK:');
  
  // Try to find React components
  const reactElements = Array.from(document.querySelectorAll('*')).filter(el => {
    return el._reactInternalFiber || 
           el._reactInternalInstance || 
           el.__reactInternalInstance ||
           el._reactInternals;
  });
  
  console.log('- React elements found:', reactElements.length);
  
  // Check for React DevTools
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('✅ React DevTools detected');
  } else {
    console.log('❌ React DevTools not detected');
  }
  
  // Check localStorage for trade data
  const completedTrade = localStorage.getItem('completedTrade');
  console.log('- localStorage completedTrade:', completedTrade);
  
  if (completedTrade) {
    try {
      const parsed = JSON.parse(completedTrade);
      console.log('- Parsed trade data:', parsed);
    } catch (e) {
      console.log('- Error parsing trade data:', e);
    }
  }
}

// Run all checks
console.log('🔧 STARTING DEBUG SEQUENCE...');

checkDOMElements();
setTimeout(() => {
  checkReactState();
  setTimeout(() => {
    testNotificationTrigger();
    setTimeout(() => {
      console.log('🛠️ Creating manual notification as final test...');
      createManualNotification();
    }, 2000);
  }, 1000);
}, 500);

console.log('🔧 DEBUG SEQUENCE INITIATED. Check console for results...');
