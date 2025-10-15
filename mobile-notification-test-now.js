// Mobile Notification Test - Run this in browser console
console.log('🧪 MOBILE NOTIFICATION TEST - IMMEDIATE');
console.log('=======================================');

// Create immediate test notification
function createTestNotification() {
  console.log('🚀 Creating test notification immediately...');
  
  // Remove any existing notifications
  const existing = document.querySelectorAll('[data-mobile-notification="true"]');
  existing.forEach(el => {
    console.log('🗑️ Removing existing:', el);
    el.remove();
  });
  
  // Create notification
  const notification = document.createElement('div');
  notification.setAttribute('data-mobile-notification', 'true');
  notification.id = 'immediate-test-notification';
  
  // Apply bulletproof styles
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
    fontFamily: 'Arial, sans-serif'
  };
  
  Object.keys(styles).forEach(key => {
    notification.style.setProperty(key, styles[key], 'important');
  });
  
  // Create card
  notification.innerHTML = `
    <div style="
      background-color: #1a1b3a !important;
      border-radius: 16px !important;
      padding: 20px !important;
      max-width: 320px !important;
      width: 90% !important;
      border: 3px solid #10b981 !important;
      color: white !important;
      text-align: center !important;
    ">
      <div style="font-size: 20px !important; font-weight: bold !important; color: #10b981 !important; margin-bottom: 16px !important;">
        🎉 Trade Won!
      </div>
      <div style="margin-bottom: 16px !important;">
        <strong>BTC/USDT</strong><br>
        Amount: $100<br>
        Profit: $10 (10%)
      </div>
      <div style="margin-bottom: 16px !important; font-size: 14px !important; color: #9ca3af !important;">
        Screen: ${window.innerWidth}x${window.innerHeight}
      </div>
      <button id="close-test-btn" style="
        background-color: #10b981 !important;
        color: white !important;
        border: none !important;
        border-radius: 8px !important;
        padding: 12px 24px !important;
        font-size: 14px !important;
        cursor: pointer !important;
        width: 100% !important;
      ">
        Close Notification
      </button>
    </div>
  `;
  
  // Add close functionality
  const closeBtn = notification.querySelector('#close-test-btn');
  closeBtn.addEventListener('click', () => {
    notification.remove();
    console.log('✅ Test notification closed');
  });
  
  notification.addEventListener('click', (e) => {
    if (e.target === notification) {
      notification.remove();
      console.log('✅ Test notification closed by clicking outside');
    }
  });
  
  // Add to DOM
  document.body.appendChild(notification);
  
  console.log('✅ Test notification created and added to DOM');
  console.log('📏 Dimensions:', notification.getBoundingClientRect());
  console.log('🔍 In DOM?', document.body.contains(notification));
  console.log('🔍 Visible?', notification.offsetWidth > 0 && notification.offsetHeight > 0);
  
  return notification;
}

// Check environment
console.log('🌍 Environment:');
console.log('  Screen:', window.innerWidth + 'x' + window.innerHeight);
console.log('  Mobile size?', window.innerWidth < 768);
console.log('  URL:', window.location.href);

// Create the notification
createTestNotification();

console.log('\n✅ Test complete - notification should be visible now!');
console.log('💡 If not visible, check browser console for errors');

// Make function available for manual testing
window.createTestNotification = createTestNotification;
