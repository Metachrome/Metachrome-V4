import React, { useEffect } from 'react';

interface TradeNotificationProps {
  trade: {
    id: string;
    direction: 'up' | 'down';
    amount: number;
    entryPrice: number;
    finalPrice: number;
    status: 'won' | 'lost';
    payout?: number;
    profitPercentage: number;
  } | null;
  onClose: () => void;
}

// ULTRA-SMALL SCREEN NOTIFICATION SYSTEM - Optimized for 250px screens
const createMobileNotification = (trade: any, onClose: () => void) => {
  console.log('📱 CREATING 250PX OPTIMIZED MOBILE NOTIFICATION:', trade.id);
  console.log('📱 Window dimensions:', window.innerWidth, 'x', window.innerHeight);
  console.log('📱 User agent:', navigator.userAgent);
  console.log('📱 Device pixel ratio:', window.devicePixelRatio);

  // Detect ultra-small screens (250px and below)
  const isUltraSmall = window.innerWidth <= 250;
  const isSmallMobile = window.innerWidth <= 400;
  console.log('📱 Ultra-small screen (≤250px):', isUltraSmall);
  console.log('📱 Small mobile (≤400px):', isSmallMobile);

  // Remove any existing notifications aggressively
  const existing = document.querySelectorAll('.metachrome-mobile-notification, [data-mobile-notification], [id*="notification"]');
  existing.forEach(el => {
    console.log('📱 Removing existing notification:', el.className);
    el.remove();
  });

  // Create notification container with ultra-small screen optimization
  const notification = document.createElement('div');
  notification.className = 'metachrome-mobile-notification';
  notification.setAttribute('data-mobile-notification', 'true');
  notification.setAttribute('data-test-notification', 'mobile-trade-250px');
  notification.setAttribute('data-screen-width', window.innerWidth.toString());

  // ULTRA-SMALL SCREEN OPTIMIZED STYLES - Perfect for 250px screens
  const baseStyles = [
    'position: fixed',
    'top: 0',
    'left: 0',
    'right: 0',
    'bottom: 0',
    'width: 100vw',
    'height: 100vh',
    'z-index: 2147483647', // Maximum z-index
    'background: rgba(0, 0, 0, 0.98)', // Slightly more opaque for small screens
    'display: flex',
    'align-items: center',
    'justify-content: center',
    'box-sizing: border-box',
    'overflow: hidden',
    'visibility: visible',
    'opacity: 1',
    'pointer-events: auto',
    // Mobile-specific optimizations
    '-webkit-overflow-scrolling: touch',
    'transform: translateZ(0)',
    '-webkit-transform: translateZ(0)',
    'backface-visibility: hidden',
    '-webkit-backface-visibility: hidden',
    'will-change: transform',
    '-webkit-user-select: none',
    'user-select: none',
    'touch-action: manipulation',
    // Font and rendering optimized for small screens
    'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    'text-rendering: optimizeLegibility',
    '-webkit-font-smoothing: antialiased',
    '-moz-osx-font-smoothing: grayscale'
  ];

  // Ultra-small screen specific padding
  if (isUltraSmall) {
    baseStyles.push('padding: 8px'); // Minimal padding for 250px screens
  } else if (isSmallMobile) {
    baseStyles.push('padding: 12px'); // Small padding for mobile
  } else {
    baseStyles.push('padding: 20px'); // Normal padding for larger screens
  }

  const mobileStyles = baseStyles.map(style => style + ' !important').join('; ');
  notification.style.cssText = mobileStyles;

  console.log('📱 Applied ultra-small screen styles for', window.innerWidth + 'px screen');

  // Create content card optimized for ultra-small screens (250px)
  const card = document.createElement('div');
  card.className = 'mobile-notification-card-250px';

  // Ultra-small screen responsive card styling
  const baseCardStyles = [
    'background: #1f2937',
    'color: white',
    'text-align: center',
    'position: relative',
    'animation: slideInMobile 0.4s ease-out',
    'margin: auto',
    'display: block',
    'visibility: visible',
    'opacity: 1',
    'z-index: 2147483647',
    `border: ${isUltraSmall ? '2px' : '3px'} solid ${trade.status === 'won' ? '#10b981' : '#ef4444'}`,
    `box-shadow: 0 0 ${isUltraSmall ? '20px' : '30px'} ${trade.status === 'won' ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)'}`,
    // Mobile-specific card optimizations
    'transform: translateZ(0)',
    '-webkit-transform: translateZ(0)',
    'will-change: transform',
    'isolation: isolate'
  ];

  // Screen-size specific dimensions and spacing
  if (isUltraSmall) {
    // Optimized for 250px screens
    baseCardStyles.push(
      'width: calc(100vw - 16px)', // Almost full width with minimal margin
      'max-width: 234px', // 250px - 16px padding
      'min-width: 200px',
      'border-radius: 8px', // Smaller radius for tiny screens
      'padding: 12px', // Compact padding
      'font-size: 12px' // Smaller base font
    );
  } else if (isSmallMobile) {
    // Optimized for small mobile (250px - 400px)
    baseCardStyles.push(
      'width: calc(100vw - 24px)',
      'max-width: 350px',
      'min-width: 280px',
      'border-radius: 12px',
      'padding: 16px',
      'font-size: 14px'
    );
  } else {
    // Normal mobile/desktop
    baseCardStyles.push(
      'width: 100%',
      'max-width: 350px',
      'min-width: 300px',
      'border-radius: 16px',
      'padding: 24px',
      'font-size: 16px'
    );
  }

  const cardStyles = baseCardStyles.map(style => style + ' !important').join('; ');
  card.style.cssText = cardStyles;

  console.log('📱 Card created for', window.innerWidth + 'px screen with optimized styling');

  // Add animation styles
  if (!document.getElementById('mobile-notification-styles')) {
    const style = document.createElement('style');
    style.id = 'mobile-notification-styles';
    style.textContent = `
      @keyframes slideInMobile {
        from { transform: translateY(-100px) scale(0.8); opacity: 0; }
        to { transform: translateY(0) scale(1); opacity: 1; }
      }
      @keyframes slideOutMobile {
        from { transform: translateY(0) scale(1); opacity: 1; }
        to { transform: translateY(-100px) scale(0.8); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  // Create content optimized for screen size
  const isWin = trade.status === 'won';
  const profit = isWin ? (trade.payout || 0) - trade.amount : -trade.amount;

  // Screen-size specific content styling
  const contentStyles = {
    title: {
      fontSize: isUltraSmall ? '18px' : isSmallMobile ? '22px' : '28px',
      margin: isUltraSmall ? '0 0 8px 0' : isSmallMobile ? '0 0 12px 0' : '0 0 20px 0'
    },
    container: {
      margin: isUltraSmall ? '8px 0' : isSmallMobile ? '12px 0' : '20px 0',
      padding: isUltraSmall ? '8px' : isSmallMobile ? '12px' : '16px',
      borderRadius: isUltraSmall ? '4px' : '8px'
    },
    row: {
      margin: isUltraSmall ? '6px 0' : isSmallMobile ? '8px 0' : '12px 0',
      fontSize: isUltraSmall ? '11px' : isSmallMobile ? '13px' : '16px'
    },
    profit: {
      fontSize: isUltraSmall ? '12px' : isSmallMobile ? '14px' : '18px'
    },
    payout: {
      fontSize: isUltraSmall ? '13px' : isSmallMobile ? '16px' : '20px'
    },
    button: {
      padding: isUltraSmall ? '8px 16px' : isSmallMobile ? '12px 24px' : '16px 32px',
      fontSize: isUltraSmall ? '12px' : isSmallMobile ? '14px' : '18px',
      borderRadius: isUltraSmall ? '6px' : isSmallMobile ? '8px' : '12px',
      marginTop: isUltraSmall ? '8px' : isSmallMobile ? '12px' : '20px'
    },
    footer: {
      fontSize: isUltraSmall ? '10px' : isSmallMobile ? '12px' : '14px',
      margin: isUltraSmall ? '8px 0 0 0' : isSmallMobile ? '12px 0 0 0' : '16px 0 0 0'
    }
  };

  card.innerHTML = `
    <div style="margin-bottom: ${isUltraSmall ? '8px' : '20px'};">
      <h2 style="color: ${isWin ? '#10b981' : '#ef4444'}; margin: ${contentStyles.title.margin}; font-size: ${contentStyles.title.fontSize}; font-weight: bold; line-height: 1.2;">
        ${isWin ? '🎉 Trade Won!' : '💔 Trade Lost'}
      </h2>
      <div style="text-align: left; margin: ${contentStyles.container.margin}; background: rgba(255,255,255,0.05); padding: ${contentStyles.container.padding}; border-radius: ${contentStyles.container.borderRadius};">
        <div style="margin: ${contentStyles.row.margin}; font-size: ${contentStyles.row.fontSize}; display: flex; justify-content: space-between; align-items: center;">
          <span><strong>Direction:</strong></span>
          <span>${trade.direction.toUpperCase()} ${trade.direction === 'up' ? '⬆️' : '⬇️'}</span>
        </div>
        <div style="margin: ${contentStyles.row.margin}; font-size: ${contentStyles.row.fontSize}; display: flex; justify-content: space-between; align-items: center;">
          <span><strong>Amount:</strong></span>
          <span>$${trade.amount}</span>
        </div>
        <div style="margin: ${contentStyles.row.margin}; font-size: ${contentStyles.row.fontSize}; display: flex; justify-content: space-between; align-items: center;">
          <span><strong>Entry:</strong></span>
          <span>$${trade.entryPrice?.toLocaleString()}</span>
        </div>
        <div style="margin: ${contentStyles.row.margin}; font-size: ${contentStyles.row.fontSize}; display: flex; justify-content: space-between; align-items: center;">
          <span><strong>Final:</strong></span>
          <span>$${trade.finalPrice?.toLocaleString()}</span>
        </div>
        <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: ${isUltraSmall ? '8px 0' : '16px 0'};">
        ${isWin ? `
          <div style="margin: ${contentStyles.row.margin}; font-size: ${contentStyles.profit.fontSize}; display: flex; justify-content: space-between; color: #10b981; font-weight: bold; align-items: center;">
            <span><strong>Profit:</strong></span>
            <span>+$${profit.toFixed(2)}</span>
          </div>
          <div style="margin: ${contentStyles.row.margin}; font-size: ${contentStyles.payout.fontSize}; display: flex; justify-content: space-between; color: #10b981; font-weight: bold; align-items: center;">
            <span><strong>Payout:</strong></span>
            <span>$${trade.payout}</span>
          </div>
        ` : `
          <div style="margin: ${contentStyles.row.margin}; font-size: ${contentStyles.profit.fontSize}; display: flex; justify-content: space-between; color: #ef4444; font-weight: bold; align-items: center;">
            <span><strong>Loss:</strong></span>
            <span>-$${trade.amount}</span>
          </div>
        `}
      </div>
      <button id="close-mobile-notification" style="
        background: ${isWin ? '#10b981' : '#ef4444'};
        color: white;
        border: none;
        padding: ${contentStyles.button.padding};
        border-radius: ${contentStyles.button.borderRadius};
        font-size: ${contentStyles.button.fontSize};
        font-weight: bold;
        cursor: pointer;
        width: 100%;
        margin-top: ${contentStyles.button.marginTop};
        transition: all 0.2s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        line-height: 1.2;
      ">Close Notification</button>
      <p style="font-size: ${contentStyles.footer.fontSize}; color: #9ca3af; margin: ${contentStyles.footer.margin}; line-height: 1.2;">
        Tap anywhere outside to close
      </p>
    </div>
  `;

  notification.appendChild(card);

  // Event handlers
  const closeNotification = () => {
    card.style.animation = 'slideOutMobile 0.3s ease-in forwards';
    setTimeout(() => {
      notification.remove();
      onClose();
    }, 300);
  };

  // Initial event handlers (will be updated later)
  notification.addEventListener('click', (e) => {
    if (e.target === notification) closeNotification();
  });

  // AGGRESSIVE DOM insertion with multiple fallbacks
  console.log('📱 Attempting to add notification to DOM...');

  // Try multiple insertion methods
  try {
    // Method 1: Direct body append
    document.body.appendChild(notification);
    console.log('📱 Method 1: Added to document.body');
  } catch (e) {
    console.error('📱 Method 1 failed:', e);

    // Method 2: Insert at body start
    try {
      document.body.insertBefore(notification, document.body.firstChild);
      console.log('📱 Method 2: Inserted at body start');
    } catch (e2) {
      console.error('📱 Method 2 failed:', e2);

      // Method 3: Create new container
      const container = document.createElement('div');
      container.appendChild(notification);
      document.documentElement.appendChild(container);
      console.log('📱 Method 3: Added to documentElement');
    }
  }

  // FORCE visibility with multiple techniques
  console.log('📱 Forcing notification visibility...');

  // Force reflow
  notification.offsetHeight;
  card.offsetHeight;

  // Force styles again
  notification.style.display = 'flex !important';
  notification.style.visibility = 'visible !important';
  notification.style.opacity = '1 !important';
  notification.style.zIndex = '2147483647 !important';

  // Force card visibility
  card.style.display = 'block !important';
  card.style.visibility = 'visible !important';
  card.style.opacity = '1 !important';

  // Check if notification is actually visible
  const rect = notification.getBoundingClientRect();
  console.log('📱 Notification position:', rect);
  console.log('📱 Notification computed style:', window.getComputedStyle(notification).display);

  // Auto-close after 12 seconds (longer for mobile testing)
  const autoCloseTimer = setTimeout(closeNotification, 12000);

  // Override close function to clear timer
  const originalClose = closeNotification;
  const enhancedClose = () => {
    clearTimeout(autoCloseTimer);
    originalClose();
  };

  // Update event handlers to use enhanced close
  const closeBtn = card.querySelector('#close-mobile-notification');
  if (closeBtn) {
    closeBtn.removeEventListener('click', closeNotification);
    closeBtn.addEventListener('click', enhancedClose);
  }

  notification.removeEventListener('click', closeNotification);
  notification.addEventListener('click', (e) => {
    if (e.target === notification) enhancedClose();
  });

  console.log('📱 AGGRESSIVE MOBILE NOTIFICATION: Created and forced to display');
};

export default function TradeNotification({ trade, onClose }: TradeNotificationProps) {
  // Use the mobile-first notification system
  useEffect(() => {
    if (!trade) return;

    console.log('📱 TRADE NOTIFICATION: Creating mobile notification for trade:', trade.id);
    console.log('📱 Screen width:', window.innerWidth);
    
    // Always use the mobile notification system
    createMobileNotification(trade, onClose);

    // Cleanup function
    return () => {
      const notifications = document.querySelectorAll('.metachrome-mobile-notification');
      notifications.forEach(el => el.remove());
    };
  }, [trade, onClose]);

  // Don't render any React component - we use the native mobile notification
  return null;
}

// 250PX OPTIMIZED test function for ultra-small screen notifications
(window as any).testMobileNotification = () => {
  console.log('🧪 250PX OPTIMIZED MOBILE NOTIFICATION TEST...');
  console.log('🧪 Screen size:', window.innerWidth, 'x', window.innerHeight);
  console.log('🧪 User agent:', navigator.userAgent);
  console.log('🧪 Document ready state:', document.readyState);
  console.log('🧪 Device pixel ratio:', window.devicePixelRatio);
  console.log('🧪 Viewport meta tag:', document.querySelector('meta[name="viewport"]')?.getAttribute('content'));

  // Test different screen size scenarios
  const isUltraSmall = window.innerWidth <= 250;
  const isSmallMobile = window.innerWidth <= 400;

  console.log('🧪 Ultra-small screen (≤250px):', isUltraSmall);
  console.log('🧪 Small mobile (≤400px):', isSmallMobile);

  // Force mobile notification with 250px optimization
  const testTrade = {
    id: '250px-test-' + Date.now(),
    direction: 'up' as const,
    status: Math.random() > 0.5 ? 'won' as const : 'lost' as const,
    amount: 100,
    entryPrice: 66000,
    finalPrice: 66500,
    payout: 115,
    profitPercentage: 15
  };

  console.log('🧪 Creating 250px optimized test trade:', testTrade);

  // Add a small delay to ensure DOM is ready
  setTimeout(() => {
    createMobileNotification(testTrade, () => {
      console.log('🧪 250PX optimized test notification closed');
    });
  }, 100);
};

// Test function specifically for 250px screens
(window as any).test250px = () => {
  console.log('🧪 TESTING SPECIFICALLY FOR 250PX SCREENS...');

  // Temporarily override window.innerWidth for testing
  const originalWidth = window.innerWidth;
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: 250
  });

  console.log('🧪 Simulated screen width set to:', window.innerWidth);

  (window as any).testMobileNotification();

  // Restore original width after test
  setTimeout(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalWidth
    });
    console.log('🧪 Screen width restored to:', window.innerWidth);
  }, 15000); // Restore after 15 seconds
};

// Also add to window for easy testing
(window as any).forceMobileNotif = (window as any).testMobileNotification;
(window as any).force250px = (window as any).test250px;
