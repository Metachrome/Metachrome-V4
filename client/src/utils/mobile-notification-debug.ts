// Notification Debug Utility
// Use this to test both desktop and mobile notifications in the browser console

export const debugNotification = () => {
  console.log('🔍 NOTIFICATION SYSTEM DEBUG');
  console.log('📱 Screen dimensions:', window.innerWidth, 'x', window.innerHeight);
  console.log('📱 User agent:', navigator.userAgent);
  console.log('📱 Device pixel ratio:', window.devicePixelRatio);

  const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isMobileWidth = window.innerWidth <= 768;
  const shouldUseMobile = isMobileDevice || isMobileWidth;

  console.log('📱 Is mobile device:', isMobileDevice);
  console.log('📱 Is mobile width (≤768px):', isMobileWidth);
  console.log('📱 Should use mobile notification:', shouldUseMobile);
  console.log('🖥️ Should use desktop notification:', !shouldUseMobile);
  
  // Check for existing notifications
  const existing = document.querySelectorAll('.metachrome-mobile-notification, [data-mobile-notification]');
  console.log('📱 Existing notifications:', existing.length);
  
  // Check viewport meta tag
  const viewport = document.querySelector('meta[name="viewport"]');
  console.log('📱 Viewport meta tag:', viewport?.getAttribute('content'));
  
  // Check body overflow
  console.log('📱 Body overflow:', document.body.style.overflow);
  console.log('📱 Document overflow:', document.documentElement.style.overflow);
  
  // Test notification creation
  console.log(shouldUseMobile ? '📱 Creating mobile test notification...' : '🖥️ Creating desktop test notification...');

  const testTrade = {
    id: 'debug-test-' + Date.now(),
    direction: 'up' as const,
    amount: 100,
    entryPrice: 65000,
    finalPrice: 66500,
    status: 'won' as const,
    payout: 115,
    profitPercentage: 15
  };

  if (!shouldUseMobile) {
    console.log('🖥️ Desktop notification will be handled by React component');
    console.log('🖥️ To test desktop notification, trigger a real trade or use React DevTools');
    return;
  }
  
  // Import and use the mobile notification system
  import('../components/TradeNotification').then(module => {
    // We need to access the createMobileNotification function
    // Since it's not exported, we'll create a simple test notification
    
    // Create a simple test notification manually
    const notification = document.createElement('div');
    notification.className = 'metachrome-mobile-notification';
    notification.setAttribute('data-mobile-notification', 'true');
    notification.style.cssText = `
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      z-index: 2147483647 !important;
      background: rgba(0, 0, 0, 0.95) !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      visibility: visible !important;
      opacity: 1 !important;
      pointer-events: auto !important;
    `;
    
    const card = document.createElement('div');
    card.style.cssText = `
      background: #1f2937 !important;
      color: white !important;
      padding: 24px !important;
      border-radius: 16px !important;
      text-align: center !important;
      max-width: 350px !important;
      width: calc(100vw - 40px) !important;
      border: 3px solid #10b981 !important;
      box-shadow: 0 0 30px rgba(16, 185, 129, 0.5) !important;
    `;
    
    card.innerHTML = `
      <h2 style="color: #10b981; margin: 0 0 20px 0; font-size: 28px; font-weight: bold;">
        🎉 Debug Test Notification
      </h2>
      <p style="margin: 0 0 20px 0; font-size: 16px;">
        This is a test notification to verify mobile notifications are working.
      </p>
      <button id="close-debug-notification" style="
        background: #10b981;
        color: white;
        border: none;
        padding: 16px 32px;
        border-radius: 12px;
        font-size: 18px;
        font-weight: bold;
        cursor: pointer;
        width: 100%;
      ">Close Test Notification</button>
    `;
    
    notification.appendChild(card);
    
    // Add close handler
    const closeBtn = card.querySelector('#close-debug-notification');
    closeBtn?.addEventListener('click', () => {
      notification.remove();
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      console.log('📱 Debug notification closed');
    });
    
    // Prevent body scrolling
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    
    // Add to DOM
    document.body.appendChild(notification);
    
    console.log('📱 Debug notification created and added to DOM');
    console.log('📱 Notification element:', notification);
    console.log('📱 Notification computed style:', window.getComputedStyle(notification));
    
    // Auto-close after 10 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        console.log('📱 Debug notification auto-closed');
      }
    }, 10000);
  });
};

// Add to window for easy access in browser console
(window as any).debugNotification = debugNotification;
(window as any).debugMobileNotification = debugNotification; // Keep old name for compatibility
(window as any).testMobileNotif = debugNotification;
(window as any).testNotif = debugNotification;

console.log('🔍 Notification debug utility loaded. Use debugNotification() or testNotif() in console to test.');
