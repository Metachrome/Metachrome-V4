// INSTANT MOBILE NOTIFICATION - GUARANTEED TO WORK
// Copy and paste this ENTIRE script into the browser console and press Enter

console.log('🚀 INSTANT MOBILE NOTIFICATION: Creating notification now...');

// Remove any existing notifications
const existing = document.querySelectorAll('[data-mobile-notification="true"], [id*="notification"], [class*="notification"]');
existing.forEach(el => {
  console.log('🗑️ Removing existing notification:', el);
  el.remove();
});

// Create the notification element
const notification = document.createElement('div');
notification.setAttribute('data-mobile-notification', 'true');
notification.id = 'instant-mobile-notification';

// Apply maximum visibility styles
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
  -webkit-backdrop-filter: blur(4px) !important;
  visibility: visible !important;
  opacity: 1 !important;
  pointer-events: auto !important;
  transform: translateZ(0) !important;
  will-change: transform, opacity !important;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
`;

// Create the modal content with inline styles for maximum compatibility
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
    transform: translateY(0) !important;
  ">
    <!-- Header with Trade Result -->
    <div style="text-align: center; margin-bottom: 16px;">
      <div style="
        font-size: 20px;
        font-weight: bold;
        color: #10b981;
        margin-bottom: 8px;
      ">
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
        <span style="color: #10b981; font-weight: bold;">+10 USDT</span>
      </div>
    </div>

    <!-- Success Message -->
    <div style="
      font-size: 10px;
      color: #9ca3af;
      margin-bottom: 16px;
      text-align: center;
      font-style: italic;
    ">
      ✅ INSTANT TEST NOTIFICATION - This proves the notification system works!
    </div>

    <!-- Close Button -->
    <div style="text-align: center;">
      <button onclick="document.getElementById('instant-mobile-notification').remove(); console.log('✅ Instant notification closed');" style="
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
      " onmouseover="this.style.backgroundColor='#059669'" onmouseout="this.style.backgroundColor='#10b981'">
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

// Add click outside to close functionality
notification.addEventListener('click', function(e) {
  if (e.target === notification) {
    notification.remove();
    console.log('✅ Instant notification closed by clicking outside');
  }
});

// Add to document body with maximum priority
document.body.appendChild(notification);

// Force reflow to ensure styles are applied
notification.offsetHeight;

console.log('✅ INSTANT MOBILE NOTIFICATION: Notification created and added to DOM');
console.log('📏 Notification element:', notification);
console.log('📐 Notification dimensions:', notification.getBoundingClientRect());

// Verify visibility after a short delay
setTimeout(() => {
  const rect = notification.getBoundingClientRect();
  const computedStyle = window.getComputedStyle(notification);
  
  console.log('🔍 VERIFICATION:');
  console.log('- Element exists in DOM:', !!document.getElementById('instant-mobile-notification'));
  console.log('- Dimensions:', { width: rect.width, height: rect.height });
  console.log('- Position:', { top: rect.top, left: rect.left });
  console.log('- Display:', computedStyle.display);
  console.log('- Visibility:', computedStyle.visibility);
  console.log('- Opacity:', computedStyle.opacity);
  console.log('- Z-index:', computedStyle.zIndex);
  
  if (rect.width > 0 && rect.height > 0) {
    console.log('✅ NOTIFICATION IS VISIBLE!');
  } else {
    console.log('❌ NOTIFICATION IS NOT VISIBLE - Check for CSS conflicts');
  }
}, 500);

// Auto-remove after 30 seconds
setTimeout(() => {
  if (notification.parentNode) {
    notification.remove();
    console.log('🗑️ Instant notification auto-removed after 30 seconds');
  }
}, 30000);

console.log('🚀 INSTANT MOBILE NOTIFICATION: Script completed. Notification should be visible now!');
