// FORCE MOBILE NOTIFICATION TEST - IMMEDIATE EXECUTION
// Copy and paste this ENTIRE script into the browser console

console.log('🚀 FORCE MOBILE NOTIFICATION: Starting immediate test...');

// Step 1: Create the notification element directly in DOM
function createDirectNotification() {
  console.log('🛠️ Creating direct notification element...');
  
  // Remove any existing notifications first
  const existing = document.querySelectorAll('[data-mobile-notification="true"]');
  existing.forEach(el => el.remove());
  
  // Create the notification container
  const notification = document.createElement('div');
  notification.setAttribute('data-mobile-notification', 'true');
  notification.id = 'force-mobile-notification';
  
  // Apply styles directly
  notification.style.cssText = `
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
    visibility: visible !important;
    opacity: 1 !important;
    pointer-events: auto !important;
    transform: translateZ(0) !important;
  `;
  
  // Create the modal content
  notification.innerHTML = `
    <div style="
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
    ">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 16px;">
        <div style="font-size: 20px; font-weight: bold; color: #10b981; margin-bottom: 8px;">
          🎉 Trade Won!
        </div>
        <div style="font-size: 12px; color: #9ca3af;">
          Market: BTC/USDT
        </div>
      </div>
      
      <!-- Trade Details -->
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
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: #9ca3af;">Entry Price :</span>
          <span style="color: white; font-weight: bold;">50,000.00</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: #9ca3af;">Closed Price :</span>
          <span style="color: white; font-weight: bold;">51,000.00</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: #9ca3af;">Duration :</span>
          <span style="color: white; font-weight: bold;">30 seconds</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #9ca3af;">Profit :</span>
          <span style="color: #10b981; font-weight: bold;">+10</span>
        </div>
      </div>
      
      <!-- Note -->
      <div style="
        font-size: 10px;
        color: #9ca3af;
        margin-bottom: 16px;
        text-align: center;
        font-style: italic;
      ">
        🧪 FORCE TEST NOTIFICATION - This proves the notification system works!
      </div>
      
      <!-- Close Button -->
      <div style="text-align: center;">
        <button onclick="document.getElementById('force-mobile-notification').remove(); console.log('✅ Force notification closed');" style="
          background-color: #10b981;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 12px 24px;
          font-size: 14px;
          font-weight: bold;
          cursor: pointer;
          width: 100%;
          transition: all 0.3s ease;
        ">
          Close Notification
        </button>
        <div style="
          font-size: 10px;
          color: #6b7280;
          margin-top: 8px;
          text-align: center;
        ">
          Click anywhere outside to close
        </div>
      </div>
    </div>
  `;
  
  // Add click outside to close
  notification.addEventListener('click', function(e) {
    if (e.target === notification) {
      notification.remove();
      console.log('✅ Force notification closed by clicking outside');
    }
  });
  
  // Add to document body
  document.body.appendChild(notification);
  
  console.log('✅ Force notification created and added to DOM');
  
  // Auto-remove after 30 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
      console.log('🗑️ Force notification auto-removed after 30 seconds');
    }
  }, 30000);
  
  return notification;
}

// Step 2: Check current page state
console.log('🔍 Current page state:');
console.log('- URL:', window.location.href);
console.log('- Screen size:', window.innerWidth + 'x' + window.innerHeight);
console.log('- User agent:', navigator.userAgent.substring(0, 100) + '...');

// Step 3: Look for existing notification elements
const existingNotifications = document.querySelectorAll('[data-mobile-notification="true"]');
console.log('🔍 Existing notifications:', existingNotifications.length);

// Step 4: Check for React components
const reactElements = document.querySelectorAll('[data-reactroot], #root');
console.log('🔍 React elements found:', reactElements.length);

// Step 5: Check for portal roots
const portalRoots = document.querySelectorAll('#mobile-modal-root, #portal-root');
console.log('🔍 Portal roots found:', portalRoots.length);

// Step 6: Create the force notification
console.log('🚀 Creating force notification in 2 seconds...');
setTimeout(() => {
  const notification = createDirectNotification();
  
  // Verify it's visible
  setTimeout(() => {
    const rect = notification.getBoundingClientRect();
    console.log('📏 Notification dimensions:', {
      width: rect.width,
      height: rect.height,
      top: rect.top,
      left: rect.left,
      visible: rect.width > 0 && rect.height > 0
    });
    
    const computedStyle = window.getComputedStyle(notification);
    console.log('🎨 Notification computed style:', {
      display: computedStyle.display,
      position: computedStyle.position,
      zIndex: computedStyle.zIndex,
      opacity: computedStyle.opacity,
      visibility: computedStyle.visibility
    });
  }, 500);
}, 2000);

console.log('🚀 FORCE MOBILE NOTIFICATION: Script loaded. Notification will appear in 2 seconds!');
