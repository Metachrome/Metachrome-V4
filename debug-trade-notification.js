// COMPREHENSIVE TRADE NOTIFICATION DEBUG SCRIPT
// Copy and paste this into your browser console before placing a trade

console.log('🔧 TRADE NOTIFICATION DEBUG SCRIPT LOADED');

// Monitor localStorage changes
let lastCompletedTrade = localStorage.getItem('completedTrade');
console.log('📦 Initial localStorage completedTrade:', lastCompletedTrade);

// Monitor localStorage every 500ms
const storageMonitor = setInterval(() => {
  const currentCompletedTrade = localStorage.getItem('completedTrade');
  if (currentCompletedTrade !== lastCompletedTrade) {
    console.log('🔄 localStorage completedTrade CHANGED!');
    console.log('📦 OLD:', lastCompletedTrade);
    console.log('📦 NEW:', currentCompletedTrade);
    
    if (currentCompletedTrade) {
      try {
        const parsed = JSON.parse(currentCompletedTrade);
        console.log('✅ PARSED TRADE DATA:', parsed);
        
        // Show immediate notification when localStorage changes
        showDebugNotification(parsed);
      } catch (e) {
        console.error('❌ Failed to parse trade data:', e);
      }
    }
    
    lastCompletedTrade = currentCompletedTrade;
  }
}, 500);

// Function to show debug notification
function showDebugNotification(tradeData) {
  console.log('🚨 SHOWING DEBUG NOTIFICATION FOR:', tradeData);
  
  // Remove existing debug notification
  const existing = document.getElementById('debug-notification');
  if (existing) existing.remove();
  
  // Create debug notification
  const notification = document.createElement('div');
  notification.id = 'debug-notification';
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    left: 20px;
    background: #1f2937;
    color: white;
    padding: 15px;
    border-radius: 8px;
    border: 2px solid #10b981;
    z-index: 999999;
    font-family: monospace;
    max-width: 300px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  `;
  
  notification.innerHTML = `
    <div style="font-weight: bold; color: #10b981; margin-bottom: 8px;">
      🚨 DEBUG: Trade Completed!
    </div>
    <div style="font-size: 12px; line-height: 1.4;">
      <div><strong>ID:</strong> ${tradeData.id}</div>
      <div><strong>Status:</strong> ${tradeData.status}</div>
      <div><strong>Amount:</strong> ${tradeData.amount} USDT</div>
      <div><strong>Direction:</strong> ${tradeData.direction}</div>
      <div><strong>Completed:</strong> ${new Date(tradeData.completedAt).toLocaleTimeString()}</div>
    </div>
    <button onclick="this.parentElement.remove()" style="
      position: absolute;
      top: 5px;
      right: 5px;
      background: none;
      border: none;
      color: #9ca3af;
      cursor: pointer;
      font-size: 16px;
    ">×</button>
  `;
  
  document.body.appendChild(notification);
  
  // Auto-remove after 10 seconds
  setTimeout(() => {
    if (document.getElementById('debug-notification')) {
      document.getElementById('debug-notification').remove();
    }
  }, 10000);
}

// Monitor React state changes by watching for specific console logs
const originalConsoleLog = console.log;
console.log = function(...args) {
  // Call original console.log
  originalConsoleLog.apply(console, args);
  
  // Check for specific trade completion logs
  const message = args.join(' ');
  if (message.includes('🎯 COMPLETE TRADE: Set completedTrade state:')) {
    console.log('🎯 DETECTED REACT STATE UPDATE!');
  }
  
  if (message.includes('🔍 OptionsPage: TradeNotification render check:')) {
    console.log('🔍 DETECTED NOTIFICATION RENDER CHECK!');
  }
  
  if (message.includes('🔍 MobileTradeNotification RENDER:')) {
    console.log('📱 DETECTED MOBILE NOTIFICATION RENDER!');
  }
};

// Monitor DOM changes for notification components
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType === 1) { // Element node
        // Check if it's a notification-related element
        if (node.className && (
          node.className.includes('notification') ||
          node.className.includes('modal') ||
          node.className.includes('trade')
        )) {
          console.log('🔍 DOM: Notification-related element added:', node);
        }
      }
    });
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

console.log('✅ DEBUG SCRIPT ACTIVE - Place a trade now and watch the console!');
console.log('📊 Monitoring:');
console.log('  - localStorage changes');
console.log('  - React state updates');
console.log('  - DOM mutations');
console.log('  - Console log patterns');

// Cleanup function
window.stopTradeDebug = () => {
  clearInterval(storageMonitor);
  observer.disconnect();
  console.log = originalConsoleLog;
  console.log('🛑 Trade debug monitoring stopped');
};

console.log('💡 Run stopTradeDebug() to stop monitoring');
